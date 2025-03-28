import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { Group } from "../models/group.model.js";
import { customAlphabet, nanoid } from "nanoid";
import { Professor } from "../models/professor.model.js";
import { Company } from "../models/company.model.js";

const createGroup = asyncHandler(async (req, res) => {
  const leader = req?.user?._id;
  const { typeofSummer, org } = req.body;
  console.log(typeofSummer, org);
  const nanoid = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 6);
  const members = [leader];
  const user = await User.findById(leader);
  if (user.group) throw new ApiError(409, "Already in a group");
  if (!typeofSummer) {
    throw new ApiError(400, "Type of summer internship is required");
  }
  if (typeofSummer === "industrial" && !org) {
    throw new ApiError(
      400,
      "Organisation Name is required for industrial summer internship"
    );
  }
  let newGroup;
  if (org) {
    const company = await Company.findById(org);
    if (!company) throw new ApiError(404, "Company not found");
    newGroup = await Group.create({
      groupId: nanoid(),
      leader,
      members,
      type: "summer",
      typeOfSummer: typeofSummer,
      org,
    });
    user.group = newGroup._id;
    user.save();
  } else {
    newGroup = await Group.create({
      groupId: nanoid(),
      leader,
      members,
      type: "summer",
      typeOfSummer: typeofSummer,
    });
    user.group = newGroup._id;
    user.save();
  }

  return res
    .status(200)
    .json(new ApiResponse(200, newGroup, "Group created successfully"));
});

const addMember = asyncHandler(async (req, res) => {
  const loggedIn = req?.user?._id;
  const { rollNumber, groupId } = req.body;
  console.log(groupId);
  const group = await Group.findById({ _id: groupId });
  if (!group) throw new ApiError(404, "Group not found");
  if(group.typeOfSummer === "industrial") throw new ApiError(409, "Cannot add member to industrial group");
  if (!group.leader.equals(loggedIn)) {
    throw new ApiError(409, "Only Leader can add");
  }
  if (group.summerAllocatedProf) {
    throw new ApiError(409, "Cannot add member after faculty allocation");
  }
  const user = await User.findOne({ rollNumber });
  if (user.group) throw new ApiError(409, "Already in a group");
  // group.members.push(user?._id);
  // user.group = group._id;
  user.groupReq.push(group._id);
  await user.save();
  return res.status(200).json(new ApiResponse(200, "Request sent"));
});

const acceptReq = asyncHandler(async (req, res) => {
  const userId = req?.user?._id;
  const { groupId } = req.body;
  console.log(groupId);
  const user = await User.findById({_id: userId});
  const group = await Group.findById({ _id: groupId });
  if (!group) throw new ApiError(404, "Group not found");
  if (group.summerAllocatedProf) {
    throw new ApiError(409, "Cannot join as group has a faculty assigned.");
  }
  if (user.group) throw new ApiError(409, "You are already in a group");
  group.members.push(user?._id);
  user.group = group._id;
  user.groupReq = [];
  await user.save();
  await group.save();
  return res.status(200).json(new ApiResponse(200, "Joined successfully"));
});

const getReq = asyncHandler(async (req, res) => {
  const userId = req?.user?._id;
  const user = await User.findById(userId)
  .populate({
    path: 'groupReq',
    populate: {
      path: 'leader', 
    }
  });
  return res.status(200).json(new ApiResponse(200, user?.groupReq, "All requests fetched"))
})
const removeMember = asyncHandler(async (req, res) => {
  const loggedIn = req?.user?._id;
  const { rollNumber, groupId } = req.body;
  const group = await Group.findById({ _id: groupId });
  if (!group) throw new ApiError(404, "Group not found");
  if (!group.leader.equals(loggedIn)) {
    throw new ApiError(409, "Only Leader can remove");
  }
  if (group.summerAllocatedProf) {
    throw new ApiError(409, "Cannot remove member after faculty allocation");
  }
  const user = await User.findOne({ rollNumber });
  if (!user.group) throw new ApiError(409, "Not in a group");
  group.members.pull(user?._id);
  user.group = null;
  await group.save();
  if (group?.leader.equals(user?._id)){
    if(group.members.length > 0){
      group.leader = group.members[0];
      await group.save();
    }
    else{
      await group.deleteOne();
    }
  }
  await user.save();
  return res.status(200).json(new ApiResponse(200, "member removed"));
});

