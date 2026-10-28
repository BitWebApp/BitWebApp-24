import axios from "axios";
import { useCallback, useEffect, useState } from "react";

// One request per page load, shared by every component that asks.
let batchesPromise = null;
const loadBatches = () => {
  if (!batchesPromise) {
    batchesPromise = axios
      .get("/api/v1/batches")
      .then((response) => response.data.data || [])
      .catch(() => {
        batchesPromise = null;
        return [];
      });
  }
  return batchesPromise;
};

/** Forget the cached list, e.g. after archiving a batch. */
export const refreshBatches = () => {
  batchesPromise = null;
};

/**
 * Programs and batches with their year of study and archive status.
 * `isArchived(program, batch)` is false until the list has loaded.
 */
export const useBatches = () => {
  const [batches, setBatches] = useState([]);
  useEffect(() => {
    let active = true;
    loadBatches().then((list) => active && setBatches(list));
    return () => {
      active = false;
    };
  }, []);
  const isArchived = useCallback(
    (program, batch) =>
      batches.some(
        (b) => b.program === program && b.batch === Number(batch) && b.archived
      ),
    [batches]
  );
  return { batches, isArchived };
};

export const CURRENT_BATCHES = "current";
export const ALL_BATCHES = "all";

/** Batches of a group's members, newest first. */
export const groupBatchList = (group) =>
  [
    ...new Set(
      (group.members || [])
        .map((member) => member?.batch)
        .filter((batch) => batch !== null && batch !== undefined)
    ),
  ].sort((a, b) => b - a);

/**
 * Whether a group passes the batch filter: "current" keeps groups with at
 * least one student of a batch that is not archived, "all" keeps every
 * group, and a batch number keeps groups with a student of that batch.
 */
export const matchesBatchFilter = (
  group,
  filter,
  isArchived,
  program = "BTECH"
) => {
  if (filter === ALL_BATCHES) return true;
  const batches = groupBatchList(group);
  if (filter === CURRENT_BATCHES) {
    return batches.length === 0 || batches.some((b) => !isArchived(program, b));
  }
  return batches.includes(Number(filter));
};
