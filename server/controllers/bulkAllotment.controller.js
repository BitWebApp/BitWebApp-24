import ExcelJS from "exceljs";
import { Allotment } from "../models/allotment.model.js";
import { Professor } from "../models/professor.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  ALLOTMENT_CATEGORIES,
  COURSES,
  categoryLabel,
  getCourse,
  parseCourse,
} from "../utils/courses.js";
import { getGroupProject } from "../utils/groupProjects.js";
import { DEFAULT_PROGRAM, programLabel } from "../utils/programs.js";
import {
  getCurrentSession,
  parseSession,
  sessionLabel,
} from "../utils/sessions.js";
import { readSpreadsheet } from "../utils/spreadsheet.js";
import { createAllotment } from "./allotment.controller.js";

const MAX_ROWS = 500;

/**
 * "Regular", "Back Paper", "back_paper", ... -> stored category, or null.
 * An empty cell means a regular allotment.
 */
const parseCategory = (raw) => {
  const key = String(raw ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
  if (!key) return "regular";
  return (
    ALLOTMENT_CATEGORIES.find(
      (c) =>
        c.value === key || c.label.toLowerCase().replace(/\s+/g, "_") === key
    )?.value || null
  );
};

const HEADER_ALIASES = {
  rollnumber: "rollNumber",
  "roll number": "rollNumber",
  rollno: "rollNumber",
  "roll no": "rollNumber",
  roll: "rollNumber",
  name: "fullName",
  fullname: "fullName",
  "full name": "fullName",
  "student name": "fullName",
  course: "course",
  "course name": "course",
  project: "course",
  mentor: "mentor",
  mentorid: "mentor",
  "mentor id": "mentor",
  faculty: "mentor",
  facultyid: "mentor",
  "faculty id": "mentor",
  guide: "mentor",
  supervisor: "mentor",
  session: "session",
  remarks: "remarks",
  type: "category",
  category: "category",
  "allotment type": "category",
  remark: "remarks",
  notes: "remarks",
};

const normalizeRow = (values) => {
  const row = {};
  Object.entries(values).forEach(([key, value]) => {
    const field = HEADER_ALIASES[key.trim().toLowerCase()];
    if (field && row[field] === undefined) row[field] = String(value).trim();
  });
  return row;
};

const canManageBatch = (admin, batch) =>
  admin.role === "master" ||
  (admin.assignedBatches || []).includes(Number(batch));

const requireDefaultSession = (raw) => {
  if (!raw) return getCurrentSession();
  const session = parseSession(raw);
  if (!session) {
    throw new ApiError(400, "Session must look like MO2026 or SP2027");
  }
  return session;
};

/**
 * Validate every row of an uploaded sheet against the database without
 * writing anything.
 */
const analyseSheet = async (file, admin, defaultSession) => {
  const { headers, rows: rawRows } = await readSpreadsheet(
    file.buffer,
    file.originalname
  );
  if (rawRows.length === 0) {
    throw new ApiError(400, "The file has no data rows");
  }
  if (rawRows.length > MAX_ROWS) {
    throw new ApiError(
      400,
      `The file has ${rawRows.length} rows; please split it into files of at most ${MAX_ROWS} rows`
    );
  }
  const recognised = headers.map((h) => HEADER_ALIASES[h.trim().toLowerCase()]);
  const missing = ["rollNumber", "course", "mentor"].filter(
    (field) => !recognised.includes(field)
  );
  if (missing.length) {
    throw new ApiError(
      400,
      `The file is missing required column(s): ${missing.join(", ")}. Download the template for the expected format.`
    );
  }

  const parsed = rawRows.map((raw, index) => ({
    rowNumber: index + 1,
    lineNumber: raw.lineNumber,
    input: normalizeRow(raw.values),
  }));

  const rolls = parsed.map((r) => (r.input.rollNumber || "").toUpperCase());
  const students = await User.find({ rollNumber: { $in: rolls } }).select(
    "fullName rollNumber program batch group MinorGroup MajorGroup project1"
  );
  const studentByRoll = new Map(
    students.map((s) => [s.rollNumber.toUpperCase(), s])
  );

  // Faculty are few, so match IDs and emails case-insensitively in memory.
  const professors = await Professor.find({}, "fullName idNumber email");
  const findMentor = (raw) => {
    const key = String(raw || "")
      .trim()
      .toLowerCase();
    return professors.find(
      (p) => p.idNumber?.toLowerCase() === key || p.email?.toLowerCase() === key
    );
  };

  const existing = await Allotment.find({
    student: { $in: students.map((s) => s._id) },
  }).populate("professor", "fullName");

  // B.Tech students already mentored through a group for a course: a
  // regular allotment for that course would give them a second mentor.
  const groupMentorOf = new Map();
  const groupCourses = [
    ...new Set(
      parsed
        .map((r) => parseCourse(r.input.course))
        .filter((c) => c && getGroupProject(c))
    ),
  ];
  for (const course of groupCourses) {
    const project = getGroupProject(course);
    const groupIds = students.map((s) => s[project.groupField]).filter(Boolean);
    const groups = await project.groupModel
      .find({ _id: { $in: groupIds }, [project.mentorField]: { $ne: null } })
      .select(`groupId ${project.mentorField}`)
      .populate(project.mentorField, "fullName");
    groups.forEach((g) => {
      students
        .filter((s) => s[project.groupField]?.equals(g._id))
        .forEach((s) =>
          groupMentorOf.set(`${s._id}|${course}`, {
            groupId: g.groupId,
            mentor: g[project.mentorField]?.fullName || "a mentor",
          })
        );
    });
  }

  const seen = new Map();
  const rows = parsed.map(({ rowNumber, lineNumber, input }) => {
    const errors = [];
    const rollNumber = (input.rollNumber || "").toUpperCase();
    const student = studentByRoll.get(rollNumber);
    const course = parseCourse(input.course);
    const courseInfo = course ? getCourse(course) : null;
    const mentor = input.mentor ? findMentor(input.mentor) : null;
    const session = input.session
      ? parseSession(input.session)
      : defaultSession;
    const category = parseCategory(input.category);

    if (!rollNumber) errors.push("rollNumber is required");
    else if (!student)
      errors.push(`no student with roll number ${input.rollNumber}`);

    if (!input.course) errors.push("course is required");
    else if (!courseInfo) {
      errors.push(
        `course "${input.course}" is not one of ${COURSES.map((c) => c.label).join(", ")}`
      );
    }
    if (!category) {
      errors.push(`type "${input.category}" must be Regular or Back Paper`);
    }

    if (!input.mentor) errors.push("mentor (faculty ID or email) is required");
    else if (!mentor)
      errors.push(`no faculty with ID or email "${input.mentor}"`);

    if (!session) {
      errors.push(`session "${input.session}" must look like MO2026 or SP2027`);
    }

    if (student && courseInfo) {
      const studentProgram = student.program || DEFAULT_PROGRAM;
      if (courseInfo.program !== studentProgram) {
        errors.push(
          `${courseInfo.label} is for ${programLabel(courseInfo.program)} students, but ${student.rollNumber} is in ${programLabel(studentProgram)}`
        );
      }
    }
    if (student && !canManageBatch(admin, student.batch)) {
      errors.push(`you don't have access to batch K${student.batch}`);
    }

    if (student && course && session) {
      const key = `${student._id}|${course}|${session}`;
      if (seen.has(key)) {
        errors.push(`duplicate of row ${seen.get(key)}`);
      } else {
        seen.set(key, rowNumber);
      }
      const clash = existing.find(
        (a) =>
          a.student.equals(student._id) &&
          a.course === course &&
          a.session === session
      );
      if (clash) {
        errors.push(
          `already allotted to ${clash.professor?.fullName || "a mentor"} for ${courseInfo.label} in ${sessionLabel(session)}`
        );
      }
      const viaGroup = groupMentorOf.get(`${student._id}|${course}`);
      if (viaGroup && category === "regular") {
        errors.push(
          `already has ${viaGroup.mentor} for ${courseInfo.label} through group ${viaGroup.groupId}; change it with Edit Allotment, or set type to Back Paper for a repeat`
        );
      }
    }

    return {
      rowNumber,
      lineNumber,
      data: {
        rollNumber: student?.rollNumber || input.rollNumber || "",
        fullName: student?.fullName || input.fullName || "",
        program: student?.program || null,
        batch: student?.batch ?? null,
        course,
        courseLabel: courseInfo?.label || input.course || "",
        mentorId: mentor?._id || null,
        mentorName: mentor?.fullName || "",
        mentorIdNumber: mentor?.idNumber || input.mentor || "",
        session,
        category,
        categoryLabel: category ? categoryLabel(category) : input.category,
        remarks: input.remarks || "",
      },
      errors,
      status: errors.length ? "invalid" : "ready",
      student,
    };
  });

  return rows;
};

const summarise = (rows) => ({
  total: rows.length,
  ready: rows.filter((r) => r.status === "ready").length,
  invalid: rows.filter((r) => r.status === "invalid").length,
});

const publicRow = ({ student, ...row }) => row;

/**
 * GET /api/v1/allotments/admin/bulk/template
 * Excel template with the allotment sheet plus the valid courses and the
 * faculty IDs to copy from.
 */
const downloadBulkTemplate = asyncHandler(async (req, res) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Allotments");
  sheet.columns = [
    { header: "rollNumber", key: "rollNumber", width: 18 },
    { header: "fullName", key: "fullName", width: 24 },
    { header: "course", key: "course", width: 22 },
    { header: "mentorId", key: "mentorId", width: 14 },
    { header: "session", key: "session", width: 10 },
    { header: "type", key: "type", width: 12 },
    { header: "remarks", key: "remarks", width: 28 },
  ];
  sheet.getRow(1).font = { bold: true };
  sheet.addRow({
    rollNumber: "MCA/10001/25",
    fullName: "Example Student",
    course: "MCA Minor Project",
    mentorId: "FAC001",
    session: getCurrentSession(),
    type: "Regular",
    remarks:
      "Optional; leave session empty to use the session chosen on the page",
  });
  sheet.addRow({
    rollNumber: "MTECH/10002/25",
    fullName: "Another Student",
    course: "MTech Thesis 1",
    mentorId: "FAC002",
    session: "",
    type: "",
    remarks: "",
  });
  sheet.addRow({
    rollNumber: "BTECH/10003/22",
    fullName: "Back Paper Student",
    course: "Minor Project",
    mentorId: "FAC003",
    session: "",
    type: "Back Paper",
    remarks: "Repeating the course; type is Regular when left empty",
  });

  const courses = workbook.addWorksheet("Courses");
  courses.columns = [
    { header: "course", key: "label", width: 24 },
    { header: "program", key: "program", width: 12 },
    { header: "maxMarks", key: "maxMarks", width: 10 },
  ];
  courses.getRow(1).font = { bold: true };
  COURSES.forEach((c) =>
    courses.addRow({ ...c, program: programLabel(c.program) })
  );

  const mentors = workbook.addWorksheet("Mentors");
  mentors.columns = [
    { header: "mentorId", key: "idNumber", width: 14 },
    { header: "name", key: "fullName", width: 28 },
    { header: "email", key: "email", width: 32 },
  ];
  mentors.getRow(1).font = { bold: true };
  (
    await Professor.find({}, "fullName idNumber email").sort({ fullName: 1 })
  ).forEach((p) => mentors.addRow(p.toObject()));

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    'attachment; filename="bulk-allotment-template.xlsx"'
  );
  const buffer = await workbook.xlsx.writeBuffer();
  return res.status(200).send(Buffer.from(buffer));
});

