// Academic programs a student can be enrolled in. `value` is what is stored
// on the User model; roll numbers start with the same code (BTECH/10001/22).
export const PROGRAMS = [
  { value: "BTECH", label: "B.Tech", years: 4 },
  { value: "MCA", label: "MCA", years: 2 },
  { value: "MTECH", label: "M.Tech", years: 2 },
];

export const PROGRAM_VALUES = PROGRAMS.map((program) => program.value);

/** Students created before programs existed are B.Tech students. */
export const DEFAULT_PROGRAM = "BTECH";

/**
 * Accepts "BTECH", "B.Tech", "b tech", "M.Tech", "mca", ... and returns the
 * stored value, or null when it is not a known program.
 * @param {string} raw
 * @returns {string|null}
 */
export const parseProgram = (raw) => {
  const key = String(raw ?? "")
    .toUpperCase()
    .replace(/[^A-Z]/g, "");
  return PROGRAM_VALUES.includes(key) ? key : null;
};

/**
 * Program implied by the roll number prefix (BTECH/10001/22 -> BTECH), or
 * null when the prefix is not a known program.
 * @param {string} rollNumber
 * @returns {string|null}
 */
export const programFromRollNumber = (rollNumber) => {
  const prefix = String(rollNumber ?? "").split("/")[0];
  return parseProgram(prefix);
};

/** Length of a program in years (B.Tech 4, MCA and M.Tech 2). */
export const programYears = (value) =>
  PROGRAMS.find((program) => program.value === value)?.years ||
  PROGRAMS.find((program) => program.value === DEFAULT_PROGRAM).years;

export const programLabel = (value) =>
  PROGRAMS.find((program) => program.value === value)?.label ||
  PROGRAMS.find((program) => program.value === DEFAULT_PROGRAM).label;

/**
 * Mongo filter for students of a program. Students saved before the field
 * existed have no program and count as the default program.
 * @param {string} program
 */
export const programQuery = (program) =>
  program === DEFAULT_PROGRAM
    ? { program: { $in: [DEFAULT_PROGRAM, null] } }
    : { program };
