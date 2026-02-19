import mongoose from "mongoose";
import nodemailer from "nodemailer";
import { Admin } from "../models/admin.model.js";
import { Major } from "../models/major.model.js";
import { Minor } from "../models/minor.model.js";
import { User } from "../models/user.model.js";
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

import { Otp } from "../models/otp.model.js";

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

export {
  createBatchAdmin,
  deleteAdmin,
  getAllAdmins,
  getAllMajorProjects,
  getAllMinorProjects,
  getBatchStats,
  getCurrendAdmin,
  getUnverifiedUsers,
  loginAdmin,
  logoutAdmin,
  registerAdmin,
  updateAdmin,
  verifyUser,
};
