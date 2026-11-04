import { Allotment } from "../models/allotment.model.js";
import { BugTracker } from "../models/bugtracker.model.js";
import { GroupRemovalRequest } from "../models/groupRemovalRequest.model.js";
import { Placement } from "../models/placement.model.js";
import { Professor } from "../models/professor.model.js";
import { User } from "../models/user.model.js";
import { getArchivedBatchKeys } from "./batch.controller.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { COURSES, courseLabel } from "../utils/courses.js";
import { GROUP_PROJECTS } from "../utils/groupProjects.js";
import { getProjectBatch } from "../utils/projectEligibility.js";
import {
  DEFAULT_PROGRAM,
  PROGRAM_VALUES,
  parseProgram,
  programLabel,
  programYears,
} from "../utils/programs.js";
import { getCurrentSession } from "../utils/sessions.js";
import { getStudentYear } from "../utils/studentYear.js";

/** Filter value for students whose branch or section is blank. */
const NOT_SET = "none";

/** Branch and section are typed in by hand: "cse " and "CSE" are one branch. */
const normalise = (value) =>
  String(value ?? "")
    .trim()
    .toUpperCase();

const matchesText = (filter, value) =>
  !filter || filter === "all"
    ? true
    : filter === NOT_SET
      ? value === ""
      : value === normalise(filter);

const batchKey = (program, batch) => `${program}|${batch}`;

const percent = (part, whole) =>
  whole ? Math.round((part / whole) * 1000) / 10 : 0;

const countBy = (list, keyOf) => {
  const counts = new Map();
  list.forEach((item) => {
    const key = keyOf(item);
    counts.set(key, (counts.get(key) || 0) + 1);
  });
  return counts;
};

/**
 * One lean row per student in scope, with the facts the summary counts.
 * @param {object} match
 */
const loadStudents = (match) =>
  User.aggregate([
    { $match: match },
    {
      $project: {
        program: { $ifNull: ["$program", DEFAULT_PROGRAM] },
        batch: { $ifNull: ["$batch", null] },
        branch: 1,
        section: 1,
        isVerified: 1,
        placements: {
          $filter: {
            input: ["$placementOne", "$placementTwo", "$placementThree"],
            cond: { $ne: ["$$this", null] },
          },
        },
        awards: { $size: { $ifNull: ["$awards", []] } },
        higherEd: { $size: { $ifNull: ["$higherEd", []] } },
        exams: { $size: { $ifNull: ["$exams", []] } },
        backlogs: { $size: { $ifNull: ["$backlogs", []] } },
        hasResume: { $gt: [{ $strLenCP: { $ifNull: ["$resume", ""] } }, 0] },
        hasCgpa: { $gt: [{ $strLenCP: { $ifNull: ["$cgpa", ""] } }, 0] },
        hasLinkedin: {
          $gt: [{ $strLenCP: { $ifNull: ["$linkedin", ""] } }, 0],
        },
      },
    },
  ]);

/**
 * Where the B.Tech students in scope stand in each group project, batch by
 * batch, counted the same way as Application Status. A batch is listed when
 * it is the one doing the project this year or has students in its groups.
 */
