import fs from 'fs';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { askAi } from '../services/openRouter.service.js';
import Interview from '../model/interviewModel.js';
import User from '../model/user.js';

export function parseAndValidateQuestions(aiResponse) {
  try {
    if (!aiResponse || typeof aiResponse !== "string") {
      throw new Error("Invalid AI response");
    }

    // 🔹 Step 1: Extract JSON array from response
    const start = aiResponse.indexOf("[");
    const end = aiResponse.lastIndexOf("]");

    if (start === -1 || end === -1) {
      throw new Error("No JSON array found in response");
    }

    const jsonString = aiResponse.slice(start, end + 1);

    // 🔹 Step 2: Remove common issues
    const cleaned = jsonString
      .replace(/,\s*]/g, "]") // remove trailing commas
      .replace(/\n/g, " ")    // remove line breaks
      .trim();

    // 🔹 Step 3: Parse JSON
    const parsed = JSON.parse(cleaned);

    // 🔹 Step 4: Validate structure
    if (!Array.isArray(parsed)) {
      throw new Error("Response is not an array");
    }

    // 🔹 Step 5: Validate each object
    parsed.forEach((item, index) => {
      if (typeof item !== "object") {
        throw new Error(`Item at index ${index} is not an object`);
      }

      if (!item.question || typeof item.question !== "string") {
        throw new Error(`Invalid question at index ${index}`);
      }

      if (!item.type || !["technical", "behavioral", "project", "scenario"].includes(item.type)) {
        throw new Error(`Invalid type at index ${index}`);
      }

      if (!item.difficulty || !["easy", "medium", "hard"].includes(item.difficulty)) {
        throw new Error(`Invalid difficulty at index ${index}`);
      }
    });

    return parsed;

  } catch (error) {
    console.error("AI Response Parsing Error:", error.message);

    return {
      success: false,
      error: error.message,
    };
  }
}


const parseAiJson = (rawResponse) => {
    if (!rawResponse || typeof rawResponse !== 'string') {
        throw new Error('AI returned invalid response format');
    }

    const cleaned = rawResponse
        .replace(/```json\s*/gi, '')
        .replace(/```/g, '')
        .trim();

    try {
        return JSON.parse(cleaned);
    } catch {
        const start = cleaned.indexOf('{');
        const end = cleaned.lastIndexOf('}');

        if (start === -1 || end === -1 || start >= end) {
            throw new Error('Could not extract valid JSON from AI response');
        }

        const jsonSlice = cleaned.slice(start, end + 1);
        return JSON.parse(jsonSlice);
    }
};

