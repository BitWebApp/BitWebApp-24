import mongoose from "mongoose";
import { Professor } from "../src/models/professor.model.js";
import { Group } from "../src/models/group.model.js";
import dotenv from "dotenv";
import { DB_NAME } from "../src/constants.js";
dotenv.config();

const mismatchedGroups = async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    console.log("Connected to DB!");
    console.log("Finding groups with missing applied professors...");
    const groups = await Group.find({
      summerAllocatedProf: { $exists: false },
      summerAppliedProfs: { $exists: true, $ne: [] },
    });
    console.log(`Found ${groups.length} groups to check...`);
    let mismatch = [];
    for (const group of groups) {
      const firstProf = group.summerAppliedProfs[0];
      if (!firstProf) {
        continue;
      }
      const prof = await Professor.findById(firstProf);
      if (
        prof &&
        (!Array.isArray(prof.appliedGroups?.summer_training) ||
          !prof.appliedGroups.summer_training.includes(group._id))
      ) {
        console.log(
          `Mismatch found for group ${group._id} and professor ${prof._id}`
        );
        mismatch.push(group._id);
      }
    }
    console.log(`Found ${mismatch.length} mismatched groups...`);
    console.log(mismatch);
  } catch (error) {
    console.log(error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from DB!");
  }
};
mismatchedGroups();
