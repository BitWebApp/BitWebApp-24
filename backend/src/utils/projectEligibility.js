// Batches for which Minor Project registration is currently open.
// Update this list at the start of a session instead of editing controllers.
export const MINOR_PROJECT_BATCHES = [22, 23];

export const formatBatches = (batches) => {
  const labels = batches.map((batch) => `K${batch}`);
  if (labels.length < 2) return labels.join("");
  return `${labels.slice(0, -1).join(", ")} and ${labels[labels.length - 1]}`;
};

export const isMinorBatchAllowed = (batch) =>
  MINOR_PROJECT_BATCHES.includes(Number(batch));

export const MINOR_BATCHES_LABEL = formatBatches(MINOR_PROJECT_BATCHES);
