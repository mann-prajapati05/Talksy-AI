import bcrypt from 'bcrypt';
import User from '../model/user.js';
import jwt from 'jsonwebtoken';
import { check, validationResult } from 'express-validator';

export const login = async(req,res,next) =>{
    try{
        const {email, password} =req.body;
        const user=await User.findOne({email});

        if(!user){
            return res.status(404).json({success:false,message:"User with this email not found.."});
        }

        const match= await bcrypt.compare(password,user.password);
        if(!match){
            return res.status(403).json({success:false,message:"Invalid email or password.."});
        }
        const payload={
            _id:user._id,
            name:user.name,
            email:user.email,
            gender:user.gender
        }
        const token=await jwt.sign(payload,process.env.JWT_SECRET);
        
        res.cookie("userToken",token,{
            httpOnly:true,
            secure:process.env.NODE_ENV==='prod',
            maxAge:3600000,
            sameSite:'strict'
        });

        return res.status(200).json({
            success:true,
            message:"Login successfully.."
        })

    }catch(err){
        console.log("Error while login user.." ,err);
        return res.status(400).json({
            success:false,
            message:"login failed..",
            err
        });
    }
}

export const signup=[
    check('name')
    .trim()
    .isLength({min:2})
    .withMessage("Name should be long atleast 2 charcters..")
    .matches(/^[A-Za-z\s]+$/)
    .withMessage("Name must contains only alphabets...") ,

    check('email')
    .normalizeEmail()
    .isEmail()
    .withMessage("Please Enter Valid email") ,

    check('password')
    .trim()
    .isLength({min:8})
    .withMessage("Password must contain atleast 8  characters..")
    .matches(/[a-z]/)
    .withMessage('Password should be atleat one lowercase letter')
    .matches(/[A-Z]/)
    .withMessage('Password should be atleat one uppercase letter')
    .matches(/[0-9]/)
    .withMessage('Password should be atleat one Number')
    .matches(/[!@#$%^&*()_<> ]/)
    .withMessage('Password should be atleat one special character') ,

    check('confirmPassword')
    .trim()
    .custom((value,{req})=>{
        if(value!==req.body.password){
            throw new Error("Password do not match..");
        }
        return true;
    }) , 

    check('gender')
    .notEmpty()
    .withMessage("Gender is required..")
    .isIn(['male','female'])
    .withMessage("Invalid gender..") ,

    async(req,res,next)=>{
        try{
            const {name,email,password,gender} = req.body;
            const errors= validationResult(req);

            if(!errors.isEmpty()){
                return res.status(400).json({
                    success:false,
                    message:"sign failed..",
                    errors: errors.array()
                });
            }

            const hashedPassword= await bcrypt.hash(password,10);
            
            const user=new User({name, email , password:hashedPassword , gender});
            await user.save();

            const payload={
                _id:user._id,
                name:user.name,
                email:user.email,
                gender:user.gender
            }
            const token=jwt.sign(payload,process.env.JWT_SECRET);

            res.cookie("userToken",token,{
                httpOnly:true,
                secure:process.env.NODE_ENV==='prod',
                maxAge:3600000,
                sameSite:'strict'
            });

            return res.status(201).json({
                success:true,
                message:"sign successfully.."
            })
    }catch(err){
        console.log("Error while user signup..",err);
        return res.status(400).json({
            success:false,
            message:"sign failed..",
            err
        });
    }
}
]