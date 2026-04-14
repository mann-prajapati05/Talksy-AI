import axios from 'axios';

export const askAi = async(messages) =>{
    try{
        if(!messages || !Array.isArray(messages) || messages.length===0){
            throw new Error("Messages array is empty..");
        }

        const modelsToTry = [
            'stepfun-ai/step-3.5-flash:free',
            'nvidia/nemotron-3-super:free',
            'openrouter/free'
        ];

        for(const model of modelsToTry){
            try{
                const response = await axios.post("https://openrouter.ai/api/v1/chat/completions",{
                    model,
                    messages:messages,
                    ...(model === 'openrouter/free' ? {} : { provider: { allowFallbacks: false } })
                },
                {
                    headers: {
                        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                        'Content-Type': 'application/json',
                    },
                }
                );

                const content= response?.data?.choices?.[0]?.message?.content;
                if(content && content.trim()){
                    return content;
                }
            }catch(modelErr){
                console.log(`Open router model failed (${model})..`, modelErr.response?.data || modelErr.message);
            }
        }

        throw new Error("AI returned empty response...");
    }catch(err){
        console.log("Open router Error..", err.response?.data || err.message);
        throw new Error("OpenRouter API Error..");
    }
}