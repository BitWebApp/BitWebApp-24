/**
 * Sets the program of students created before the program field existed.
 * The program is taken from the roll number prefix (MCA/10001/24 -> MCA);
 * anything else becomes B.Tech, which is what every older account is.
 *
 * Safe to run more than once: only students without a program are touched.
 * Run: node scripts/backfill-program.js
 */

import mongoose from "mongoose";
import "../server/env.js";
import connectDB from "../server/db/index.js";
import { User } from "../server/models/user.model.js";
import {
  DEFAULT_PROGRAM,
  programFromRollNumber,
} from "../server/utils/programs.js";

const backfillProgram = async () => {
  await connectDB();

  const students = await User.collection
    .find({ program: { $exists: false } }, { projection: { rollNumber: 1 } })
    .toArray();
  console.log(`Found ${students.length} student(s) without a program.`);

  const counts = {};
  const operations = students.map((student) => {
    const program =
      programFromRollNumber(student.rollNumber) || DEFAULT_PROGRAM;
    counts[program] = (counts[program] || 0) + 1;
    return {
      updateOne: {
        filter: { _id: student._id, program: { $exists: false } },
        update: { $set: { program } },
      },
    };
  });

  if (operations.length > 0) {
    await User.collection.bulkWrite(operations);
  }
  console.log("Programs set:", counts);
};

backfillProgram()
  .catch((error) => {
    console.error("Backfill failed:", error);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
