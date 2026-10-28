import mongoose from "mongoose";
import { customAlphabet } from "nanoid";
import { Internship } from "../models/internship.model.js";
import { Professor } from "../models/professor.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "./ApiError.js";
import { courseLabel } from "./courses.js";
import { getGroupProject } from "./groupProjects.js";
import { getCurrentSession } from "./sessions.js";

// Same group codes the student flows create.
const newGroupCode = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 6);

/** Fields a one-person group needs that students normally choose. */
const NEW_GROUP_DEFAULTS = {
  summer_training: {
    type: "summer",
    typeOfSummer: "research",
    location: "inside_bit",
  },
  major_project: { type: "research" },
};

/** The group a student belongs to for a project, read from the groups. */
export const findStudentGroup = (project, studentId, session = null) =>
  project.groupModel.findOne({ members: studentId }).session(session);

/**
 * Batches of a group's members.
 * @returns {Promise<number[]>}
 */
export const groupBatches = async (group) => {
  const members = await User.find({ _id: { $in: group.members } }).select(
    "batch"
  );
  return [...new Set(members.map((m) => m.batch))];
};

const overLimitNote = async (professorId, course) => {
  const prof = await Professor.findById(professorId).select(
    "fullName currentCount limits"
  );
  const count = prof.currentCount?.[course] || 0;
  const limit = prof.limits?.[course];
  return limit !== undefined && count > limit
    ? ` ${prof.fullName} now has ${count} ${courseLabel(course)} students, above their limit of ${limit}.`
    : "";
};

/**
 * Admin allotment of a mentor to a group, recorded exactly as if the mentor
 * had accepted the group's application: the group gets the mentor and the
 * session, its pending applications are withdrawn from every professor, and
 * the mentor's student list and seat count go up. A student who is not in a
 * group gets a one-person group first; other students can still join it.
 *
 * @param {{ course: string, groupRef?: string, studentId?: string, professorId: string, session?: string }} input
 * @returns {Promise<{ group: object, createdGroup: boolean, message: string }>}
 */
export const allotGroupMentor = async ({
  course,
  groupRef,
  studentId,
  professorId,
  session: allotSession,
}) => {
  const project = getGroupProject(course);
  if (!project) throw new ApiError(400, "Unknown project");
  if (!mongoose.Types.ObjectId.isValid(professorId)) {
    throw new ApiError(400, "Choose a mentor");
  }
  const prof = await Professor.findById(professorId).select("fullName");
  if (!prof) throw new ApiError(404, "Mentor not found");

  let group;
  let createdGroup = false;
  const txn = await mongoose.startSession();
  try {
    await txn.withTransaction(async () => {
      createdGroup = false;
      group = groupRef
        ? await project.groupModel.findById(groupRef).session(txn)
        : await findStudentGroup(project, studentId, txn);
      if (!group && groupRef) throw new ApiError(404, "Group not found");

      if (!group) {
        const student = await User.findById(studentId)
          .select("_id")
          .session(txn);
        if (!student) throw new ApiError(404, "Student not found");
        [group] = await project.groupModel.create(
          [
            {
              groupId: newGroupCode(),
              leader: student._id,
              members: [student._id],
              ...(NEW_GROUP_DEFAULTS[course] || {}),
            },
          ],
          { session: txn }
        );
        await User.updateOne(
          { _id: student._id },
          { $set: { [project.groupField]: group._id } },
          { session: txn }
        );
        createdGroup = true;
      }

      if (group[project.mentorField]) {
        const current = await Professor.findById(group[project.mentorField])
          .select("fullName")
          .session(txn);
        throw new ApiError(
          409,
          `Group ${group.groupId} already has ${current?.fullName || "a mentor"} for ${courseLabel(course)}; change it with Edit Allotment`
        );
      }

      // Withdraw the group's pending application wherever it is waiting.
      await Professor.updateMany(
        { [`appliedGroups.${course}`]: group._id },
        { $pull: { [`appliedGroups.${course}`]: group._id } },
        { session: txn }
      );
      await project.groupModel.updateOne(
        { _id: group._id },
        {
          $set: {
            [project.mentorField]: prof._id,
            [project.appliedField]: [],
            session: allotSession || getCurrentSession(),
          },
        },
        { session: txn }
      );
      await Professor.updateOne(
        { _id: prof._id },
        {
          $addToSet: { [`students.${course}`]: group._id },
          $inc: { [`currentCount.${course}`]: group.members.length },
        },
        { session: txn }
      );

      // Summer training keeps an internship record per student, as when a
      // mentor accepts the group.
      if (course === "summer_training") {
        for (const studentRef of group.members) {
          await Internship.findOneAndUpdate(
            { student: studentRef, mentor: { $exists: false } },
            {
              type: group.typeOfSummer,
              location: group.location || "inside_bit",
              company:
                group.typeOfSummer === "industrial" ? group.org : undefined,
              mentor: prof._id,
            },
            { upsert: true, new: true, session: txn }
          );
        }
      }
    });
  } finally {
    await txn.endSession();
  }

  const size = group.members.length;
  return {
    group,
    createdGroup,
    message: `${createdGroup ? "One-person group" : "Group"} ${group.groupId} (${size} student${size === 1 ? "" : "s"}) allotted to ${prof.fullName} for ${courseLabel(course)}.${await overLimitNote(prof._id, course)}`,
  };
};

