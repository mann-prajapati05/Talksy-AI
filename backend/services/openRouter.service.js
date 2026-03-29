import axios from 'axios';

export const askAi = async(messages) =>{
    try{
        if(!messages || !Array.isArray(messages) || messages.length===0){
            throw new Error("Messages array is empty..");
        }

        const response = await axios.post("https://openrouter.ai/api/v1/chat/completions",{
            model:'openrouter/free',
            messages:messages
        },
        {
            headers: {
                Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
            },
        }
        );

        const content= response?.data?.choices?.[0]?.message?.content;
        if(!content || !content.trim()){
            throw new Error("AI returned empty response...");
        }

        return content;
    }catch(err){
        console.log("Open router Error..", err.response?.data || err.message);
        throw new Error("OpenRouter API Error..");
    }
}