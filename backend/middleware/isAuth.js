import jwt from 'jsonwebtoken'
const isAuth =(req,res,next) =>{
    try{
        const {userToken} = req.cookies;

        if(!userToken){
            return res.status(403).json({
                success:false,
                message:"Bad Request un-Authorised access..",
            })
        }

        const decoded = jwt.verify(userToken,process.env.JWT_SECRET);
        if(!decoded){
            return res.status(403).json({
                success:false,
                message:"Invalid Token..",
            })
        }

        req.userId=decoded._id;
        next();

    }catch(err){
        console.log("Error in isAuth ..",err);
        return res.status(403).json({
                success:false,
                message:"Error in isAuth middleware..",
        }) 
    }
}

export default isAuth;