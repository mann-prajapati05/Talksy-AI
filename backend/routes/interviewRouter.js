import express from 'express';
import { upload } from '../middleware/multer.js';
import { analyzeResume, finishInterview, generateQuestions, getInterviewReport, getMyInterviews, submitAnswer, startAgenticInterview, submitAgenticAnswer } from '../controller/interviewController.js';
import isAuth from '../middleware/isAuth.js';

const interviewRouter = express.Router();

interviewRouter.post('/resume-analyze',isAuth,upload.single("resume"),analyzeResume);
interviewRouter.post('/generate-questions',isAuth,generateQuestions);
interviewRouter.post('/submit-answer',isAuth,submitAnswer);
interviewRouter.post('/finish',isAuth,finishInterview);

interviewRouter.get('/my-interviews',isAuth,getMyInterviews);
interviewRouter.get('/report/:interviewId',isAuth,getInterviewReport);

// === Agentic interview routes ===
interviewRouter.post('/agentic/start',isAuth,startAgenticInterview);
interviewRouter.post('/agentic/answer',isAuth,submitAgenticAnswer);


export default interviewRouter;