import mongoose, { mongo } from "mongoose";

async function ConnectDB(){
    try{
        await mongoose.connect(process.env.MONGO_CONNECTION_STRING);
        console.log("Database Connected..");
    }
    catch(err){
        console.log("err while connecting DB .." , err);
    }
}
export default ConnectDB;