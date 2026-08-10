import { Project1 } from "../models/project1.model.js";
import { User } from "../models/user.model.js";
import { Professor } from "../models/professor.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { customAlphabet } from "nanoid";
import mongoose from "mongoose";

import { getStudentYear } from "../utils/studentYear.js";

// ===================== Student-facing =====================

const createProject1 = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");

  const year = getStudentYear(user.batch);
  if (year !== 3) {
    throw new ApiError(403, "Only 3rd year students can create a Project 1 group");
  }

  if (user.project1) {
    throw new ApiError(409, "You are already in a Project 1 group");
  }

  const nanoid = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 6);
  const members = [userId];

  const newGroup = await Project1.create({
    groupId: nanoid(),
    leader: userId,
    members,
  });

  await newGroup.populate("members leader");

  user.project1 = newGroup._id;
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, newGroup, "Project 1 group created successfully"));
});

const addMember = asyncHandler(async (req, res) => {
  const loggedIn = req.user._id;
  const { rollNumber, groupId } = req.body;

  const group = await Project1.findById(groupId);
  if (!group) throw new ApiError(404, "Group not found");

  if (!group.leader.equals(loggedIn)) {
    throw new ApiError(409, "Only the leader can add members");
  }

  if (group.allocatedProf) {
    throw new ApiError(409, "Cannot add member after faculty allocation");
  }

  const user = await User.findOne({ rollNumber });
  if (!user) throw new ApiError(404, "User not found with this roll number");

  if (user.project1) {
    throw new ApiError(409, "This student is already in a Project 1 group");
  }

  const year = getStudentYear(user.batch);
  if (year !== 3) {
    throw new ApiError(403, "Only 3rd year students can join Project 1");
  }

  user.Project1GroupReq.push(group._id);
  await user.save();
  return res.status(200).json(new ApiResponse(200, "Request sent"));
});

const acceptReq = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { groupId } = req.body;

  const user = await User.findById(userId);
  const group = await Project1.findById(groupId);
  if (!group) throw new ApiError(404, "Group not found");

  if (group.allocatedProf) {
    throw new ApiError(409, "Cannot join as group has a faculty assigned");
  }

  if (user.project1) {
    throw new ApiError(409, "You are already in a Project 1 group");
  }

  if (group.members.length >= 3) {
    throw new ApiError(409, "Group is already full (max 3 members)");
  }

  group.members.push(userId);
  user.project1 = group._id;
  user.Project1GroupReq = [];
  await user.save();
  await group.save();
  return res.status(200).json(new ApiResponse(200, "Joined successfully"));
});

const getReq = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const user = await User.findById(userId).populate({
    path: "Project1GroupReq",
    populate: {
      path: "leader",
    },
  });
  return res
    .status(200)
    .json(new ApiResponse(200, user?.Project1GroupReq, "All requests fetched"));
});

const removeMember = asyncHandler(async (req, res) => {
  const loggedIn = req.user._id;
  const { rollNumber, groupId } = req.body;

  const group = await Project1.findById(groupId);
  if (!group) throw new ApiError(404, "Group not found");

  if (!group.leader.equals(loggedIn)) {
    throw new ApiError(409, "Only the leader can remove members");
  }

  if (group.allocatedProf) {
    throw new ApiError(409, "Cannot remove member after faculty allocation");
  }

  const user = await User.findOne({ rollNumber });
  if (!user) throw new ApiError(404, "User not found");

  if (!user.project1 || !user.project1.equals(group._id)) {
    throw new ApiError(409, "User is not in this group");
  }

  group.members.pull(user._id);
  user.project1 = null;
  await group.save();

  if (group.leader.equals(user._id)) {
    if (group.members.length > 0) {
      group.leader = group.members[0];
      await group.save();
    } else {
      // Clean up professors' queues
      if (group.appliedProfs && group.appliedProfs.length > 0) {
        const currentProfId = group.appliedProfs[0];
        const prof = await Professor.findById(currentProfId);
        if (prof) {
          prof.appliedGroups.project1.pull(group._id);
          await prof.save();
        }
      }
      await group.deleteOne();
    }
  }
  await user.save();
  return res.status(200).json(new ApiResponse(200, "Member removed"));
});

