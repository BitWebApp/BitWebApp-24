import mongoose from "mongoose";
import nodemailer from "nodemailer";
import { Admin } from "../models/admin.model.js";
import { Major } from "../models/major.model.js";
import { Minor } from "../models/minor.model.js";
import { User } from "../models/user.model.js";
import { Professor } from "../models/professor.model.js";
import { Group } from "../models/group.model.js";
import { Project1 } from "../models/project1.model.js";
import { Internship } from "../models/internship.model.js";
import { Academics } from "../models/academic.model.js";
import { Award } from "../models/award.model.js";
import { Exam } from "../models/exam.model.js";
import { Placement } from "../models/placement.model.js";
import { Project } from "../models/project.model.js";
import { HigherEducation } from "../models/higher-education.model.js";
import { Allotment } from "../models/allotment.model.js";
import { RequestProj } from "../models/requestProj.model.js";
import { ClassroomBooking } from "../models/classroom.model.js";
import { Alumni } from "../models/alumni.model.js";
import { InterviewExp } from "../models/interviewExp.model.js";
import { Review } from "../models/review.model.js";
import { BugTracker } from "../models/bugtracker.model.js";
import { PeCourse } from "../models/peCourse.model.js";
import { GroupRemovalRequest } from "../models/groupRemovalRequest.model.js";
import { Chat } from "../models/chat.model.js";
import { Otp } from "../models/otp.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getUnverifiedUsers = asyncHandler(async (req, res) => {
  const admin = req.admin;
  let filter = { isVerified: false };

  // If not a master admin, filter by assigned batches
  if (admin.role !== "master" && admin.assignedBatches?.length > 0) {
    filter.batch = { $in: admin.assignedBatches };
  }

  const users = await User.find(filter).select("-password -refreshToken");
  const us = users.map((user) => ({
    _id: user._id,
    name: user.fullName,
    rollNumber: user.rollNumber,
    idCard: user.idCard,
    batch: user.batch,
  }));
  return res
    .status(200)
    .json(new ApiResponse(200, us, "All unverified users fetched"));
});

const verifyUser = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    throw new ApiError(400, "userId is required");
  }
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid userId");
  }
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    user.isVerified = true;
    await user.save();
    const email = user.email;
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASSWORD,
      },
    });
    const mailOptions = {
      from: process.env.AUTH_EMAIL,
      to: email,
      subject: "Verified Successfully",
      html: `
        <html>
        <head>
          <style>
            .email-container {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              max-width: 600px;
              margin: 0 auto;
              border: 1px solid #dddddd;
              border-radius: 5px;
              overflow: hidden;
            }
            .header {
              background-color: #007bff;
              color: white;
              padding: 20px;
              text-align: center;
              font-size: 24px;
            }
            .content {
              padding: 30px;
              background-color: #ffffff;
            }
            .content p {
              font-size: 18px;
              margin: 0 0 15px;
            }
            .footer {
              background-color: #f2f2f2;
              padding: 15px;
              text-align: center;
              font-size: 14px;
              color: #888888;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              Congratulations! You are verified successfully
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>Thank you for choosing BITAcademia. We are pleased to inform you that your verification process is now complete. You can now log in to your account and start exploring our platform.</p>
              <p>If you did not request this verification, please ignore this email or contact our support team.</p>
              <p>Best regards,</p>
              <p>TEAM BITACADEMIA</p>
            </div>
            <div class="footer">
              &copy; BITAcademia 2024. All rights reserved.
            </div>
          </div>
        </body>
        </html>
      `,
    };
    transporter.sendMail(mailOptions, async (error) => {
      if (error) {
        console.log("Error sending email to:", email, error);
      } else {
        console.log("Email sent to:", email);
      }
    });
    return res.json(new ApiResponse(200, "User verified successfully"));
  } catch (error) {
    throw new ApiError(500, "Something went wrong while verifying user");
  }
});

const generateAcessAndRefreshToken = async (adminId) => {
  try {
    const admin = await Admin.findById(adminId);
    const accessToken = admin.generateAccessToken();
    const refreshToken = admin.generateRefreshToken();
    admin.refreshToken = refreshToken;
    await admin.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and acess token!"
    );
  }
};

