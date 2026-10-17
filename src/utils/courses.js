// Project courses a student can be allotted a mentor for. `value` is what an
// allotment stores; B.Tech courses use the same keys as Professor.limits.
export const COURSES = [
  {
    value: "summer_training",
    label: "Summer Training",
    program: "BTECH",
    maxMarks: 50,
  },
  {
    value: "minor_project",
    label: "Minor Project",
    program: "BTECH",
    maxMarks: 50,
  },
  {
    value: "major_project",
    label: "Major Project",
    program: "BTECH",
    maxMarks: 25,
  },
  { value: "project1", label: "Project 1", program: "BTECH", maxMarks: 50 },
  {
    value: "mca_minor_project",
    label: "MCA Minor Project",
    program: "MCA",
    maxMarks: 100,
  },
  {
    value: "mca_major_project",
    label: "MCA Major Project",
    program: "MCA",
    maxMarks: 100,
  },
  {
    value: "mtech_thesis_1",
    label: "MTech Thesis 1",
    program: "MTECH",
    maxMarks: 100,
  },
  {
    value: "mtech_thesis_2",
    label: "MTech Thesis 2",
    program: "MTECH",
    maxMarks: 100,
  },
];

export const COURSE_VALUES = COURSES.map((course) => course.value);

export const getCourse = (value) =>
  COURSES.find((course) => course.value === value) || null;

export const courseLabel = (value) => getCourse(value)?.label || value || "";

export const coursesForProgram = (program) =>
  COURSES.filter((course) => course.program === program);

/**
 * Accepts the stored value ("mca_minor_project") or the label
 * ("MCA Minor Project", any case) and returns the stored value, or null.
 * @param {string} raw
 * @returns {string|null}
 */
export const parseCourse = (raw) => {
  const key = String(raw ?? "")
    .trim()
    .toLowerCase();
  const course = COURSES.find(
    (c) =>
      c.value === key ||
      c.label.toLowerCase() === key ||
      c.label.toLowerCase().replace(/\s+/g, "_") === key
  );
  return course?.value || null;
};

export const ALLOTMENT_CATEGORIES = [
  { value: "regular", label: "Regular" },
  { value: "back_paper", label: "Back Paper" },
];

export const categoryLabel = (value) =>
  ALLOTMENT_CATEGORIES.find((c) => c.value === value)?.label || value || "";