const leaveGroup = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");

  if (!user.project1) {
    throw new ApiError(409, "You are not in a Project 1 group");
  }

  const group = await Project1.findById(user.project1);
  if (!group) throw new ApiError(404, "Group not found");

  if (group.allocatedProf) {
    throw new ApiError(409, "Cannot leave group after faculty allocation");
  }

  group.members.pull(userId);
  user.project1 = null;

  if (group.leader.equals(userId)) {
    if (group.members.length > 0) {
      group.leader = group.members[0];
      await group.save();
    } else {
      // Clean up professors' queues
      if (group.appliedProfs && group.appliedProfs.length > 0) {
        const currentProfId = group.appliedProfs[0];
        const prof = await Professor.findById(currentProfId);
        if (prof) {
          prof.appliedGroups.project1.pull(group._id);
          await prof.save();
        }
      }
      await group.deleteOne();
      await user.save();
      return res.status(200).json(new ApiResponse(200, "Left and group deleted"));
    }
  } else {
    await group.save();
  }

  await user.save();
  return res.status(200).json(new ApiResponse(200, "Left group successfully"));
});

const applyToFaculty = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { facultyId } = req.body;

  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");

  const year = getStudentYear(user.batch);
  if (year !== 3) {
    throw new ApiError(403, "Only 3rd year students can apply for Project 1");
  }

  if (!user.project1) {
    throw new ApiError(404, "Create a Project 1 group first");
  }

  const group = await Project1.findById(user.project1).populate("members");
  if (!group) throw new ApiError(404, "Group not found");

  if (!group.leader.equals(userId)) {
    throw new ApiError(409, "Only the leader can apply to faculty");
  }

  if (group.allocatedProf) {
    throw new ApiError(409, "You already have an allocated professor");
  }

  if (group.appliedProfs.some((id) => id.toString() === facultyId)) {
    throw new ApiError(409, "Already applied to this professor");
  }

  if (group.deniedProf.some((id) => id.toString() === facultyId)) {
    throw new ApiError(409, "Denied by this professor");
  }

  const faculty = await Professor.findById(facultyId);
  if (!faculty) throw new ApiError(404, "Faculty not found");

  // Profile completeness check for all members
  for (const member of group.members) {
    const missingFields = [];
    if (!member.branch) missingFields.push("branch");
    if (!member.section) missingFields.push("section");
    if (!member.email) missingFields.push("email");
    if (!member.mobileNumber || member.mobileNumber === "0000000000")
      missingFields.push("mobileNumber");
    if (!member.semester) missingFields.push("semester");
    if (!member.cgpa) missingFields.push("cgpa");
    if (!member.abcId) missingFields.push("abcId");
    if (!member.linkedin) missingFields.push("linkedin");
    if (!member.codingProfiles?.github) missingFields.push("github profile");
    if (!member.resume) missingFields.push("resume");
    if (!member.image) missingFields.push("profile picture");
    if (!member.alternateEmail) missingFields.push("alternate email");
    if (!member.fatherName) missingFields.push("father's name");
    if (!member.fatherMobileNumber) missingFields.push("father's mobile number");
    if (!member.motherName) missingFields.push("mother's name");
    if (!member.residentialAddress) missingFields.push("address");

    const hasCodingProfile =
      member.codingProfiles?.leetcode ||
      member.codingProfiles?.codeforces ||
      member.codingProfiles?.codechef ||
      member.codingProfiles?.atcoder;
    if (!hasCodingProfile) {
      missingFields.push(
        "at least one coding profile (leetcode/codeforces/codechef/atcoder)"
      );
    }

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Member ${member.fullName} has incomplete profile: missing ${missingFields.join(", ")}`,
      });
    }
  }

  group.appliedProfs.push(facultyId);
  await group.save();

  // Add to first applied prof's queue immediately
  if (group.appliedProfs.length === 1) {
    faculty.appliedGroups.project1.push(group._id);
    await faculty.save();
    group.preferenceLastMovedAt = new Date();
    await group.save();
  }

  return res
    .status(200)
    .json(new ApiResponse(200, group, "Applied to faculty successfully"));
});

const withdrawPreferences = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const user = await User.findById(userId);
  if (!user || !user.project1) {
    throw new ApiError(404, "No Project 1 group found");
  }

  const group = await Project1.findById(user.project1);
  if (!group) throw new ApiError(404, "Group not found");

  if (!group.leader.equals(userId)) {
    throw new ApiError(409, "Only the leader can withdraw preferences");
  }

  if (group.allocatedProf) {
    throw new ApiError(409, "Cannot withdraw after allocation");
  }

  if (group.appliedProfs.length > 0) {
    const currentProfId = group.appliedProfs[0];
    const prof = await Professor.findById(currentProfId);
    if (prof) {
      prof.appliedGroups.project1 = prof.appliedGroups.project1.filter(
        (grpId) => grpId.toString() !== group._id.toString()
      );
      await prof.save();
    }
  }

  group.appliedProfs = [];
  group.deniedProf = [];
  group.preferenceLastMovedAt = null;
  await group.save();

  return res
    .status(200)
    .json(new ApiResponse(200, group, "All preferences withdrawn successfully"));
});

const getProject1 = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const user = await User.findById(userId);
  if (!user || !user.project1) {
    throw new ApiError(404, "No Project 1 group found");
  }

  const group = await Project1.findById(user.project1)
    .populate("members")
    .populate("leader")
    .populate("appliedProfs")
    .populate("allocatedProf")
    .populate("deniedProf")
    .populate("discussion.absent");

  if (!group) {
    await User.updateOne({ _id: user._id }, { $set: { project1: null } });
    throw new ApiError(404, "No Project 1 group found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, group, "Project 1 details returned"));
});

const getAppliedProfs = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const user = await User.findById(userId);
  if (!user || !user.project1) throw new ApiError(404, "No Project 1 group found");

  const group = await Project1.findById(user.project1);
  if (!group) throw new ApiError(404, "Group not found");

  let prof = null;
  if (group.allocatedProf) {
    prof = await Professor.findById(group.allocatedProf);
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        appliedProfs: group.appliedProfs,
        isAllocated: !!group.allocatedProf,
        denied: group.deniedProf,
        prof,
      },
      "Applied profs and allocation details returned"
    )
  );
});

const getDiscussionByStudent = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const user = await User.findById(userId);
  if (!user || !user.project1) throw new ApiError(404, "Project 1 group not found");

  const group = await Project1.findById(user.project1).populate("discussion.absent");
  if (!group) throw new ApiError(404, "Group not found");

  return res
    .status(200)
    .json(
      new ApiResponse(200, group.discussion, "Discussion fetched successfully")
    );
});

// ===================== Professor-facing =====================

const getProject1AppliedStudents = asyncHandler(async (req, res) => {
  const profId = req.professor._id;

  const professor = await Professor.findById(profId).populate({
    path: "appliedGroups.project1",
    populate: {
      path: "members",
      select:
        "fullName rollNumber email linkedin codingProfiles cgpa section branch image",
    },
  });

  if (!professor) throw new ApiError(404, "Professor not found");

  const records = professor.appliedGroups.project1 || [];

  return res
    .status(200)
    .json(
      new ApiResponse(200, records, "Applied groups retrieved successfully")
    );
});

const acceptProject1Student = asyncHandler(async (req, res) => {
  const { _id } = req.body; // Project1 group id
  const profId = req.professor._id;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const prof = await Professor.findById(profId).session(session);
    if (!prof) throw new ApiError(404, "Professor not found");

    const group = await Project1.findById(_id).session(session);
    if (!group) throw new ApiError(404, "Project 1 group not found");

    if (group.allocatedProf) {
      throw new ApiError(409, "Group already has an allocated professor");
    }

    const numMembers = group.members.length;
    if (
      prof.currentCount.project1 + numMembers >
      prof.limits.project1
    ) {
      throw new ApiError(
        409,
        "Limit will exceed, you cannot accept above the limit."
      );
    }

    group.allocatedProf = profId;
    group.appliedProfs = [];
    await group.save({ session });

    prof.currentCount.project1 += numMembers;
    prof.appliedGroups.project1.pull(group._id);
    prof.students.project1.push(group._id);
    await prof.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res
      .status(200)
      .json(new ApiResponse(200, "Group accepted for Project 1"));
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw new ApiError(
      500,
      error.message || "Something went wrong while accepting group"
    );
  }
});

const denyProject1Student = asyncHandler(async (req, res) => {
  const { _id } = req.body; // Project1 group id
  const profId = req.professor._id;

  const group = await Project1.findById(_id);
  if (!group) throw new ApiError(404, "Project 1 group not found");

  const prof = await Professor.findById(profId);
  if (!prof) throw new ApiError(404, "Professor not found");

  // Remove this prof from applied list
  group.appliedProfs.pull(profId);
  prof.appliedGroups.project1.pull(_id);
  group.deniedProf.push(profId);

  await group.save();
  await prof.save();

  // Move to next professor in preference if any
  if (group.appliedProfs.length > 0) {
    const nextProfId = group.appliedProfs[0];
    const nextProf = await Professor.findById(nextProfId);
    if (nextProf) {
      nextProf.appliedGroups.project1.push(group._id);
      await nextProf.save();
    }
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Group denied and passed to next faculty in preference"
      )
    );
});

const getProject1AcceptedStudents = asyncHandler(async (req, res) => {
  const profId = req.professor._id;

  const professor = await Professor.findById(profId);
  if (!professor) throw new ApiError(404, "Professor not found");

  const project1Ids = professor.students.project1;
  const records = await Project1.find({ _id: { $in: project1Ids } })
    .populate("members")
    .populate("discussion.absent");

  return res
    .status(200)
    .json(
      new ApiResponse(200, records, "Accepted groups retrieved successfully")
    );
});

const addProject1Remark = asyncHandler(async (req, res) => {
  const { _id, description, remark, absent } = req.body;

  if (!_id || !description) {
    throw new ApiError(400, "Project 1 group ID and description are required.");
  }

  const group = await Project1.findById(_id);
  if (!group) throw new ApiError(404, "Project 1 group not found");

  const profId = req.professor._id;
  if (!group.allocatedProf || !group.allocatedProf.equals(profId)) {
    throw new ApiError(403, "Only allocated professor can add remarks");
  }

  group.discussion.push({
    description,
    remark: remark || "",
    absent: absent || [],
    date: new Date(),
  });

  await group.save();

  return res
    .status(200)
    .json(new ApiResponse(200, { _id: group._id }, "Remark added successfully"));
});

const addProject1Marks = asyncHandler(async (req, res) => {
  const { studentId, marks } = req.body;

  const user = await User.findById(studentId);
  if (!user) throw new ApiError(404, "User not found");

  user.marks.project1 = marks;
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Marks added successfully"));
});

const getProject1Limits = asyncHandler(async (req, res) => {
  const profId = req.professor._id;
  const prof = await Professor.findById(profId);
  if (!prof) throw new ApiError(404, "Professor not found");

  const limitleft = prof.limits.project1 - prof.currentCount.project1;

  return res
    .status(200)
    .json(new ApiResponse(200, limitleft, "Project 1 limit returned"));
});

const saveProject1Title = asyncHandler(async (req, res) => {
  const { project1Id, projectTitle } = req.body;
  const profId = req.professor._id;

  const group = await Project1.findById(project1Id);
  if (!group) throw new ApiError(404, "Project 1 group not found");

  if (
    !group.allocatedProf ||
    group.allocatedProf.toString() !== profId.toString()
  ) {
    throw new ApiError(403, "Unauthorized");
  }

  group.projectTitle = projectTitle?.trim() || "";
  await group.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        group.projectTitle,
        group.projectTitle
          ? "Project title updated successfully"
          : "Project title cleared successfully"
      )
    );
});

// ===================== Admin-facing =====================

const getAllProject1Data = asyncHandler(async (req, res) => {
  const { batch } = req.query;
  const admin = req.admin;

  if (!batch) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Batch is required."));
  }

  const batchNumber = Number(batch);
  if (Number.isNaN(batchNumber)) {
    throw new ApiError(400, "Invalid batch query parameter");
  }

  // For batch admins, enforce access only to assigned batches
  if (admin && admin.role !== "master" && admin.assignedBatches?.length > 0) {
    if (!admin.assignedBatches.includes(batchNumber)) {
      throw new ApiError(
        403,
        `Access forbidden: You don't have access to batch K${batchNumber}`
      );
    }
  }

  // Find all Project1 groups where at least one member is from this batch
  const batchUsers = await User.find({ batch: batchNumber }).select("_id");
  const batchUserIds = batchUsers.map((u) => u._id);

  const records = await Project1.find({
    members: { $in: batchUserIds },
  })
    .populate({
      path: "members",
      select:
        "batch fullName rollNumber email section branch mobileNumber marks",
    })
    .populate("allocatedProf")
    .populate("leader");

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { response: records },
        "All Project 1 data fetched"
      )
    );
});

export {
  createProject1,
  addMember,
  acceptReq,
  getReq,
  removeMember,
  leaveGroup,
  applyToFaculty,
  withdrawPreferences,
  getProject1,
  getAppliedProfs,
  getDiscussionByStudent,
  getProject1AppliedStudents,
  acceptProject1Student,
  denyProject1Student,
  getProject1AcceptedStudents,
  addProject1Remark,
  addProject1Marks,
  getProject1Limits,
  saveProject1Title,
  getAllProject1Data,
};
