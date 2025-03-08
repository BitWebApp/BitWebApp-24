import mongoose from "mongoose";
import { Group } from "../src/models/group.model.js";
import { Professor } from "../src/models/professor.model.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

mongoose
  .connect("")
  .then(() => console.log("Connected to MongoDB for test setup"))
  .catch((err) => console.error("MongoDB connection error:", err));

async function setupTestData() {
  try {
    await Professor.deleteMany();
    await Group.deleteMany();

    console.log("Creating test professors...");

    const professors = await Professor.create([
      {
        idNumber: "TEST001",
        fullName: "Prof Available",
        contact: "1234567890",
        email: "test1@bit.ac.in",
        password: await bcrypt.hash("password123", 10),
        limits: { summer_training: 6 },
        currentCount: { summer_training: 0 },
      },
      {
        idNumber: "TEST002",
        fullName: "Prof At Limit",
        contact: "1234567891",
        email: "test2@bit.ac.in",
        password: await bcrypt.hash("password123", 10),
        limits: { summer_training: 6 },
        currentCount: { summer_training: 0 },
      },
      {
        idNumber: "TEST003",
        fullName: "Prof Over Limit",
        contact: "1234567892",
        email: "test3@bit.ac.in",
        password: await bcrypt.hash("password123", 10),
        limits: { summer_training: 6 },
        currentCount: { summer_training: 0 },
      },
      {
        idNumber: "TEST004",
        fullName: "Prof Backup",
        contact: "1234567893",
        email: "test4@bit.ac.in",
        password: await bcrypt.hash("password123", 10),
        limits: { summer_training: 5 },
        currentCount: { summer_training: 0 },
      },
    ]);

    console.log(
      "Created test professors:",
      professors.map((p) => p.fullName)
    );

    console.log("Creating test groups...");
    console.log(professors[0]);
    const groups = await Group.create([
      {
        groupId: "TEST001",
        type: "summer",
        typeOfSummer: "research",
        leader: new mongoose.Types.ObjectId(),
        summerAppliedProfs: [professors[0]._id, professors[1]._id],
        preferenceLastMovedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        deniedProf: [],
      },
      {
        groupId: "TEST002",
        type: "summer",
        typeOfSummer: "research",
        leader: new mongoose.Types.ObjectId(),
        summerAppliedProfs: [professors[0]._id, professors[3]._id],
        preferenceLastMovedAt: new Date(Date.now()),
        deniedProf: [],
      },
      {
        groupId: "TEST003",
        type: "summer",
        typeOfSummer: "industrial",
        leader: new mongoose.Types.ObjectId(),
        summerAppliedProfs: [professors[2]._id, professors[3]._id],
        preferenceLastMovedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        deniedProf: [],
      },
      {
        groupId: "TEST004",
        type: "summer",
        typeOfSummer: "industrial",
        leader: new mongoose.Types.ObjectId(),
        summerAppliedProfs: [professors[1]._id],
        preferenceLastMovedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        deniedProf: [],
      },
    ]);

    console.log(
      "Created test groups:",
      groups.map((g) => g.groupId)
    );
    console.log("Test data setup complete!");
  } catch (error) {
    console.error("Error setting up test data:", error);
  } finally {
    mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

setupTestData();
