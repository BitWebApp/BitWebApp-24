// Set project title (leader only, only if not already set)
const setProjectTitle = asyncHandler(async (req, res) => {
  const userId = req?.user?._id;
  const { projectTitle } = req.body;
  if (
    !projectTitle ||
    typeof projectTitle !== "string" ||
    !projectTitle.trim()
  ) {
    return res.status(400).json({
      success: false,
      message: "Project title is required.",
    });
  }
  const user = await User.findById(userId);
  if (!user || !user.MajorGroup) {
    return res.status(404).json({
      success: false,
      message: "User or group not found.",
    });
  }
  const group = await Major.findById(user.MajorGroup);
  if (!group) {
    return res.status(404).json({
      success: false,
      message: "Group not found.",
    });
  }
  if (!group.leader.equals(userId)) {
    return res.status(403).json({
      success: false,
      message: "Only the group leader can set the project title.",
    });
  }
  if (group.projectTitle && group.projectTitle.trim().length > 0) {
    return res.status(409).json({
      success: false,
      message:
        "Project title has already been set and cannot be changed unless group type is changed.",
    });
  }
  group.projectTitle = projectTitle.trim();
  await group.save();
  return res
    .status(200)
    .json(new ApiResponse(200, group, "Project title set successfully."));
});
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
  // console.log(type, org);
  const nanoid = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 6);
  const members = [leader];
  const user = await User.findById(leader);
  if (user?.MajorGroup) {
    // console.log("already in a group");
    return res.status(409).json({
      success: false,
      message: "Already in a group",
    });
    // throw new ApiError(409, "Already in a group");
  }
  if (!type) {
    // console.log("type of major internship is required");
    return res.status(400).json({
      success: false,
      message: "Type of major internship is required",
    });
    // throw new ApiError(400, "Type of major internship is required");
  }
  if (type === "industrial" && !org) {
    // console.log("organisation name is required");
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
      // console.log("company not found");
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
    user.MajorGroup = newGroup._id;
    user.save();
  }

  return res
    .status(200)
    .json(new ApiResponse(200, newGroup, "Group created successfully"));
});
const addMember = asyncHandler(async (req, res) => {
  const loggedIn = req?.user?._id;
  const { rollNumber, groupId } = req.body;
  // console.log(rollNumber)
  if (req.user.batch == 23) {
    return res.status(403).json({
      success: false,
      message: "Students of batch 2023 are not allowed to form major groups.",
    });
  }

  // console.log("hello", groupId);
  const group = await Major.findById(groupId);
  // console.log(groupId)
  if (!group) {
    // console.log("group not found");
    return res.status(404).json({
      success: false,
      message: "Group not found",
    });
  }

  if (!group.leader.equals(loggedIn)) {
    // console.log("Only Leader can add member");
    return res.status(409).json({
      success: false,
      message: "Only Leader can add member",
    });
  }
  if (group.majorAllocatedProf) {
    // console.log("Cannot add member after faculty allocation");
    return res.status(409).json({
      success: false,
      message: "Cannot add member after faculty allocation",
    });
  }
  const user = await User.findOne({ rollNumber });
  if (user.MajorGroup) {
    // console.log("Already in a major group");
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
  // console.log(groupId);
  const user = await User.findById(userId);
  const group = await Major.findById(groupId);
  if (!group) {
    // console.log("group not found");
    return res.status(404).json({
      success: false,
      message: "Group not found",
    });
  }
  if (group.majorAllocatedProf) {
    // console.log("Cannot join as group has a faculty assigned.");
    return res.status(409).json({
      success: false,
      message: "Cannot join as group has a faculty assigned.",
    });
  }
  if (user.MajorGroup) {
    // console.log("You are already in a major group");
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
    // console.log("group not found");
    return res.status(404).json({
      success: false,
      message: "Group not found",
    });
  }
  if (!group.leader.equals(loggedIn)) {
    // console.log("Only Leader can remove member");
    return res.status(409).json({
      success: false,
      message: "Only Leader can remove member",
    });
  }
  if (group.majorAllocatedProf) {
    // console.log("Cannot remove member after faculty allocation");
    return res.status(409).json({
      success: false,
      message: "Cannot remove member after faculty allocation",
    });
  }
  const user = await User.findOne({ rollNumber });
  if (!user.MajorGroup) {
    // console.log("Not in a major group");
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

  if (req.user.batch == 23) {
    return res.status(403).json({
      success: false,
      message:
        "Students of batch 2023 are not allowed to apply to faculty for major project.",
    });
  }

  // console.log("Applying to faculty", facultyId);
  const user = await User.findById(userId);
  if (!user) {
    // console.log("user not found");
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  if (user.majorAppliedProfs.includes(facultyId)) {
    // console.log("Already applied to this professor");
    return res.status(409).json({
      success: false,
      message: "Already applied to this professor",
    });
  }

  const groupId = user.MajorGroup;
  const group = await Major.findById(groupId).populate("members");
  if (!group) {
    // console.log("group not found");
    return res.status(404).json({
      success: false,
      message: "Group not found",
    });
  }

  if (!group.leader.equals(loggedIn)) {
    // console.log("Only Leader can apply to faculty");
    return res.status(409).json({
      success: false,
      message: "Only Leader can apply to faculty",
    });
  }

  if (group.deniedProf.includes(facultyId)) {
    // console.log("Denied by this professor");
    return res.status(409).json({
      success: false,
      message: "Denied by this professor",
    });
  }

  if (group.majorAllocatedProf) {
    // console.log("You already have a faculty assigned");
    return res.status(409).json({
      success: false,
      message: "You already have a faculty assigned",
    });
  }

  if (group.majorAppliedProfs.includes(facultyId)) {
    // console.log("Already applied to this faculty");
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
    // console.log("Some group members have incomplete profiles");
    // console.log(incompleteProfiles);
    return res.status(400).json({
      success: false,
      message: `Some group members have incomplete profiles: ${incompleteProfiles
        .map((m) => `${m.memberName} is missing ${m.missingFields.join(", ")}`)
        .join("; ")}`,
    });
  }

  const faculty = await Professor.findById(facultyId);
  if (!faculty) {
    // console.log("faculty not found");
    return res.status(404).json({
      success: false,
      message: "Faculty not found",
    });
  }
  if (
    group.members.length >
    faculty.limits.major_project - faculty.currentCount.major_project
  ) {
    // console.log("Your group size exceeds faculty's remaining limit");
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
    .populate("org");
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
  // console.log(groupId, description, remark, absent);
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
  const group = await Major.findById(groupId).populate("discussion.absent");
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
  const group = await Major.findById(groupId).populate("discussion.absent");
  if (!group) throw new ApiError(404, "Group not found");
  return res
    .status(200)
    .json(
      new ApiResponse(200, group.discussion, "Discussion fetched successfully")
    );
});

const addMarks = asyncHandler(async (req, res) => {
  const { userId, marks } = req.body;
  // console.log(userId, marks);
  const user = await User.findById(userId).select(
    "fullName rollNumber marks MajorGroup"
  );
  if (!user) throw new ApiError(404, "User not found");
  // Check if user's group has projectTitle set
  if (!user.MajorGroup) {
    throw new ApiError(400, "User is not in a major project group");
  }
  const group = await Major.findById(user.MajorGroup).select("projectTitle");
  if (!group || !group.projectTitle || group.projectTitle.trim() === "") {
    return res.status(400).json({
      success: false,
      message:
        "Project title is not set for this group. Please ask the group to submit the project title before entering marks.",
    });
  }
  if (user.marks.majorProject > 0) {
    throw new ApiError(400, "Marks already added");
  }
  user.marks.majorProject = marks;
  await user.save();
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Marks added successfully"));
});

const withdrawFromFaculty = asyncHandler(async (req, res) => {
  const loggedIn = req?.user?._id;
  const { facultyId } = req.body;
  const userId = req?.user?._id;

  if (!facultyId) {
    return res.status(400).json({
      success: false,
      message: "Faculty ID is required",
    });
  }

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  const groupId = user.MajorGroup;
  const group = await Major.findById(groupId);
  if (!group) {
    return res.status(404).json({
      success: false,
      message: "Group not found",
    });
  }

  // Check if professor has already been allocated
  if (group.majorAllocatedProf) {
    return res.status(403).json({
      success: false,
      message:
        "Cannot withdraw - a professor has already been allocated to your group",
    });
  }

  if (!group.leader.equals(loggedIn)) {
    return res.status(403).json({
      success: false,
      message: "Only group leader can withdraw applications",
    });
  }

  // Check if the faculty is in the applied list
  const facultyIndex = group.majorAppliedProfs.findIndex(
    (profId) => profId.toString() === facultyId
  );

  if (facultyIndex === -1) {
    return res.status(404).json({
      success: false,
      message: "This professor is not in your applied list",
    });
  }

  // Store the old first preference professor ID
  const oldFirstProfId = group.majorAppliedProfs[0]?.toString();

  // Remove from applied professors
  group.majorAppliedProfs.splice(facultyIndex, 1);

  // If this was the first preference, remove group from that professor's appliedGroups
  if (facultyIndex === 0 && oldFirstProfId) {
    const oldFirstProf = await Professor.findById(oldFirstProfId);
    if (oldFirstProf) {
      oldFirstProf.appliedGroups.major_project.pull(group._id);
      await oldFirstProf.save();
    }
  }

  // If there's a new first preference after withdrawal, add to that professor's appliedGroups
  if (group.majorAppliedProfs.length > 0) {
    const newFirstProfId = group.majorAppliedProfs[0]?.toString();

    // Only add if the new first preference is different from the old one
    if (newFirstProfId && newFirstProfId !== oldFirstProfId) {
      const newFirstProf = await Professor.findById(newFirstProfId);
      if (newFirstProf) {
        // Check if group is not already in appliedGroups to avoid duplicates
        if (!newFirstProf.appliedGroups.major_project.includes(group._id)) {
          newFirstProf.appliedGroups.major_project.push(group._id);
          await newFirstProf.save();
        }
      }
    }
  }

  group.preferenceLastMovedAt = new Date();
  await group.save();

  return res
    .status(200)
    .json(new ApiResponse(200, group, "Application withdrawn successfully"));
});

const requestTypeChange = asyncHandler(async (req, res) => {
  const userId = req?.user?._id;
  const { requestedType, org } = req.body;

  if (!requestedType || !["industrial", "research"].includes(requestedType)) {
    return res.status(400).json({
      success: false,
      message: "Valid requested type is required (industrial or research)",
    });
  }

  if (requestedType === "industrial" && !org) {
    return res.status(400).json({
      success: false,
      message: "Organization is required for industrial type",
    });
  }

  const user = await User.findById(userId);
  if (!user || !user.MajorGroup) {
    return res.status(404).json({
      success: false,
      message: "User or group not found",
    });
  }

  const group = await Major.findById(user.MajorGroup).populate(
    "members leader"
  );
  if (!group) {
    return res.status(404).json({
      success: false,
      message: "Group not found",
    });
  }

  // Check if same type
  if (group.type === requestedType) {
    return res.status(400).json({
      success: false,
      message: "Group is already of this type",
    });
  }

  // Check for existing pending request from THIS USER (not entire group)
  // Compare ObjectIds as strings since typeChangeRequests.user is not populated here
  const existingRequestFromUser = group.typeChangeRequests.find(
    (req) =>
      req.user.toString() === userId.toString() && req.status === "pending"
  );

  if (existingRequestFromUser) {
    return res.status(409).json({
      success: false,
      message: "You already have a pending type change request",
    });
  }

  // Validate member count for requested type
  if (requestedType === "industrial" && group.members.length > 1) {
    // This will trigger a split if approved
    // For now, just add the request
  }

  // If no professor allocated yet, apply change immediately and handle split if needed
  if (!group.majorAllocatedProf) {
    // Industrial groups can only have 1 member
    if (requestedType === "industrial" && group.members.length === 2) {
      // Split logic: Create new industrial group for initiator, keep other in research
      const otherMember = group.members.find((m) => !m._id.equals(userId));

      // Create new industrial group for initiator
      const nanoid = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 6);
      const newGroupId = nanoid();

      const newGroup = await Major.create({
        groupId: newGroupId,
        type: "industrial",
        org,
        leader: userId,
        members: [userId],
      });

      // Update user's group reference
      user.MajorGroup = newGroup._id;
      await user.save();

      // Remove user from original group
      group.members = group.members.filter((m) => !m._id.equals(userId));

      // If user was the leader, make the other member the leader
      if (group.leader.equals(userId)) {
        group.leader = otherMember._id;
      }

      await group.save();

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            { originalGroup: group, newGroup },
            "Type changed and group split successfully"
          )
        );
    } else {
      // Simple type change - no split needed
      group.type = requestedType;
      if (requestedType === "industrial") {
        group.org = org;
      } else {
        group.org = undefined;
      }
      // Erase project title on type change
      group.projectTitle = "";
      await group.save();

      return res
        .status(200)
        .json(new ApiResponse(200, group, "Type changed successfully"));
    }
  }

  // Professor allocated - need approval
  group.typeChangeRequests.push({
    user: userId,
    requestedType,
    org: requestedType === "industrial" ? org : undefined,
    status: "pending",
  });

  await group.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        group,
        "Type change request submitted for professor approval"
      )
    );
});