/**
 * POST /api/v1/allotments/admin/bulk/preview
 * Multipart: file (.xlsx or .csv), session (default for rows without one).
 */
const previewBulkAllotment = asyncHandler(async (req, res) => {
  if (!req.file?.buffer)
    throw new ApiError(400, "Upload an .xlsx or .csv file");
  const session = requireDefaultSession(req.body.session);
  const rows = await analyseSheet(req.file, req.admin, session);
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        fileName: req.file.originalname,
        session,
        summary: summarise(rows),
        rows: rows.map(publicRow),
      },
      "File checked"
    )
  );
});

/**
 * POST /api/v1/allotments/admin/bulk/import
 * Creates an allotment for every valid row; invalid rows are skipped and
 * reported, so a few bad rows don't block the rest.
 */
const importBulkAllotment = asyncHandler(async (req, res) => {
  if (!req.file?.buffer)
    throw new ApiError(400, "Upload an .xlsx or .csv file");
  const session = requireDefaultSession(req.body.session);
  const rows = await analyseSheet(req.file, req.admin, session);

  const results = [];
  for (const row of rows) {
    const result = { ...publicRow(row), message: row.errors.join("; ") };
    if (row.status !== "ready") {
      result.status = "skipped";
      results.push(result);
      continue;
    }
    try {
      await createAllotment({
        admin: req.admin,
        student: row.student,
        professorId: row.data.mentorId,
        course: row.data.course,
        session: row.data.session,
        category: row.data.category,
        remarks: row.data.remarks,
        source: "bulk",
      });
      result.status = "created";
      result.message = `Allotted to ${row.data.mentorName}`;
    } catch (error) {
      result.status = "failed";
      result.message = error?.message || "Could not create the allotment";
    }
    results.push(result);
  }

  const summary = {
    total: results.length,
    created: results.filter((r) => r.status === "created").length,
    skipped: results.filter((r) => r.status === "skipped").length,
    failed: results.filter((r) => r.status === "failed").length,
  };
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { fileName: req.file.originalname, session, summary, results },
        `${summary.created} of ${summary.total} student(s) allotted`
      )
    );
});

export { downloadBulkTemplate, importBulkAllotment, previewBulkAllotment };
