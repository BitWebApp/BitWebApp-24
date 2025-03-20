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
    const allProfs = await Professor.find({});
    const overLimitProfs = new Set(
      allProfs
        .filter(
          (prof) =>
            prof.currentCount.summer_training >= prof.limits.summer_training
        )
        .map((prof) => prof._id.toString())
    );
    console.log(`Found ${overLimitProfs.size} professors over their limits`);
    for (const group of groups) {
      group.summerAppliedProfs = group.summerAppliedProfs.filter(
        (profId) => !overLimitProfs.has(profId.toString())
      );
      await group.save();
    }
    console.log("Preprocessing completed!");
  } catch (error) {
    console.log("Error preprocessing groups:", error);
  }
};

const moveApplications = async () => {
  try {
    console.log("Checking and moving pending applications...");
    const fiveDaysAgo = moment().subtract(3, "days").toDate();
    console.log(fiveDaysAgo)
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

moveApplications();
export { preprocessGroups, moveApplications };
