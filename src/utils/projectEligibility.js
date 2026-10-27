import { getStudentYear } from "./studentYear";

// Year of study in which each B.Tech group project is done. Eligibility
// follows the student's current year, so batches roll over on their own
// every August (in 2026-27: K23, 4th year, does Minor Project and K24, 3rd
// year, does Project 1).
export const MINOR_PROJECT_YEAR = 4;
export const PROJECT1_YEAR = 3;

const PROJECT_YEARS = {
  minor_project: MINOR_PROJECT_YEAR,
  project1: PROJECT1_YEAR,
};

/** 3 -> "3rd year" */
export const yearLabel = (year) =>
  `${year}${{ 1: "st", 2: "nd", 3: "rd" }[year] || "th"} year`;

export const formatBatches = (batches) => {
  const labels = batches.map((batch) => `K${batch}`);
  if (labels.length < 2) return labels.join("");
  return `${labels.slice(0, -1).join(", ")} and ${labels[labels.length - 1]}`;
};

export const isMinorBatchAllowed = (batch) =>
  getStudentYear(batch) === MINOR_PROJECT_YEAR;

/** Batch (two digit, e.g. 23 for K23) currently in the given year of study. */
export const batchInYear = (year) => {
  const firstYearBatch = Array.from({ length: 100 }, (_, batch) => batch).find(
    (batch) => getStudentYear(batch) === 1
  );
  return firstYearBatch - (year - 1);
};

/**
 * Batch currently doing a group project (course key as in Professor.limits),
 * or null when the project is not tied to a year of study here.
 */
export const getProjectBatch = (course) =>
  PROJECT_YEARS[course] ? batchInYear(PROJECT_YEARS[course]) : null;

// Batches (two digit, e.g. 23 for K23) currently in the minor project year.
export const getMinorBatches = () => [batchInYear(MINOR_PROJECT_YEAR)];

export const getMinorBatchesLabel = () => formatBatches(getMinorBatches());
