import PropTypes from "prop-types";
import { ALL_BATCHES, CURRENT_BATCHES, groupBatchList } from "../utils/batches";

/**
 * Batch dropdown for faculty group lists. "Current batches" (the default)
 * hides batches the master admin has archived, such as passed-out ones;
 * they can still be picked one by one or with "All batches".
 */
const BatchFilter = ({
  groups,
  value,
  onChange,
  isArchived,
  program,
  className,
}) => {
  const batches = [
    ...new Set(groups.flatMap((group) => groupBatchList(group))),
  ].sort((a, b) => b - a);
  return (
    <select
      aria-label="Batch filter"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={className}
    >
      <option value={CURRENT_BATCHES}>Current batches</option>
      {batches.map((batch) => (
        <option key={batch} value={String(batch)}>
          K{batch}
          {isArchived(program, batch) ? " (archived)" : ""}
        </option>
      ))}
      <option value={ALL_BATCHES}>All batches (incl. archived)</option>
    </select>
  );
};

BatchFilter.propTypes = {
  groups: PropTypes.arrayOf(PropTypes.object).isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  isArchived: PropTypes.func.isRequired,
  program: PropTypes.string,
  className: PropTypes.string,
};

BatchFilter.defaultProps = {
  program: "BTECH",
  className:
    "px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500",
};

export default BatchFilter;
