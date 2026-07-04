import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { Group } from "../models/group.model.js";
import { customAlphabet, nanoid } from "nanoid";
import { Professor } from "../models/professor.model.js";
import { Company } from "../models/company.model.js";
import { Internship } from "../models/internship.model.js";

const createGroup = asyncHandler(async (req, res) => {
  const leader = req?.user?._id;
  const { typeofSummer, org, location } = req.body;
  console.log(typeofSummer, org, location);
  const nanoid = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 6);
  const members = [leader];
  const user = await User.findById(leader);
  if (user.group) {
    console.log("already in a group");
    throw new ApiError(409, "Already in a group");
  }
  if (!typeofSummer) {
    console.log("type of summer internship is required");
    throw new ApiError(400, "Type of summer internship is required");
  }
  if (typeofSummer === "industrial" && !org) {
    console.log("organisation name is required");
    throw new ApiError(
      400,
      "Organisation Name is required for industrial summer internship"
    );
  }
  if (!location || (location !== "inside_bit" && location !== "outside_bit")) {
    throw new ApiError(400, "Valid location (inside_bit or outside_bit) is required");
  }
  let newGroup;
  if (org) {
    const company = await Company.findById(org);
    if (!company) {
      console.log("company not found");
      throw new ApiError(404, "Company not found");
    }
    newGroup = await Group.create({
      groupId: nanoid(),
      leader,
      members,
      type: "summer",
      typeOfSummer: typeofSummer,
      org,
      location,
    });
    user.group = newGroup._id;
    await user.save();
  } else {
    newGroup = await Group.create({
      groupId: nanoid(),
      leader,
      members,
      type: "summer",
      typeOfSummer: typeofSummer,
      location,
    });
    user.group = newGroup._id;
    await user.save();
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
  if (!group) {
    console.log("group not found");
    throw new ApiError(404, "Group not found");
  }
  if (group.typeOfSummer === "industrial") {
    console.log("Cannot add member to industrial group");
    throw new ApiError(409, "Cannot add member to industrial group");
  }
  if (group.typeOfSummer === "research" && group.location === "outside_bit") {
    console.log("Cannot add member to outside_bit research group");
    throw new ApiError(409, "Outside BIT research groups can only have 1 member");
  }

  if (!group.leader.equals(loggedIn)) {
    console.log("Only Leader can add member");
    throw new ApiError(409, "Only Leader can add");
  }
  if (group.summerAllocatedProf) {
    console.log("Cannot add member after faculty allocation");
    throw new ApiError(409, "Cannot add member after faculty allocation");
  }
  const user = await User.findOne({ rollNumber });
  if (user.group) {
    console.log("Already in a group");
    throw new ApiError(409, "Already in a group");
  }
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
  const user = await User.findById({ _id: userId });
  const group = await Group.findById({ _id: groupId });
  if (!group) {
    console.log("group not found");
    throw new ApiError(404, "Group not found");
  }
  if (group.typeOfSummer === "industrial") {
     throw new ApiError(409, "Cannot join industrial group");
  }
  if (group.typeOfSummer === "research" && group.location === "outside_bit") {
     throw new ApiError(409, "Outside BIT research groups can only have 1 member");
  }
  if (!group) {
    console.log("group not found");
    throw new ApiError(404, "Group not found");
  }
  if (group.summerAllocatedProf) {
    console.log("Cannot join as group has a faculty assigned.");
    throw new ApiError(409, "Cannot join as group has a faculty assigned.");
  }
  if (user.group) {
    console.log("You are already in a group");
    throw new ApiError(409, "You are already in a group");
  }
  group.members.push(user?._id);
  user.group = group._id;
  user.groupReq = [];

  if (group.summerAppliedProfs && group.summerAppliedProfs.length > 0) {
    let internshipData = {
      student: user._id,
      type: group.typeOfSummer,
      location: group.location || "inside_bit",
    };
    await Internship.create(internshipData);
  }

  await user.save();
  await group.save({ validateBeforeSave: false });
  return res.status(200).json(new ApiResponse(200, "Joined successfully"));
});