const projectSummaries = async (students, archivedKeys) => {
  const btech = students.filter((s) => s.program === DEFAULT_PROGRAM);
  const ids = btech.map((s) => s._id);

  return Promise.all(
    GROUP_PROJECTS.map(async (project) => {
      const groups = ids.length
        ? await project.groupModel
            .find({ members: { $in: ids } })
            .select(
              `members deniedProf ${project.mentorField} ${project.appliedField}`
            )
            .lean()
        : [];
      const groupOf = new Map();
      groups.forEach((g) => g.members.forEach((m) => groupOf.set(String(m), g)));

      const projectBatch = getProjectBatch(project.course);
      const rows = new Map();
      btech.forEach((s) => {
        if (!rows.has(s.batch)) {
          rows.set(s.batch, {
            batch: s.batch,
            archived: archivedKeys.has(batchKey(DEFAULT_PROGRAM, s.batch)),
            doing: s.batch === projectBatch,
            students: 0,
            allotted: 0,
            waiting: 0,
            noFaculty: 0,
            declined: 0,
            notInGroup: 0,
            groups: new Set(),
            waitingGroups: new Set(),
          });
        }
        const row = rows.get(s.batch);
        row.students += 1;
        const group = groupOf.get(String(s._id));
        if (!group) {
          row.notInGroup += 1;
          return;
        }
        row.groups.add(String(group._id));
        if (group[project.mentorField]) {
          row.allotted += 1;
        } else if ((group[project.appliedField] || []).length) {
          row.waiting += 1;
          row.waitingGroups.add(String(group._id));
        } else if ((group.deniedProf || []).length) {
          row.declined += 1;
        } else {
          row.noFaculty += 1;
        }
      });

      const listed = [...rows.values()]
        .filter((row) => row.doing || row.groups.size > 0)
        .sort((a, b) => b.batch - a.batch)
        .map(({ groups: g, waitingGroups, ...row }) => ({
          ...row,
          groups: g.size,
          waitingGroups: waitingGroups.size,
          notApplied: row.noFaculty + row.declined + row.notInGroup,
          allottedPercent: percent(row.allotted, row.students),
        }));

      return {
        course: project.course,
        label: courseLabel(project.course),
        projectBatch,
        rows: listed,
      };
    })
  );
};

/**
 * Individual allotments of the students in scope. MCA and M.Tech courses
 * are always listed; B.Tech mentors come through groups, so a B.Tech
 * course is only listed when it has allotments (back papers).
 */
const allotmentSummary = async (students) => {
  const programs = new Set(students.map((s) => s.program));
  const session = getCurrentSession();
  const counts = students.length
    ? await Allotment.aggregate([
        { $match: { student: { $in: students.map((s) => s._id) } } },
        {
          $group: {
            _id: { course: "$course", category: "$category" },
            total: { $sum: 1 },
            thisSession: {
              $sum: { $cond: [{ $eq: ["$session", session] }, 1, 0] },
            },
          },
        },
      ])
    : [];
  const of = (course, category) =>
    counts.find(
      (c) => c._id.course === course && (c._id.category || "regular") === category
    ) || { total: 0, thisSession: 0 };

  const hasAllotments = (course) => counts.some((x) => x._id.course === course);
  return {
    session,
    rows: COURSES.filter((c) =>
      c.program === DEFAULT_PROGRAM
        ? hasAllotments(c.value)
        : programs.has(c.program) || hasAllotments(c.value)
    ).map((c) => {
      const regular = of(c.value, "regular");
      const backPaper = of(c.value, "back_paper");
      return {
        course: c.value,
        label: c.label,
        program: c.program,
        programLabel: programLabel(c.program),
        regular: regular.total,
        backPaper: backPaper.total,
        total: regular.total + backPaper.total,
        thisSession: regular.thisSession + backPaper.thisSession,
      };
    }),
  };
};

