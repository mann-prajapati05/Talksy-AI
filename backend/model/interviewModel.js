import mongoose from "mongoose";
import User from "./user.js";

const questionsSchema = new mongoose.Schema({
    question:String,
    difficulty:{
        type:String,
        enum:["Easy","Medium","Hard"]
    },
    questionType:{
        type:String,
        enum:["Technical","Behavioral","Project","Scenario","Situational","Hr"]
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
        enum:['Fresher',"1-3 years","3+ years","Junior","Mid","Senior"],
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
    },
    // === Agentic interview fields (optional) ===
    interviewType:{
        type:String,
        enum:["classic","agentic"],
        default:"classic"
    },
    totalQuestions:{
        type:Number,
    },
    agenticState:{
        type:mongoose.Schema.Types.Mixed,
        default:null,
    }

},{timestamps:true});

const Interview=mongoose.model("Interview",interviewSchema);
export default Interview;