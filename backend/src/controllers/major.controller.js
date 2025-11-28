import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { Major } from "../models/major.model.js";
import { customAlphabet, nanoid } from "nanoid";
import { Professor } from "../models/professor.model.js";
import { Company } from "../models/company.model.js";

const createGroup = asyncHandler(async (req, res) => {
  const leader = req?.user?._id;
  const { type, org } = req.body;
  console.log(type, org);
  const nanoid = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 6);
  const members = [leader];
  const user = await User.findById(leader);
  if (user?.MajorGroup) {
    console.log("already in a group");
    return res.status(409).json({
      success: false,
      message: "Already in a group",
    });
    // throw new ApiError(409, "Already in a group");
  }
  if (!type) {
    console.log("type of major internship is required");
    return res.status(400).json({
      success: false,
      message: "Type of major internship is required",
    });
    // throw new ApiError(400, "Type of major internship is required");
  }
  if (type === "industrial" && !org) {
    console.log("organisation name is required");
    return res.status(400).json({
      success: false,
      message: "Organisation Name is required for industrial major internship",
    });
    // throw new ApiError(
    //   400,
    //   "Organisation Name is required for industrial major internship"
    // );
  }
  let newGroup;
  if (org) {
    const company = await Company.findById(org);
    if (!company) {
      console.log("company not found");
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
      // throw new ApiError(404, "Company not found");
    }
    newGroup = await Major.create({
      groupId: nanoid(),
      leader,
      members,
      type,
      org,
    });
    user.MajorGroup = newGroup._id;
    user.save();
  } else {
    newGroup = await Major.create({
      groupId: nanoid(),
      leader,
      members,
      type,
    });
    user.MajorGroup= newGroup._id;
    user.save();
  }

  return res
    .status(200)
    .json(new ApiResponse(200, newGroup, "Group created successfully"));
});
const addMember = asyncHandler(async (req, res) => {
  const loggedIn = req?.user?._id;
  const { rollNumber, groupId } = req.body;
  console.log(rollNumber)
  if(req.user.batch == 23) {
    return res.status(403).json({
      success: false,
      message: "Students of batch 2023 are not allowed to form major groups.",
    });
  }

  console.log("hello", groupId);
  const group = await Major.findById(groupId);
  console.log(groupId)
  if (!group) {
    console.log("group not found");
    return res.status(404).json({
      success: false,
      message: "Group not found",
    });
  }

  if (!group.leader.equals(loggedIn)) {
    console.log("Only Leader can add member");
    return res.status(409).json({
      success: false,
      message: "Only Leader can add member",
    });
  }
  if (group.majorAllocatedProf) {
    console.log("Cannot add member after faculty allocation");
    return res.status(409).json({
      success: false,
      message: "Cannot add member after faculty allocation",
    });
  }
  const user = await User.findOne({ rollNumber });
  if (user.MajorGroup) {
    console.log("Already in a major group");
    return res.status(409).json({
      success: false,
      message: "Already in a major group",
    });
  }
  user.MajorGroupReq.push(group._id);
  await user.save();
  return res.status(200).json(new ApiResponse(200, "Request sent"));
});

const acceptReq = asyncHandler(async (req, res) => {
  const userId = req?.user?._id;
  const { groupId } = req.body;
  console.log(groupId);
  const user = await User.findById(userId);
  const group = await Major.findById(groupId);
  if (!group) {
    console.log("group not found");
    return res.status(404).json({
      success: false,
      message: "Group not found",
    });
  }
  if (group.majorAllocatedProf) {
    console.log("Cannot join as group has a faculty assigned.");
    return res.status(409).json({
      success: false,
      message: "Cannot join as group has a faculty assigned.",
    });
  }
  if (user.MajorGroup) {
    console.log("You are already in a major group");
    return res.status(409).json({
      success: false,
      message: "You are already in a major group",
    });
  }
  group.members.push(user?._id);
  user.MajorGroup = group._id;
  user.MajorGroupReq = [];
  await user.save();
  await group.save();
  return res.status(200).json(new ApiResponse(200, "Joined successfully"));
});

const getReq = asyncHandler(async (req, res) => {
  const userId = req?.user?._id;
  const user = await User.findById(userId).populate({
    path: "MajorGroupReq",
    populate: {
      path: "leader",
    },
  });
  return res
    .status(200)
    .json(new ApiResponse(200, user?.MajorGroupReq, "All requests fetched"));
});

