import mongoose, { mongo } from "mongoose"
import { DB_NAME } from "../constants.js"

const connectDB = async () => {
    try{
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(` \n mongodb connected !! DB HOST: ${connectionInstance.connection.host}`);
    }
    catch(error) {
        console.log("MongoDB connection error", error);
        process.exit(1); // read about this
    }
}

export default connectDB