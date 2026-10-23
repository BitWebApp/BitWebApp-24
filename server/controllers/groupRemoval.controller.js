import { GroupRemovalRequest } from "../models/groupRemovalRequest.model.js";
import { Group } from "../models/group.model.js";
import { Major } from "../models/major.model.js";
import { Minor } from "../models/minor.model.js";
import { Project1 } from "../models/project1.model.js";
import { Professor } from "../models/professor.model.js";
import { User } from "../models/user.model.js";
import { Admin } from "../models/admin.model.js";
import { Internship } from "../models/internship.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import {
  sendMail,
  buildGroupRemovalRequestEmailForAdmin,
  buildGroupRemovedEmailForStudents,
} from "../utils/mailer.js";

/**
 * Helper to get group model and allocation field by project type
 */
const getModelAndField = (groupType) => {
  switch (groupType) {
    case "summer":
      return { Model: Group, groupModelName: "Group", field: "summerAllocatedProf" };
    case "major":
      return { Model: Major, groupModelName: "Major", field: "majorAllocatedProf" };
    case "minor":
      return { Model: Minor, groupModelName: "Minor", field: "minorAllocatedProf" };
    case "project1":
      return { Model: Project1, groupModelName: "Project1", field: "allocatedProf" };
    default:
      return null;
  }
};

/**
 * Faculty requests removal of an accepted group.
 * Sends email to the corresponding Batch Admin(s).
 */
export const requestGroupRemoval = asyncHandler(async (req, res) => {
  const { groupId, groupType, reason } = req.body;
  const professorId = req?.professor?._id;
  const professor = req.professor;

  if (!groupId || !groupType || !reason || !reason.trim()) {
    throw new ApiError(400, "groupId, groupType, and a valid reason are required");
  }

  const modelInfo = getModelAndField(groupType);
  if (!modelInfo) {
    throw new ApiError(400, "Invalid groupType provided. Must be 'summer', 'major', 'minor', or 'project1'");
  }

  const { Model, groupModelName, field } = modelInfo;

  const group = await Model.findOne({ groupId }).populate(
    "members",
    "fullName rollNumber email batch"
  );
  if (!group) {
    throw new ApiError(404, "Group not found");
  }

  // Check if allocated to the requesting professor
  if (!group[field] || group[field].toString() !== professorId.toString()) {
    throw new ApiError(403, "This group is not allocated to you");
  }

  // Check if a pending request already exists for this group
  const existingPending = await GroupRemovalRequest.findOne({
    groupId,
    groupType,
    status: "pending",
  });
  if (existingPending) {
    throw new ApiError(409, "A removal request for this group is already pending Batch Admin approval");
  }

  // Determine batch from group members
  const memberWithBatch = group.members?.find((m) => m.batch);
  const batch = memberWithBatch?.batch || 22;

  const removalRequest = await GroupRemovalRequest.create({
    groupType,
    groupId,
    groupRef: group._id,
    groupModel: groupModelName,
    professor: professorId,
    batch,
    reason: reason.trim(),
    status: "pending",
  });

  // Find Batch Admins assigned to this batch
  let adminsToNotify = await Admin.find({
    role: "batch_admin",
    assignedBatches: batch,
  });

  // If no Batch Admin exists for this batch, notify Master Admin(s)
  if (!adminsToNotify || adminsToNotify.length === 0) {
    adminsToNotify = await Admin.find({ role: "master" });
  }

  // Send email to Batch Admin(s)
  for (const admin of adminsToNotify) {
    if (admin.email) {
      const emailContent = buildGroupRemovalRequestEmailForAdmin({
        adminName: admin.username,
        professorName: professor.fullName,
        professorEmail: professor.email,
        groupType,
        groupId,
        batch,
        reason: reason.trim(),
        members: group.members,
      });
      sendMail({
        to: admin.email,
        subject: emailContent.subject,
        html: emailContent.html,
      }).catch((err) =>
        console.error("Failed to send removal request email to admin:", admin.email, err.message)
      );
    }
  }

  return res.status(201).json(
    new ApiResponse(
      201,
      removalRequest,
      "Group removal request submitted successfully and forwarded to Batch Admin"
    )
  );
});