const removeMember = asyncHandler(async (req, res) => {
  const loggedIn = req?.user?._id;
  const { rollNumber, groupId } = req.body;
  const group = await Major.findById(groupId);
  if (!group) {
    console.log("group not found");
    return res.status(404).json({
      success: false,
      message: "Group not found",
    });
  }
  if (!group.leader.equals(loggedIn)) {
    console.log("Only Leader can remove member");
    return res.status(409).json({
      success: false,
      message: "Only Leader can remove member",
    });
  }
  if (group.majorAllocatedProf) {
    console.log("Cannot remove member after faculty allocation");
    return res.status(409).json({
      success: false,
      message: "Cannot remove member after faculty allocation",
    });
  }
  const user = await User.findOne({ rollNumber });
  if (!user.MajorGroup) {
    console.log("Not in a major group");
    return res.status(409).json({
      success: false,
      message: "Not in a major group",
    });
  }
  group.members.pull(user?._id);
  user.MajorGroup = null;
  await group.save();
  if (group?.leader.equals(user?._id)) {
    if (group.members.length > 0) {
      group.leader = group.members[0];
      await group.save();
    } else {
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

  if(req.user.batch == 23) {
    return res.status(403).json({
      success: false,
      message: "Students of batch 2023 are not allowed to apply to faculty for major project.",
    });
  }

  console.log("Applying to faculty", facultyId);
  const user = await User.findById(userId);
  if (!user) {
    console.log("user not found");
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  if (user.majorAppliedProfs.includes(facultyId)) {
    console.log("Already applied to this professor");
    return res.status(409).json({
      success: false,
      message: "Already applied to this professor",
    });
  }

  const groupId = user.MajorGroup;
  const group = await Major.findById(groupId).populate("members");
  if (!group) {
    console.log("group not found");
    return res.status(404).json({
      success: false,
      message: "Group not found",
    });
  }

  if (!group.leader.equals(loggedIn)) {
    console.log("Only Leader can apply to faculty");
    return res.status(409).json({
      success: false,
      message: "Only Leader can apply to faculty",
    });
  }

  if (group.deniedProf.includes(facultyId)) {
    console.log("Denied by this professor");
    return res.status(409).json({
      success: false,
      message: "Denied by this professor",
    });
  }

  if (group.majorAllocatedProf) {
    console.log("You already have a faculty assigned");
    return res.status(409).json({
      success: false,
      message: "You already have a faculty assigned",
    });
  }

  if (group.majorAppliedProfs.includes(facultyId)) {
    console.log("Already applied to this faculty");
    return res.status(409).json({
      success: false,
      message: "Already applied to this faculty",
    });
  }

  const members = group.members;
  const incompleteProfiles = [];

  for (const member of members) {
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
    if (!member.codingProfiles.github) missingFields.push("github profile");
    if (!member.resume) missingFields.push("resume");
    if (!member.image) missingFields.push("profile picture");
    if (!member.alternateEmail) missingFields.push("alternate email");
    if (!member.fatherName) missingFields.push("father's name");
    if (!member.fatherMobileNumber)
      missingFields.push("father's mobile number");
    if (!member.motherName) missingFields.push("mother's name");
    if (!member.residentialAddress) missingFields.push("address");

    const hasCodingProfile =
      member.codingProfiles.leetcode ||
      member.codingProfiles.codeforces ||
      member.codingProfiles.codechef ||
      member.codingProfiles.atcoder;
    if (!hasCodingProfile) {
      missingFields.push(
        "at least one coding profile (leetcode/codeforces/codechef/atcoder)"
      );
    }

    if (missingFields.length > 0) {
      incompleteProfiles.push({
        memberId: member._id,
        memberName: member.fullName,
        missingFields,
      });
    }
  }
  if (incompleteProfiles.length > 0) {
    console.log("Some group members have incomplete profiles");
    console.log(incompleteProfiles);
    return res.status(400).json({
      success: false,
      message: `Some group members have incomplete profiles: ${incompleteProfiles
        .map((m) => `${m.memberName} is missing ${m.missingFields.join(", ")}`)
        .join("; ")}`,
    });
  }

  const faculty = await Professor.findById(facultyId);
  if (!faculty) {
    console.log("faculty not found");
    return res.status(404).json({
      success: false,
      message: "Faculty not found",
    });
  }
  if(group.members.length > faculty.limits.major_project-faculty.currentCount.major_project) {
    console.log("Your group size exceeds faculty's remaining limit");
  }

  group.majorAppliedProfs.push(facultyId);

  if (group.majorAppliedProfs.length === 1) {
    group.preferenceLastMovedAt = Date.now();
    faculty.appliedGroups.major_project.push(group._id);
    await faculty.save();
  }

  await group.save();

  return res
    .status(200)
    .json(new ApiResponse(200, group, "Applied to faculty successfully"));
});

const getGroup = asyncHandler(async (req, res) => {
  const userid = req?.user?._id;
  const user = await User.findById(userid);
  const groupId = user.MajorGroup;
  if (!groupId) throw new ApiError(409, "Not in any major group");
  const group = await Major.findById(groupId)
    .populate("members")
    .populate("leader")
    .populate("majorAppliedProfs")
    .populate("majorAllocatedProf")
  return res
    .status(200)
    .json(new ApiResponse(200, group, "major group details returned"));
});

const getAppliedProfs = asyncHandler(async (req, res) => {
  const userid = req?.user?._id;
  const user = await User.findById(userid);
  if (!user.MajorGroup) throw new ApiError(409, "Not in any major group");
  const group = await Major.findById(user.MajorGroup);
  if (!group) throw new ApiError(409, "Group not found");
  let prof = null;
  if (group.majorAllocatedProf) {
    prof = await Professor.findById(group?.majorAllocatedProf);
  }
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        majorAppliedProfs: group.majorAppliedProfs,
        ismajorAllocated: group.majorAllocatedProf ? true : false,
        denied: group.deniedProf,
        prof,
      },
      "Applied profs and allocation details returned"
    )
  );
});

