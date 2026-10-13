import { getStudentYear } from "./studentYear.js";

// Minor Project is done in this year of study. Eligibility follows the
// student's current year, so batches roll over on their own every August.
export const MINOR_PROJECT_YEAR = 4;

export const formatBatches = (batches) => {
  const labels = batches.map((batch) => `K${batch}`);
  if (labels.length < 2) return labels.join("");
  return `${labels.slice(0, -1).join(", ")} and ${labels[labels.length - 1]}`;
};

export const isMinorBatchAllowed = (batch) =>
  getStudentYear(batch) === MINOR_PROJECT_YEAR;

// Batches (two digit, e.g. 23 for K23) currently in the minor project year.
export const getMinorBatches = () => {
  const firstYearBatch = Array.from({ length: 100 }, (_, batch) => batch).find(
    (batch) => getStudentYear(batch) === 1
  );
  return [firstYearBatch - (MINOR_PROJECT_YEAR - 1)];
};

export const getMinorBatchesLabel = () => formatBatches(getMinorBatches());
