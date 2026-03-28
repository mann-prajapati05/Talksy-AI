import express from 'express';
import { googleAuth, login, logout, signup } from '../controller/authController.js';
const authRouter= express.Router();

authRouter.post('/login',login);
authRouter.post('/signup',signup);
authRouter.post('/google',googleAuth);
authRouter.get('/logout',logout);

export default authRouter; 