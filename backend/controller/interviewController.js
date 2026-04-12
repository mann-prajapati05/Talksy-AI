import fs from 'fs';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { askAi } from '../services/openRouter.service.js';
import Interview from '../model/interviewModel.js';
import User from '../model/user.js';

export function parseAndValidateQuestions(aiResponse) {
    if (!aiResponse || typeof aiResponse !== "string") {
        throw new Error("Invalid AI response");
    }

    const cleanedResponse = aiResponse
        .replace(/```json\s*/gi, "")
        .replace(/```/g, "")
        .trim();

    const normalizeType = (rawType) => {
        const normalized = String(rawType || "").trim().toLowerCase();

        if (["technical", "tech"].includes(normalized)) return "technical";
        if (["behavioral", "behavioural", "behavior", "behaviour"].includes(normalized)) {
            return "behavioral";
        }
        if (["project", "project-based", "project based"].includes(normalized)) {
            return "project";
        }
        if (["scenario", "situational", "system-design", "system design", "design"].includes(normalized)) {
            return "scenario";
        }

        return "scenario";
    };

    const normalizeDifficulty = (rawDifficulty) => {
        const normalized = String(rawDifficulty || "").trim().toLowerCase();
        if (["easy", "medium", "hard"].includes(normalized)) return normalized;
        return "medium";
    };

    const tryParseArray = (candidate) => {
        if (!candidate) return null;

        const sanitized = String(candidate)
            .replace(/,\s*([}\]])/g, "$1")
            .trim();

        try {
            const parsed = JSON.parse(sanitized);
            return Array.isArray(parsed) ? parsed : null;
        } catch {
            return null;
        }
    };

    const buildRepairCandidate = (source) => {
        const start = source.indexOf("[");
        if (start === -1) return null;

        let candidate = source.slice(start).trim();

        // If there is a proper closing bracket, drop any trailing extra text.
        const lastCloseBracket = candidate.lastIndexOf("]");
        if (lastCloseBracket !== -1) {
            candidate = candidate.slice(0, lastCloseBracket + 1);
        }

        candidate = candidate.replace(/,\s*$/g, "");

        const openCurly = (candidate.match(/{/g) || []).length;
        const closeCurly = (candidate.match(/}/g) || []).length;
        const openSquare = (candidate.match(/\[/g) || []).length;
        const closeSquare = (candidate.match(/\]/g) || []).length;

        if (openCurly > closeCurly) {
            candidate += "}".repeat(openCurly - closeCurly);
        }
        if (openSquare > closeSquare) {
            candidate += "]".repeat(openSquare - closeSquare);
        }

        return candidate;
    };

    const firstArrayStart = cleanedResponse.indexOf("[");
    const lastArrayEnd = cleanedResponse.lastIndexOf("]");

    const parseCandidates = [
        cleanedResponse,
        firstArrayStart !== -1 && lastArrayEnd !== -1 && firstArrayStart < lastArrayEnd
            ? cleanedResponse.slice(firstArrayStart, lastArrayEnd + 1)
            : null,
        buildRepairCandidate(cleanedResponse),
    ];

    let parsedArray = null;
    for (const candidate of parseCandidates) {
        parsedArray = tryParseArray(candidate);
        if (parsedArray) break;
    }

    if (!parsedArray) {
        throw new Error("No valid JSON array found in AI response");
    }

    const normalizedQuestions = parsedArray
        .filter((item) => item && typeof item === "object")
        .map((item, index) => ({
            id: Number(item.id) || index + 1,
            question: String(item.question || "").trim(),
            type: normalizeType(item.type),
            difficulty: normalizeDifficulty(item.difficulty),
        }))
        .filter((item) => item.question.length > 0);

    if (!normalizedQuestions.length) {
        throw new Error("Parsed question array is empty after normalization");
    }

    return normalizedQuestions;
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
                Extract structured data from the provided resume.

                Return strictly valid JSON only.
                Do NOT include markdown, code fences, comments, or any explanations.
                Ensure the response is directly parsable using JSON.parse().

                Output format:
                {
                "experience": [
                {
                "company": "",
                "type": "", // job or internship
                "mode": "", // remote or office (or hybrid if explicitly mentioned)
                "employment": "", // part-time or full-time
                "description": ""
                }
                ],
                "projects": ["project1", "project2", ...],
                "skills": ["skill1", "skill2", ...]
                }

                Instructions:

                Extract ALL relevant information accurately from the resume.
                For "experience":
                Each entry MUST include:
                company name
                type (job/internship)
                mode (remote/office/hybrid)
                employment type (part-time/full-time)
                short description of work done
                If any field is not explicitly mentioned, set its value to null.
                Do NOT infer or hallucinate missing details.
                Keep descriptions concise but meaningful.

                Strict Rules:

                Output ONLY valid JSON.
                No trailing commas.
                No additional text before or after JSON.
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
        let {role,experience,mode,projects,skills,resumeText}=req.body;
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

        Return questions in the specified JSON format.
        `;
        const noOfQuestions=5;
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

                Your task is to generate EXACTLY ${noOfQuestions} interview questions tailored to a candidate.

                ---

                STRICT RULES:

                * Generate EXACTLY ${noOfQuestions} questions (no more, no less)
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
                "type": "technical | behavioral | project | scenario",
                "difficulty": "easy | medium | hard"
                }
                ]

                Return EXACTLY ${noOfQuestions} objects.
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
        console.log(aiResponse);
        const parsedQuestionsArray= parseAndValidateQuestions(aiResponse);

        if(!Array.isArray(parsedQuestionsArray) || parsedQuestionsArray.length===0){
            return res.status(500).json({
                success:false,
                message:"AI failed to generate valid questions.."
            });
        }
        user.credits -=20;
        await user.save();
        console.log("question generate okk..",parsedQuestionsArray);
        const difficultyTimeMap = {
            easy: 60,
            medium: 90,
            hard: 120,
        };
        const capitalize = (str) => {
            if (!str || typeof str !== "string") return str;
            return str.charAt(0).toUpperCase() + str.slice(1);
        };
        const interview= new Interview({userId:user._id , role, experience , mode , resumeText:safeResume ,
        questions: parsedQuestionsArray.map((q) => {
            const difficulty = q.difficulty?.toLowerCase();
            const type = q.type?.toLowerCase();

            return {
            question: q.question,
            difficulty: capitalize(difficulty),
            questionType: capitalize(type),
            timeLimit: difficultyTimeMap[difficulty] || 60,
            };
        }),
        });
        await interview.save();
        console.log("final prepared interview.. ",interview.questions);
        res.status(201).json({
            interviewId:interview._id,
            creditsLeft:user.credits,
            userName: user.name,
            questions: interview.questions
        });

    }catch(err){
        console.log(err);
        return res.status(500).json({
            success:false,
            message:"something went wrong while preparing interview..",
            err
        })
    }
}

export const submitAnswer= async(req,res)=>{
    try{
        const {interviewId , questionIndex , answer , timeTaken }=req.body;

        const interview=await Interview.findById(interviewId);
        const question=interview.questions[questionIndex];

        if(!answer){
            question.score=0;
            question.feedback="You did not submit an answer.";
            question.answer="";

            await interview.save();

            return res.status(200).json({
                feedback:question.feedback
            });
        }

        const messages=[
            {
                role:"system",
                content:`
                You are a highly experienced, unbiased, and professional interview evaluator.

