import User from "../model/user.js";

export const getCurrentUser = async(req,res)=>{
    try{
        const userId=req.userId;
        const user=await User.findById(userId);
        if(!user){
            return res.status(404).json({
                success:false,
                message:"User not found..",
            })
        }
        console.log(user);
        return res.status(200).json({
            name:user.name,
            email:user.email,
            gender:user.gender,
            credits:user.credits,
        });
    }catch(err){
        return res.status(404).json({
                success:false,
                message:"something went wrong while finding user..",
                err
            }) 
    }
}