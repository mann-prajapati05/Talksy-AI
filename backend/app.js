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

const allowedOrigins = [
    process.env.FRONTEND_URL,
    "https://talksy-ai-frontend.onrender.com",
    "http://localhost:5173",
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) {
            return callback(null, true);
        }

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error("Not allowed by CORS"));
    },
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