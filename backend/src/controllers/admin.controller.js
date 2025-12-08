import mongoose from "mongoose";
import nodemailer from "nodemailer";
import { Admin } from "../models/admin.model.js";
import { Minor } from "../models/minor.model.js";
import { Major } from "../models/major.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getUnverifiedUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ isVerified: false }).select(
    "-password -refreshToken"
  );
  const us = users.map((user) => ({
    _id: user._id,
    name: user.name,
    rollNumer: user.rollNumber,
    idCard: user.idCard,
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
  const { username, password } = req.body;
  console.log(username, password);
  if (!username || !password) {
    throw new ApiError(400, "username and password are required");
  }
  const existing = await Admin.findOne({ username });
  if (existing) {
    throw new ApiError(402, "Account with username already exists!");
  }
  const adminUser = await Admin.create({
    username: username.toLowerCase(),
    password,
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
    const { batch } = req.query; // Extract batch from request body

    if (!batch) {
      throw new ApiError(400, "Batch is required"); // Throw error if batch is not provided
    }

    // Fetch all minor project groups with populated data
    const minorProjects = await Minor.find()
      .populate({
        path: "members",
        select: "fullName rollNumber email branch section marks.minorProject",
      })
      .populate({
        path: "leader",
        select:
          "fullName rollNumber email branch section marks.minorProject batch", // Include batch in leader selection
        match: { batch }, // Filter by batch
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
            marks: {
              minorProject: member.marks?.minorProject || 0,
            },
          },
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
    const { batch } = req.query; // Extract batch from request query

    if (!batch) {
      throw new ApiError(400, "Batch is required"); // Throw error if batch is not provided
    }

    // Fetch all major project groups with populated data
    const majorProjects = await Major.find()
      .populate({
        path: "members",
        select: "fullName rollNumber email branch section marks.majorProject",
      })
      .populate({
        path: "leader",
        select:
          "fullName rollNumber email branch section marks.majorProject batch", // Include batch in leader selection
        match: { batch }, // Filter by batch
      })
      .populate({
        path: "majorAllocatedProf",
        select: "idNumber fullName email",
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
        formattedData.response.push({
          student: {
            rollNumber: member.rollNumber,
            fullName: member.fullName,
            email: member.email,
            branch: member.branch,
            section: member.section,
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

export {
  getAllMinorProjects,
  getAllMajorProjects,
  getCurrendAdmin,
  getUnverifiedUsers,
  loginAdmin,
  logoutAdmin,
  registerAdmin,
  verifyUser,
};