const getReq = asyncHandler(async (req, res) => {
  const userId = req?.user?._id;
  const user = await User.findById(userId).populate({
    path: "groupReq",
    populate: {
      path: "leader",
    },
  });
  return res
    .status(200)
    .json(new ApiResponse(200, user?.groupReq, "All requests fetched"));
});
const removeMember = asyncHandler(async (req, res) => {
  const loggedIn = req?.user?._id;
  const { rollNumber, groupId } = req.body;
  const group = await Group.findById({ _id: groupId });
  if (!group) {
    console.log("group not found");
    throw new ApiError(404, "Group not found");
  }
  if (!group.leader.equals(loggedIn)) {
    console.log("Only Leader can remove member");
    throw new ApiError(409, "Only Leader can remove");
  }
  if (group.summerAllocatedProf) {
    console.log("Cannot remove member after faculty allocation");
    throw new ApiError(409, "Cannot remove member after faculty allocation");
  }
  const user = await User.findOne({ rollNumber });
  if (!user.group) {
    console.log("Not in a group");
    throw new ApiError(409, "Not in a group");
  }
  group.members.pull(user?._id);
  user.group = null;
  await group.save({ validateBeforeSave: false });

  if (!group.summerAllocatedProf) {
    await Internship.deleteOne({ student: user._id, mentor: { $exists: false } });
  }

  if (group?.leader.equals(user?._id)) {
    if (group.members.length > 0) {
      group.leader = group.members[0];
      await group.save({ validateBeforeSave: false });
    } else {
      // Clean up professors' queues to prevent ghost applications
      if (group.summerAppliedProfs && group.summerAppliedProfs.length > 0) {
        for (const profId of group.summerAppliedProfs) {
          const prof = await Professor.findById(profId);
          if (prof) {
            prof.appliedGroups.summer_training.pull(group._id);
            await prof.save();
          }
        }
      }
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
  console.log("Applying to faculty", facultyId);
  const user = await User.findById(userId);
  if (!user) {
    console.log("user not found");
    throw new ApiError(404, "User not found");
  }

  if (user.summerAppliedProfs.includes(facultyId)) {
    console.log("Already applied to this professor");
    throw new ApiError(409, "Already applied to this professor");
  }

  const groupId = user.group;
  const group = await Group.findById(groupId).populate("members");
  if (!group) {
    console.log("group not found");
    throw new ApiError(404, "Group not found");
  }

  if (!group.leader.equals(loggedIn)) {
    console.log("Only Leader can apply to faculty");
    throw new ApiError(409, "Only Leader can apply to faculty");
  }

  if (group.deniedProf.includes(facultyId)) {
    console.log("Denied by this professor");
    throw new ApiError(409, "Denied by this professor");
  }

  if (group.summerAllocatedProf) {
    console.log("You already have a faculty assigned");
    throw new ApiError(409, "You already have a faculty assigned");
  }

  if (group.summerAppliedProfs.includes(facultyId)) {
    console.log("Already applied to this faculty");
    throw new ApiError(409, "Already applied to this faculty");
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

  // if (incompleteProfiles.length > 0) {
  //   console.log(incompleteProfiles);
  //   throw new ApiError(400, "Some group members have incomplete profiles", {
  //     incompleteProfiles,
  //   });
  // }

  const faculty = await Professor.findById(facultyId);
  if (!faculty) {
    console.log("faculty not found");
    throw new ApiError(404, "Faculty not found");
  }
  if (
    group.members.length >
    faculty.limits.summer_training - faculty.currentCount.summer_training
  ) {
    console.log("Your group size exceeds faculty's remaining limit");
  }

  group.summerAppliedProfs.push(facultyId);

  if (group.summerAppliedProfs.length === 1) {
    group.preferenceLastMovedAt = Date.now();
    faculty.appliedGroups.summer_training.push(group._id);
    await faculty.save();

    // Create pending internship records for all members
    let internships;
    if (group.typeOfSummer === "research") {
      internships = group.members.map((studentId) => ({
        student: studentId,
        type: group.typeOfSummer,
        location: group.location || "inside_bit",
      }));
    } else {
      internships = group.members.map((studentId) => ({
        student: studentId,
        type: group.typeOfSummer,
        location: group.location || "outside_bit",
        company: group.org,
      }));
    }
    await Internship.insertMany(internships);
  }

  await group.save({ validateBeforeSave: false });

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
    .populate("org");
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
  await group.save({ validateBeforeSave: false });
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
    date: new Date(),
  });

  await group.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(
      new ApiResponse(200, { groupId: group._id }, "Remark added successfully")
    );
});

const getDiscussion = asyncHandler(async (req, res) => {
  const { groupId } = req.body;
  const group = await Group.findById({ _id: groupId }).populate(
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
  if (!user.group) throw new ApiError(404, "Group not found");
  const groupId = user.group;
  const group = await Group.findById({ _id: groupId }).populate(
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
  const user = await User.findById(userId).select("fullName rollNumber group");
  if (!user) throw new ApiError(404, "User not found");
  user.marks.summerTraining = marks;
  await user.save();
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Marks added successfully"));
});

const leaveGroup = asyncHandler(async (req, res) => {
  const userId = req?.user?._id;
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");
  if (!user.group) throw new ApiError(409, "Not in any group");

  const group = await Group.findById(user.group);
  if (!group) {
    user.group = null;
    user.summerAllocatedProf = null;
    user.isSummerAllocated = false;
    user.summerAppliedProfs = [];
    await user.save();
    throw new ApiError(404, "Group not found, cleared user reference");
  }

  const allocatedProfId = group.summerAllocatedProf;
  const wasLeader = group.leader?.equals(user._id);

  group.members.pull(user._id);

  const internshipFilter = { student: user._id };
  if (allocatedProfId) internshipFilter.mentor = allocatedProfId;
  else internshipFilter.mentor = { $exists: false };
  await Internship.deleteMany(internshipFilter);

  user.group = null;
  user.summerAllocatedProf = null;
  user.isSummerAllocated = false;
  user.summerAppliedProfs = [];

  if (group.members.length === 0) {
    if (group.summerAppliedProfs && group.summerAppliedProfs.length > 0) {
      for (const profId of group.summerAppliedProfs) {
        const prof = await Professor.findById(profId);
        if (prof) {
          prof.appliedGroups.summer_training.pull(group._id);
          await prof.save();
        }
      }
    }
    if (allocatedProfId) {
      const prof = await Professor.findById(allocatedProfId);
      if (prof) {
        prof.students.summer_training.pull(group._id);
        prof.currentCount.summer_training = Math.max(
          0,
          prof.currentCount.summer_training - 1
        );
        await prof.save();
      }
    }
    await group.deleteOne();
  } else {
    if (wasLeader) group.leader = group.members[0];
    if (allocatedProfId) {
      const prof = await Professor.findById(allocatedProfId);
      if (prof) {
        prof.currentCount.summer_training = Math.max(
          0,
          prof.currentCount.summer_training - 1
        );
        await prof.save();
      }
    }
    await group.save({ validateBeforeSave: false });
  }

  await user.save();
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Left group successfully"));
});

const joinGroupByCode = asyncHandler(async (req, res) => {
  const userId = req?.user?._id;
  const { groupId } = req.body;
  if (!groupId) throw new ApiError(400, "Group code is required");

  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");
  if (user.group) {
    throw new ApiError(
      409,
      "Already in a group. Leave your current group first."
    );
  }

  const group = await Group.findOne({ groupId: groupId.toUpperCase() });
  if (!group) throw new ApiError(404, "Group not found for that code");

  if (group.typeOfSummer === "industrial") {
    throw new ApiError(409, "Cannot join an industrial group");
  }
  if (
    group.typeOfSummer === "research" &&
    group.location === "outside_bit" &&
    group.members.length >= 1
  ) {
    throw new ApiError(409, "Outside BIT research groups can only have 1 member");
  }

  group.members.push(user._id);
  user.group = group._id;
  user.groupReq = [];

  const allocatedProfId = group.summerAllocatedProf;
  if (allocatedProfId) {
    user.summerAllocatedProf = allocatedProfId;
    user.isSummerAllocated = true;
    const prof = await Professor.findById(allocatedProfId);
    if (prof) {
      prof.currentCount.summer_training += 1;
      await prof.save();
    }
  }

  const internshipDoc = {
    student: user._id,
    type: group.typeOfSummer,
    location:
      group.location ||
      (group.typeOfSummer === "research" ? "inside_bit" : "outside_bit"),
  };
  if (group.typeOfSummer === "industrial") internshipDoc.company = group.org;
  if (allocatedProfId) internshipDoc.mentor = allocatedProfId;

  const shouldCreateInternship =
    allocatedProfId ||
    (group.summerAppliedProfs && group.summerAppliedProfs.length > 0);
  if (shouldCreateInternship) await Internship.create(internshipDoc);

  await user.save();
  await group.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, group, "Joined group successfully"));
});

const requestSummerTypeChange = asyncHandler(async (req, res) => {
  const userId = req?.user?._id;
  const { requestedType, location, org, newLeader } = req.body;

  if (!requestedType || !["industrial", "research"].includes(requestedType)) {
    throw new ApiError(400, "Valid internship type is required (industrial or research)");
  }

  const user = await User.findById(userId);
  if (!user || !user.group) throw new ApiError(409, "Not in any group");

  const group = await Group.findById(user.group).populate("members leader");
  if (!group) throw new ApiError(404, "Group not found");

  if (!group.summerAllocatedProf) {
    throw new ApiError(400, "Cannot change type without an allocated faculty mentor");
  }

  // Check for existing pending request by this specific user
  const existingPending = group.typeChangeRequests.find(
    (req) => req.status === "pending" && req.initiatedBy.toString() === userId.toString()
  );
  if (existingPending) {
    throw new ApiError(409, "You already have a pending type change request");
  }

  const currentType = group.typeOfSummer;
  let validatedOrg;
  let newLeaderId;

  if (requestedType === "research") {
    if (currentType === "research") {
      throw new ApiError(400, "Group is already in research");
    }
    if (!location || !["inside_bit", "outside_bit"].includes(location)) {
      throw new ApiError(400, "Valid location is required for research type");
    }
  } else if (requestedType === "industrial") {
    if (!org) {
      throw new ApiError(400, "Company is required for industrial type");
    }
    if (currentType === "industrial" && group.org?.toString() === org) {
      throw new ApiError(400, "You are already assigned to this company");
    }

    const hasCompany = user.companyInterview.some((c) => c.toString() === org);
    if (!hasCompany) {
      throw new ApiError(400, "This company is not assigned to you");
    }

    validatedOrg = org;

    // If the initiator is the leader and there are other members in the group
    if (group.leader._id.equals(userId) && group.members.length > 1) {
      if (!newLeader) {
        throw new ApiError(400, "New leader must be selected since you are the current leader");
      }
      if (newLeader.toString() === userId.toString()) {
        throw new ApiError(400, "You cannot appoint yourself as the new leader");
      }
      const isMember = group.members.some((m) => m._id.toString() === newLeader.toString());
      if (!isMember) {
        throw new ApiError(400, "New leader must be a current member of the group");
      }
      newLeaderId = newLeader;
    }
  }

  group.typeChangeRequests.push({
    initiatedBy: userId,
    requestedType,
    location: requestedType === "research" ? location : "outside_bit",
    org: validatedOrg,
    newLeader: newLeaderId,
    status: "pending",
  });

  await group.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, group, "Type change request submitted for faculty approval"));
});

