import cron from "node-cron";
import moment from "moment";
import { Minor } from "../models/minor.model.js";
import { Professor } from "../models/professor.model.js";

const preprocessMinorGroups = async () => {
  try {
    console.log("Preprocessing minor groups to clean up limit exceeded professors");
    const groups = await Minor.find({
      minorAppliedProfs: { $exists: true, $ne: [] },
      minorAllocatedProf: { $exists: false },
    });
    console.log(`Found ${groups.length} minor groups to preprocess`);

    for (const group of groups) {
      try {
        const originalFirstPref =
          group.minorAppliedProfs.length > 0
            ? group.minorAppliedProfs[0].toString()
            : null;

        const newAppliedProfs = [];
        for (const profId of group.minorAppliedProfs) {
          const prof = await Professor.findById(profId);
          if (!prof) continue;

          const availableSlots =
            prof.limits.minor_project - prof.currentCount.minor_project;

          if (group.members.length <= availableSlots) {
            newAppliedProfs.push(prof._id);
          }
        }
        group.minorAppliedProfs = newAppliedProfs;
        const newFirstPref =
          group.minorAppliedProfs.length > 0
            ? group.minorAppliedProfs[0].toString()
            : null;

        if (
          originalFirstPref &&
          newFirstPref &&
          originalFirstPref !== newFirstPref
        ) {
          await Professor.findByIdAndUpdate(originalFirstPref, {
            $pull: { "appliedGroups.minor_project": group._id },
          });

          await Professor.findByIdAndUpdate(newFirstPref, {
            $push: { "appliedGroups.minor_project": group._id },
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
            `Minor group ${group._id} moved to professor ${newFirstPref} from ${originalFirstPref}`
          );
        }
      } catch (error) {
        console.log(`Error saving minor group ${group.groupId || group._id}:`, error);
      }
    }
  } catch (error) {
    console.log("Error preprocessing minor groups:", error);
  }
};

const moveMinorApplications = async () => {
  try {
    console.log("Checking and moving pending minor applications...");
    const fiveDaysAgo = moment().subtract(7, "days").toDate();
    console.log(fiveDaysAgo);
    console.log(`Looking for minor groups with no movement since: ${fiveDaysAgo}`);
    const groups = await Minor.find({
      minorAppliedProfs: { $exists: true, $ne: [] },
      minorAllocatedProf: { $exists: false },
      preferenceLastMovedAt: { $lte: fiveDaysAgo },
    });
    console.log(
      `Found ${groups.length} minor groups eligible for preference movement`
    );
    for (const group of groups) {
      console.log(`Processing minor group: ${group.groupId}`);
      console.log(
        `Current applied professors: ${group.minorAppliedProfs.length}`
      );
      const profToMove = group.minorAppliedProfs.shift();
      console.log(`Moving professor ${profToMove} from applied to denied`);
      group.deniedProf.push(profToMove);
      console.log(`Denied professors count: ${group.deniedProf.length}`);
      const prof = await Professor.findById(profToMove);
      prof.appliedGroups.minor_project =
        prof.appliedGroups.minor_project.filter(
          (grpId) => grpId.toString() !== group._id.toString()
        );
      await prof.save();
      console.log(`Updated professor ${prof.fullName}'s applied groups`);
      const nextProf = group.minorAppliedProfs[0];
      if (nextProf) {
        console.log(`Next professor in line: ${nextProf}`);
        const nextProfessor = await Professor.findById(nextProf);
        if (nextProfessor) {
          console.log(
            `Adding minor group ${group._id} to professor ${nextProfessor.fullName}'s applied groups`
          );
          nextProfessor.appliedGroups.minor_project.push(group._id);
          await nextProfessor.save();
          console.log(
            `Updated professor ${nextProfessor.fullName}'s applied groups`
          );
        }
      }
      group.preferenceLastMovedAt = new Date();
      await group.save();
      console.log(`Minor group ${group.groupId} saved successfully`);
    }
    console.log("Pending minor applications moved successfully!");
  } catch (error) {
    console.error("Error moving pending minor applications:", error);
    console.error(error.stack);
  }
};

cron.schedule(
  "30 18 * * *",
  async () => {
    console.log();
    await preprocessMinorGroups();
    await moveMinorApplications();
    console.log("All pending minor applications moved successfully!");
  },
  {
    timezone: "UTC",
  }
);

export { preprocessMinorGroups, moveMinorApplications };
