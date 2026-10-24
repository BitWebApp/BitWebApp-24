import { MARKS_TYPES } from "./marks.js";
import { getCurrentSession } from "./sessions.js";

/**
 * The four B.Tech projects that students do in groups and that mentors
 * accept through the application flow. `course` is the Professor.limits /
 * Professor.students key and the course value used by allotments.
 * `userMentorField` is the copy of the mentor some flows keep on the
 * student, if any. `appliedField` holds the faculty the group applied to,
 * in preference order; the first one is reviewing the application.
 */
export const GROUP_PROJECTS = [
  {
    course: "summer_training",
    marksKey: "summerTraining",
    userMentorField: "summerAllocatedProf",
    appliedField: "summerAppliedProfs",
    ...MARKS_TYPES.summerTraining,
  },
  {
    course: "minor_project",
    marksKey: "minorProject",
    userMentorField: "minorAllocatedProf",
    appliedField: "minorAppliedProfs",
    ...MARKS_TYPES.minorProject,
  },
  {
    course: "major_project",
    marksKey: "majorProject",
    userMentorField: "majorAllocatedProf",
    appliedField: "majorAppliedProfs",
    ...MARKS_TYPES.majorProject,
  },
  {
    course: "project1",
    marksKey: "project1",
    userMentorField: null,
    appliedField: "appliedProfs",
    ...MARKS_TYPES.project1,
  },
];

export const getGroupProject = (course) =>
  GROUP_PROJECTS.find((project) => project.course === course) || null;

/**
 * Session a group belongs to: the one it was accepted in, or for groups
 * accepted before sessions were recorded, the one it was created in.
 * @param {{ session?: string, _id: import("mongoose").Types.ObjectId }} group
 */
export const groupSession = (group) =>
  group.session || getCurrentSession(group._id.getTimestamp());