/**
 * Faculty retrieves all removal requests they initiated.
 */
export const getProfessorRemovalRequests = asyncHandler(async (req, res) => {
  const professorId = req?.professor?._id;
  const requests = await GroupRemovalRequest.find({
    professor: professorId,
  }).sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, requests, "Removal requests retrieved successfully")
  );
});

/**
 * Admin retrieves removal requests filtered by assigned batches (or all if master).
 */
export const getAdminRemovalRequests = asyncHandler(async (req, res) => {
  const admin = req.admin;
  const filter = {};

  if (admin.role !== "master") {
    if (!admin.assignedBatches || admin.assignedBatches.length === 0) {
      return res.status(200).json(
        new ApiResponse(200, [], "No batches assigned to this admin")
      );
    }
    filter.batch = { $in: admin.assignedBatches };
  }

  const requests = await GroupRemovalRequest.find(filter)
    .populate("professor", "fullName email idNumber")
    .populate("actionBy", "username email role")
    .sort({ createdAt: -1 });

  // Populate dynamic group details and member data
  const populatedRequests = await Promise.all(
    requests.map(async (reqItem) => {
      let groupDetails = null;
      let Model;
      if (reqItem.groupModel === "Group") Model = Group;
      else if (reqItem.groupModel === "Major") Model = Major;
      else if (reqItem.groupModel === "Minor") Model = Minor;
      else if (reqItem.groupModel === "Project1") Model = Project1;

      if (Model) {
        groupDetails = await Model.findById(reqItem.groupRef)
          .populate("members", "fullName rollNumber email batch")
          .populate("leader", "fullName rollNumber email");
      }

      return {
        ...reqItem.toObject(),
        groupDetails,
      };
    })
  );

  return res.status(200).json(
    new ApiResponse(200, populatedRequests, "Group removal requests retrieved successfully")
  );
});

/**
 * Admin retrieves the count of pending removal requests within their batch scope.
 */
export const getPendingRemovalCount = asyncHandler(async (req, res) => {
  const admin = req.admin;
  const filter = { status: "pending" };

  if (admin.role !== "master") {
    if (!admin.assignedBatches || admin.assignedBatches.length === 0) {
      return res.status(200).json(
        new ApiResponse(200, { count: 0 }, "No batches assigned to this admin")
      );
    }
    filter.batch = { $in: admin.assignedBatches };
  }

  const count = await GroupRemovalRequest.countDocuments(filter);

  return res.status(200).json(
    new ApiResponse(200, { count }, "Pending removal requests count retrieved successfully")
  );
});

/**
 * Admin accepts or rejects a group removal request.
 * If approved:
 *  - Deallocates the group from the professor
 *  - Decrements professor currentCount and pulls group from students list
 *  - Clears student allocation fields (and cleans up internship record if summer)
 *  - Sends email to all group members
 */
