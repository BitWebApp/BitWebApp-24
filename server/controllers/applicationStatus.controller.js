import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { courseLabel } from "../utils/courses.js";
import {
  allotGroupMentor,
  groupBatches,
  undoGroupRejection,
} from "../utils/groupAllotment.js";
import { getGroupProject } from "../utils/groupProjects.js";
import { getProjectBatch } from "../utils/projectEligibility.js";
import { DEFAULT_PROGRAM, programQuery } from "../utils/programs.js";

const STUDENT_FIELDS =
  "fullName rollNumber email mobileNumber branch section batch";
const FACULTY_FIELDS = "fullName idNumber email";

/**
 * Batch to open on: the one doing the project this year, else the batch
 * with the most groups for the project, else the newest.
 */
const defaultBatch = async (project, projectBatch, batches) => {
  if (projectBatch !== null && batches.includes(projectBatch)) {
    return projectBatch;
  }
  const leaders = await project.groupModel.distinct("leader");
  const leaderBatches = await User.find({
    _id: { $in: leaders },
    batch: { $in: batches },
  }).select("batch");
  const counts = {};
  leaderBatches.forEach((u) => {
    counts[u.batch] = (counts[u.batch] || 0) + 1;
  });
  const busiest = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  return busiest ? Number(busiest[0]) : batches[0];
};

const facultyList = (list = []) =>
  list
    .filter(Boolean)
    .map((f) => ({ _id: f._id, fullName: f.fullName, idNumber: f.idNumber }));

/**
 * GET /api/v1/admin/application-status?course=minor_project&batch=23
 *
 * Where every B.Tech student of a batch stands in the mentor application
 * flow of one group project (summer_training, minor_project,
 * major_project or project1):
 * - notApplied: students who have not applied to any faculty yet, either
 *   because they are not in a group, their group chose no faculty, or every
 *   faculty they chose declined;
 * - notAllotted: groups waiting for a faculty, with the faculty they chose
 *   in preference order (the first one is reviewing the application) and
 *   the ones who declined;
 * - allotted: count of students who already have a mentor.
 *
 * Without a batch, the batch doing the project this year is used (K23 for
 * Minor Project and K24 for Project 1 in 2026-27). For projects not tied
 * to a year here, the batch with the most groups is used. Batch
 * coordinators only get their own batches.
 */
const getApplicationStatus = asyncHandler(async (req, res) => {
  const course = req.query.course || "minor_project";
  const project = getGroupProject(course);
  if (!project) {
    throw new ApiError(
      400,
      "course must be summer_training, minor_project, major_project or project1"
    );
  }

  const admin = req.admin;
  const allBatches = (
    await User.distinct("batch", programQuery(DEFAULT_PROGRAM))
  ).filter((b) => b !== null && b !== undefined);
  const batches = (
    admin.role === "master"
      ? allBatches
      : allBatches.filter((b) => (admin.assignedBatches || []).includes(b))
  ).sort((a, b) => b - a);

  const projectBatch = getProjectBatch(course);
  let batch = req.query.batch
    ? Number(String(req.query.batch).replace(/^[kK]/, ""))
    : await defaultBatch(project, projectBatch, batches);
  if (req.query.batch && Number.isNaN(batch)) {
    throw new ApiError(400, "Batch must look like 23 or K23");
  }
  if (
    batch !== undefined &&
    admin.role !== "master" &&
    !(admin.assignedBatches || []).includes(batch)
  ) {
    throw new ApiError(403, `You don't have access to batch K${batch}`);
  }

  const empty = {
    course,
    courseLabel: courseLabel(course),
    batch: batch ?? null,
    batches,
    projectBatch,
    summary: { students: 0, notApplied: 0, waiting: 0, allotted: 0 },
    notApplied: [],
    notAllotted: [],
  };
  if (batch === undefined) {
    return res
      .status(200)
      .json(new ApiResponse(200, empty, "No B.Tech students yet"));
  }

  const students = await User.find({
    batch,
    ...programQuery(DEFAULT_PROGRAM),
  })
    .select(STUDENT_FIELDS)
    .sort({ rollNumber: 1 });
  const studentIds = students.map((s) => s._id);

  // Group membership is read from the groups themselves, which stays right
  // even where a student's own group reference is out of date.
  const groups = await project.groupModel
    .find({ members: { $in: studentIds } })
    .select(
      `groupId projectTitle members leader preferenceLastMovedAt deniedProf ${project.mentorField} ${project.appliedField}`
    )
    .populate(project.appliedField, FACULTY_FIELDS)
    .populate("deniedProf", FACULTY_FIELDS)
    .populate(project.mentorField, FACULTY_FIELDS);
  const groupOf = new Map();
  groups.forEach((g) => g.members.forEach((m) => groupOf.set(String(m), g)));

  const studentRow = (s) => ({
    _id: s._id,
    rollNumber: s.rollNumber,
    fullName: s.fullName,
    email: s.email,
    mobileNumber: s.mobileNumber,
    branch: s.branch,
    section: s.section,
  });

  const notApplied = [];
  let allotted = 0;
  const waitingGroups = new Map();
  students.forEach((s) => {
    const group = groupOf.get(String(s._id));
    if (!group) {
      notApplied.push({
        ...studentRow(s),
        groupId: "",
        groupRef: null,
        declined: [],
        reason: "Not in a group",
      });
      return;
    }
    if (group[project.mentorField]) {
      allotted += 1;
      return;
    }
    if ((group[project.appliedField] || []).length > 0) {
      if (!waitingGroups.has(String(group._id))) {
        waitingGroups.set(String(group._id), { group, members: [] });
      }
      waitingGroups.get(String(group._id)).members.push(studentRow(s));
      return;
    }
    notApplied.push({
      ...studentRow(s),
      groupId: group.groupId,
      groupRef: group._id,
      declined: facultyList(group.deniedProf),
      reason: (group.deniedProf || []).length
        ? "Every faculty chosen has declined"
        : "In a group, no faculty chosen yet",
    });
  });

  const notAllotted = [...waitingGroups.values()]
    .map(({ group, members }) => ({
      _id: group._id,
      groupId: group.groupId,
      projectTitle: group.projectTitle || "",
      members,
      preferences: facultyList(group[project.appliedField]),
      declined: facultyList(group.deniedProf),
      waitingSince: group.preferenceLastMovedAt || null,
    }))
    .sort((a, b) => a.groupId.localeCompare(b.groupId));

  const waiting = notAllotted.reduce((n, g) => n + g.members.length, 0);
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        ...empty,
        summary: {
          students: students.length,
          notApplied: notApplied.length,
          waiting,
          allotted,
        },
        notApplied,
        notAllotted,
      },
      "Application status fetched"
    )
  );
});

