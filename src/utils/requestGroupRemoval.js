import Swal from "sweetalert2";
import axios from "axios";
import { toast } from "react-hot-toast";

/**
 * Prompts professor for a reason and submits a group removal request to Batch Admin.
 * @param {{ groupId: string, groupType: 'summer' | 'major' | 'minor' | 'project1', onSuccess?: () => void }} params
 */
export const handleRequestGroupRemoval = async ({
  groupId,
  groupType,
  onSuccess,
}) => {
  const typeDisplay =
    groupType === "summer"
      ? "Summer Training"
      : groupType === "major"
      ? "Major Project"
      : groupType === "minor"
      ? "Minor Project"
      : "Project 1";

  const { value: reason } = await Swal.fire({
    title: "Request Group Removal",
    html: `
      <p style="font-size: 14px; color: #555; margin-bottom: 8px;">
        Request the Batch Admin to remove group <strong>${groupId}</strong> (${typeDisplay}) from your mentorship.
      </p>
      <p style="font-size: 13px; color: #888;">
        Once approved by the Batch Admin, the group will be deallocated and all members will be notified via email.
      </p>
    `,
    input: "textarea",
    inputLabel: "Reason for removal (Required)",
    inputPlaceholder: "Explain why this group should be removed (e.g., student unresponsiveness, lack of project progress, misconduct)...",
    inputAttributes: {
      rows: 4,
    },
    showCancelButton: true,
    confirmButtonText: "Submit to Batch Admin",
    confirmButtonColor: "#EF4444",
    cancelButtonColor: "#6B7280",
    inputValidator: (value) => {
      if (!value || !value.trim()) {
        return "Reason is required to submit a removal request!";
      }
    },
  });

  if (reason) {
    try {
      const response = await axios.post("/api/v1/prof/request-group-removal", {
        groupId,
        groupType,
        reason: reason.trim(),
      });
      await Swal.fire({
        icon: "success",
        title: "Request Submitted",
        text:
          response.data?.message ||
          "Removal request has been forwarded to Batch Admin. You will be notified once approved.",
        confirmButtonColor: "#10B981",
      });
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to submit removal request."
      );
    }
  }
};
