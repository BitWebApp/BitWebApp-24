import mongoose from "mongoose";
import cron from "node-cron";
import bcrypt from "bcrypt";
// import dotenv from "dotenv";
import { Group } from "../src/models/group.model.js";
import { Professor } from "../src/models/professor.model.js";
import {
  preprocessGroups,
  moveApplications,
} from "../src/cron-jobs/autoMovePreferences.js";

// dotenv.config();

mongoose
  .connect("")
  .then(() => console.log("Connected to MongoDB for testing"))
  .catch((err) => console.error("MongoDB connection error:", err));

async function setupTestData() {
  try {
    // Clear previous test data
    await Professor.deleteMany();
    await Group.deleteMany();

    console.log("Creating test professors...");

    // Create professors with realistic currentCount values.
    // Prof Available is below limit.
    // Prof At Limit is exactly at limit.
    // Prof Over Limit is above the limit.
    // Prof Backup is below its limit.
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
        currentCount: { summer_training: 6 }, // at limit
      },
      {
        idNumber: "TEST003",
        fullName: "Prof Over Limit",
        contact: "1234567892",
        email: "test3@bit.ac.in",
        password: await bcrypt.hash("password123", 10),
        limits: { summer_training: 6 },
        currentCount: { summer_training: 7 }, // over limit
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
    // Create groups with varying last moved times.
    // Groups with preferenceLastMovedAt older than 4 days will trigger moveApplications.
    const groups = await Group.create([
      {
        groupId: "TEST001",
        type: "summer",
        typeOfSummer: "research",
        leader: new mongoose.Types.ObjectId(),
        // Group with two applied professors: [Prof Available, Prof At Limit]
        summerAppliedProfs: [professors[0]._id, professors[1]._id],
        // Last moved 6 days ago → eligible for movement.
        preferenceLastMovedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        deniedProf: [],
      },
      {
        groupId: "TEST002",
        type: "summer",
        typeOfSummer: "research",
        leader: new mongoose.Types.ObjectId(),
        // Group with two applied professors: [Prof Available, Prof Backup]
        summerAppliedProfs: [professors[0]._id, professors[3]._id],
        // Last moved now → not eligible for movement.
        preferenceLastMovedAt: new Date(),
        deniedProf: [],
      },
      {
        groupId: "TEST003",
        type: "summer",
        typeOfSummer: "industrial",
        leader: new mongoose.Types.ObjectId(),
        // Group with two applied professors: [Prof Over Limit, Prof Backup]
        summerAppliedProfs: [professors[2]._id, professors[3]._id],
        // Last moved 10 days ago → eligible for movement.
        preferenceLastMovedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        deniedProf: [],
      },
      {
        groupId: "TEST004",
        type: "summer",
        typeOfSummer: "industrial",
        leader: new mongoose.Types.ObjectId(),
        // Group with one applied professor: [Prof At Limit]
        summerAppliedProfs: [professors[1]._id],
        // Last moved 7 days ago → eligible for movement.
        preferenceLastMovedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        deniedProf: [],
      },
      {
        groupId: "TEST005",
        type: "summer",
        typeOfSummer: "research",
        leader: new mongoose.Types.ObjectId(),
        // This group has summerAllocatedProf set, so it should be skipped.
        summerAppliedProfs: [professors[0]._id, professors[2]._id],
        summerAllocatedProf: professors[0]._id,
        // Last moved 8 days ago, but not eligible because summerAllocatedProf exists.
        preferenceLastMovedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
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
  }
}

async function verifyTestResults() {
  try {
    console.log("\n-------- VERIFYING RESULTS --------");

    // Retrieve all test groups for verification.
    const groups = await Group.find({ groupId: /TEST/ }).lean();
    console.log(`Found ${groups.length} test groups for verification`);

    const allProfs = await Professor.find({ idNumber: /TEST/ }).lean();
    console.log(`Found ${allProfs.length} test professors for verification`);

    console.log("\n1. Verifying preprocessGroups results:");
    // preprocessGroups should keep only the first professor in summerAppliedProfs,
    // filtering out any subsequent professors that are at or over their limit.
    const availableProf = allProfs.find((p) => p.idNumber === "TEST001");
    const atLimitProf = allProfs.find((p) => p.idNumber === "TEST002");
    const overLimitProf = allProfs.find((p) => p.idNumber === "TEST003");
    const backupProf = allProfs.find((p) => p.idNumber === "TEST004");

    // For group TEST003 (originally [Prof Over Limit, Prof Backup]):
    const group3 = groups.find((g) => g.groupId === "TEST003");
    if (group3) {
      const firstProfId = group3.summerAppliedProfs[0].toString();
      console.log(
        `✓ Group TEST003 first applied professor is: ${
          firstProfId === overLimitProf._id.toString()
            ? "Prof Over Limit"
            : "Unexpected"
        }`
      );
      if (group3.summerAppliedProfs.length > 1) {
        const secondProfId = group3.summerAppliedProfs[1].toString();
        console.log(
          `✓ Group TEST003 second applied professor is: ${
            secondProfId === backupProf._id.toString()
              ? "Prof Backup"
              : "Unexpected"
          }`
        );
      } else {
        console.log("Group TEST003 second applied professor was removed");
      }
    } else {
      console.error("ERROR: Group TEST003 not found");
    }

    console.log("\n2. Verifying moveApplications results:");
    // For groups eligible for movement (preferenceLastMovedAt > 4 days ago):
    // The first professor should be moved to deniedProf.
    // For group TEST001, after processing, the applied list is expected to be empty.
    const group1 = groups.find((g) => g.groupId === "TEST001");
    if (group1) {
      const isAvailableInDenied = group1.deniedProf.some(
        (p) => p.toString() === availableProf._id.toString()
      );
      const isAppliedEmpty =
        !group1.summerAppliedProfs || group1.summerAppliedProfs.length === 0;
      console.log(
        `✓ Group TEST001 has Prof Available moved to denied list: ${isAvailableInDenied ? "PASSED" : "FAILED"}`
      );
      console.log(
        `✓ Group TEST001 has empty summerAppliedProfs: ${isAppliedEmpty ? "PASSED" : "FAILED"}`
      );
    } else {
      console.error("ERROR: Group TEST001 not found");
    }

    // Verify group TEST004 (with only [Prof At Limit]) is processed correctly.
    const group4 = groups.find((g) => g.groupId === "TEST004");
    if (group4) {
      const isAtLimitInDenied = group4.deniedProf.some(
        (p) => p.toString() === atLimitProf._id.toString()
      );
      const isAppliedEmpty =
        !group4.summerAppliedProfs || group4.summerAppliedProfs.length === 0;
      console.log(
        `✓ Group TEST004 has Prof At Limit moved to denied list: ${isAtLimitInDenied ? "PASSED" : "FAILED"}`
      );
      console.log(
        `✓ Group TEST004 has empty summerAppliedProfs: ${isAppliedEmpty ? "PASSED" : "FAILED"}`
      );
    } else {
      console.error("ERROR: Group TEST004 not found");
    }

    console.log("\n3. Verifying professor appliedGroups updates:");
    // For groups where there is a next professor in the applied list,
    // that professor should have the group id added to their appliedGroups.summer_training.
    const updatedBackupProf = await Professor.findById(backupProf._id);
    if (updatedBackupProf) {
      const appliedGroups =
        updatedBackupProf.appliedGroups?.summer_training || [];
      if (group3) {
        const hasGroup3InApplied = appliedGroups.some(
          (g) => g.toString() === group3._id.toString()
        );
        console.log(
          `✓ Prof Backup has group TEST003 in appliedGroups: ${hasGroup3InApplied ? "PASSED" : "FAILED"}`
        );
      }
    } else {
      console.warn("WARNING: Could not find updated Prof Backup data");
    }

    // Verify that group TEST005 (which has summerAllocatedProf) was not processed.
    const group5 = groups.find((g) => g.groupId === "TEST005");
    if (group5) {
      const wasProcessed =
        (group5.deniedProf && group5.deniedProf.length > 0) ||
        (group5.summerAppliedProfs && group5.summerAppliedProfs.length < 2);
      console.log(
        `✓ Group TEST005 (with summerAllocatedProf) was not processed: ${!wasProcessed ? "PASSED" : "FAILED"}`
      );
    } else {
      console.error("ERROR: Group TEST005 not found");
    }

    console.log("\n-------- TEST VERIFICATION COMPLETE --------");
  } catch (error) {
    console.error("Error verifying results:", error);
    console.error(error.stack);
  } finally {
    mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

async function runTest() {
  try {
    console.log("-------- STARTING TEST RUN --------");
    await setupTestData();

    const testGroups = await Group.find({ groupId: /TEST/ });
    const testProfs = await Professor.find({ idNumber: /TEST/ });
    console.log(`Found ${testGroups.length} test groups before processing`);
    console.log(`Found ${testProfs.length} test professors before processing`);

    console.log("\nInitial state:");
    for (const prof of testProfs) {
      console.log(
        `${prof.fullName}: currentCount=${prof.currentCount.summer_training}, limit=${prof.limits.summer_training}`
      );
    }
    for (const group of testGroups) {
      const appliedProfs = await Promise.all(
        group.summerAppliedProfs.map(async (id) => {
          const prof = await Professor.findById(id);
          return prof ? prof.fullName : "Unknown";
        })
      );
      console.log(
        `${group.groupId}: Applied professors: ${appliedProfs.join(", ")}, Last moved: ${group.preferenceLastMovedAt}`
      );
    }

    console.log("\n[1] Scheduling cron job for test execution...");
    // For testing, schedule a cron job that triggers every second.
    const job = cron.schedule("* * * * * *", async () => {
      console.log("Cron job triggered in test environment");
      await preprocessGroups();
      await moveApplications();
      // Stop the cron job after execution.
      job.stop();
      await verifyTestResults();
    });
  } catch (error) {
    console.error("Test run failed:", error);
    console.error(error.stack);
    mongoose.disconnect();
  }
}

runTest();
