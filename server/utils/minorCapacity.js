import { Minor } from "../models/minor.model.js";
import { User } from "../models/user.model.js";
import { isMinorBatchAllowed } from "./projectEligibility.js";

// The minor project limit applies to each batch separately: a professor with a
// limit of 7 can take 7 students from K22 and another 7 from K23.
// `currentCount.minor_project` is the total across batches, so capacity checks
// count the accepted students per batch from the groups themselves.

/**
 * Number of students per batch among the given user ids.
 * @returns {Promise<Record<number, number>>}
 */
export const countBatches = async (memberIds, session = null) => {
  const members = await User.find({ _id: { $in: memberIds } })
    .select("batch")
    .session(session);
  const counts = {};
  for (const member of members) {
    counts[member.batch] = (counts[member.batch] || 0) + 1;
  }
  return counts;
};

/**
 * Accepted minor project students per batch for each given professor.
 * @returns {Promise<Map<string, Record<number, number>>>} keyed by professor id
 */
export const getMinorCountsByBatch = async (professors, session = null) => {
  const profIdByGroup = new Map();
  for (const prof of professors) {
    for (const groupId of prof.students?.minor_project || []) {
      profIdByGroup.set(groupId.toString(), prof._id.toString());
    }
  }

  const groups = await Minor.find({ _id: { $in: [...profIdByGroup.keys()] } })
    .select("members")
    .populate({ path: "members", select: "batch" })
    .session(session);

  const result = new Map(professors.map((prof) => [prof._id.toString(), {}]));
  for (const group of groups) {
    const counts = result.get(profIdByGroup.get(group._id.toString()));
    for (const member of group.members) {
      counts[member.batch] = (counts[member.batch] || 0) + 1;
    }
  }
  return result;
};

/**
 * Groups whose members are all currently in the minor project year. Groups
 * from older batches stay in the database but are no longer eligible.
 */
export const filterMinorEligibleGroups = async (groups) => {
  const idOf = (member) => (member._id ?? member).toString();
  const users = await User.find({
    _id: { $in: groups.flatMap((group) => group.members.map(idOf)) },
  }).select("batch");
  const batchById = new Map(users.map((u) => [u._id.toString(), u.batch]));
  return groups.filter((group) =>
    group.members.every((member) =>
      isMinorBatchAllowed(batchById.get(idOf(member)))
    )
  );
};

/** Seats a professor has left for one batch (negative when over the limit). */
export const minorSeatsLeft = (prof, accepted, batch) =>
  prof.limits.minor_project - (accepted?.[batch] || 0);

/** True when every batch in the group fits in the professor's remaining seats. */
export const minorGroupFits = (prof, accepted, groupBatches) =>
  Object.entries(groupBatches).every(
    ([batch, count]) => count <= minorSeatsLeft(prof, accepted, batch)
  );
