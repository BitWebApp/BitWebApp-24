import PropTypes from "prop-types";
import { FaLock } from "react-icons/fa";

/** Read-only marks after the mentor's final submission. */
const FrozenMarksBadge = ({ marks, maxMarks }) => (
  <span
    title="Final marks: submitted and frozen"
    className="inline-flex items-center gap-1.5 rounded bg-green-50 px-3 py-1 text-green-800 ring-1 ring-green-200"
  >
    <FaLock className="text-xs" />
    {marks ?? 0}/{maxMarks}
    <span className="text-[0.65rem] font-semibold uppercase tracking-wide">
      Final
    </span>
  </span>
);

FrozenMarksBadge.propTypes = {
  marks: PropTypes.number,
  maxMarks: PropTypes.number.isRequired,
};

export default FrozenMarksBadge;
