import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        require:true,
    },
    email:{
        type:String,
        require:true,
        unique:true,
    },
    password:{
        type:String,
    },
    gender:{
        type:String,
        enum:["male","female"],
    },
    credits:{
        type:Number,
        default:100
    }
},{timestamps:true});

const User = mongoose.model("User",userSchema);
export default User;