const registerAdmin = asyncHandler(async (req, res) => {
  const { username, password, email, role, assignedBatches } = req.body;

  if (!username || !password || !email) {
    throw new ApiError(400, "username, password, and email are required");
  }

  const existing = await Admin.findOne({
    $or: [{ username: username.toLowerCase() }, { email: email.toLowerCase() }],
  });
  if (existing) {
    throw new ApiError(409, "Account with username or email already exists!");
  }

  const adminUser = await Admin.create({
    username: username.toLowerCase(),
    password,
    email: email.toLowerCase(),
    role: role || "batch_admin",
    assignedBatches: assignedBatches || [],
  });

  const createdAdmin = await Admin.findById(adminUser._id).select(
    "-password -refreshToken"
  );
  if (!createdAdmin) {
    throw new ApiError(500, "Internal server error!");
  }
  return res
    .status(201)
    .json(new ApiResponse(200, createdAdmin, "Admin account created!"));
});
const loginAdmin = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    throw new ApiError(400, "username and password are required");
  }
  const admin = await Admin.findOne({ username: username.toLowerCase() });
  if (!admin) {
    throw new ApiError(404, "Admin not found");
  }
  const isPasswordValid = await admin.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid Credentials!");
  }
  const { accessToken, refreshToken } = await generateAcessAndRefreshToken(
    admin._id
  );
  const loggedInAdmin = await Admin.findById(admin._id).select(
    "-password -refeshToken"
  );
  // if (!admin.isAdmin) {
  //   throw new ApiError(403, "You are not verified as an admin yet!");
  // }

  const options = {
    httpOnly: true,
    secure: false,
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          admin: loggedInAdmin,
          accessToken,
          refreshToken,
        },
        "User loggedIn successfully!"
      )
    );
});

const logoutAdmin = asyncHandler(async (req, res) => {
  await Admin.findByIdAndUpdate(
    req.admin._id,
    {
      $unset: { refreshToken: 1 },
    },
    {
      new: true,
    }
  );
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Admin logged out successfully!"));
});

const getCurrendAdmin = asyncHandler(async (req, res) => {
  const _id = req?.admin?._id;
  const admin = await Admin.findById({ _id });
  if (!admin) throw new ApiError(404, "admin not found");
  res.status(200).json(new ApiResponse(200, admin, "admin fetched"));
});

export const rejectUser = asyncHandler(async (req, res) => {
  const { userId, reason } = req.body;
  if (!userId) {
    throw new ApiError(400, "userId is required");
  }
  if (!reason) {
    throw new ApiError(400, "Rejection reason is required");
  }
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid userId");
  }
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const email = user.email;
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASSWORD,
      },
    });
    const mailOptions = {
      from: process.env.AUTH_EMAIL,
      to: email,
      subject: "Verification Rejected",
      html: `
        <html>
        <head>
          <style>
            .email-container {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              max-width: 600px;
              margin: 0 auto;
              border: 1px solid #dddddd;
              border-radius: 5px;
              overflow: hidden;
            }
            .header {
              background-color: #ff0000;
              color: white;
              padding: 20px;
              text-align: center;
              font-size: 24px;
            }
            .content {
              padding: 30px;
              background-color: #ffffff;
            }
            .content p {
              font-size: 18px;
              margin: 0 0 15px;
            }
            .footer {
              background-color: #f2f2f2;
              padding: 15px;
              text-align: center;
              font-size: 14px;
              color: #888888;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              Verification Rejected
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>We regret to inform you that your verification process has been rejected for the following reason:</p>
              <p><strong>${reason}</strong></p>
              <p>Sign Up again with correct details.</p>
              <p>Best regards,</p>
              <p>TEAM BITACADEMIA</p>
            </div>
            <div class="footer">
              &copy; BITAcademia 2024. All rights reserved.
            </div>
          </div>
        </body>
        </html>
      `,
    };
    transporter.sendMail(mailOptions, async (error) => {
      if (error) {
        console.log("Error sending email to:", email, error);
      } else {
        console.log("Email sent to:", email);
      }
    });

    await User.findByIdAndDelete(userId);
    try {
      await Otp.findOneAndDelete({ email });
    } catch (error) {
      console.log("no otp, ok!");
    }

    return res.json(
      new ApiResponse(200, "User rejected and deleted successfully")
    );
  } catch (error) {
    throw new ApiError(500, "Something went wrong while rejecting user");
  }
});

