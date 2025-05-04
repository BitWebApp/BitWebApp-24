import mongoose from "mongoose";
import { User } from "../src/models/user.model.js";
import dotenv from "dotenv";
import { DB_NAME } from "../src/constants.js";
import { Internship } from "../src/models/internship.model.js";
dotenv.config();

const func = async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    console.log("Connected to DB!");
    console.log("Finding users with missing applied internships...");
    let internships = await Internship.find({});
    internships = internships.map((internship) => internship.student);
    let users = await User.find({ _id: { $nin: internships } });
    console.log(`Found ${users.length} users to check...`);
    users = users.map((user) => ({
      _id: user._id,
      rollNumber: user.rollNumber,
      name: user.fullName,
    }));
    console.log(users);
  } catch (error) {
    console.log(error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from DB!");
  }
};
func();
