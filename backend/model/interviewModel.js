import mongoose from "mongoose";
import User from "./user";

const questionsSchema = new mongoose.Schema({
    question:String,
    difficulty:{
        type:String,
        enum:["Easy","Medium","Hard"]
    },
    questionType:{
        type:String,
        enum:["Technical","Behavioral","Project","Scenario"]
    },
    timeLimit:Number,
    answer:String,
    feedback:String,
    score:{
        type:Number,
        default:0
    },
    confidence:{
        type:Number,
        default:0
    },
    communication:{
        type:Number,
        default:0
    },
    correctness:{
        type:Number,
        default:0
    },
});

const interviewSchema= new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    role:{
        type:String,
        required:true,
    },
    experience:{
        type:String,
        required:true,
        enum:['Fresher',"1-3 years","3+ years"],
    },
    mode:{
        type:String,
        required:true,
        enum:["Technical","HR","Mixed"],
    },
    resumeText:String,
    questions:[questionsSchema],
    finalScore:{
        type:Number,
        default:0
    },
    status:{
        type:String,
        enum:["Incompleted","completed"],
        default:"Incompleted"
    }

},{timestamps:true});

const Interview=mongoose.model("Interview",interviewSchema);
export default Interview;