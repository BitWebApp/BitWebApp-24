import Swal from "sweetalert2";

// Mirrors MARKS_TYPES in server/utils/marks.js. Minor and major project
// marks could already not be changed once entered, so older marks there
// count as final even without a freeze date.
export const MARKS_TYPES = {
  summerTraining: { maxMarks: 50, lockedOnceSet: false },
  minorProject: { maxMarks: 50, lockedOnceSet: true },
  majorProject: { maxMarks: 25, lockedOnceSet: true },
  project1: { maxMarks: 50, lockedOnceSet: false },
};

/** Whether a student's marks of one type have been finally submitted. */
export const isMarksFrozen = (student, key) =>
  Boolean(student?.marksFrozenAt?.[key]) ||
  (MARKS_TYPES[key].lockedOnceSet && Number(student?.marks?.[key]) > 0);

const escapeHtml = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ]
  );

/**
 * Ask the mentor to confirm a final submission of marks.
 * @returns {Promise<boolean>} true when confirmed
 */
export const confirmFinalMarks = async ({
  name,
  rollNumber,
  marks,
  maxMarks,
}) => {
  const result = await Swal.fire({
    icon: "warning",
    title: "Submit final marks?",
    html: `<b style="text-transform: capitalize">${escapeHtml(name)}</b> (${escapeHtml(
      rollNumber
    )}) will be given <b>${escapeHtml(marks)}/${maxMarks}</b>.<br/><br/>This is the final submission. The marks will be <b>frozen</b> and cannot be edited afterwards.`,
    showCancelButton: true,
    confirmButtonText: "Submit & freeze",
    cancelButtonText: "Go back",
    confirmButtonColor: "#16a34a",
    focusCancel: true,
  });
  return result.isConfirmed;
};
