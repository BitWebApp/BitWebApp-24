// Academic sessions are written as "MO2026" (Monsoon semester, July to
// December 2026) or "SP2027" (Spring semester, January to June 2027).
const SESSION_PATTERN = /^(MO|SP)(\d{4})$/;

export const SESSION_TERMS = {
  MO: "Monsoon",
  SP: "Spring",
};

/**
 * Session a date falls in: July to December is Monsoon, January to June is
 * Spring.
 * @param {Date} [date]
 * @returns {string} e.g. "MO2026"
 */
export const getCurrentSession = (date = new Date()) =>
  `${date.getMonth() >= 6 ? "MO" : "SP"}${date.getFullYear()}`;

export const isValidSession = (value) => SESSION_PATTERN.test(value ?? "");

/**
 * Accepts "MO2026", "mo 2026", "MO-2026", "Monsoon 2026", "SP2027",
 * "Spring 2027", ... and returns the stored form, or null.
 * @param {string} raw
 * @returns {string|null}
 */
export const parseSession = (raw) => {
  const match = String(raw ?? "")
    .trim()
    .toUpperCase()
    .match(/^(MO|MONSOON|SP|SPRING)[\s\-_/]*(\d{4})$/);
  if (!match) return null;
  return `${match[1].slice(0, 2)}${match[2]}`;
};

/** "MO2026" -> "MO 2026" */
export const sessionLabel = (session) => {
  const match = SESSION_PATTERN.exec(session ?? "");
  return match ? `${match[1]} ${match[2]}` : session || "";
};

/** "MO2026" -> "Monsoon 2026" */
export const sessionLongLabel = (session) => {
  const match = SESSION_PATTERN.exec(session ?? "");
  return match ? `${SESSION_TERMS[match[1]]} ${match[2]}` : session || "";
};

/** Session right before the given one: MO2026 -> SP2026 -> MO2025. */
export const previousSession = (session) => {
  const [, term, year] = SESSION_PATTERN.exec(session);
  return term === "MO" ? `SP${year}` : `MO${Number(year) - 1}`;
};

/** Session right after the given one: SP2026 -> MO2026 -> SP2027. */
export const nextSession = (session) => {
  const [, term, year] = SESSION_PATTERN.exec(session);
  return term === "SP" ? `MO${year}` : `SP${Number(year) + 1}`;
};

/**
 * Sessions to offer in a dropdown, newest first: the next session, the
 * current one and `past` sessions before it.
 * @param {number} [past]
 * @returns {string[]}
 */
export const sessionOptions = (past = 5) => {
  const current = getCurrentSession();
  const options = [nextSession(current), current];
  let session = current;
  for (let i = 0; i < past; i++) {
    session = previousSession(session);
    options.push(session);
  }
  return options;
};
