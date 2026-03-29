import express from 'express';
import { upload } from '../middleware/multer.js';
import { analyzeResume } from '../controller/interviewController.js';
import isAuth from '../middleware/isAuth.js';

const interviewRouter = express.Router();

interviewRouter.post('/resume-analyze',isAuth,upload.single("resume"),analyzeResume);

export default interviewRouter;