const getTypeChangeStatus = asyncHandler(async (req, res) => {
  const userId = req?.user?._id;

  const user = await User.findById(userId);
  if (!user || !user.MajorGroup) {
    return res.status(404).json({
      success: false,
      message: "User or group not found",
    });
  }

  const group = await Major.findById(user.MajorGroup).populate(
    "members leader typeChangeRequests.user typeChangeRequests.org"
  );

  if (!group) {
    return res.status(404).json({
      success: false,
      message: "Group not found",
    });
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        group,
        typeChangeRequests: group.typeChangeRequests,
      },
      "Type change status fetched successfully"
    )
  );
});

const profApproveTypeChange = asyncHandler(async (req, res) => {
  const { groupId, action } = req.body; // action: "approve" or "reject"

  if (!groupId || !action || !["approve", "reject"].includes(action)) {
    return res.status(400).json({
      success: false,
      message: "Valid groupId and action (approve/reject) are required",
    });
  }

  const group = await Major.findById(groupId).populate(
    "members leader typeChangeRequests.user typeChangeRequests.org majorAllocatedProf"
  );

  if (!group) {
    return res.status(404).json({
      success: false,
      message: "Group not found",
    });
  }

  const pendingRequests = group.typeChangeRequests.filter(
    (req) => req.status === "pending"
  );

  if (pendingRequests.length === 0) {
    return res.status(404).json({
      success: false,
      message: "No pending type change requests for this group",
    });
  }

  if (action === "reject") {
    // Reject all pending requests
    group.typeChangeRequests.forEach((req) => {
      if (req.status === "pending") {
        req.status = "rejected";
      }
    });
    await group.save();

    return res
      .status(200)
      .json(new ApiResponse(200, group, "Type change requests rejected"));
  }

  // Approve action
  // Check how many members have pending requests

  // Case 1: Only one member requested change
  if (pendingRequests.length === 1) {
    const request = pendingRequests[0];
    const requestingUser = await User.findById(request.user._id);

    // If changing to industrial and group has 2 members, split
    if (request.requestedType === "industrial" && group.members.length === 2) {
      const otherMember = group.members.find(
        (m) => !m._id.equals(request.user._id)
      );

      // Create new industrial group for requesting user
      const nanoid = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 6);
      const newGroupId = nanoid();

      const newGroup = await Major.create({
        groupId: newGroupId,
        type: "industrial",
        org: request.org,
        leader: request.user._id,
        members: [request.user._id],
        majorAllocatedProf: group.majorAllocatedProf,
      });

      // Update requesting user's group reference
      requestingUser.MajorGroup = newGroup._id;
      await requestingUser.save();

      // Remove user from original group
      group.members = group.members.filter(
        (m) => !m._id.equals(request.user._id)
      );

      // If requesting user was the leader, make the other member the leader
      if (group.leader.equals(request.user._id)) {
        group.leader = otherMember._id;
      }

      // Mark request as approved before clearing
      request.status = "approved";
      await group.save();

      // Clear all typeChangeRequests from original group for UI update
      group.typeChangeRequests = [];
      await group.save();

      // Update professor's students list
      if (group.majorAllocatedProf) {
        const professor = await Professor.findById(group.majorAllocatedProf);
        if (professor) {
          // Add new group to professor's list if not already there
          if (!professor.students.major_project.includes(newGroup._id)) {
            professor.students.major_project.push(newGroup._id);
          }
          await professor.save();
        }
      }

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            { originalGroup: group, newGroup },
            "Type change approved and group split successfully"
          )
        );
    } else {
      // Simple type change - no split
      group.type = request.requestedType;
      if (request.requestedType === "industrial") {
        group.org = request.org;
      } else {
        group.org = undefined;
      }
      // Erase project title on type change
      group.projectTitle = "";
      // Mark request as approved first
      request.status = "approved";
      await group.save();

      // Clear all typeChangeRequests for UI update
      group.typeChangeRequests = [];
      await group.save();

      return res
        .status(200)
        .json(new ApiResponse(200, group, "Type change approved successfully"));
    }
  }

  // Case 2: Both members requested change
  if (pendingRequests.length === 2 && group.members.length === 2) {
    const request1 = pendingRequests[0];
    const request2 = pendingRequests[1];

    // Both requested industrial - create two separate industrial groups
    if (
      request1.requestedType === "industrial" &&
      request2.requestedType === "industrial"
    ) {
      const nanoid = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 6);

      // Create first industrial group
      const newGroup1 = await Major.create({
        groupId: nanoid(),
        type: "industrial",
        org: request1.org,
        leader: request1.user._id,
        members: [request1.user._id],
        majorAllocatedProf: group.majorAllocatedProf,
      });

      // Create second industrial group
      const newGroup2 = await Major.create({
        groupId: nanoid(),
        type: "industrial",
        org: request2.org,
        leader: request2.user._id,
        members: [request2.user._id],
        majorAllocatedProf: group.majorAllocatedProf,
      });

      // Update both users' group references
      const user1 = await User.findById(request1.user._id);
      const user2 = await User.findById(request2.user._id);
      user1.MajorGroup = newGroup1._id;
      user2.MajorGroup = newGroup2._id;
      await user1.save();
      await user2.save();

      // Update professor's students list
      if (group.majorAllocatedProf) {
        const professor = await Professor.findById(group.majorAllocatedProf);
        if (professor) {
          // Remove original group and add both new groups
          professor.students.major_project.pull(group._id);
          professor.students.major_project.push(newGroup1._id);
          professor.students.major_project.push(newGroup2._id);
          await professor.save();
        }
      }

      // Delete original group
      await Major.findByIdAndDelete(group._id);

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            { newGroup1, newGroup2 },
            "Both type changes approved and groups split successfully"
          )
        );
    }

    // Both requested research - just change the original group type
    if (
      request1.requestedType === "research" &&
      request2.requestedType === "research"
    ) {
      group.type = "research";
      group.org = undefined;
      // Erase project title on type change
      group.projectTitle = "";
      // Mark both requests as approved first
      request1.status = "approved";
      request2.status = "approved";
      await group.save();

      // Clear all typeChangeRequests for UI update
      group.typeChangeRequests = [];
      await group.save();

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            group,
            "Both type changes approved - group converted to research"
          )
        );
    }

    // Mixed requests (one industrial, one research) - handle as two separate splits
    const industrialRequest =
      request1.requestedType === "industrial" ? request1 : request2;
    const researchRequest =
      request1.requestedType === "research" ? request1 : request2;

    const nanoid = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 6);

    // Create industrial group for the industrial requester
    const newIndustrialGroup = await Major.create({
      groupId: nanoid(),
      type: "industrial",
      org: industrialRequest.org,
      leader: industrialRequest.user._id,
      members: [industrialRequest.user._id],
      majorAllocatedProf: group.majorAllocatedProf,
    });

    // Keep original group as research for the research requester
    group.type = "research";
    group.org = undefined;
    group.members = [researchRequest.user._id];
    group.leader = researchRequest.user._id;
    // Mark both requests as approved first
    industrialRequest.status = "approved";
    researchRequest.status = "approved";
    await group.save();

    // Clear all typeChangeRequests for UI update
    group.typeChangeRequests = [];
    await group.save();

    // Update industrial requester's group reference
    const industrialUser = await User.findById(industrialRequest.user._id);
    industrialUser.MajorGroup = newIndustrialGroup._id;
    await industrialUser.save();

    // Update professor's students list
    if (group.majorAllocatedProf) {
      const professor = await Professor.findById(group.majorAllocatedProf);
      if (professor) {
        if (
          !professor.students.major_project.includes(newIndustrialGroup._id)
        ) {
          professor.students.major_project.push(newIndustrialGroup._id);
        }
        await professor.save();
      }
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { researchGroup: group, industrialGroup: newIndustrialGroup },
          "Type changes approved with split"
        )
      );
  }

  return res.status(400).json({
    success: false,
    message: "Invalid request state",
  });
});

export {
  addMarks,
  createGroup,
  getDiscussionByStudent,
  addMember,
  removeMember,
  applyToFaculty,
  withdrawFromFaculty,
  requestTypeChange,
  getTypeChangeStatus,
  profApproveTypeChange,
  getGroup,
  getDiscussion,
  getAppliedProfs,
  majorSorted,
  acceptReq,
  getReq,
  addDiscussion,
  addRemarkAbsent,
  setProjectTitle,
};