const getAllMinorProjects = asyncHandler(async (req, res) => {
  try {
    const { batch } = req.query;
    const admin = req.admin;

    if (!batch) {
      throw new ApiError(400, "Batch is required");
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

    // Fetch all minor project groups with populated data
    const minorProjects = await Minor.find()
      .populate({
        path: "members",
        select:
          "fullName rollNumber email branch section mobileNumber marks.minorProject",
      })

      .populate({
        path: "leader",
        select:
          "fullName rollNumber email branch section mobileNumber marks.minorProject batch",
        match: { batch: batchNumber },
      })

      .populate({
        path: "minorAllocatedProf",
        select: "idNumber fullName email",
      });

    // Filter out projects where leader does not match the batch
    const filteredProjects = minorProjects.filter(
      (project) => project.leader !== null
    );

    // Format the data to match the frontend table structure
    const formattedData = {
      response: [],
    };

    // Process each minor project group
    filteredProjects.forEach((project) => {
      // Combine leader and members for the frontend display
      const allMembers = project.leader
        ? [
            project.leader,
            ...project.members.filter(
              (member) =>
                member._id.toString() !== project.leader._id.toString()
            ),
          ]
        : project.members;

      // Create entries for each member
      allMembers.forEach((member) => {
        formattedData.response.push({
          student: {
            rollNumber: member.rollNumber,
            fullName: member.fullName,
            email: member.email,
            branch: member.branch,
            section: member.section,
            mobileNumber: member.mobileNumber,
            marks: {
              minorProject: member.marks?.minorProject || 0,
            },
          },
          projectTitle: project.projectTitle || "",

          groupId: project.groupId,
          mentor: project.minorAllocatedProf
            ? {
                idNumber: project.minorAllocatedProf.idNumber,
                fullName: project.minorAllocatedProf.fullName,
              }
            : null,
        });
      });
    });

    // Sort the response by roll number
    formattedData.response.sort((a, b) => {
      const rollA = a.student.rollNumber.toUpperCase(); // ignore upper and lowercase
      const rollB = b.student.rollNumber.toUpperCase(); // ignore upper and lowercase
      if (rollA < rollB) {
        return -1;
      }
      if (rollA > rollB) {
        return 1;
      }
      return 0;
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          formattedData,
          "All minor projects fetched successfully"
        )
      );
  } catch (error) {
    throw new ApiError(500, "Error fetching minor projects: " + error.message);
  }
});

const getAllMajorProjects = asyncHandler(async (req, res) => {
  try {
    const { batch } = req.query;
    const admin = req.admin;

    if (!batch) {
      throw new ApiError(400, "Batch is required");
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

    // Fetch all major project groups with populated data
    const majorProjects = await Major.find()
      .populate({
        path: "members",
        select:
          "fullName rollNumber email branch section marks.majorProject mobileNumber projectTitle",
      })
      .populate({
        path: "leader",
        select:
          "fullName rollNumber email branch section marks.majorProject batch mobileNumber projectTitle",
        match: { batch: batchNumber },
      })
      .populate({
        path: "majorAllocatedProf",
        select: "idNumber fullName email",
      })
      .populate({
        path: "org",
        select: "companyName",
      });

    // Filter out projects where leader does not match the batch
    const filteredProjects = majorProjects.filter(
      (project) => project.leader !== null
    );

    // Format the data to match the frontend table structure
    const formattedData = {
      response: [],
    };

    // Process each major project group
    filteredProjects.forEach((project) => {
      // Combine leader and members for the frontend display
      const allMembers = project.leader
        ? [
            project.leader,
            ...project.members.filter(
              (member) =>
                member._id.toString() !== project.leader._id.toString()
            ),
          ]
        : project.members;

      // Create entries for each member
      allMembers.forEach((member) => {
        let orgName = "";
        if (project.type === "industrial") {
          orgName =
            project.org && project.org.companyName
              ? project.org.companyName
              : "";
        } else if (project.type === "research") {
          orgName = "BIT";
        }
        formattedData.response.push({
          student: {
            rollNumber: member.rollNumber,
            fullName: member.fullName,
            email: member.email,
            branch: member.branch,
            section: member.section,
            mobileNumber: member.mobileNumber,
            projectTitle: member.projectTitle,
            marks: {
              majorProject: member.marks?.majorProject || 0,
            },
          },
          groupId: project.groupId,
          mentor: project.majorAllocatedProf
            ? {
                idNumber: project.majorAllocatedProf.idNumber,
                fullName: project.majorAllocatedProf.fullName,
              }
            : null,
          type: project.type,
          org: orgName,
          location:
            project.type === "industrial" ? "outside_bit" : "inside_bit",
          projectTitle: project.projectTitle || member.projectTitle || "",
        });
      });
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          formattedData,
          "All major projects fetched successfully"
        )
      );
  } catch (error) {
    throw new ApiError(500, "Error fetching major projects: " + error.message);
  }
});

/**
 * Get all admins (Master Admin only)
 */
const getAllAdmins = asyncHandler(async (req, res) => {
  const admins = await Admin.find().select("-password -refreshToken");
  return res
    .status(200)
    .json(new ApiResponse(200, admins, "All admins fetched successfully"));
});

/**
 * Create a batch admin (Master Admin only)
 */
const createBatchAdmin = asyncHandler(async (req, res) => {
  const { username, password, email, assignedBatches } = req.body;

  if (!username || !password || !email) {
    throw new ApiError(400, "username, password, and email are required");
  }

  if (!assignedBatches || assignedBatches.length === 0) {
    throw new ApiError(400, "At least one batch must be assigned");
  }

  const existing = await Admin.findOne({
    $or: [{ username: username.toLowerCase() }, { email: email.toLowerCase() }],
  });
  if (existing) {
    throw new ApiError(409, "Account with username or email already exists!");
  }

  const adminUser = await Admin.create({
    username: username.toLowerCase(),
    password,
    email: email.toLowerCase(),
    role: "batch_admin",
    assignedBatches,
  });

  const createdAdmin = await Admin.findById(adminUser._id).select(
    "-password -refreshToken"
  );
  if (!createdAdmin) {
    throw new ApiError(500, "Internal server error!");
  }
  return res
    .status(201)
    .json(
      new ApiResponse(200, createdAdmin, "Batch admin created successfully!")
    );
});

/**
 * Update an admin (Master Admin only)
 */
const updateAdmin = asyncHandler(async (req, res) => {
  const { adminId } = req.params;
  const { role, assignedBatches, email } = req.body;

  if (!mongoose.Types.ObjectId.isValid(adminId)) {
    throw new ApiError(400, "Invalid admin ID");
  }

  const admin = await Admin.findById(adminId);
  if (!admin) {
    throw new ApiError(404, "Admin not found");
  }

  // Prevent updating own role to prevent lockout
  if (adminId === req.admin._id.toString() && role && role !== admin.role) {
    throw new ApiError(400, "Cannot change your own role");
  }

  // Validate role if provided
  const allowedRoles = ["master", "batch_admin"];
  if (role && !allowedRoles.includes(role)) {
    throw new ApiError(
      400,
      `Invalid role. Allowed values: ${allowedRoles.join(", ")}`
    );
  }

  // Check email uniqueness if email is being updated
  if (email) {
    const normalizedEmail = email.toLowerCase();
    const existingAdmin = await Admin.findOne({
      email: normalizedEmail,
      _id: { $ne: adminId },
    });
    if (existingAdmin) {
      throw new ApiError(409, "Email is already in use by another admin");
    }
  }

  const updateFields = {};
  if (role) updateFields.role = role;
  if (assignedBatches) updateFields.assignedBatches = assignedBatches;
  if (email) updateFields.email = email.toLowerCase();

  const updatedAdmin = await Admin.findByIdAndUpdate(
    adminId,
    { $set: updateFields },
    { new: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedAdmin, "Admin updated successfully"));
});

/**
 * Delete an admin (Master Admin only)
 */
const deleteAdmin = asyncHandler(async (req, res) => {
  const { adminId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(adminId)) {
    throw new ApiError(400, "Invalid admin ID");
  }

  // Prevent self-deletion
  if (adminId === req.admin._id.toString()) {
    throw new ApiError(400, "Cannot delete yourself");
  }

  const admin = await Admin.findById(adminId);
  if (!admin) {
    throw new ApiError(404, "Admin not found");
  }

  await Admin.findByIdAndDelete(adminId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Admin deleted successfully"));
});

/**
 * Get batch statistics (for dashboard)
 */
const getBatchStats = asyncHandler(async (req, res) => {
  const admin = req.admin;
  let batchFilter = {};

  if (admin.role !== "master" && admin.assignedBatches?.length > 0) {
    batchFilter.batch = { $in: admin.assignedBatches };
  }

  // Get counts per batch
  const stats = await User.aggregate([
    { $match: batchFilter },
    {
      $group: {
        _id: "$batch",
        total: { $sum: 1 },
        verified: { $sum: { $cond: ["$isVerified", 1, 0] } },
        unverified: { $sum: { $cond: ["$isVerified", 0, 1] } },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, stats, "Batch statistics fetched"));
});

/**
 * Reset all professor summer training seats (Master Admin only)
 */
const resetSummerTrainingSeats = asyncHandler(async (req, res) => {
  const admin = req.admin;
  if (admin.role !== "master") {
    throw new ApiError(403, "Access forbidden: Master admins only");
  }

  const result = await Professor.updateMany(
    {},
    {
      $set: {
        "currentCount.summer_training": 0,
        "students.summer_training": [],
        "appliedGroups.summer_training": [],
      },
    }
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { modifiedCount: result.modifiedCount },
        "Summer training seats have been successfully reset to 0."
      )
    );
});

/**
 * Get all professors (for admin dropdown when reassigning mentors)
 */
const getAllProfessors = asyncHandler(async (req, res) => {
  const professors = await Professor.find(
    {},
    "fullName idNumber email currentCount limits"
  ).sort({ fullName: 1 });

  return res
    .status(200)
    .json(
      new ApiResponse(200, professors, "All professors fetched successfully")
    );
});

/**
 * Reassign a major project group's mentor from one professor to another.
 * Updates: Major group, old professor, new professor — all in a transaction.
 */
const reassignMajorMentor = asyncHandler(async (req, res) => {
  const { groupId, newProfessorId } = req.body;

  if (!groupId || !newProfessorId) {
    throw new ApiError(400, "groupId and newProfessorId are required");
  }

  if (!mongoose.Types.ObjectId.isValid(newProfessorId)) {
    throw new ApiError(400, "Invalid newProfessorId");
  }

  // Find the group by its 6-char groupId string
  const group = await Major.findOne({ groupId }).populate("members");
  if (!group) {
    throw new ApiError(404, `Major group with ID "${groupId}" not found`);
  }

  const newProf = await Professor.findById(newProfessorId);
  if (!newProf) {
    throw new ApiError(404, "New professor not found");
  }

  // Check if already assigned to this professor
  if (
    group.majorAllocatedProf &&
    group.majorAllocatedProf.toString() === newProfessorId
  ) {
    throw new ApiError(
      409,
      "This group is already assigned to the selected professor"
    );
  }

  const numMembers = group.members.length;
  const oldProfId = group.majorAllocatedProf;

  // Start a transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Update the group's allocated professor
    group.majorAllocatedProf = newProfessorId;
    await group.save({ session, validateBeforeSave: false });

    // 2. Remove from old professor (if one existed)
    if (oldProfId) {
      const oldProf = await Professor.findById(oldProfId).session(session);
      if (oldProf) {
        oldProf.students.major_project.pull(group._id);
        oldProf.currentCount.major_project = Math.max(
          0,
          oldProf.currentCount.major_project - numMembers
        );
        await oldProf.save({ session });
      }
    }

    // 3. Add to new professor
    if (!newProf.students.major_project.includes(group._id)) {
      newProf.students.major_project.push(group._id);
    }
    newProf.currentCount.major_project += numMembers;
    await newProf.save({ session });

    await session.commitTransaction();
    session.endSession();

    // Fetch updated group with populated data for the response
    const updatedGroup = await Major.findById(group._id)
      .populate("members", "fullName rollNumber email")
      .populate("majorAllocatedProf", "fullName idNumber email")
      .populate("org", "companyName");

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          updatedGroup,
          `Mentor successfully reassigned to ${newProf.fullName}`
        )
      );
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error reassigning mentor:", error);
    throw new ApiError(
      500,
      "Something went wrong while reassigning mentor: " + error.message
    );
  }
});

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Master Admin: Search student by roll number to inspect full profile,
 * project/group memberships, mentor allocations, and associated records
 * before removing the record.
 */
const searchStudentForRemoval = asyncHandler(async (req, res) => {
  const roll = req.query.rollNumber || req.body?.rollNumber || req.params?.rollNumber;

  if (!roll || typeof roll !== "string" || !roll.trim()) {
    throw new ApiError(400, "Roll number is required");
  }

  const cleanRoll = roll.trim();
  const student = await User.findOne({
    rollNumber: { $regex: new RegExp(`^${escapeRegex(cleanRoll)}$`, "i") },
  })
    .select("-password -refreshToken")
    .populate("summerAllocatedProf", "fullName email idNumber")
    .populate("minorAllocatedProf", "fullName email idNumber")
    .populate("majorAllocatedProf", "fullName email idNumber");

  if (!student) {
    throw new ApiError(404, `No student found with roll number "${cleanRoll}"`);
  }

  // Find active group associations (prioritizing the student's active group reference)
  const [summerGroup, minorGroup, majorGroup, project1Group] = await Promise.all([
    student.group
      ? Group.findById(student.group)
          .populate("summerAllocatedProf", "fullName email idNumber")
          .select("groupId typeOfSummer summerAllocatedProf members leader projectTitle")
      : Group.findOne({ members: student._id })
          .populate("summerAllocatedProf", "fullName email idNumber")
          .select("groupId typeOfSummer summerAllocatedProf members leader projectTitle"),

    student.MinorGroup
      ? Minor.findById(student.MinorGroup)
          .populate("minorAllocatedProf", "fullName email idNumber")
          .select("groupId minorAllocatedProf members leader projectTitle")
      : Minor.findOne({ members: student._id })
          .populate("minorAllocatedProf", "fullName email idNumber")
          .select("groupId minorAllocatedProf members leader projectTitle"),

    student.MajorGroup
      ? Major.findById(student.MajorGroup)
          .populate("majorAllocatedProf", "fullName email idNumber")
          .select("groupId type majorAllocatedProf members leader projectTitle")
      : Major.findOne({ members: student._id })
          .populate("majorAllocatedProf", "fullName email idNumber")
          .select("groupId type majorAllocatedProf members leader projectTitle"),

    student.project1
      ? Project1.findById(student.project1)
          .populate("allocatedProf", "fullName email idNumber")
          .select("groupId allocatedProf members leader projectTitle")
      : Project1.findOne({ members: student._id })
          .populate("allocatedProf", "fullName email idNumber")
          .select("groupId allocatedProf members leader projectTitle"),
  ]);

  // Count records in related collections to show impact
  const [
    academicsCount,
    awardsCount,
    examsCount,
    internshipsCount,
    projectsCount,
    higherEdCount,
    allotmentsCount,
    bookingsCount,
    peCoursesCount,
  ] = await Promise.all([
    Academics.countDocuments({ name: student._id }),
    Award.countDocuments({ student: student._id }),
    Exam.countDocuments({ name: student._id }),
    Internship.countDocuments({ student: student._id }),
    Project.countDocuments({ name: student._id }),
    HigherEducation.countDocuments({ name: student._id }),
    Allotment.countDocuments({ student: student._id }),
    ClassroomBooking.countDocuments({ student: student._id }),
    PeCourse.countDocuments({ students: student._id }),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        student: {
          _id: student._id,
          fullName: student.fullName,
          rollNumber: student.rollNumber,
          email: student.email,
          branch: student.branch,
          batch: student.batch,
          program: student.program,
          section: student.section,
          isVerified: student.isVerified,
          cgpa: student.cgpa,
          mobileNumber: student.mobileNumber,
        },
        groups: {
          summer: summerGroup
            ? {
                groupId: summerGroup.groupId,
                projectTitle: summerGroup.projectTitle,
                isLeader: summerGroup.leader?.equals(student._id),
                membersCount: summerGroup.members?.length || 0,
                allocatedProf: summerGroup.summerAllocatedProf,
              }
            : null,
          minor: minorGroup
            ? {
                groupId: minorGroup.groupId,
                projectTitle: minorGroup.projectTitle,
                isLeader: minorGroup.leader?.equals(student._id),
                membersCount: minorGroup.members?.length || 0,
                allocatedProf: minorGroup.minorAllocatedProf,
              }
            : null,
          major: majorGroup
            ? {
                groupId: majorGroup.groupId,
                projectTitle: majorGroup.projectTitle,
                isLeader: majorGroup.leader?.equals(student._id),
                membersCount: majorGroup.members?.length || 0,
                allocatedProf: majorGroup.majorAllocatedProf,
              }
            : null,
          project1: project1Group
            ? {
                groupId: project1Group.groupId,
                projectTitle: project1Group.projectTitle,
                isLeader: project1Group.leader?.equals(student._id),
                membersCount: project1Group.members?.length || 0,
                allocatedProf: project1Group.allocatedProf,
              }
            : null,
        },
        recordsCount: {
          academics: academicsCount,
          awards: awardsCount,
          exams: examsCount,
          internships: internshipsCount,
          projects: projectsCount,
          higherEducation: higherEdCount,
          allotments: allotmentsCount,
          classroomBookings: bookingsCount,
          peCourses: peCoursesCount,
        },
      },
      "Student details retrieved successfully"
    )
  );
});

