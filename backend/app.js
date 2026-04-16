import dotenv from 'dotenv';
import express from 'express';
import ConnectDB from './config/connectDB.js';
import authRouter from './routes/authRouter.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import userRouter from './routes/userRouter.js';
import interviewRouter from './routes/interviewRouter.js';
import paymentRouter from './routes/paymentRouter.js';

dotenv.config();
const app=express();

app.use(cors({
    origin: "https://talksy-ai-frontend.onrender.com", 
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
app.use('/users', userRouter); 
app.use('/interview', interviewRouter);
app.use('/payment',paymentRouter);

const PORT=process.env.PORT;

const startServer = async () => {
    try {
        await ConnectDB();
        app.listen(PORT,()=>{
            console.log(`Server is running on http://localhost:${PORT}/`);
        });
    } catch (err) {
        console.log("Failed to start server due to DB connection error..", err);
        process.exit(1);
    }
};

startServer();