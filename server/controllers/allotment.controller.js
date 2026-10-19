import mongoose from "mongoose";
import { Allotment } from "../models/allotment.model.js";
import { Professor } from "../models/professor.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  ALLOTMENT_CATEGORIES,
  COURSES,
  courseLabel,
  getCourse,
  parseCourse,
} from "../utils/courses.js";
import { parseMarks } from "../utils/marks.js";
import { DEFAULT_PROGRAM, programLabel } from "../utils/programs.js";
import {
  getCurrentSession,
  parseSession,
  sessionLabel,
  sessionOptions,
} from "../utils/sessions.js";

const STUDENT_FIELDS = "fullName rollNumber email program batch branch section";

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Coordinators (batch admins) may only act on their own batches. */
const canManageBatch = (admin, batch) =>
  admin.role === "master" ||
  (admin.assignedBatches || []).includes(Number(batch));

const batchScope = (admin) =>
  admin.role === "master"
    ? {}
    : { batch: { $in: admin.assignedBatches || [] } };

const requireSession = (raw) => {
  const session = parseSession(raw);
  if (!session) {
    throw new ApiError(400, "Session must look like MO2026 or SP2027");
  }
  return session;
};

const populateAllotment = (query) =>
  query
    .populate("student", STUDENT_FIELDS)
    .populate("professor", "fullName idNumber email")
    .populate("allottedBy", "username");

/**
 * Validate and create one allotment. Shared by the back paper form and,
 * later, bulk uploads.
 * @returns {Promise<import("mongoose").Document>}
 */
export const createAllotment = async ({
  admin,
  student,
  professorId,
  course,
  session,
  category,
  remarks = "",
  source = "manual",
}) => {
  if (!canManageBatch(admin, student.batch)) {
    throw new ApiError(
      403,
      `You can only allot mentors to students of your batches (this student is K${student.batch})`
    );
  }

  const courseInfo = getCourse(course);
  const studentProgram = student.program || DEFAULT_PROGRAM;
  if (courseInfo.program !== studentProgram) {
    throw new ApiError(
      400,
      `${courseInfo.label} is for ${programLabel(courseInfo.program)} students, but ${student.rollNumber} is in ${programLabel(studentProgram)}`
    );
  }

  if (!mongoose.Types.ObjectId.isValid(professorId)) {
    throw new ApiError(400, "Choose a mentor");
  }
  const professor = await Professor.findById(professorId).select("fullName");
  if (!professor) throw new ApiError(404, "Mentor not found");

  const existing = await Allotment.findOne({
    student: student._id,
    course,
    session,
  }).populate("professor", "fullName");
  if (existing) {
    throw new ApiError(
      409,
      `${student.rollNumber} already has ${existing.professor?.fullName || "a mentor"} for ${courseInfo.label} in ${sessionLabel(session)}`
    );
  }

  return Allotment.create({
    student: student._id,
    professor: professor._id,
    course,
    session,
    category,
    program: studentProgram,
    batch: student.batch,
    remarks,
    source,
    allottedBy: admin._id,
  });
};

// ===================== Admin =====================

/**
 * GET /api/v1/allotments/admin/options
 * Everything the allotment forms need: sessions, courses and mentors.
 */
const getAllotmentOptions = asyncHandler(async (req, res) => {
  const professors = await Professor.find({}, "fullName idNumber email").sort({
    fullName: 1,
  });
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        currentSession: getCurrentSession(),
        sessions: sessionOptions(),
        courses: COURSES,
        professors,
        assignedBatches:
          req.admin.role === "master" ? null : req.admin.assignedBatches || [],
      },
      "Allotment options fetched"
    )
  );
});

/**
 * GET /api/v1/allotments/admin/student?rollNumber=
 * Looks a student up before allotting, within the admin's batches.
 */
const findStudentForAllotment = asyncHandler(async (req, res) => {
  const rollNumber = String(req.query.rollNumber || "").trim();
  if (!rollNumber) throw new ApiError(400, "Enter a roll number");

  const student = await User.findOne({
    rollNumber: { $regex: `^${escapeRegex(rollNumber)}$`, $options: "i" },
  }).select(STUDENT_FIELDS);
  if (!student)
    throw new ApiError(404, `No student with roll number ${rollNumber}`);
  if (!canManageBatch(req.admin, student.batch)) {
    throw new ApiError(
      403,
      `${student.rollNumber} is in batch K${student.batch}, which is not assigned to you`
    );
  }

  const allotments = await populateAllotment(
    Allotment.find({ student: student._id }).sort({ createdAt: -1 })
  );

  return res
    .status(200)
    .json(new ApiResponse(200, { student, allotments }, "Student found"));
});

/**
 * GET /api/v1/allotments/admin/list
 * Query: category, session, course, search (roll number or name)
 */