export const reviewRemovalRequest = asyncHandler(async (req, res) => {
  const admin = req.admin;
  const { requestId, action, comment } = req.body;

  if (!requestId || !action) {
    throw new ApiError(400, "requestId and action are required");
  }

  if (!["approve", "reject"].includes(action)) {
    throw new ApiError(400, "Invalid action. Must be 'approve' or 'reject'");
  }

  const removalRequest = await GroupRemovalRequest.findById(requestId).populate("professor");
  if (!removalRequest) {
    throw new ApiError(404, "Removal request not found");
  }

  if (removalRequest.status !== "pending") {
    throw new ApiError(400, `This request has already been ${removalRequest.status}`);
  }

  // Check batch permission for batch admins
  if (admin.role !== "master") {
    if (
      !admin.assignedBatches ||
      !admin.assignedBatches.includes(removalRequest.batch)
    ) {
      throw new ApiError(
        403,
        `Access forbidden: You do not have permission for batch K${removalRequest.batch}`
      );
    }
  }

  // Case 1: Rejected
  if (action === "reject") {
    removalRequest.status = "rejected";
    removalRequest.actionBy = admin._id;
    removalRequest.actionComment = comment?.trim() || "";
    removalRequest.actionAt = new Date();
    await removalRequest.save();

    return res.status(200).json(
      new ApiResponse(200, removalRequest, "Removal request rejected successfully")
    );
  }

  // Case 2: Approved -> Deallocate group
  const { groupType, groupRef, professor, groupModel } = removalRequest;

  let Model;
  if (groupModel === "Group") Model = Group;
  else if (groupModel === "Major") Model = Major;
  else if (groupModel === "Minor") Model = Minor;
  else if (groupModel === "Project1") Model = Project1;

  const group = await Model.findById(groupRef).populate(
    "members",
    "fullName rollNumber email batch"
  );

  if (!group) {
    throw new ApiError(404, "Group associated with this removal request no longer exists");
  }

  const prof = await Professor.findById(professor._id || professor);
  if (!prof) {
    throw new ApiError(404, "Professor not found");
  }

  const membersCount = group.members.length;

  if (groupType === "summer") {
    group.summerAllocatedProf = null;
    await group.save({ validateBeforeSave: false });

    prof.students.summer_training.pull(group._id);
    prof.currentCount.summer_training = Math.max(
      0,
      prof.currentCount.summer_training - membersCount
    );
    await prof.save();

    for (const member of group.members) {
      await User.findByIdAndUpdate(member._id, {
        $set: {
          isSummerAllocated: false,
          summerAllocatedProf: null,
        },
      });
      await Internship.deleteMany({
        student: member._id,
        mentor: prof._id,
      });
    }
  } else if (groupType === "major") {
    group.majorAllocatedProf = null;
    await group.save({ validateBeforeSave: false });

    prof.students.major_project.pull(group._id);
    prof.currentCount.major_project = Math.max(
      0,
      prof.currentCount.major_project - membersCount
    );
    await prof.save();

    for (const member of group.members) {
      await User.findByIdAndUpdate(member._id, {
        $set: {
          isMajorAllocated: false,
          majorAllocatedProf: null,
        },
      });
    }
  } else if (groupType === "minor") {
    group.minorAllocatedProf = null;
    await group.save({ validateBeforeSave: false });

    prof.students.minor_project.pull(group._id);
    prof.currentCount.minor_project = Math.max(
      0,
      prof.currentCount.minor_project - membersCount
    );
    await prof.save();

    for (const member of group.members) {
      await User.findByIdAndUpdate(member._id, {
        $set: {
          isMinorAllocated: false,
          minorAllocatedProf: null,
        },
      });
    }
  } else if (groupType === "project1") {
    group.allocatedProf = null;
    await group.save({ validateBeforeSave: false });

    prof.students.project1.pull(group._id);
    prof.currentCount.project1 = Math.max(
      0,
      prof.currentCount.project1 - membersCount
    );
    await prof.save();

    for (const member of group.members) {
      await User.findByIdAndUpdate(member._id, {
        $set: {
          isProject1Allocated: false,
          project1AllocatedProf: null,
        },
      });
    }
  }

  // Update request record
  removalRequest.status = "approved";
  removalRequest.actionBy = admin._id;
  removalRequest.actionComment = comment?.trim() || "";
  removalRequest.actionAt = new Date();
  await removalRequest.save();

  // Send email to all group members
  for (const member of group.members) {
    if (member.email) {
      const emailContent = buildGroupRemovedEmailForStudents({
        studentName: member.fullName,
        professorName: prof.fullName,
        groupType,
        groupId: group.groupId,
        reason: removalRequest.reason,
        adminComment: removalRequest.actionComment,
      });
      sendMail({
        to: member.email,
        subject: emailContent.subject,
        html: emailContent.html,
      }).catch((err) =>
        console.error("Failed to send group removed email to student:", member.email, err.message)
      );
    }
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      removalRequest,
      "Group removal request approved. Group has been deallocated and all members notified via email."
    )
  );
});
