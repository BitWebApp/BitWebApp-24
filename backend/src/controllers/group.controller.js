import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { Group } from "../models/group.model.js";
import { customAlphabet, nanoid } from "nanoid";
import { Professor } from "../models/professor.model.js";

const createGroup = asyncHandler(async (req, res) => {
  const leader = req?.user?._id;
  const nanoid = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 6);
  const members = [leader];
  const user = await User.findById(leader);
  if (user.group) throw new ApiError(409, "Already in a group");
  const newGroup = await Group.create({
    groupId: nanoid(),
    leader,
    members,
    type: "summer",
  });
  user.group = newGroup._id;
  user.save();
  return res
    .status(200)
    .json(new ApiResponse(200, newGroup, "Group created successfully"));
});

const addMember = asyncHandler(async (req, res) => {
  const { rollNumber, groupId } = req.body;
  const group = await Group.findById({ _id: groupId });
  if (!group) throw new ApiError(404, "Group not found");
  if (group.summerAllocatedProf) {
    throw new ApiError(409, "Cannot add member after faculty allocation");
  }
  const user = await User.findOne({ rollNumber });
  if (user.group) throw new ApiError(409, "Already in a group");
  group.members.push(user?._id);
  user.group = group._id;
  await user.save();
  await group.save();
  return res.status(200).json(new ApiResponse(200, "New member added"));
});

const removeMember = asyncHandler(async (req, res) => {
  const { rollNumber, groupId } = req.body;
  const group = await Group.findById({ _id: groupId });
  if (!group) throw new ApiError(404, "Group not found");
  if (group.summerAllocatedProf) {
    throw new ApiError(409, "Cannot remove member after faculty allocation");
  }
  const user = await User.findOne({ rollNumber });
  if (!user.group) throw new ApiError(409, "Not in a group");
  group.members.pull(user?._id);
  user.group = null;
  await user.save();
  await group.save();
  return res.status(200).json(new ApiResponse(200, "member removed"));
});

const applyToFaculty = asyncHandler(async (req, res) => {
  const { facultyId } = req.body;
  const userId = req?.user?._id;
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  const groupId = user.group;
  const group = await Group.findById({ _id: groupId });
  if (!group) throw new ApiError(404, "Group not found");
  if (group.deniedProf.includes(facultyId))
    throw new ApiError(409, "Denied by this professor");
  if (group.summerAllocatedProf)
    throw new ApiError(409, "You already have a faculty assigned");
  const faculty = await Professor.findById(facultyId);
  if (!faculty) throw new ApiError(404, "Faculty not found");

  if (group.summerAppliedProfs.includes(facultyId)) {
    throw new ApiError(409, "Already applied to this faculty");
  }

  group.summerAppliedProfs.push(facultyId);
  if (group.summerAppliedProfs.length === 1) {
    faculty.students.summer_training.push(group._id);
    await faculty.save();
  }
  await group.save();
  return res
    .status(200)
    .json(new ApiResponse(200, group, "Applied to faculty successfully"));
});

const getGroup = asyncHandler(async (req, res) => {
  const userid = req?.user?._id;
  const user = await User.findById({ _id: userid });
  const groupId = user.group;
  if (!groupId) throw new ApiError(409, "Not in any group");
  const group = await Group.findById({ _id: groupId })
    .populate("members")
    .populate("leader")
    .populate("summerAppliedProfs")
    .populate("summerAllocatedProf");
  return res
    .status(200)
    .json(new ApiResponse(200, group, "Group details returned"));
});

export { createGroup, addMember, removeMember, applyToFaculty, getGroup };
