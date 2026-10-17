import mongoose from "mongoose";
import { Allotment } from "../models/allotment.model.js";
import { Internship } from "../models/internship.model.js";
import { Professor } from "../models/professor.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { courseLabel } from "../utils/courses.js";
import { getGroupProject, groupSession } from "../utils/groupProjects.js";
import { DEFAULT_PROGRAM } from "../utils/programs.js";
import { parseSession, sessionLabel } from "../utils/sessions.js";

/** Allotments made one student at a time (back paper, bulk upload). */
const INDIVIDUAL = "individual";

const MEMBER_FIELDS = "fullName rollNumber program batch branch";
const MENTOR_FIELDS = "fullName idNumber email";

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Coordinators (batch admins) may only edit allotments whose students are
 * all in their batches; master admins may edit any.
 */
const canEditBatches = (admin, batches) =>
  admin.role === "master" ||
  batches.every((batch) =>
    (admin.assignedBatches || []).includes(Number(batch))
  );

const parseBatchFilter = (raw) => {
  if (!raw || raw === "all") return null;
  const batch = Number(String(raw).replace(/^[kK]/, ""));
  if (Number.isNaN(batch))
    throw new ApiError(400, "Batch must look like 23 or K23");
  return batch;
};

const parseSessionFilter = (raw) => {
  if (!raw || raw === "all") return null;
  const session = parseSession(raw);
  if (!session)
    throw new ApiError(400, "Session must look like MO2026 or SP2027");
  return session;
};

const groupRow = (project, group, admin) => {
  const batches = [...new Set(group.members.map((m) => m.batch))];
  return {
    id: group._id,
    course: project.course,
    courseLabel: courseLabel(project.course),
    groupId: group.groupId,
    projectTitle: group.projectTitle || "",
    members: group.members.map((m) => ({
      _id: m._id,
      fullName: m.fullName,
      rollNumber: m.rollNumber,
      program: m.program || DEFAULT_PROGRAM,
      batch: m.batch,
    })),
    batches,
    mentor: group[project.mentorField],
    session: groupSession(group),
    editable: canEditBatches(admin, batches),
  };
};

const allotmentRow = (allotment, admin) => ({
  id: allotment._id,
  course: allotment.course,
  courseLabel: courseLabel(allotment.course),
  category: allotment.category,
  groupId: "",
  projectTitle: "",
  members: allotment.student
    ? [
        {
          _id: allotment.student._id,
          fullName: allotment.student.fullName,
          rollNumber: allotment.student.rollNumber,
          program: allotment.program,
          batch: allotment.batch,
        },
      ]
    : [],
  batches: [allotment.batch],
  mentor: allotment.professor,
  session: allotment.session,
  editable: canEditBatches(admin, [allotment.batch]),
});

/**
 * GET /api/v1/allotments/admin/edit?course=&batch=&session=&search=
 *
 * Existing mentor allotments of one kind: groups of a B.Tech project
 * (course = summer_training | minor_project | major_project | project1) or
 * individual allotments (course = individual). Coordinators only see
 * allotments of their batches.
 */
const listEditableAllotments = asyncHandler(async (req, res) => {
  const course = req.query.course;
  const batch = parseBatchFilter(req.query.batch);
  const session = parseSessionFilter(req.query.session);
  const search = String(req.query.search || "").trim();
  const admin = req.admin;

  let rows;
  if (course === INDIVIDUAL) {
    const filter = {};
    if (admin.role !== "master") {
      filter.batch = { $in: admin.assignedBatches || [] };
    }
    if (batch !== null) filter.batch = batch;
    if (session) filter.session = session;
    const allotments = await Allotment.find(filter)
      .populate("student", MEMBER_FIELDS)
      .populate("professor", MENTOR_FIELDS)
      .sort({ createdAt: -1 });
    rows = allotments.map((a) => allotmentRow(a, admin));
  } else {
    const project = getGroupProject(course);
    if (!project)
      throw new ApiError(400, "Choose what kind of allotment to edit");
    const groups = await project.groupModel
      .find({ [project.mentorField]: { $ne: null } })
      .select(`groupId projectTitle session members ${project.mentorField}`)
      .populate("members", MEMBER_FIELDS)
      .populate(project.mentorField, MENTOR_FIELDS);
    rows = groups
      .map((g) => groupRow(project, g, admin))
      .filter((row) => row.editable)
      .filter((row) => batch === null || row.batches.includes(batch))
      .filter((row) => !session || row.session === session);
  }

  if (search) {
    const term = new RegExp(escapeRegex(search), "i");
    rows = rows.filter(
      (row) =>
        term.test(row.groupId) ||
        row.members.some(
          (m) => term.test(m.rollNumber) || term.test(m.fullName)
        )
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, rows.slice(0, 500), "Allotments fetched"));
});