/**
 * Master Admin: Remove student record when student leaves the Institute.
 * Cleans up all group memberships, releases allocated mentor capacities,
 * deletes all student-related sub-records, and removes user record.
 * 
 * Includes strict cross-verification safeguards:
 * - Validates rollNumber and optional studentId
 * - Aborts on ambiguity
 * - Verifies studentId matches rollNumber
 * - Targets only records belonging strictly to this student's ObjectId
 */
const removeStudentRecord = asyncHandler(async (req, res) => {
  const roll = req.body?.rollNumber || req.query.rollNumber || req.params?.rollNumber;
  const providedStudentId = req.body?.studentId || req.query.studentId;

  if (!roll || typeof roll !== "string" || !roll.trim()) {
    throw new ApiError(400, "Roll number is required");
  }

  const cleanRoll = roll.trim();

  let student = null;

  // If studentId was provided by the client, use strict ID lookup with roll number verification
  if (providedStudentId) {
    if (!mongoose.Types.ObjectId.isValid(providedStudentId)) {
      throw new ApiError(400, "Invalid studentId provided");
    }
    student = await User.findById(providedStudentId);
    if (!student) {
      throw new ApiError(404, "Student record not found for the provided ID");
    }
    if (student.rollNumber.trim().toUpperCase() !== cleanRoll.toUpperCase()) {
      throw new ApiError(
        400,
        "Safety mismatch: Roll number does not match student record ID"
      );
    }
  } else {
    // Exact full-string case-insensitive match
    const matches = await User.find({
      rollNumber: { $regex: new RegExp(`^${escapeRegex(cleanRoll)}$`, "i") },
    });

    if (!matches || matches.length === 0) {
      throw new ApiError(404, `No student found with roll number "${cleanRoll}"`);
    }

    if (matches.length > 1) {
      throw new ApiError(
        409,
        `Ambiguous roll number: multiple records found for "${cleanRoll}". Aborting to prevent accidental deletion.`
      );
    }

    student = matches[0];
  }

  const studentId = student._id;
  const studentEmail = student.email;

  if (!studentId || !mongoose.Types.ObjectId.isValid(studentId)) {
    throw new ApiError(500, "Invalid student identifier");
  }

  // 1. Summer Training Group Cleanup
  const summerGroups = await Group.find({ members: studentId });
  for (const group of summerGroups) {
    group.members.pull(studentId);
    if (group.discussion && group.discussion.length > 0) {
      for (const d of group.discussion) {
        if (d.absent && d.absent.length > 0) {
          d.absent.pull(studentId);
        }
      }
    }

    const allocatedProfId = group.summerAllocatedProf;
    if (allocatedProfId) {
      const prof = await Professor.findById(allocatedProfId);
      if (prof) {
        prof.currentCount.summer_training = Math.max(
          0,
          (prof.currentCount.summer_training || 0) - 1
        );
        if (group.members.length === 0) {
          prof.students.summer_training.pull(group._id);
        }
        await prof.save({ validateBeforeSave: false });
      }
    }

    if (group.members.length === 0) {
      if (group.summerAppliedProfs && group.summerAppliedProfs.length > 0) {
        for (const profId of group.summerAppliedProfs) {
          const prof = await Professor.findById(profId);
          if (prof) {
            prof.appliedGroups?.summer_training?.pull(group._id);
            await prof.save({ validateBeforeSave: false });
          }
        }
      }
      await GroupRemovalRequest.deleteMany({ groupRef: group._id });
      await Chat.deleteOne({ groupId: group.groupId });
      await group.deleteOne();
    } else {
      if (group.leader?.equals(studentId)) {
        group.leader = group.members[0];
      }
      await group.save({ validateBeforeSave: false });
    }
  }

  // 2. Minor Project Group Cleanup
  const minorGroups = await Minor.find({ members: studentId });
  for (const group of minorGroups) {
    group.members.pull(studentId);
    if (group.discussion && group.discussion.length > 0) {
      for (const d of group.discussion) {
        if (d.absent && d.absent.length > 0) {
          d.absent.pull(studentId);
        }
      }
    }

    const allocatedProfId = group.minorAllocatedProf;
    if (allocatedProfId) {
      const prof = await Professor.findById(allocatedProfId);
      if (prof) {
        prof.currentCount.minor_project = Math.max(
          0,
          (prof.currentCount.minor_project || 0) - 1
        );
        if (group.members.length === 0) {
          prof.students.minor_project.pull(group._id);
        }
        await prof.save({ validateBeforeSave: false });
      }
    }

    if (group.members.length === 0) {
      if (group.minorAppliedProfs && group.minorAppliedProfs.length > 0) {
        for (const profId of group.minorAppliedProfs) {
          const prof = await Professor.findById(profId);
          if (prof) {
            prof.appliedGroups?.minor_project?.pull(group._id);
            await prof.save({ validateBeforeSave: false });
          }
        }
      }
      await GroupRemovalRequest.deleteMany({ groupRef: group._id });
      await group.deleteOne();
    } else {
      if (group.leader?.equals(studentId)) {
        group.leader = group.members[0];
      }
      await group.save({ validateBeforeSave: false });
    }
  }

  // 3. Major Project Group Cleanup
  const majorGroups = await Major.find({ members: studentId });
  for (const group of majorGroups) {
    group.members.pull(studentId);
    if (group.discussion && group.discussion.length > 0) {
      for (const d of group.discussion) {
        if (d.absent && d.absent.length > 0) {
          d.absent.pull(studentId);
        }
      }
    }

    const allocatedProfId = group.majorAllocatedProf;
    if (allocatedProfId) {
      const prof = await Professor.findById(allocatedProfId);
      if (prof) {
        prof.currentCount.major_project = Math.max(
          0,
          (prof.currentCount.major_project || 0) - 1
        );
        if (group.members.length === 0) {
          prof.students.major_project.pull(group._id);
        }
        await prof.save({ validateBeforeSave: false });
      }
    }

    if (group.members.length === 0) {
      if (group.majorAppliedProfs && group.majorAppliedProfs.length > 0) {
        for (const profId of group.majorAppliedProfs) {
          const prof = await Professor.findById(profId);
          if (prof) {
            prof.appliedGroups?.major_project?.pull(group._id);
            await prof.save({ validateBeforeSave: false });
          }
        }
      }
      await GroupRemovalRequest.deleteMany({ groupRef: group._id });
      await group.deleteOne();
    } else {
      if (group.leader?.equals(studentId)) {
        group.leader = group.members[0];
      }
      await group.save({ validateBeforeSave: false });
    }
  }

  // 4. Project 1 Group Cleanup
  const project1Groups = await Project1.find({ members: studentId });
  for (const group of project1Groups) {
    group.members.pull(studentId);
    if (group.discussion && group.discussion.length > 0) {
      for (const d of group.discussion) {
        if (d.absent && d.absent.length > 0) {
          d.absent.pull(studentId);
        }
      }
    }

    const allocatedProfId = group.allocatedProf;
    if (allocatedProfId) {
      const prof = await Professor.findById(allocatedProfId);
      if (prof) {
        prof.currentCount.project1 = Math.max(
          0,
          (prof.currentCount.project1 || 0) - 1
        );
        if (group.members.length === 0) {
          prof.students.project1.pull(group._id);
        }
        await prof.save({ validateBeforeSave: false });
      }
    }

    if (group.members.length === 0) {
      if (group.appliedProfs && group.appliedProfs.length > 0) {
        for (const profId of group.appliedProfs) {
          const prof = await Professor.findById(profId);
          if (prof) {
            prof.appliedGroups?.project1?.pull(group._id);
            await prof.save({ validateBeforeSave: false });
          }
        }
      }
      await GroupRemovalRequest.deleteMany({ groupRef: group._id });
      await group.deleteOne();
    } else {
      if (group.leader?.equals(studentId)) {
        group.leader = group.members[0];
      }
      await group.save({ validateBeforeSave: false });
    }
  }

  // 5. Clean up associated collections strictly matching studentId
  const cleanupTasks = [
    Academics.deleteMany({ name: studentId }),
    Award.deleteMany({ student: studentId }),
    Exam.deleteMany({ name: studentId }),
    Internship.deleteMany({ student: studentId }),
    Placement.deleteMany({ student: studentId }),
    Project.deleteMany({ name: studentId }),
    HigherEducation.deleteMany({ name: studentId }),
    Allotment.deleteMany({ student: studentId }),
    RequestProj.deleteMany({ studentId: studentId }),
    ClassroomBooking.deleteMany({ student: studentId }),
    Alumni.deleteMany({ user: studentId }),
    InterviewExp.deleteMany({ student: studentId }),
    Review.deleteMany({ user: studentId, userModel: "User" }),
    BugTracker.deleteMany({ "reporter.id": studentId, "reporter.kind": "User" }),
    PeCourse.updateMany({ students: studentId }, { $pull: { students: studentId } }),
    Group.updateMany(
      { "typeChangeRequests.initiatedBy": studentId },
      { $pull: { typeChangeRequests: { initiatedBy: studentId } } }
    ),
  ];

  if (studentEmail && typeof studentEmail === "string" && studentEmail.trim().length > 0) {
    cleanupTasks.push(Otp.deleteMany({ email: studentEmail.trim().toLowerCase() }));
  }

  await Promise.all(cleanupTasks);

  // 6. Delete User document strictly matching both _id and rollNumber
  await User.deleteOne({ _id: studentId, rollNumber: student.rollNumber });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        rollNumber: student.rollNumber,
        fullName: student.fullName,
      },
      `Student record for ${student.fullName} (${student.rollNumber}) has been permanently removed`
    )
  );
});

export {
  createBatchAdmin,
  deleteAdmin,
  getAllAdmins,
  getAllMajorProjects,
  getAllMinorProjects,
  getAllProfessors,
  getBatchStats,
  getCurrendAdmin,
  getUnverifiedUsers,
  loginAdmin,
  logoutAdmin,
  reassignMajorMentor,
  registerAdmin,
  updateAdmin,
  verifyUser,
  resetSummerTrainingSeats,
  searchStudentForRemoval,
  removeStudentRecord,
};