const listAllotments = asyncHandler(async (req, res) => {
  const filter = batchScope(req.admin);

  if (req.query.category) {
    if (!ALLOTMENT_CATEGORIES.some((c) => c.value === req.query.category)) {
      throw new ApiError(400, "Unknown category");
    }
    filter.category = req.query.category;
  }
  if (req.query.session) filter.session = requireSession(req.query.session);
  if (req.query.course) {
    const course = parseCourse(req.query.course);
    if (!course) throw new ApiError(400, "Unknown course");
    filter.course = course;
  }
  if (req.query.search) {
    const term = escapeRegex(String(req.query.search).trim());
    const students = await User.find({
      $or: [
        { rollNumber: { $regex: term, $options: "i" } },
        { fullName: { $regex: term, $options: "i" } },
      ],
    }).select("_id");
    filter.student = { $in: students.map((s) => s._id) };
  }

  const allotments = await populateAllotment(
    Allotment.find(filter).sort({ createdAt: -1 }).limit(500)
  );
  return res
    .status(200)
    .json(new ApiResponse(200, allotments, "Allotments fetched"));
});

/**
 * POST /api/v1/allotments/admin/back-paper
 * Body: { rollNumber, course, session, professorId, remarks }
 */
const createBackPaperAllotment = asyncHandler(async (req, res) => {
  const { rollNumber, professorId, remarks } = req.body;
  const course = parseCourse(req.body.course);
  if (!course) throw new ApiError(400, "Choose a course");
  const session = requireSession(req.body.session);

  const student = await User.findOne({
    rollNumber: String(rollNumber || "").trim(),
  }).select(STUDENT_FIELDS);
  if (!student)
    throw new ApiError(404, `No student with roll number ${rollNumber}`);

  const allotment = await createAllotment({
    admin: req.admin,
    student,
    professorId,
    course,
    session,
    category: "back_paper",
    remarks: String(remarks || ""),
  });

  const populated = await populateAllotment(Allotment.findById(allotment._id));
  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        populated,
        `${student.rollNumber} allotted to ${populated.professor.fullName} for ${courseLabel(course)} (${sessionLabel(session)})`
      )
    );
});

/**
 * DELETE /api/v1/allotments/admin/:id
 * Only while no marks have been entered, so no evaluation is lost.
 */
const deleteAllotment = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new ApiError(400, "Invalid allotment id");
  }
  const allotment = await Allotment.findById(req.params.id);
  if (!allotment) throw new ApiError(404, "Allotment not found");
  if (!canManageBatch(req.admin, allotment.batch)) {
    throw new ApiError(
      403,
      `You don't have access to batch K${allotment.batch}`
    );
  }
  if (allotment.marks !== null && allotment.marks !== undefined) {
    throw new ApiError(
      409,
      "Marks have already been entered for this allotment, so it cannot be removed"
    );
  }
  await allotment.deleteOne();
  return res.status(200).json(new ApiResponse(200, null, "Allotment removed"));
});

// ===================== Faculty =====================

/**
 * GET /api/v1/allotments/mine?session=
 * Students allotted to the logged in mentor. Without a session, the current
 * session is used; session=all returns every session.
 */
const getMyAllotments = asyncHandler(async (req, res) => {
  const filter = { professor: req.professor._id };
  const session =
    req.query.session === "all"
      ? null
      : req.query.session
        ? requireSession(req.query.session)
        : getCurrentSession();
  if (session) filter.session = session;

  const [allotments, sessions] = await Promise.all([
    populateAllotment(Allotment.find(filter).sort({ course: 1, createdAt: 1 })),
    Allotment.distinct("session", { professor: req.professor._id }),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        session,
        currentSession: getCurrentSession(),
        sessions: [...new Set([...sessionOptions(), ...sessions])],
        allotments,
      },
      "Allotted students fetched"
    )
  );
});

/**
 * POST /api/v1/allotments/:id/marks
 * Body: { marks }. This is the mentor's final submission: the marks are
 * frozen and can't be changed afterwards.
 */
const setAllotmentMarks = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new ApiError(400, "Invalid allotment id");
  }
  const allotment = await Allotment.findById(req.params.id);
  if (!allotment) throw new ApiError(404, "Allotment not found");
  if (!allotment.professor.equals(req.professor._id)) {
    throw new ApiError(403, "This student is not allotted to you");
  }

  const { maxMarks, label } = getCourse(allotment.course);
  const marks = parseMarks(req.body.marks, maxMarks);
  const frozenMessage = `${label} marks for this student are final and can no longer be changed`;
  if (allotment.marksFrozenAt) throw new ApiError(409, frozenMessage);

  // Final submission: save and freeze in one conditional update.
  const updated = await Allotment.findOneAndUpdate(
    { _id: allotment._id, marksFrozenAt: null },
    { $set: { marks, marksFrozenAt: new Date() } },
    { new: true }
  );
  if (!updated) throw new ApiError(409, frozenMessage);
  return res
    .status(200)
    .json(new ApiResponse(200, updated, "Marks submitted and frozen"));
});

export {
  createBackPaperAllotment,
  deleteAllotment,
  findStudentForAllotment,
  getAllotmentOptions,
  getMyAllotments,
  listAllotments,
  setAllotmentMarks,
};