/** Coordinators may only act on students of their own batches. */
const requireBatchAccess = (admin, batches) => {
  if (admin.role === "master") return;
  const outside = batches.filter(
    (b) => !(admin.assignedBatches || []).includes(b)
  );
  if (outside.length) {
    throw new ApiError(
      403,
      `You don't have access to batch ${outside.map((b) => `K${b}`).join(", ")}`
    );
  }
};

/**
 * Batches touched by an action on a group (groupRef) or on a student who is
 * not in a group yet (studentId).
 */
const targetBatches = async (project, { groupRef, studentId }) => {
  if (groupRef) {
    if (!mongoose.Types.ObjectId.isValid(groupRef)) {
      throw new ApiError(400, "Invalid group");
    }
    const group = await project.groupModel.findById(groupRef).select("members");
    if (!group) throw new ApiError(404, "Group not found");
    return groupBatches(group);
  }
  if (!mongoose.Types.ObjectId.isValid(studentId)) {
    throw new ApiError(400, "Choose a group or a student");
  }
  const student = await User.findById(studentId).select("batch program");
  if (!student) throw new ApiError(404, "Student not found");
  if ((student.program || DEFAULT_PROGRAM) !== DEFAULT_PROGRAM) {
    throw new ApiError(400, "Group projects are for B.Tech students");
  }
  return [student.batch];
};

/**
 * POST /api/v1/admin/application-status/allot
 * Body: { course, groupRef | studentId, professorId }
 *
 * Admin allots a mentor to a group that has none, e.g. after a professor
 * rejected it by mistake; a student not in a group gets a one-person group.
 */
const allotMentorFromStatus = asyncHandler(async (req, res) => {
  const { course, groupRef, studentId, professorId } = req.body;
  const project = getGroupProject(course);
  if (!project) throw new ApiError(400, "Unknown project");
  requireBatchAccess(
    req.admin,
    await targetBatches(project, { groupRef, studentId })
  );
  const { group, message } = await allotGroupMentor({
    course,
    groupRef,
    studentId: groupRef ? undefined : studentId,
    professorId,
  });
  return res
    .status(200)
    .json(new ApiResponse(200, { groupRef: group._id }, message));
});

/**
 * POST /api/v1/admin/application-status/undo-rejection
 * Body: { course, groupRef, professorId }
 */
const undoRejectionFromStatus = asyncHandler(async (req, res) => {
  const { course, groupRef, professorId } = req.body;
  const project = getGroupProject(course);
  if (!project) throw new ApiError(400, "Unknown project");
  requireBatchAccess(req.admin, await targetBatches(project, { groupRef }));
  const { group, message } = await undoGroupRejection({
    course,
    groupRef,
    professorId,
  });
  return res
    .status(200)
    .json(new ApiResponse(200, { groupRef: group._id }, message));
});

export { allotMentorFromStatus, getApplicationStatus, undoRejectionFromStatus };
