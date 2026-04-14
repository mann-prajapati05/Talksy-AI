import razorpay from "../services/razorpay.service.js";
import Payment from "../model/paymentModel.js"
import crypto from 'crypto';
import User from "../model/user.js"

export const createOrder= async(req,res)=>{
    try{
        const {planId, amount , credits}=req.body;
        if(!amount || !credits){
            return res.status(404).json({
                success:false,
                message:"Invalid amount or credits - plan data"
            });
        }
        const options={
            amount: amount*100 , //concert to paisa
            currency:"INR",
            receipt:`receipt_${Date.now()}`
        };

        const order= await razorpay.orders.create(options);

        await Payment.create({
            userId:req.userId,
            planId,
            amount,
            credits,
            razorpayOrderId:order.id,
        });

        return res.status(201).json(order);
    }catch(err){
        return res.status(500).json({
            success:false,
            message:`Failed to create razorpay order..${err}`,
        });
    }
}

export const verifyPayment = async(req,res) =>{
    try{
        const {razorpayOrderId , razorpayPaymentId , razorpaySignature }=req.body;

        const body= razorpayOrderId + "|" + razorpayPaymentId;

        const expected_signature=crypto
        .createHmac("sha256",process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest("hex");

        if(expected_signature!== razorpaySignature){
            return res.status(400).json({
                success:false,
                message:`Invalid payment signature..`,
            });
        }

        const payment= await Payment.findOne({razorpayOrderId});

        if(!payment){
        return res.status(404).json({
                success:false,
                message:`payment not found..`,
            }); 
        }

        if(payment.status==="paid"){
            return res.json({message:"Already processed.."});
        }

        payment.status="paid";
        payment.razorpayPaymentId=razorpayPaymentId;

        await payment.save();

        const updatedUser=await User.findByIdAndUpdate(payment.userId, {
            $inc:{ credits:payment.credits}
        } , {new:true});

        res.json(201).json({
            success:true,
            message:"Payment verified and credits added..",
            user:{
                name:updatedUser.name,
                email:updatedUser.email,
                gender:updatedUser.gender,
                credits:updatedUser.credits,
            }
        });

    }catch(err){
         return res.status(500).json({
            success:false,
            message:`Failed to veridy razorpay payment..${err}`,
        });
    }
}