/**
 * Undo a professor's rejection of a group: the professor is taken off the
 * group's declined list and the application goes back to them, ahead of
 * the group's remaining preferences, so they can accept it now.
 *
 * @param {{ course: string, groupRef: string, professorId: string }} input
 * @returns {Promise<{ group: object, message: string }>}
 */
export const undoGroupRejection = async ({ course, groupRef, professorId }) => {
  const project = getGroupProject(course);
  if (!project) throw new ApiError(400, "Unknown project");
  if (!mongoose.Types.ObjectId.isValid(professorId)) {
    throw new ApiError(400, "Choose the professor whose rejection to undo");
  }
  const prof = await Professor.findById(professorId).select("fullName");
  if (!prof) throw new ApiError(404, "Professor not found");

  let group;
  const txn = await mongoose.startSession();
  try {
    await txn.withTransaction(async () => {
      group = await project.groupModel.findById(groupRef).session(txn);
      if (!group) throw new ApiError(404, "Group not found");
      if (group[project.mentorField]) {
        throw new ApiError(
          409,
          `Group ${group.groupId} already has a mentor for ${courseLabel(course)}; change it with Edit Allotment`
        );
      }
      if (!group.deniedProf.some((p) => p.equals(prof._id))) {
        throw new ApiError(
          409,
          `${prof.fullName} has not declined group ${group.groupId}`
        );
      }

      const preferences = group[project.appliedField].filter(
        (p) => !p.equals(prof._id)
      );
      // The application moves from whoever has it now back to this professor.
      if (preferences.length) {
        await Professor.updateOne(
          { _id: preferences[0] },
          { $pull: { [`appliedGroups.${course}`]: group._id } },
          { session: txn }
        );
      }
      await Professor.updateOne(
        { _id: prof._id },
        { $addToSet: { [`appliedGroups.${course}`]: group._id } },
        { session: txn }
      );
      await project.groupModel.updateOne(
        { _id: group._id },
        {
          $pull: { deniedProf: prof._id },
          $set: {
            [project.appliedField]: [prof._id, ...preferences],
            preferenceLastMovedAt: new Date(),
          },
        },
        { session: txn }
      );
    });
  } finally {
    await txn.endSession();
  }

  return {
    group,
    message: `Rejection undone: group ${group.groupId}'s application is back with ${prof.fullName}, who can accept it now.`,
  };
};
