import cron from "node-cron";
import moment from "moment";
import { Group } from "../models/group.model.js";
import { Professor } from "../models/professor.model.js";

const preprocessGroups = async () => {
  try {
    console.log("Preprocessing groups to clean up limit exceeded professors");
    const groups = await Group.find({
      summerAppliedProfs: { $exists: true, $ne: [] },
      summerAllocatedProf: { $exists: false },
    });
    console.log(`Found ${groups.length} groups to preprocess`);

    for (const group of groups) {
      try {
        const originalFirstPref =
          group.summerAppliedProfs.length > 0
            ? group.summerAppliedProfs[0].toString()
            : null;

        const newAppliedProfs = [];
        for (const profId of group.summerAppliedProfs) {
          const prof = await Professor.findById(profId);
          if (!prof) continue;

          const availableSlots =
            prof.limits.summer_training - prof.currentCount.summer_training;

          if (group.members.length <= availableSlots) {
            newAppliedProfs.push(prof._id);
          }
        }
        group.summerAppliedProfs = newAppliedProfs;
        const newFirstPref =
          group.summerAppliedProfs.length > 0
            ? group.summerAppliedProfs[0].toString()
            : null;

        if (
          originalFirstPref &&
          newFirstPref &&
          originalFirstPref !== newFirstPref
        ) {
          await Professor.findByIdAndUpdate(originalFirstPref, {
            $pull: { "appliedGroups.summer_training": group._id },
          });

          await Professor.findByIdAndUpdate(newFirstPref, {
            $push: { "appliedGroups.summer_training": group._id },
          });

          group.preferenceLastMovedAt = new Date();
        }
        await group.save();

        if (
          originalFirstPref &&
          newFirstPref &&
          originalFirstPref !== newFirstPref
        ) {
          console.log(
            `Group ${group._id} moved to professor ${newFirstPref} from ${originalFirstPref}`
          );
        }
      } catch (error) {
        console.log(`Error saving group ${group.groupId || group._id}:`, error);
      }
    }
  } catch (error) {
    console.log("Error preprocessing groups:", error);
  }
};

const moveApplications = async () => {
  try {
    console.log("Checking and moving pending applications...");
    const fiveDaysAgo = moment().subtract(7, "days").toDate();
    console.log(fiveDaysAgo);
    console.log(`Looking for groups with no movement since: ${fiveDaysAgo}`);
    const groups = await Group.find({
      summerAppliedProfs: { $exists: true, $ne: [] },
      summerAllocatedProf: { $exists: false },
      preferenceLastMovedAt: { $lte: fiveDaysAgo },
    });
    console.log(
      `Found ${groups.length} groups eligible for preference movement`
    );
    for (const group of groups) {
      console.log(`Processing group: ${group.groupId}`);
      console.log(
        `Current applied professors: ${group.summerAppliedProfs.length}`
      );
      const profToMove = group.summerAppliedProfs.shift();
      console.log(`Moving professor ${profToMove} from applied to denied`);
      group.deniedProf.push(profToMove);
      console.log(`Denied professors count: ${group.deniedProf.length}`);
      const prof = await Professor.findById(profToMove);
      prof.appliedGroups.summer_training =
        prof.appliedGroups.summer_training.filter(
          (grpId) => grpId.toString() !== group._id.toString()
        );
      await prof.save();
      console.log(`Updated professor ${prof.fullName}'s applied groups`);
      const nextProf = group.summerAppliedProfs[0];
      if (nextProf) {
        console.log(`Next professor in line: ${nextProf}`);
        const nextProfessor = await Professor.findById(nextProf);
        if (nextProfessor) {
          console.log(
            `Adding group ${group._id} to professor ${nextProfessor.fullName}'s applied groups`
          );
          nextProfessor.appliedGroups.summer_training.push(group._id);
          await nextProfessor.save();
          console.log(
            `Updated professor ${nextProfessor.fullName}'s applied groups`
          );
        }
      }
      group.preferenceLastMovedAt = new Date();
      await group.save();
      console.log(`Group ${group.groupId} saved successfully`);
    }
    console.log("Pending applications moved successfully!");
  } catch (error) {
    console.error("Error moving pending applications:", error);
    console.error(error.stack);
  }
};

cron.schedule(
  "30 18 * * *",
  async () => {
    console.log();
    await preprocessGroups();
    await moveApplications();
    console.log("All pending applications moved successfully!");
  },
  {
    timezone: "UTC",
  }
);

export { preprocessGroups, moveApplications };
