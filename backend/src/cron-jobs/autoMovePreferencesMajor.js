import cron from "node-cron";
import moment from "moment";
import { Major } from "../models/major.model.js";
import { Professor } from "../models/professor.model.js";

const preprocessMajorGroups = async () => {
  try {
    console.log("Preprocessing major groups to clean up limit exceeded professors");
    const groups = await Major.find({
      majorAppliedProfs: { $exists: true, $ne: [] },
      majorAllocatedProf: { $exists: false },
    });
    console.log(`Found ${groups.length} major groups to preprocess`);

    for (const group of groups) {
      try {
        const originalFirstPref =
          group.majorAppliedProfs.length > 0
            ? group.majorAppliedProfs[0].toString()
            : null;

        const newAppliedProfs = [];
        for (const profId of group.majorAppliedProfs) {
          const prof = await Professor.findById(profId);
          if (!prof) continue;

          const availableSlots =
            prof.limits.major_project - prof.currentCount.major_project;

          if (group.members.length <= availableSlots) {
            newAppliedProfs.push(prof._id);
          }
        }
        group.majorAppliedProfs = newAppliedProfs;
        const newFirstPref =
          group.majorAppliedProfs.length > 0
            ? group.majorAppliedProfs[0].toString()
            : null;

        if (
          originalFirstPref &&
          newFirstPref &&
          originalFirstPref !== newFirstPref
        ) {
          await Professor.findByIdAndUpdate(originalFirstPref, {
            $pull: { "appliedGroups.major_project": group._id },
          });

          await Professor.findByIdAndUpdate(newFirstPref, {
            $push: { "appliedGroups.major_project": group._id },
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
            `Major group ${group._id} moved to professor ${newFirstPref} from ${originalFirstPref}`
          );
        }
      } catch (error) {
        console.log(`Error saving major group ${group.groupId || group._id}:`, error);
      }
    }
  } catch (error) {
    console.log("Error preprocessing major groups:", error);
  }
};

const moveMajorApplications = async () => {
  try {
    console.log("Checking and moving pending major applications...");
    const twoDaysAgo = moment().subtract(2, "days").toDate();
    console.log(twoDaysAgo);
    console.log(`Looking for major groups with no movement since: ${twoDaysAgo}`);
    const groups = await Major.find({
      majorAppliedProfs: { $exists: true, $ne: [] },
      majorAllocatedProf: { $exists: false },
      preferenceLastMovedAt: { $lte: twoDaysAgo },
    });
    console.log(
      `Found ${groups.length} major groups eligible for preference movement`
    );
    for (const group of groups) {
      console.log(`Processing major group: ${group.groupId}`);
      console.log(
        `Current applied professors: ${group.majorAppliedProfs.length}`
      );
      const profToMove = group.majorAppliedProfs.shift();
      console.log(`Moving professor ${profToMove} from applied to denied`);
      group.deniedProf.push(profToMove);
      console.log(`Denied professors count: ${group.deniedProf.length}`);
      const prof = await Professor.findById(profToMove);
      prof.appliedGroups.major_project =
        prof.appliedGroups.major_project.filter(
          (grpId) => grpId.toString() !== group._id.toString()
        );
      await prof.save();
      console.log(`Updated professor ${prof.fullName}'s applied groups`);
      const nextProf = group.majorAppliedProfs[0];
      if (nextProf) {
        console.log(`Next professor in line: ${nextProf}`);
        const nextProfessor = await Professor.findById(nextProf);
        if (nextProfessor) {
          console.log(
            `Adding major group ${group._id} to professor ${nextProfessor.fullName}'s applied groups`
          );
          nextProfessor.appliedGroups.major_project.push(group._id);
          await nextProfessor.save();
          console.log(
            `Updated professor ${nextProfessor.fullName}'s applied groups`
          );
        }
      }
      group.preferenceLastMovedAt = new Date();
      await group.save();
      console.log(`Major group ${group.groupId} saved successfully`);
    }
    console.log("Pending major applications moved successfully!");
  } catch (error) {
    console.error("Error moving pending major applications:", error);
    console.error(error.stack);
  }
};

cron.schedule(
  "30 18 * * *",
  async () => {
    console.log();
    await preprocessMajorGroups();
    await moveMajorApplications();
    console.log("All pending major applications moved successfully!");
  },
  {
    timezone: "UTC",
  }
);

export { preprocessMajorGroups, moveMajorApplications };