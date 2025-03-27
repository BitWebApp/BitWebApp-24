import mongoose from "mongoose";
import { Professor } from "../src/models/professor.model.js";
import dotenv from "dotenv";
import { DB_NAME } from "../src/constants.js";
dotenv.config();
const updateProfessorLimit = async (professor, limit, type) => {
  if (!professor) {
    console.log("Prof not found!");
    return;
  }
  if (limit == null || !type) {
    console.log("limit and field are required!");
    return;
  }
  if (type === "summer_training") {
    if (limit < professor.currentCount.summer_training) {
      console.error(
        `Professor ${professor._id}: Limit (${limit}) cannot be less than current count (${professor.currentCount.summer_training})!`
      );
      return;
    }
    professor.limits.summer_training = limit;
  } else if (type === "minor_project") {
    if (limit < professor.currentCount.minor_project) {
      console.error(
        `Professor ${professor._id}: Limit (${limit}) cannot be less than current count (${professor.currentCount.minor_project})!`
      );
      return;
    }
    professor.limits.minor_project = limit;
  } else if (type === "major_project") {
    if (limit < professor.currentCount.major_project) {
      console.error(
        `Professor ${professor._id}: Limit (${limit}) cannot be less than current count (${professor.currentCount.major_project})!`
      );
      return;
    }
    professor.limits.major_project = limit;
  } else {
    console.error("Invalid type provided!");
    return;
  }
  try {
    const updatedProfessor = await professor.save();
    console.log(`Updated professor ${updatedProfessor._id} successfully.`);
  } catch (error) {
    console.error(`Error saving professor ${professor._id}:`, error.message);
  }
};

const updateAllProfessors = async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    console.log("Connected to DB!");
    const professors = await Professor.find({});
    console.log(`Found ${professors.length} professors.`);
    for (const professor of professors) {
      await updateProfessorLimit(professor, 7, "summer_training");
    }
    console.log("All professors updated!");
  } catch (error) {
    console.log(error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from DB!");
  }
};
updateAllProfessors();
