import dotenv from 'dotenv';
import express from 'express';

dotenv.config();

const app=express();

app.get('/',(req,res)=>{
    res.send("backend ready..");
})

PORT=process.env.PORT;

app.listen(PORT,()=>{
    console.log(`Server is running on http://localhost:${PORT}/`);
})