const getSummerTypeChangeStatus = asyncHandler(async (req, res) => {
  const userId = req?.user?._id;

  const user = await User.findById(userId);
  if (!user || !user.group) {
    throw new ApiError(404, "User or group not found");
  }

  const group = await Group.findById(user.group).populate(
    "members leader typeChangeRequests.initiatedBy typeChangeRequests.memberAssignments.user typeChangeRequests.memberAssignments.org"
  );

  if (!group) {
    throw new ApiError(404, "Group not found");
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

const getMemberCompanies = asyncHandler(async (req, res) => {
  const userId = req?.user?._id;

  const user = await User.findById(userId);
  if (!user || !user.group) {
    throw new ApiError(404, "User or group not found");
  }

  const group = await Group.findById(user.group).populate("members leader");
  if (!group) {
    throw new ApiError(404, "Group not found");
  }

  // Any member can fetch member companies (used for R→I type change)
  const memberCompanies = [];
  for (const member of group.members) {
    const memberUser = await User.findById(member._id).populate("companyInterview");
    memberCompanies.push({
      _id: member._id.toString(),
      fullName: member.fullName,
      rollNumber: member.rollNumber,
      email: member.email,
      companies: memberUser?.companyInterview || [],
    });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, memberCompanies, "Member companies fetched successfully"));
});

const profApproveSummerTypeChange = asyncHandler(async (req, res) => {
  const { groupId, requestId, action } = req.body;

  if (!groupId || !requestId || !action || !["approve", "reject"].includes(action)) {
    throw new ApiError(400, "Valid groupId, requestId, and action (approve/reject) are required");
  }

  const group = await Group.findById(groupId).populate(
    "members leader summerAllocatedProf typeChangeRequests.initiatedBy typeChangeRequests.org"
  );

  if (!group) {
    throw new ApiError(404, "Group not found");
  }

  const request = group.typeChangeRequests.id(requestId);
  
  if (!request) {
    throw new ApiError(404, "Type change request not found");
  }

  if (request.status !== "pending") {
    throw new ApiError(400, "Request is already processed");
  }

  if (action === "reject") {
    request.status = "rejected";
    await group.save({ validateBeforeSave: false });

    return res
      .status(200)
      .json(new ApiResponse(200, group, "Type change request rejected"));
  }

  // Approve action
  const memberId = request.initiatedBy._id || request.initiatedBy;

  if (request.requestedType === "research") {
    // Industrial → Research: simple conversion (since industrial groups are 1 member)
    group.typeOfSummer = "research";
    group.location = request.location;
    group.org = undefined;

    await Internship.findOneAndUpdate(
      { student: memberId, type: "industrial" },
      {
        $set: {
          type: "research",
          location: request.location,
          mentor: group.summerAllocatedProf?._id,
        },
        $unset: { company: "" }
      },
      { new: true }
    );

    request.status = "approved";
    
    // Clear all pending requests (since group type changed)
    group.typeChangeRequests = group.typeChangeRequests.filter(r => r.status !== "pending");
    
    await group.save({ validateBeforeSave: false });

    const updatedGroup = await Group.findById(group._id)
      .populate("members leader summerAllocatedProf org");

    return res
      .status(200)
      .json(new ApiResponse(200, updatedGroup, "Type change approved — group converted to research"));
  }

  // Research → Industrial: complex split for an individual
  if (request.requestedType === "industrial") {
    // Check if the member is actually still in the group (they might have left via another way)
    const isMemberStillInGroup = group.members.some(m => (m._id || m).toString() === memberId.toString());
    
    if (!isMemberStillInGroup) {
      request.status = "rejected";
      await group.save({ validateBeforeSave: false });
      throw new ApiError(400, "User is no longer in this group, request automatically rejected");
    }

    const nanoid = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 6);
    const newGroupId = nanoid();

    const newGroup = await Group.create({
      groupId: newGroupId,
      type: "summer",
      typeOfSummer: "industrial",
      org: request.org._id || request.org,
      location: "outside_bit",
      leader: memberId,
      members: [memberId],
      summerAllocatedProf: group.summerAllocatedProf?._id,
    });

    // Update user's group reference
    const memberUser = await User.findById(memberId);
    memberUser.group = newGroup._id;
    await memberUser.save({ validateBeforeSave: false });

    // Update old research internship to industrial
    await Internship.findOneAndUpdate(
      { student: memberId, type: "research" },
      {
        $set: {
          type: "industrial",
          location: "outside_bit",
          company: request.org._id || request.org,
          mentor: group.summerAllocatedProf?._id,
        }
      },
      { new: true }
    );

    // Remove member from original group
    group.members = group.members.filter(
      (m) => !(m._id || m).equals(memberId)
    );

    // Update professor's students list
    if (group.summerAllocatedProf) {
      const professor = await Professor.findById(group.summerAllocatedProf._id || group.summerAllocatedProf);
      if (professor) {
        if (!professor.students.summer_training.includes(newGroup._id)) {
          professor.students.summer_training.push(newGroup._id);
        }

        if (group.members.length === 0) {
          // All members left — remove original group from professor
          professor.students.summer_training = professor.students.summer_training.filter(
            (g) => !g.equals(group._id)
          );
        }

        await professor.save({ validateBeforeSave: false });
      }
    }

    if (group.members.length === 0) {
      // All members moved to industrial — delete original group
      await Group.findByIdAndDelete(group._id);

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            { deletedOriginalGroup: true, newGroup },
            "Type change approved — member moved to industrial, original group deleted"
          )
        );
    }

    // Some members stay in research — update the original group
    // If the leader left, promote the newly chosen leader
    const remainingMemberIds = group.members.map((m) => (m._id || m).toString());
    const leaderLeft = !remainingMemberIds.includes((group.leader._id || group.leader).toString());

    if (leaderLeft) {
      const suggestedNewLeaderStr = request.newLeader?.toString();
      if (suggestedNewLeaderStr && remainingMemberIds.includes(suggestedNewLeaderStr)) {
        group.leader = request.newLeader;
      } else {
        group.leader = group.members[0]._id || group.members[0];
      }
    }

    request.status = "approved";
    // Filter out requests for the user who just left
    group.typeChangeRequests = group.typeChangeRequests.filter(r => r.initiatedBy.toString() !== memberId.toString());
    
    await group.save({ validateBeforeSave: false });

    const updatedGroup = await Group.findById(group._id)
      .populate("members leader summerAllocatedProf org");

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { originalGroup: updatedGroup, newGroup },
          "Type change approved — group split successfully"
        )
      );
  }

  throw new ApiError(400, "Invalid request state");
});

const getSummerPendingTypeChanges = asyncHandler(async (req, res) => {
  const professorId = req?.professor?._id;

  if (!professorId) {
    throw new ApiError(401, "Professor not authenticated");
  }

  const groupsWithRequests = await Group.find({
    summerAllocatedProf: professorId,
    "typeChangeRequests.status": "pending",
  })
    .populate(
      "members leader summerAllocatedProf org typeChangeRequests.initiatedBy typeChangeRequests.org"
    )
    .lean();

  const groupsWithPendingRequests = groupsWithRequests
    .map((group) => ({
      ...group,
      typeChangeRequests: group.typeChangeRequests.filter(
        (req) => req.status === "pending"
      ),
    }))
    .filter((group) => group.typeChangeRequests.length > 0);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        groupsWithPendingRequests,
        "Pending summer type change requests fetched successfully"
      )
    );
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
  summerSorted,
  acceptReq,
  getReq,
  addDiscussion,
  addRemarkAbsent,
  leaveGroup,
  joinGroupByCode,
  requestSummerTypeChange,
  getSummerTypeChangeStatus,
  getMemberCompanies,
  profApproveSummerTypeChange,
  getSummerPendingTypeChanges,
};
