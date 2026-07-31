import mongoose from "mongoose";
import { Professor } from "../src/models/professor.model.js";
import dotenv from "dotenv";
import { DB_NAME } from "../src/constants.js";
import dns from "dns";

dns.setServers(["8.8.8.8", "8.8.4.4"]);
dotenv.config();

const clearMinorAllocations = async () => {
  try {
    console.log("MONGODB_URI:", process.env.MONGODB_URI);
console.log("DB_NAME:", DB_NAME);
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    console.log("Connected to DB!");
    const result = await Professor.updateMany(
      {},
      {
        $set: {
          "students.minor_project": [],
          "appliedGroups.minor_project": [],
          "currentCount.minor_project": 0
        }
      }
    );
    console.log("Result:", result);
    console.log("Minor project allocations cleared for all professors!");
  } catch (error) {
    console.log(error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from DB!");
  }
};
clearMinorAllocations();