const majorSorted = asyncHandler(async (req, res) => {
  const userid = req?.user?._id;
  const user = await User.findById(userid);
  const group = await Major.findById({ _id: user.MajorGroup });
  if (!group) throw new ApiError(409, "Group not found");
  let sorted = false;
  let prof;
  if (group.majorAllocatedProf) {
    sorted = true;
    prof = await Professor.findById(group.majorAllocatedProf);
  }
  return res
    .status(200)
    .json(new ApiResponse(200, sorted, "major status returned"));
});

const addDiscussion = asyncHandler(async (req, res) => {
  const { groupId, description } = req.body;
  const group = await Major.findById(groupId);
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
});

const addRemarkAbsent = asyncHandler(async (req, res) => {
  const { groupId, description, remark, absent } = req.body;
  console.log(groupId, description, remark, absent);
  if (!groupId || !description || !remark || !absent) {
    throw new ApiError(400, "All fields are required.");
  }

  const group = await Major.findById(groupId);
  if (!group) throw new ApiError(404, "Group not found");

  const loggedIn = req?.professor?._id;
  if (!group.majorAllocatedProf.equals(loggedIn)) {
    throw new ApiError(403, "Only allocated professor can add remarks");
  }

  group.discussion.push({
    description: description,
    remark: remark,
    absent: absent,
    date: new Date(),
  });

  await group.save();

  return res
    .status(200)
    .json(
      new ApiResponse(200, { groupId: group._id }, "Remark added successfully")
    );
});

const getDiscussion = asyncHandler(async (req, res) => {
  const { groupId } = req.body;
  const group = await Major.findById(groupId).populate(
    "discussion.absent"
  );
  if (!group) throw new ApiError(404, "Group not found");
  return res
    .status(200)
    .json(
      new ApiResponse(200, group.discussion, "Discussion fetched successfully")
    );
});

const getDiscussionByStudent = asyncHandler(async (req, res) => {
  const userId = req?.user?._id;
  const user = await User.findById(userId);
  if (!user.MajorGroup) throw new ApiError(404, "Group not found");
  const groupId = user.MajorGroup;
  const group = await Major.findById(groupId).populate(
    "discussion.absent"
  );
  if (!group) throw new ApiError(404, "Group not found");
  return res
    .status(200)
    .json(
      new ApiResponse(200, group.discussion, "Discussion fetched successfully")
    );
});

const addMarks = asyncHandler(async (req, res) => {
  const { userId, marks } = req.body;
  console.log(userId, marks);
  const user = await User.findById(userId).select("fullName rollNumber marks");
  if (!user) throw new ApiError(404, "User not found");
  // 
  if(user.marks.majorProject > 0){
    throw new ApiError(400, "Marks already added");
  }
  // 
  user.marks.majorProject = marks;
  await user.save();
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Marks added successfully"));
});

export {
  addMarks,
  createGroup,
  getDiscussionByStudent,
  addMember,
  removeMember,
  applyToFaculty,
  getGroup,
  getDiscussion,
  getAppliedProfs,
  majorSorted,
  acceptReq,
  getReq,
  addDiscussion,
  addRemarkAbsent,
};