Your task is to evaluate a candidate’s answer as a real human interviewer would in a professional interview setting.

---

EVALUATION CRITERIA:

You must evaluate the answer across THREE dimensions:

1. confidence (0–10)

   * How confidently the candidate communicates
   * Clarity, tone, and decisiveness

2. communication (0–10)

   * Structure of answer
   * Clarity of explanation
   * Ability to articulate thoughts clearly

3. correctness (0–10)

   * Technical accuracy
   * Relevance to the question
   * Depth of understanding

---
FINAL SCORE:

Compute:
finalScore = average(confidence, communication, correctness)
Rules:
Must be a number between 0–10
Round to 1 decimal place (e.g., 6.7)
Must logically reflect the three scores
DO NOT assign randomly
---
STRICT SCORING RULES:

* Scores must be realistic and justified
* DO NOT give high scores (8–10) unless the answer is truly strong
* Average or incomplete answers should fall in 4–7 range
* Weak, vague, or incorrect answers should be below 4
* Avoid giving all scores the same value unless clearly justified
* Be honest, not polite

---

FAIRNESS & BIAS RULES:

* Be completely unbiased
* Do NOT assume anything beyond the given answer
* Do NOT favor length over quality
* Do NOT penalize minor grammar issues if meaning is clear
* Focus on substance, clarity, and correctness

---

FEEDBACK STYLE (VERY IMPORTANT):

* Feedback must feel like a REAL HUMAN INTERVIEWER
* Be constructive, honest, and helpful
* Avoid generic phrases like:

  * "Good job"
  * "Nice answer"

Instead:

* Point out specific strengths
* Clearly highlight mistakes or gaps
* Suggest how to improve

Feedback should:

* Help the candidate improve step-by-step
* Be practical and actionable
* Be concise but meaningful (3–6 lines)

---

OUTPUT FORMAT (STRICT JSON):