/**
 * POST /api/v1/allotments/admin/edit/reassign
 * Body: { course, id, newProfessorId }
 *
 * Moves an existing allotment to another mentor, e.g. when a faculty member
 * leaves. For groups this keeps the professors' student lists and seat
 * counts, the students' copy of their mentor and summer internship records
 * in step, all in one transaction. Marks already given stay as they are.
 */
const reassignAllotment = asyncHandler(async (req, res) => {
  const { course, id, newProfessorId } = req.body;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid allotment id");
  }
  if (!mongoose.Types.ObjectId.isValid(newProfessorId)) {
    throw new ApiError(400, "Choose the new mentor");
  }
  const newProf = await Professor.findById(newProfessorId);
  if (!newProf) throw new ApiError(404, "New mentor not found");

  if (course === INDIVIDUAL) {
    const allotment = await Allotment.findById(id).populate(
      "student",
      "rollNumber"
    );
    if (!allotment) throw new ApiError(404, "Allotment not found");
    if (!canEditBatches(req.admin, [allotment.batch])) {
      throw new ApiError(
        403,
        `You don't have access to batch K${allotment.batch}`
      );
    }
    if (allotment.professor.equals(newProf._id)) {
      throw new ApiError(
        409,
        `This student is already allotted to ${newProf.fullName}`
      );
    }
    allotment.professor = newProf._id;
    await allotment.save();
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          allotment,
          `${allotment.student?.rollNumber} (${courseLabel(allotment.course)}, ${sessionLabel(allotment.session)}) moved to ${newProf.fullName}`
        )
      );
  }

  const project = getGroupProject(course);
  if (!project)
    throw new ApiError(400, "Choose what kind of allotment to edit");

  const group = await project.groupModel
    .findById(id)
    .populate("members", "batch");
  if (!group) throw new ApiError(404, "Group not found");
  const oldProfId = group[project.mentorField];
  if (!oldProfId) {
    throw new ApiError(409, "This group has no mentor allotted yet");
  }
  const batches = [...new Set(group.members.map((m) => m.batch))];
  if (!canEditBatches(req.admin, batches)) {
    throw new ApiError(
      403,
      `You can only edit allotments of your batches (this group has ${batches.map((b) => `K${b}`).join(", ")})`
    );
  }
  if (oldProfId.equals(newProf._id)) {
    throw new ApiError(
      409,
      `This group is already allotted to ${newProf.fullName}`
    );
  }

  const memberIds = group.members.map((m) => m._id);
  const count = memberIds.length;
  const key = project.course;
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      await project.groupModel.updateOne(
        { _id: group._id },
        { $set: { [project.mentorField]: newProf._id } },
        { session }
      );
      const oldProf = await Professor.findById(oldProfId).session(session);
      if (oldProf) {
        oldProf.students[key].pull(group._id);
        oldProf.currentCount[key] = Math.max(
          0,
          (oldProf.currentCount[key] || 0) - count
        );
        await oldProf.save({ session });
      }
      const target = await Professor.findById(newProf._id).session(session);
      if (!target.students[key].some((g) => g.equals(group._id))) {
        target.students[key].push(group._id);
      }
      target.currentCount[key] = (target.currentCount[key] || 0) + count;
      await target.save({ session });

      if (project.userMentorField) {
        await User.updateMany(
          { _id: { $in: memberIds }, [project.userMentorField]: oldProfId },
          { $set: { [project.userMentorField]: newProf._id } },
          { session }
        );
      }
      if (key === "summer_training") {
        await Internship.updateMany(
          { student: { $in: memberIds }, mentor: oldProfId },
          { $set: { mentor: newProf._id } },
          { session }
        );
      }
    });
  } finally {
    await session.endSession();
  }

  const updated = await Professor.findById(newProf._id).select(
    "currentCount limits"
  );
  const overLimit =
    updated.currentCount[key] > (updated.limits?.[key] ?? Infinity)
      ? ` ${newProf.fullName} now has ${updated.currentCount[key]} ${courseLabel(key)} students, above their limit of ${updated.limits[key]}.`
      : "";

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { id: group._id, mentor: newProf._id },
        `Group ${group.groupId} moved to ${newProf.fullName}.${overLimit}`
      )
    );
});

export { listEditableAllotments, reassignAllotment };