/** Placements, other records and profile details of the students in scope. */
const recordSummary = async (students) => {
  const placementIds = students.flatMap((s) => s.placements);
  const placements = placementIds.length
    ? await Placement.find({ _id: { $in: placementIds } })
        .select("ctc")
        .lean()
    : [];
  const ctcs = placements.map((p) => p.ctc).filter((c) => Number.isFinite(c));
  const withAny = (key) => students.filter((s) => s[key] > 0).length;
  const sum = (key) => students.reduce((n, s) => n + s[key], 0);
  const has = (key) => students.filter((s) => s[key]).length;

  return {
    placements: {
      placedStudents: students.filter((s) => s.placements.length).length,
      offers: placements.length,
      highestCtc: ctcs.length ? Math.max(...ctcs) : null,
      averageCtc: ctcs.length
        ? Math.round((ctcs.reduce((a, b) => a + b, 0) / ctcs.length) * 100) /
          100
        : null,
    },
    rows: [
      { key: "higherEd", label: "Higher education", students: withAny("higherEd"), records: sum("higherEd") },
      { key: "exams", label: "Examinations", students: withAny("exams"), records: sum("exams") },
      { key: "awards", label: "Awards & achievements", students: withAny("awards"), records: sum("awards") },
      { key: "backlogs", label: "Backlogs", students: withAny("backlogs"), records: sum("backlogs") },
      { key: "resume", label: "Resume uploaded", students: has("hasResume"), records: null },
      { key: "cgpa", label: "CGPA filled in", students: has("hasCgpa"), records: null },
      { key: "linkedin", label: "LinkedIn added", students: has("hasLinkedin"), records: null },
    ].map((row) => ({ ...row, percent: percent(row.students, students.length) })),
  };
};

/** Seats per B.Tech group project across all faculty. */
const facultySummary = async () => {
  const professors = await Professor.find().select("limits currentCount").lean();
  return {
    professors: professors.length,
    rows: GROUP_PROJECTS.map(({ course }) => {
      let seats = 0;
      let filled = 0;
      let free = 0;
      let full = 0;
      professors.forEach((p) => {
        const limit = Math.max(p.limits?.[course] || 0, 0);
        const count = Math.max(p.currentCount?.[course] || 0, 0);
        seats += limit;
        filled += count;
        free += Math.max(limit - count, 0);
        if (limit > 0 && count >= limit) full += 1;
      });
      return {
        course,
        label: courseLabel(course),
        seats,
        filled,
        free,
        full,
        filledPercent: percent(filled, seats),
      };
    }),
  };
};

/**
 * GET /api/v1/admin/platform-summary
 *   ?program=all|BTECH|MCA|MTECH
 *   &batch=current|all|23
 *   &branch=all|none|CSE
 *   &section=all|none|A
 *
 * A summary of the platform for the students chosen by the filters:
 * totals, students by batch, by branch and batch x branch, where each
 * B.Tech batch stands in the group projects, individual allotments,
 * placements and other records, plus faculty seats and items that need an
 * admin. "current" (the default) leaves archived batches out. Batch
 * coordinators only see their own batches.
 */
