import dotenv from 'dotenv';
import express from 'express';
import mongoose, { connect } from 'mongoose';
import ConnectDB from './config/connectDB.js';
import authRouter from './routes/authRouter.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';

dotenv.config();
const app=express();

app.use(cors({
    origin: "http://localhost:5173", 
    credentials: true                
}));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/',(req,res,next)=>{
    console.log(req.method , req.url);
    next();
})

app.use('/auth', authRouter);

const PORT=process.env.PORT;

app.listen(PORT,()=>{
    console.log(`Server is running on http://localhost:${PORT}/`);
    ConnectDB();
})