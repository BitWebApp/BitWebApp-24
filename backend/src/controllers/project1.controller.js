import { Project1 } from "../models/project1.model.js";
import { User } from "../models/user.model.js";
import { Professor } from "../models/professor.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";

/**
 * Returns the academic year of the student (1 = first year, 2 = second year, etc.)
 */
const getStudentYear = (batch) => {
  const currentYear = new Date().getFullYear();
  return currentYear - batch + 1;
};

// ===================== Student-facing =====================

const createProject1 = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");

  const year = getStudentYear(user.batch);
  if (year !== 2) {
    throw new ApiError(403, "Only 2nd year students can create a Project 1");
  }

  const existing = await Project1.findOne({ student: userId });
  if (existing) {
    throw new ApiError(409, "You already have a Project 1 record");
  }

  const project1 = await Project1.create({ student: userId });
  user.project1 = project1._id;
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, project1, "Project 1 created successfully"));
});

const applyToFaculty = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { facultyId } = req.body;

  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");

  const year = getStudentYear(user.batch);
  if (year !== 2) {
    throw new ApiError(403, "Only 2nd year students can apply for Project 1");
  }

  const project1 = await Project1.findOne({ student: userId });
  if (!project1) {
    throw new ApiError(404, "Create a Project 1 record first");
  }

  if (project1.allocatedProf) {
    throw new ApiError(409, "You already have an allocated professor");
  }

  if (project1.appliedProfs.some((id) => id.toString() === facultyId)) {
    throw new ApiError(409, "Already applied to this professor");
  }

  if (project1.deniedProf.some((id) => id.toString() === facultyId)) {
    throw new ApiError(409, "Denied by this professor");
  }

  const faculty = await Professor.findById(facultyId);
  if (!faculty) throw new ApiError(404, "Faculty not found");

  // Profile completeness check
  const missingFields = [];
  if (!user.branch) missingFields.push("branch");
  if (!user.section) missingFields.push("section");
  if (!user.email) missingFields.push("email");
  if (!user.mobileNumber || user.mobileNumber === "0000000000")
    missingFields.push("mobileNumber");
  if (!user.semester) missingFields.push("semester");
  if (!user.cgpa) missingFields.push("cgpa");
  if (!user.abcId) missingFields.push("abcId");
  if (!user.linkedin) missingFields.push("linkedin");
  if (!user.codingProfiles.github) missingFields.push("github profile");
  if (!user.resume) missingFields.push("resume");
  if (!user.image) missingFields.push("profile picture");
  if (!user.alternateEmail) missingFields.push("alternate email");
  if (!user.fatherName) missingFields.push("father's name");
  if (!user.fatherMobileNumber) missingFields.push("father's mobile number");
  if (!user.motherName) missingFields.push("mother's name");
  if (!user.residentialAddress) missingFields.push("address");

  const hasCodingProfile =
    user.codingProfiles.leetcode ||
    user.codingProfiles.codeforces ||
    user.codingProfiles.codechef ||
    user.codingProfiles.atcoder;
  if (!hasCodingProfile) {
    missingFields.push(
      "at least one coding profile (leetcode/codeforces/codechef/atcoder)"
    );
  }

  if (missingFields.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Incomplete profile: missing ${missingFields.join(", ")}`,
    });
  }

  project1.appliedProfs.push(facultyId);
  await project1.save();

  // Add to first applied prof's queue immediately
  if (project1.appliedProfs.length === 1) {
    faculty.appliedGroups.project1.push(project1._id);
    await faculty.save();
    project1.preferenceLastMovedAt = new Date();
    await project1.save();
  }

  return res
    .status(200)
    .json(new ApiResponse(200, project1, "Applied to faculty successfully"));
});

const withdrawPreferences = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const project1 = await Project1.findOne({ student: userId });
  if (!project1) {
    throw new ApiError(404, "No Project 1 record found");
  }

  if (project1.allocatedProf) {
    throw new ApiError(409, "Cannot withdraw after allocation");
  }

  if (project1.appliedProfs.length > 0) {
    const currentProfId = project1.appliedProfs[0];
    const prof = await Professor.findById(currentProfId);
    if (prof) {
      prof.appliedGroups.project1 = prof.appliedGroups.project1.filter(
        (grpId) => grpId.toString() !== project1._id.toString()
      );
      await prof.save();
    }
  }

  project1.appliedProfs = [];
  project1.deniedProf = [];
  project1.preferenceLastMovedAt = null;
  await project1.save();

  return res
    .status(200)
    .json(new ApiResponse(200, project1, "All preferences withdrawn successfully"));
});

const getProject1 = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const project1 = await Project1.findOne({ student: userId })
    .populate("appliedProfs")
    .populate("allocatedProf")
    .populate("deniedProf")
    .populate("discussion.absent");

  if (!project1) {
    throw new ApiError(404, "No Project 1 record found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, project1, "Project 1 details returned"));
});

const getAppliedProfs = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const project1 = await Project1.findOne({ student: userId });
  if (!project1) throw new ApiError(404, "No Project 1 record found");

  let prof = null;
  if (project1.allocatedProf) {
    prof = await Professor.findById(project1.allocatedProf);
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        appliedProfs: project1.appliedProfs,
        isAllocated: !!project1.allocatedProf,
        denied: project1.deniedProf,
        prof,
      },
      "Applied profs and allocation details returned"
    )
  );
});

const getDiscussionByStudent = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const project1 = await Project1.findOne({ student: userId }).populate(
    "discussion.absent"
  );
  if (!project1) throw new ApiError(404, "Project 1 record not found");
  return res
    .status(200)
    .json(
      new ApiResponse(200, project1.discussion, "Discussion fetched successfully")
    );
});

// ===================== Professor-facing =====================

const getProject1AppliedStudents = asyncHandler(async (req, res) => {
  const profId = req.professor._id;

  const professor = await Professor.findById(profId).populate({
    path: "appliedGroups.project1",
    populate: {
      path: "student",
      select:
        "fullName rollNumber email linkedin codingProfiles cgpa section branch image",
    },
  });

  if (!professor) throw new ApiError(404, "Professor not found");

  const records = professor.appliedGroups.project1 || [];

  return res
    .status(200)
    .json(
      new ApiResponse(200, records, "Applied students retrieved successfully")
    );
});

const acceptProject1Student = asyncHandler(async (req, res) => {
  const { _id } = req.body; // Project1 record id
  const profId = req.professor._id;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const prof = await Professor.findById(profId).session(session);
    if (!prof) throw new ApiError(404, "Professor not found");

    const project1 = await Project1.findById(_id).session(session);
    if (!project1) throw new ApiError(404, "Project 1 record not found");

    if (project1.allocatedProf) {
      throw new ApiError(409, "Student already has an allocated professor");
    }

    if (
      prof.currentCount.project1 + 1 >
      prof.limits.project1
    ) {
      throw new ApiError(
        409,
        "Limit will exceed, you cannot accept above the limit."
      );
    }

    project1.allocatedProf = profId;
    project1.appliedProfs = [];
    await project1.save({ session });

    prof.currentCount.project1 += 1;
    prof.appliedGroups.project1.pull(project1._id);
    prof.students.project1.push(project1._id);
    await prof.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res
      .status(200)
      .json(new ApiResponse(200, "Student accepted for Project 1"));
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw new ApiError(
      500,
      error.message || "Something went wrong while accepting student"
    );
  }
});

const denyProject1Student = asyncHandler(async (req, res) => {
  const { _id } = req.body; // Project1 record id
  const profId = req.professor._id;

  const project1 = await Project1.findById(_id);
  if (!project1) throw new ApiError(404, "Project 1 record not found");

  const prof = await Professor.findById(profId);
  if (!prof) throw new ApiError(404, "Professor not found");

  // Remove this prof from applied list
  project1.appliedProfs.pull(profId);
  prof.appliedGroups.project1.pull(_id);
  project1.deniedProf.push(profId);

  await project1.save();
  await prof.save();

  // Move to next professor in preference if any
  if (project1.appliedProfs.length > 0) {
    const nextProfId = project1.appliedProfs[0];
    const nextProf = await Professor.findById(nextProfId);
    if (nextProf) {
      nextProf.appliedGroups.project1.push(project1._id);
      await nextProf.save();
    }
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Student denied and passed to next faculty in preference"
      )
    );
});

const getProject1AcceptedStudents = asyncHandler(async (req, res) => {
  const profId = req.professor._id;

  const professor = await Professor.findById(profId);
  if (!professor) throw new ApiError(404, "Professor not found");

  const project1Ids = professor.students.project1;
  const records = await Project1.find({ _id: { $in: project1Ids } })
    .populate("student")
    .populate("discussion.absent");

  return res
    .status(200)
    .json(
      new ApiResponse(200, records, "Accepted students retrieved successfully")
    );
});

const addProject1Remark = asyncHandler(async (req, res) => {
  const { _id, description, remark, absent } = req.body;

  if (!_id || !description) {
    throw new ApiError(400, "Project 1 ID and description are required.");
  }

  const project1 = await Project1.findById(_id);
  if (!project1) throw new ApiError(404, "Project 1 record not found");

  const profId = req.professor._id;
  if (!project1.allocatedProf || !project1.allocatedProf.equals(profId)) {
    throw new ApiError(403, "Only allocated professor can add remarks");
  }

  project1.discussion.push({
    description,
    remark: remark || "",
    absent: absent || [],
    date: new Date(),
  });

  await project1.save();

  return res
    .status(200)
    .json(new ApiResponse(200, { _id: project1._id }, "Remark added successfully"));
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

  const project1 = await Project1.findById(project1Id);
  if (!project1) throw new ApiError(404, "Project 1 record not found");

  if (
    !project1.allocatedProf ||
    project1.allocatedProf.toString() !== profId.toString()
  ) {
    throw new ApiError(403, "Unauthorized");
  }

  project1.projectTitle = projectTitle?.trim() || "";
  await project1.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        project1.projectTitle,
        project1.projectTitle
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

  const records = await Project1.find()
    .populate({
      path: "student",
      select:
        "batch fullName rollNumber email section branch mobileNumber marks",
      match: { batch: batchNumber },
    })
    .populate("allocatedProf");

  const filteredRecords = records.filter((r) => r.student !== null);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { response: filteredRecords },
        "All Project 1 data fetched"
      )
    );
});

export {
  createProject1,
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