{
"confidence": number (0-10),
"communication": number (0-10),
"correctness": number (0-10),
"feedback": "Detailed, human-like feedback here"
"finalScore": number (0-10)
}

---

IMPORTANT:

* Return ONLY valid JSON
* Do NOT include explanations outside JSON
* Do NOT include extra text

---

GOAL:

Evaluate like a real expert interviewer — fair, strict, and genuinely helpful for improvement.

                `
            },
            {
                role:"user",
                content:`
                Question: ${question.question},
                Answer: ${answer}
                `
            }
        ];
        const aiResponse= await askAi(messages);
        const parsed=parseAiJson(aiResponse);

        question.answer=answer;
        question.confidence=parsed.confidence;
        question.communication=parsed.communication;
        question.correctness=parsed.correctness;
        question.score=parsed.finalScore;
        question.feedback=parsed.feedback;

        await interview.save();

        return res.status(200).json({
            feedback:parsed.feedback
        });
    }catch(err){
        return res.status(500).json({
            success:false,
            message:"something went wrong while evalution of answer..",
            err
        })
    }
}

export const finishInterview = async(req,res) =>{
    try{
        const {interviewId} =req.body;
        const interview=await Interview.findById(interviewId);

        if(!interview){
            return res.status(404).json({
            success:false,
            message:"interview not found..",
            err
        })
        }

        const totalQuestions = interview.questions.length;

        let totalScore=0;
        let totalConfidence=0;
        let totalCommunication=0;
        let totalCorrectness=0;

        interview.questions.forEach((q)=>{
            totalScore+=q.score || 0;
            totalConfidence+= q.confidence || 0;
            totalCommunication+= q.communication || 0;
            totalCorrectness+= q.correctness || 0;
        });

        const finalScore=totalQuestions? totalScore/totalQuestions : 0;

        const avgConfidence= totalQuestions? totalConfidence/totalQuestions : 0;
        const avgCommunication= totalQuestions? totalCommunication/totalQuestions : 0;
        const avgCorrectness= totalQuestions? totalCorrectness/totalQuestions : 0;

        interview.finalScore=finalScore;
        interview.status="completed";

        await interview.save();

        return res.status(200).json({
            finalScore:Number(finalScore.toFixed(1)),
            role:interview.role,
            experience:interview.experience,
            mode:interview.mode,
            status:interview.status,
            createdAt:interview.createdAt,
            confidence:Number(avgConfidence.toFixed(1)),
            communication:Number(avgCommunication.toFixed(1)),
            correctness:Number(avgCorrectness.toFixed(1)),
            questionWiseScore: interview.questions.map((q)=>({
                question:q.question,
                score: q.score || 0,
                confidence: q.confidence || 0,
                communication: q.communication || 0,
                correctness: q.correctness || 0,
                answer: q.answer || "",
                feedback: q.feedback|| ""
            }))
        })

    }catch(err){
        return res.status(500).json({
            success:false,
            message:"failed to finish-interview & generate report ..",
            err
        })
    }
}

export const getMyInterviews = async(req,res)=>{
    try{
        const interviews=await Interview.find({userId:req.userId})
        .sort({createdAt:-1}) //latest
        .select("role experience mode finalScore status createdAt");

        return res.status(200).json(interviews);

    }catch(err){
        return res.status(500).json({
            success:false,
            message:`Failed to find currentUser interview ${err}`
        });
    }
}

export const getInterviewReport = async(req,res)=>{
    try{
        const interviewId = req.params.interviewId;
        const interview = await Interview.findById(interviewId);

        if(!interview){
            return res.status(404).json({message:"Interview not found.."});
        }

        const totalQuestions = interview.questions.length;

        let totalConfidence=0;
        let totalCommunication=0;
        let totalCorrectness=0;

        interview.questions.forEach((q)=>{
            totalConfidence+= q.confidence || 0;
            totalCommunication+= q.communication || 0;
            totalCorrectness+= q.correctness || 0;
        });

        const avgConfidence= totalQuestions? totalConfidence/totalQuestions : 0;
        const avgCommunication= totalQuestions? totalCommunication/totalQuestions : 0;
        const avgCorrectness= totalQuestions? totalCorrectness/totalQuestions : 0;

        return res.status(200).json({
            finalScore:interview.finalScore,
            role:interview.role,
            experience:interview.experience,
            mode:interview.mode,
            status:interview.status,
            createdAt:interview.createdAt,
            confidence:Number(avgConfidence.toFixed(1)),
            communication:Number(avgCommunication.toFixed(1)),
            correctness:Number(avgCorrectness.toFixed(1)),
            questionWiseScore: interview.questions
        });

    }catch(err){
        return res.status(500).json({
            success:false,
            message:`Failed to find currentUser interview Report ${err}`
        });
    }
}