export const analyzeResume= async(req,res) =>{
    try{
        if(!req.file){
            return res.status(400).json(
                {
                success:false,
                message : "Resume required.."
            });
        }
        const filepath = req.file.path;

        const fileBuffer = await fs.promises.readFile(filepath); //binary coverted file

        const uint8Array = new Uint8Array(fileBuffer); //convert pdf to binary to pdfjs-dist supported formate

        const pdf = await pdfjsLib.getDocument({data:uint8Array}).promise;

        let resumeText="";

        //extract text from all pages

        for(let pageNum=1; pageNum<=pdf.numPages; pageNum++){
            const page=await pdf.getPage(pageNum);
            const content=await page.getTextContent();

            const pageText = content.items.map(item => item.str).join(" ");
            resumeText+= pageText + "\n";
        }

        resumeText = resumeText.replace(/\s+/g," ").trim();
        
        const messages= [
            {
                role:"system",
                content:`
                Extract structured data from resume.
                Return strictly valid JSON only.
                Do not include markdown, code fences, or explanations.
                {
                    "role":"string",
                    "experience":"string",
                    "projects":["project1","project2",..],
                    "skills":["skill1","skill2",..]
                }
                `
            },
            {
                role:"user",
                content:resumeText
            }
        ];

        const aiResponse = await askAi(messages);
        const parsed= parseAiJson(aiResponse);

        fs.unlinkSync(filepath);

        res.json({
            role:parsed.role || '',
            experience:parsed.experience || '',
            projects:Array.isArray(parsed.projects) ? parsed.projects : [],
            skills:Array.isArray(parsed.skills) ? parsed.skills : [],
            resumeText
        });
    }catch(err){
        console.log("Error while analysing resume..",err);

        if(req.file && fs.existsSync(req.file.path)){
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({
            success:false,
            message:err.message
        });
    }
}

export const generateQuestions= async(req,res)=>{
    try{
        const {role,experience,mode,projects,skills,resumeText}=req.boody;
        role=role?.trim();
        experience=experience?.trim();
        mode=mode?.trim();

        if(!role || !experience || !mode){
            return res.status(400).json({
                success:false,
                message:"role-Experience-mode required.."
            });
        }

        const user=await User.findById(req.userId);
        if(!user){
            return res.status(404).json({
                success:false,
                message:"User not found.."
            });
        }
        if(user.credits<20){
            return res.status(400).json({
                success:false,
                message:"Not enough credits , minimum 20 credits required.."
            });
        }

        const projectText = Array.isArray(projects) && projects.length? projects.join(", ") : "None";

        const skillText = Array.isArray(skills) && skills.length? skills.join(", ") : "None";

        const safeResume = resumeText?.trim() || "None";

        const userPrompt = `
        Generate interview questions for the following candidate:

        Role: ${role}
        Experience: ${experience}
        Interview Mode: ${mode}

        Skills:
        ${skillText}

        Projects:
        ${projectText}

        Resume Content:
        ${safeResume}

        Instructions:

        * Ask questions like a real human interviewer would
        * Keep tone natural, conversational, and professional
        * Avoid robotic phrasing
        * Focus more on ${mode} style interview
        * Personalize questions using projects and skills

        Return EXACTLY 20 questions in the specified JSON format.
        `;

        if(!userPrompt.trim()){
            return res.status(400).json({
                success:false,
                message:"Prompt content is empty"
            });
        }

        const messages=[
            {
                role:"system",
                content:`
                You are a highly experienced, professional interviewer conducting real-world interviews at top tech companies.

                Your task is to generate EXACTLY 20 interview questions tailored to a candidate.

                ---

                STRICT RULES:

                * Generate EXACTLY 20 questions (no more, no less)
                * Do NOT include answers
                * Do NOT include explanations
                * Output ONLY valid JSON

                ---

                LANGUAGE STYLE (VERY IMPORTANT):

                * Questions must sound like a REAL HUMAN INTERVIEWER speaking
                * Use natural, conversational, and professional tone
                * Avoid robotic or textbook phrasing

                Examples of preferred style:

                * "Can you walk me through..."
                * "How would you approach..."
                * "Have you ever worked on..."
                * "What challenges did you face when..."
                * "Why did you choose..."

                Avoid:

                * "Explain..."
                * "Define..."
                * "What is the definition of..."

                ---

                QUESTION QUALITY:

                * Personalize deeply based on:

                * Role
                * Experience
                * Skills
                * Projects
                * Resume

                * Include a mix of:

                * Technical questions
                * Scenario-based questions
                * Project deep-dives
                * Behavioral questions

                * Difficulty distribution:

                * Easy (fundamentals)
                * Medium (applied)
                * Hard (problem-solving / real-world scenarios)

                ---

                INTERVIEW REALISM:

                * Some questions should feel like follow-ups
                * Some questions should reference candidate projects directly
                * Questions should feel progressive (like a real interview flow)

                ---

                OUTPUT FORMAT (STRICT JSON):

                [
                {
                "id": 1,
                "question": "Human-like question here",
                "type": "Technical | Behavioral | Project | Scenario",
                "difficulty": "easy | medium | hard"
                }
                ]

                Return EXACTLY 20 objects.
                No extra text outside JSON.
                `
            },
            {
                role:"user",
                content:userPrompt
            }
        ];

        const aiResponse=await askAi(messages);
        if(!aiResponse || !aiResponse.trim()){
            return res.status(500).json({
                success:false,
                message:"AI returned empty response.."
            });
        }

        const parsedQuestionsArray= parseAndValidateQuestions(aiResponse);

        if(parsedQuestionsArray.length===0){
            return res.status(500).json({
                success:false,
                message:"AI failed to generate valid questions.."
            });
        }

        user.credits -=20;
        await user.save();

        const difficultyTimeMap = {
            easy: 60,
            medium: 90,
            hard: 120,
        };

        const interview= new Interview({userId:user._id , role, experience , mode , resumeText:safeResume ,
        questions:parsedQuestionsArray.map((q)=>({
            question:q.question,
            difficulty:q.difficulty,
            questionType:q.type,
            timeLimit:difficultyTimeMap[q.difficulty] || 60;
        }))
        });

        res.status(201).json({
            interviewId:interview._id,
            creditsLeft:user.credits,
            userName: user.name,
            questions: interview.questions
        });

    }catch(err){
        return res.status(500).json({
            success:false,
            message:"something went wrong while preparing interview..",
            err
        })
    }
}

export const submitAnswers= async(req,res)=>{
    try{
        const {interviewId , questionIndex , answer , timeTaken }=req.body;

    }catch(err){

    }
}