const applyToFaculty = asyncHandler(async (req, res) => {
  const loggedIn = req?.user?._id;
  const { facultyId } = req.body;
  const userId = req?.user?._id;
  console.log("hello")
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  
  if (user.summerAppliedProfs.includes(facultyId)) {
    throw new ApiError(409, "Already applied to this professor");
  }
  
  const groupId = user.group;
  const group = await Group.findById(groupId).populate("members");
  if (!group) throw new ApiError(404, "Group not found");
  
  if (!group.leader.equals(loggedIn)) {
    throw new ApiError(409, "Only Leader can apply to faculty");
  }
  
  if (group.deniedProf.includes(facultyId)) {
    throw new ApiError(409, "Denied by this professor");
  }
  
  if (group.summerAllocatedProf) {
    throw new ApiError(409, "You already have a faculty assigned");
  }
  
  if (group.summerAppliedProfs.includes(facultyId)) {
    throw new ApiError(409, "Already applied to this faculty");
  }
  
  const members = group.members;
  const incompleteProfiles = [];
  
  for (const member of members) {
    const missingFields = [];

    if (!member.branch) missingFields.push("branch");
    if (!member.section) missingFields.push("section");
    if (!member.email) missingFields.push("email");
    if (!member.mobileNumber || member.mobileNumber === "0000000000") missingFields.push("mobileNumber");
    if (!member.semester) missingFields.push("semester");
    if (!member.cgpa) missingFields.push("cgpa");
    if (!member.abcId) missingFields.push("abcId");
    if (!member.linkedin) missingFields.push("linkedin");
    if (!member.codingProfiles.github) missingFields.push("github profile");
    if (!member.resume) missingFields.push("resume");
    if (!member.image) missingFields.push("profile picture");
    if (!member.alternateEmail) missingFields.push("alternate email");
    if (!member.fatherName) missingFields.push("father's name");
    if (!member.fatherMobileNumber) missingFields.push("father's mobile number");
    if (!member.motherName) missingFields.push("mother's name");
    if (!member.residentialAddress) missingFields.push("address");
    
    const hasCodingProfile = member.codingProfiles.leetcode || 
                            member.codingProfiles.codeforces || 
                            member.codingProfiles.codechef || 
                            member.codingProfiles.atcoder;
    if (!hasCodingProfile) {
      missingFields.push("at least one coding profile (leetcode/codeforces/codechef/atcoder)");
    }
    
    if (missingFields.length > 0) {
      incompleteProfiles.push({
        memberId: member._id,
        memberName: member.fullName,
        missingFields
      });
    }
  }
  
  if (incompleteProfiles.length > 0) {
    console.log(incompleteProfiles);
    throw new ApiError(400, "Some group members have incomplete profiles", {
      incompleteProfiles
    });
  }
  
  const faculty = await Professor.findById(facultyId);
  if (!faculty) throw new ApiError(404, "Faculty not found");
  
  group.summerAppliedProfs.push(facultyId);
  
  if (group.summerAppliedProfs.length === 1) {
    group.preferenceLastMovedAt = Date.now();
    faculty.appliedGroups.summer_training.push(group._id);
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
    .populate("summerAllocatedProf")
    .populate("org")
  return res
    .status(200)
    .json(new ApiResponse(200, group, "Group details returned"));
});

const getAppliedProfs = asyncHandler(async (req, res) => {
  const userid = req?.user?._id;
  const user = await User.findById(userid);
  // yha pe error html me jaa r
  if (!user.group) throw new ApiError(409, "Not in any group");
  const group = await Group.findById({ _id: user.group });
  if (!group) throw new ApiError(409, "Group not found");
  let prof = null;
  if (group.summerAllocatedProf) {
    prof = await Professor.findById({ _id: group?.summerAllocatedProf });
  }
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        summerAppliedProfs: group.summerAppliedProfs,
        isSummerAllocated: group.summerAllocatedProf ? true : false,
        denied: group.deniedProf,
        prof,
      },
      "Applied profs and allocation details returned"
    )
  );
});

const summerSorted = asyncHandler(async (req, res) => {
  const userid = req?.user?._id;
  const user = await User.findById(userid);
  const group = await Group.findById({ _id: user.group });
  if (!group) throw new ApiError(409, "Group not found");
  let sorted = false;
  let prof;
  if (group.summerAllocatedProf) {
    sorted = true;
    prof = await Professor.findById({ _id: group.summerAllocatedProf });
  }
  return res
    .status(200)
    .json(new ApiResponse(200, sorted, "Summer status returned"));
});

const addDiscussion = asyncHandler(async (req, res) => {
  const { groupId, description } = req.body;
  const group = await Group.findById({
    _id: groupId,
  });
  if (!group) throw new ApiError(404, "Group not found");
  const loggedIn = req?.user?._id;
  if (!group.leader.equals(loggedIn)) {
    throw new ApiError(409, "Only Leader can add discussion");
  }
  group.discussion.push({ description });
  await group.save();
  return res
    .status(200)
    .json(new ApiResponse(200, group, "Discussion added successfully"));
})

const addRemarkAbsent = asyncHandler(async (req, res) => {
  const { groupId, description, remark, absent } = req.body;
  console.log(groupId, description, remark, absent);
  if (!groupId || !description || !remark || !absent) {
    throw new ApiError(400, "All fields are required.");
  }

  const group = await Group.findById(groupId);
  if (!group) throw new ApiError(404, "Group not found");

  const loggedIn = req?.professor?._id;
  if (!group.summerAllocatedProf.equals(loggedIn)) {
    throw new ApiError(403, "Only allocated professor can add remarks");
  }

  group.discussion.push({
    description: description,  
    remark: remark,
    absent: absent,
    date: new Date()
  });

  await group.save();

  return res
    .status(200)
    .json(new ApiResponse(200, { groupId: group._id }, "Remark added successfully"));
});

const getDiscussion = asyncHandler(async (req, res) => {
  const { groupId } = req.body;
  const group = await Group.findById({_id: groupId}).populate("discussion.absent");
  if (!group) throw new ApiError(404, "Group not found");
  return res
    .status(200)
    .json(new ApiResponse(200, group.discussion, "Discussion fetched successfully"));
});


const getDiscussionByStudent = asyncHandler(async (req, res) => {
  const userId = req?.user?._id;
  const user = await User.findById(userId);
  if (!user.group) throw new ApiError(404, "Group not found");
  const groupId = user.group;
  const group = await Group.findById({_id: groupId}).populate("discussion.absent");
  if (!group) throw new ApiError(404, "Group not found");
  return res
    .status(200)
    .json(new ApiResponse(200, group.discussion, "Discussion fetched successfully"));
});
export {
  createGroup,
  getDiscussionByStudent,
  addMember,
  removeMember,
  applyToFaculty,
  getGroup,
  getDiscussion,
  getAppliedProfs,
  summerSorted,
  acceptReq,
  getReq,
  addDiscussion,
  addRemarkAbsent
};