const getPlatformSummary = asyncHandler(async (req, res) => {
  const admin = req.admin;
  const program = req.query.program || "all";
  const batch = String(req.query.batch || "current").replace(/^[kK]/, "");
  const branch = req.query.branch || "all";
  const section = req.query.section || "all";

  const programValue = program === "all" ? null : parseProgram(program);
  if (program !== "all" && !programValue) {
    throw new ApiError(400, `Program must be one of ${PROGRAM_VALUES.join(", ")}`);
  }
  const batchNumber = ["current", "all"].includes(batch) ? null : Number(batch);
  if (batchNumber !== null && Number.isNaN(batchNumber)) {
    throw new ApiError(400, "Batch must be current, all, or look like 23 or K23");
  }

  const isMaster = admin.role === "master";
  const scope = isMaster ? {} : { batch: { $in: admin.assignedBatches || [] } };
  const [all, archivedKeys] = await Promise.all([
    loadStudents(scope),
    getArchivedBatchKeys(),
  ]);
  all.forEach((s) => {
    s.branch = normalise(s.branch);
    s.section = normalise(s.section);
    s.archived =
      s.batch !== null && archivedKeys.has(batchKey(s.program, s.batch));
  });

  // Filter options come from everyone in scope, so a filter never hides
  // the values the others could be switched to.
  const batchCounts = countBy(all, (s) => batchKey(s.program, s.batch));
  const batches = [...batchCounts.entries()]
    .map(([key, students]) => {
      const [p, b] = key.split("|");
      const number = b === "null" ? null : Number(b);
      const year = number === null ? null : getStudentYear(number);
      return {
        program: p,
        programLabel: programLabel(p),
        batch: number,
        students,
        year,
        passedOut: year !== null && year > programYears(p),
        archived: archivedKeys.has(key),
      };
    })
    .sort(
      (a, b) =>
        PROGRAM_VALUES.indexOf(a.program) - PROGRAM_VALUES.indexOf(b.program) ||
        (b.batch ?? -1) - (a.batch ?? -1)
    );
  const distinctSorted = (key) =>
    [...new Set(all.map((s) => s[key]))].sort((a, b) =>
      a === "" ? 1 : b === "" ? -1 : a.localeCompare(b)
    );

  const students = all.filter(
    (s) =>
      (!programValue || s.program === programValue) &&
      (batch === "all" ||
        (batch === "current" ? !s.archived : s.batch === batchNumber)) &&
      matchesText(branch, s.branch) &&
      matchesText(section, s.section)
  );

  const verified = students.filter((s) => s.isVerified).length;
  const branchNames = distinctSorted("branch").filter((b) =>
    students.some((s) => s.branch === b)
  );

  const byBatch = batches
    .map((b) => {
      const inBatch = students.filter(
        (s) => s.program === b.program && s.batch === b.batch
      );
      const perBranch = countBy(inBatch, (s) => s.branch);
      return {
        ...b,
        students: inBatch.length,
        verified: inBatch.filter((s) => s.isVerified).length,
        unverified: inBatch.filter((s) => !s.isVerified).length,
        branches: Object.fromEntries(perBranch),
      };
    })
    .filter((b) => b.students > 0);

  const byBranch = branchNames
    .map((name) => {
      const inBranch = students.filter((s) => s.branch === name);
      return {
        branch: name,
        students: inBranch.length,
        verified: inBranch.filter((s) => s.isVerified).length,
        programs: Object.fromEntries(countBy(inBranch, (s) => s.program)),
        percent: percent(inBranch.length, students.length),
      };
    })
    .sort((a, b) => b.students - a.students);

  const bySection = [...countBy(students, (s) => s.section).entries()]
    .map(([name, count]) => ({ section: name, students: count }))
    .sort((a, b) =>
      a.section === "" ? 1 : b.section === "" ? -1 : a.section.localeCompare(b.section)
    );

  const removalFilter = { status: "pending" };
  if (!isMaster) removalFilter.batch = { $in: admin.assignedBatches || [] };

  const [projects, allotments, records, faculty, pendingRemovals, openBugs] =
    await Promise.all([
      projectSummaries(students, archivedKeys),
      allotmentSummary(students),
      recordSummary(students),
      facultySummary(),
      GroupRemovalRequest.countDocuments(removalFilter),
      BugTracker.countDocuments({ status: { $in: ["Open", "In Progress"] } }),
    ]);

  const waitingGroups = projects.reduce(
    (n, p) => n + p.rows.reduce((m, r) => m + r.waitingGroups, 0),
    0
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        filters: { program, batch, branch, section },
        options: {
          programs: PROGRAM_VALUES.filter((p) => all.some((s) => s.program === p)).map(
            (p) => ({ value: p, label: programLabel(p) })
          ),
          batches,
          branches: distinctSorted("branch"),
          sections: distinctSorted("section"),
        },
        totals: {
          students: students.length,
          verified,
          unverified: students.length - verified,
          verifiedPercent: percent(verified, students.length),
          batches: byBatch.length,
          branches: branchNames.filter((b) => b !== "").length,
          professors: faculty.professors,
        },
        attention: {
          unverified: students.length - verified,
          waitingGroups,
          pendingRemovals,
          openBugs,
          passedOutNotArchived: isMaster
            ? batches
                .filter((b) => b.passedOut && !b.archived)
                .map((b) => `${b.programLabel} K${b.batch}`)
            : [],
        },
        byBatch,
        byBranch,
        bySection,
        projects,
        allotments,
        records,
        faculty,
      },
      "Platform summary fetched"
    )
  );
});

export { getPlatformSummary };
