import express from 'express';
import isAuth from '../middleware/isAuth.js';
import { createOrder, verifyPayment } from '../controller/paymentController.js';


const paymentRouter = express.Router();

paymentRouter.post('/order',isAuth,createOrder);
paymentRouter.post('/verify-payment',isAuth,verifyPayment);

export default paymentRouter;