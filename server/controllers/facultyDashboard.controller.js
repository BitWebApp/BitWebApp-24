import { Allotment } from "../models/allotment.model.js";
import { Professor } from "../models/professor.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { courseLabel, getCourse } from "../utils/courses.js";
import { GROUP_PROJECTS, groupSession } from "../utils/groupProjects.js";
import { isMarksFrozen } from "../utils/marks.js";
import {
  DEFAULT_PROGRAM,
  PROGRAM_VALUES,
  parseProgram,
} from "../utils/programs.js";
import { getCurrentSession, parseSession } from "../utils/sessions.js";

const STUDENT_FIELDS =
  "fullName rollNumber email program batch branch section marks marksFrozenAt";

const studentRow = (student) => ({
  studentId: student._id,
  rollNumber: student.rollNumber,
  fullName: student.fullName,
  email: student.email,
  program: student.program || DEFAULT_PROGRAM,
  batch: student.batch,
  branch: student.branch,
  section: student.section,
});

/**
 * Every student the professor mentors: members of the groups they accepted
 * (summer training, minor, major, project 1) and students allotted to them
 * individually (back paper, bulk uploads). One row per student and course.
 * @param {import("mongoose").Types.ObjectId} professorId
 */
const collectMentoredStudents = async (professorId) => {
  const professor = await Professor.findById(professorId).select("students");
  if (!professor) throw new ApiError(404, "Professor not found");

  const groupRows = await Promise.all(
    GROUP_PROJECTS.map(async (project) => {
      const groups = await project.groupModel
        .find({ _id: { $in: professor.students?.[project.course] || [] } })
        .select("groupId projectTitle session members")
        .populate("members", STUDENT_FIELDS);
      return groups.flatMap((group) =>
        group.members.map((member) => ({
          ...studentRow(member),
          course: project.course,
          courseLabel: courseLabel(project.course),
          category: "regular",
          source: "group",
          groupId: group.groupId,
          projectTitle: group.projectTitle || "",
          session: groupSession(group),
          marks: member.marks?.[project.marksKey] ?? 0,
          maxMarks: project.maxMarks,
          marksFrozen: isMarksFrozen(member, project.marksKey),
        }))
      );
    })
  );

  const allotments = await Allotment.find({ professor: professorId }).populate(
    "student",
    STUDENT_FIELDS
  );
  const allotmentRows = allotments
    .filter((allotment) => allotment.student)
    .map((allotment) => ({
      ...studentRow(allotment.student),
      course: allotment.course,
      courseLabel: courseLabel(allotment.course),
      category: allotment.category,
      source: "allotment",
      allotmentId: allotment._id,
      groupId: "",
      projectTitle: "",
      session: allotment.session,
      marks: allotment.marks,
      maxMarks: getCourse(allotment.course)?.maxMarks,
      marksFrozen: Boolean(allotment.marksFrozenAt),
    }));

  return [...groupRows.flat(), ...allotmentRows];
};

/**
 * GET /api/v1/prof/my-students?program=&batch=&session=
 *
 * Students the logged in mentor is responsible for, filtered by program,
 * batch and session (MO/SP year). Leaving a filter out (or passing "all")
 * keeps every value. `options` lists the programs, batches and sessions
 * the mentor actually has students in, so the dashboard dropdowns only
 * offer useful choices.
 */
const getMyStudents = asyncHandler(async (req, res) => {
  const rows = await collectMentoredStudents(req.professor._id);

  const program =
    req.query.program && req.query.program !== "all"
      ? parseProgram(req.query.program)
      : null;
  if (req.query.program && req.query.program !== "all" && !program) {
    throw new ApiError(400, "Unknown program");
  }
  const batch =
    req.query.batch && req.query.batch !== "all"
      ? Number(String(req.query.batch).replace(/^[kK]/, ""))
      : null;
  if (batch !== null && Number.isNaN(batch)) {
    throw new ApiError(400, "Batch must look like 23 or K23");
  }
  const session =
    req.query.session && req.query.session !== "all"
      ? parseSession(req.query.session)
      : null;
  if (req.query.session && req.query.session !== "all" && !session) {
    throw new ApiError(400, "Session must look like MO2026 or SP2027");
  }

  const students = rows
    .filter(
      (row) =>
        (!program || row.program === program) &&
        (batch === null || row.batch === batch) &&
        (!session || row.session === session)
    )
    .sort(
      (a, b) =>
        b.batch - a.batch ||
        a.courseLabel.localeCompare(b.courseLabel) ||
        a.rollNumber.localeCompare(b.rollNumber)
    );

  const distinct = (values) => [...new Set(values)];
  const options = {
    currentSession: getCurrentSession(),
    programs: PROGRAM_VALUES.filter((p) => rows.some((r) => r.program === p)),
    sessions: distinct(rows.map((r) => r.session)).sort(
      (a, b) =>
        // newest first: by year, then Monsoon after Spring within a year
        b.slice(2).localeCompare(a.slice(2)) || a.localeCompare(b)
    ),
    // Which batches have students, per program and session, so the batch
    // dropdown can follow the other two.
    combinations: distinct(
      rows.map((r) => `${r.program}|${r.batch}|${r.session}`)
    ).map((key) => {
      const [p, b, s] = key.split("|");
      return { program: p, batch: Number(b), session: s };
    }),
  };

  return res
    .status(200)
    .json(
      new ApiResponse(200, { students, options }, "Mentored students fetched")
    );
});

export { getMyStudents };
