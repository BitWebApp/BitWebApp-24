import mongoose from "mongoose";
import { Group } from "../src/models/group.model.js";
import { Professor } from "../src/models/professor.model.js";
import {
  preprocessGroups,
  moveApplications,
} from "../src/cron-jobs/autoMovePreferences.js";
import dotenv from "dotenv";

dotenv.config();

mongoose
  .connect("")
  .then(() => console.log("Connected to MongoDB for testing"))
  .catch((err) => console.error("MongoDB connection error:", err));

async function verifyTestResults() {
  try {
    console.log("\n-------- VERIFYING RESULTS --------");

    const groups = await Group.find({ groupId: /TEST/ }).lean();
    console.log(`Found ${groups.length} test groups for verification`);

    const allProfs = await Professor.find({ idNumber: /TEST/ }).lean();
    console.log(`Found ${allProfs.length} test professors for verification`);

    console.log("\n1. Checking preprocessGroups results:");

    const availableProf = allProfs.find((p) => p.idNumber === "TEST001");
    const atLimitProf = allProfs.find((p) => p.idNumber === "TEST002");
    const overLimitProf = allProfs.find((p) => p.idNumber === "TEST003");
    const backupProf = allProfs.find((p) => p.idNumber === "TEST004");

    const profNames = {
      TEST001: "Prof Available",
      TEST002: "Prof At Limit",
      TEST003: "Prof Over Limit",
      TEST004: "Prof Backup",
    };

    console.log(
      `Prof Over Limit current count: ${overLimitProf?.currentCount?.summer_training || "N/A"}`
    );

    const group3 = groups.find((g) => g.groupId === "TEST003");
    if (group3) {
      const hasOverLimitProf = group3.summerAppliedProfs.some(
        (p) => p.toString() === overLimitProf._id.toString()
      );
      console.log(
        `✓ Group TEST003 has Prof Over Limit removed: ${!hasOverLimitProf ? "PASSED" : "FAILED"}`
      );

      const hasBackupProf = group3.summerAppliedProfs.some(
        (p) => p.toString() === backupProf._id.toString()
      );
      console.log(
        `✓ Group TEST003 still has Prof Backup: ${hasBackupProf ? "PASSED" : "FAILED"}`
      );
    } else {
      console.log("ERROR: TEST003 group not found");
    }

    console.log("\n2. Checking moveApplications results:");

    const group1 = groups.find((g) => g.groupId === "TEST001");
    if (group1) {
      const isAvailableProfInDeniedList =
        group1.deniedProf &&
        group1.deniedProf.some(
          (p) => p.toString() === availableProf._id.toString()
        );

      const isAtLimitProfStillApplied =
        group1.summerAppliedProfs &&
        group1.summerAppliedProfs.some(
          (p) => p.toString() === atLimitProf._id.toString()
        );

      console.log(
        `✓ Group TEST001 has Prof Available moved to denied list: ${isAvailableProfInDeniedList ? "PASSED" : "FAILED"}`
      );

      console.log(
        `✓ Group TEST001 still has Prof At Limit in applied list: ${isAtLimitProfStillApplied ? "PASSED" : "FAILED"}`
      );
    } else {
      console.log("ERROR: TEST001 group not found");
    }

    const group2 = groups.find((g) => g.groupId === "TEST002");
    if (group2) {
      const hasAvailableProf = group2.summerAppliedProfs.some(
        (p) => p.toString() === availableProf._id.toString()
      );

      const hasBackupProf = group2.summerAppliedProfs.some(
        (p) => p.toString() === backupProf._id.toString()
      );

      console.log(
        `✓ Group TEST002 still has Prof Available (too recent): ${hasAvailableProf ? "PASSED" : "FAILED"}`
      );

      console.log(
        `✓ Group TEST002 still has Prof Backup (too recent): ${hasBackupProf ? "PASSED" : "FAILED"}`
      );
    } else {
      console.log("ERROR: TEST002 group not found");
    }

    const group4 = groups.find((g) => g.groupId === "TEST004");
    if (group4) {
      const isEmpty =
        !group4.summerAppliedProfs || group4.summerAppliedProfs.length === 0;

      const isAtLimitProfInDenied =
        group4.deniedProf &&
        group4.deniedProf.some(
          (p) => p.toString() === atLimitProf._id.toString()
        );

      console.log(
        `✓ Group TEST004 has empty summerAppliedProfs: ${isEmpty ? "PASSED" : "FAILED"}`
      );

      console.log(
        `✓ Group TEST004 has Prof At Limit in denied list: ${isAtLimitProfInDenied ? "PASSED" : "FAILED"}`
      );
    } else {
      console.log("ERROR: TEST004 group not found");
    }

    console.log("\n3. Checking professor appliedGroups updates:");

    const updatedBackupProf = await Professor.findById(backupProf._id);
    if (updatedBackupProf) {
      const hasAppliedGroupsProp = !!updatedBackupProf.appliedGroups;
      const hasSummerTrainingProp =
        hasAppliedGroupsProp &&
        Array.isArray(updatedBackupProf.appliedGroups.summer_training);

      console.log(
        `Prof Backup has appliedGroups property: ${hasAppliedGroupsProp ? "Yes" : "No"}`
      );

      console.log(
        `Prof Backup has summer_training array: ${hasSummerTrainingProp ? "Yes" : "No"}`
      );

      if (hasSummerTrainingProp && group3) {
        const hasGroup3InApplied =
          updatedBackupProf.appliedGroups.summer_training.some(
            (g) => g.toString() === group3._id.toString()
          );

        console.log(
          `✓ Prof Backup has group TEST003 in appliedGroups: ${hasGroup3InApplied ? "PASSED" : "FAILED"}`
        );
      }
    } else {
      console.log("WARNING: Could not find updated Prof Backup data");
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

    const testGroups = await Group.find({ groupId: /TEST/ });
    const testProfs = await Professor.find({ idNumber: /TEST/ });
    console.log(`Found ${testGroups.length} test groups before processing`);
    console.log(`Found ${testProfs.length} test professors before processing`);

    if (testGroups.length === 0 || testProfs.length === 0) {
      console.error(
        "ERROR: Test data not found. Please run setupTestData.js first"
      );
      mongoose.disconnect();
      return;
    }

    console.log("\nInitial state:");
    for (const prof of testProfs) {
      console.log(
        `${prof.fullName}: currentCount=${prof.currentCount?.summer_training || 0}, limit=${prof.limits?.summer_training || "not set"}`
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
        `${group.groupId}: Applied professors: ${appliedProfs.join(", ")}`
      );
      console.log(`  Last moved: ${group.preferenceLastMovedAt}`);
    }

    console.log("\n[1] Running preprocessGroups()...");
    await preprocessGroups();
    console.log("\n[2] Running moveApplications()...");
    await moveApplications();
    await verifyTestResults();
  } catch (error) {
    console.error("Test run failed:", error);
    console.error(error.stack);
  }
}

runTest();
