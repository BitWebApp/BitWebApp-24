import { Group } from "../models/group.model.js";
import { Major } from "../models/major.model.js";
import { Minor } from "../models/minor.model.js";
import { Project1 } from "../models/project1.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "./ApiError.js";

/**
 * Marks a mentor gives a student for a group project. Submitting marks is a
 * final submission: the marks are frozen and can no longer be changed.
 *
 * `lockedOnceSet`: minor and major project marks could already not be changed
 * once entered, so marks saved before freezing existed count as final there.
 */
export const MARKS_TYPES = {
  summerTraining: {
    label: "Summer Training",
    maxMarks: 50,
    groupModel: Group,
    groupField: "group",
    mentorField: "summerAllocatedProf",
    lockedOnceSet: false,
  },
  minorProject: {
    label: "Minor Project",
    maxMarks: 50,
    groupModel: Minor,
    groupField: "MinorGroup",
    mentorField: "minorAllocatedProf",
    lockedOnceSet: true,
  },
  majorProject: {
    label: "Major Project",
    maxMarks: 25,
    groupModel: Major,
    groupField: "MajorGroup",
    mentorField: "majorAllocatedProf",
    lockedOnceSet: true,
  },
  project1: {
    label: "Project 1",
    maxMarks: 50,
    groupModel: Project1,
    groupField: "project1",
    mentorField: "allocatedProf",
    lockedOnceSet: false,
  },
};

/** Whether a student's marks of one type are final. */
export const isMarksFrozen = (user, key) =>
  Boolean(user.marksFrozenAt?.[key]) ||
  (MARKS_TYPES[key].lockedOnceSet && Number(user.marks?.[key]) > 0);

/**
 * Parse submitted marks, rejecting anything outside 0..maxMarks.
 * @returns {number}
 */
export const parseMarks = (raw, maxMarks) => {
  const marks = Number(raw);
  if (raw === "" || raw === null || raw === undefined || Number.isNaN(marks)) {
    throw new ApiError(400, `Marks must be a number from 0 to ${maxMarks}`);
  }
  if (marks < 0 || marks > maxMarks) {
    throw new ApiError(400, `Marks must be a number from 0 to ${maxMarks}`);
  }
  return marks;
};

/**
 * Final submission of a student's marks by their mentor: validates, checks
 * the professor mentors the student's group, then saves and freezes the
 * marks in one conditional update so two submissions can't both win.
 *
 * @param {{ studentId: string, key: keyof MARKS_TYPES, marks: unknown, professorId: import("mongoose").Types.ObjectId }} input
 * @returns {Promise<object>} the updated student (name, roll number, marks)
 */
export const submitFinalMarks = async ({
  studentId,
  key,
  marks,
  professorId,
}) => {
  const type = MARKS_TYPES[key];
  const value = parseMarks(marks, type.maxMarks);

  const user = await User.findById(studentId).select(
    `fullName rollNumber marks marksFrozenAt ${type.groupField}`
  );
  if (!user) throw new ApiError(404, "User not found");

  if (isMarksFrozen(user, key)) {
    throw new ApiError(
      409,
      `${type.label} marks for ${user.rollNumber} are final and can no longer be changed`
    );
  }

  const group = user[type.groupField]
    ? await type.groupModel
        .findById(user[type.groupField])
        .select(type.mentorField)
    : null;
  if (!group?.[type.mentorField]?.equals(professorId)) {
    throw new ApiError(
      403,
      `You are not the ${type.label} mentor of ${user.rollNumber}`
    );
  }

  const result = await User.updateOne(
    { _id: user._id, [`marksFrozenAt.${key}`]: null },
    {
      $set: {
        [`marks.${key}`]: value,
        [`marksFrozenAt.${key}`]: new Date(),
      },
    }
  );
  if (result.matchedCount === 0) {
    throw new ApiError(
      409,
      `${type.label} marks for ${user.rollNumber} are final and can no longer be changed`
    );
  }

  return User.findById(user._id).select(
    "fullName rollNumber marks marksFrozenAt"
  );
};
