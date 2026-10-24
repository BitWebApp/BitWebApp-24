import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { courseLabel } from "../utils/courses.js";
import { getGroupProject } from "../utils/groupProjects.js";
import { DEFAULT_PROGRAM, programQuery } from "../utils/programs.js";

const STUDENT_FIELDS =
  "fullName rollNumber email mobileNumber branch section batch";
const FACULTY_FIELDS = "fullName idNumber email";

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
 * Without a batch, the newest batch the admin can see is used. Batch
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

  let batch = req.query.batch
    ? Number(String(req.query.batch).replace(/^[kK]/, ""))
    : batches[0];
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

export { getApplicationStatus };
