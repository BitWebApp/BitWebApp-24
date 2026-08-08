import cron from "node-cron";
import moment from "moment";
import { Project1 } from "../models/project1.model.js";
import { Professor } from "../models/professor.model.js";

const preprocessProject1 = async () => {
  try {
    console.log("Preprocessing Project 1 records to clean up limit exceeded professors");
    const records = await Project1.find({
      appliedProfs: { $exists: true, $ne: [] },
      allocatedProf: { $exists: false },
    });
    console.log(`Found ${records.length} Project 1 records to preprocess`);

    for (const record of records) {
      try {
        const originalFirstPref =
          record.appliedProfs.length > 0
            ? record.appliedProfs[0].toString()
            : null;

        const newAppliedProfs = [];
        for (const profId of record.appliedProfs) {
          const prof = await Professor.findById(profId);
          if (!prof) continue;

          const availableSlots =
            (prof.limits?.project1 || 0) - (prof.currentCount?.project1 || 0);

          if (record.members.length <= availableSlots) {
            newAppliedProfs.push(prof._id);
          }
        }
        record.appliedProfs = newAppliedProfs;
        const newFirstPref =
          record.appliedProfs.length > 0
            ? record.appliedProfs[0].toString()
            : null;

        if (
          originalFirstPref &&
          newFirstPref &&
          originalFirstPref !== newFirstPref
        ) {
          await Professor.findByIdAndUpdate(originalFirstPref, {
            $pull: { "appliedGroups.project1": record._id },
          });

          await Professor.findByIdAndUpdate(newFirstPref, {
            $push: { "appliedGroups.project1": record._id },
          });

          record.preferenceLastMovedAt = new Date();
        }
        await record.save({ validateBeforeSave: false });

        if (
          originalFirstPref &&
          newFirstPref &&
          originalFirstPref !== newFirstPref
        ) {
          console.log(
            `Project 1 record ${record._id} moved to professor ${newFirstPref} from ${originalFirstPref}`
          );
        }
      } catch (error) {
        console.log(`Error saving Project 1 record ${record._id}:`, error);
      }
    }
  } catch (error) {
    console.log("Error preprocessing Project 1 records:", error);
  }
};

const moveApplications = async () => {
  try {
    console.log("Checking and moving pending Project 1 applications...");
    const daysAgo = moment().subtract(2, "days").toDate();
    console.log(daysAgo);
    console.log(`Looking for records with no movement since: ${daysAgo}`);
    const records = await Project1.find({
      appliedProfs: { $exists: true, $ne: [] },
      allocatedProf: { $exists: false },
      preferenceLastMovedAt: { $lte: daysAgo },
    });
    console.log(
      `Found ${records.length} Project 1 records eligible for preference movement`
    );
    for (const record of records) {
      console.log(`Processing Project 1 record: ${record._id}`);
      console.log(
        `Current applied professors: ${record.appliedProfs.length}`
      );
      const profToMove = record.appliedProfs.shift();
      console.log(`Moving professor ${profToMove} from applied to denied`);
      record.deniedProf.push(profToMove);
      console.log(`Denied professors count: ${record.deniedProf.length}`);
      const prof = await Professor.findById(profToMove);
      if (prof) {
        prof.appliedGroups.project1 = prof.appliedGroups.project1.filter(
          (grpId) => grpId.toString() !== record._id.toString()
        );
        await prof.save();
        console.log(`Updated professor ${prof.fullName}'s applied Project 1 groups`);
      }

      const nextProf = record.appliedProfs[0];
      if (nextProf) {
        console.log(`Next professor in line: ${nextProf}`);
        const nextProfessor = await Professor.findById(nextProf);
        if (nextProfessor) {
          console.log(
            `Adding record ${record._id} to professor ${nextProfessor.fullName}'s applied Project 1 list`
          );
          nextProfessor.appliedGroups.project1.push(record._id);
          await nextProfessor.save();
          console.log(
            `Updated professor ${nextProfessor.fullName}'s applied Project 1 list`
          );
        }
      }
      record.preferenceLastMovedAt = new Date();
      await record.save({ validateBeforeSave: false });
      console.log(`Project 1 record ${record._id} saved successfully`);
    }
    console.log("Pending Project 1 applications moved successfully!");
  } catch (error) {
    console.error("Error moving pending Project 1 applications:", error);
    console.error(error.stack);
  }
};

cron.schedule(
  "30 18 * * *",
  async () => {
    console.log();
    await preprocessProject1();
    await moveApplications();
    console.log("All pending Project 1 applications moved successfully!");
  },
  {
    timezone: "UTC",
  }
);
