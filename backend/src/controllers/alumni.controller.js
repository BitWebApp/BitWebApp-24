import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Alumni } from "../models/alumni.model.js";
import { User } from "../models/user.model.js";
import nodemailer from "nodemailer";

// Create alumni profile
const createAlumni = asyncHandler(async (req, res) => {
  const { batch, program } = req.body;
  const name = req.user.fullName;
  const userId = req.user._id;

  // Check if alumni profile already exists
  const existingAlumni = await Alumni.findOne({ user: userId });
  if (existingAlumni) {
    throw new ApiError(400, "Alumni profile already exists");
  }

  const user = await User.findById(userId);
  if (!user.branch) {
    throw new ApiError(400, "Please update your branch in your profile first");
  }

  // Create new alumni profile
  const alumni = await Alumni.create({
    user: userId,
    name,
    batch,
    program,
    branch: user.branch,
    hasSubmittedForm: true
  });

  return res
    .status(201)
    .json(new ApiResponse(201, alumni, "Alumni profile created successfully"));
});

// Get alumni profile status
const getAlumniStatus = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  console.log("Print user", req.user);

  const alumni = await Alumni.findOne({ user: userId }).select("hasSubmittedForm");

  return res.status(200).json(
    new ApiResponse(200, {
      hasSubmittedForm: alumni?.hasSubmittedForm || false
    }, "Alumni status retrieved successfully")
  );
});

// Add work experience
const addWorkExperience = asyncHandler(async (req, res) => {
  const { company, role, startDate, endDate, isCurrentlyWorking } = req.body;
  const userId = req.user._id;

  const alumni = await Alumni.findOne({ user: userId });
  if (!alumni) {
    throw new ApiError(404, "Alumni profile not found");
  }

  if (!alumni.hasSubmittedForm) {
    throw new ApiError(400, "Please submit alumni form first");
  }

  const startDateTime = new Date(startDate).getTime();
  if (endDate && !isCurrentlyWorking) {
    const endDateTime = new Date(endDate).getTime();
    if (startDateTime > endDateTime) {
      throw new ApiError(400, "Start date cannot be after end date");
    }
  }

  const workExp = {
    company,
    role,
    startDate: new Date(startDate),
    isCurrentlyWorking
  };

  if (!isCurrentlyWorking && endDate) {
    workExp.endDate = new Date(endDate);
  }

  alumni.workExperiences.push(workExp);
  await alumni.save();

  return res
    .status(200)
    .json(new ApiResponse(200, alumni, "Work experience added successfully"));
});

// Get work experiences
const getWorkExperiences = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const alumni = await Alumni.findOne({ user: userId })
    .select("workExperiences hasSubmittedForm");

  if (!alumni) {
    throw new ApiError(404, "Alumni profile not found");
  }

  if (!alumni.hasSubmittedForm) {
    throw new ApiError(400, "Please submit alumni form first");
  }

  // Sort work experiences by start date (most recent first)
  const sortedExperiences = [...alumni.workExperiences].sort(
    (a, b) => new Date(b.startDate) - new Date(a.startDate)
  );

  return res
    .status(200)
    .json(new ApiResponse(
      200,
      sortedExperiences,
      "Work experiences retrieved successfully"
    ));
});


// Get all alumni (admin only)
const getAllAlumni = asyncHandler(async (req, res) => {
  try {
    // Remove .lean() to preserve the full document structure
    const alumni = await Alumni.find()
      .populate("user", "email")
      .select("-__v");

    if (!alumni || alumni.length === 0) {
      throw new ApiError(404, "No alumni records found");
    }

    // Format the response for admin view
    const formattedAlumni = alumni.map(record => {
      // Convert to plain object while preserving arrays
      const plainRecord = record.toObject();

      return {
        ...plainRecord,
        workExperiences: plainRecord.workExperiences
          ? plainRecord.workExperiences.sort(
            (a, b) => new Date(b.startDate) - new Date(a.startDate)
          )
          : [],
        totalExperiences: plainRecord.workExperiences
          ? plainRecord.workExperiences.length
          : 0
      };
    });

    return res
      .status(200)
      .json(new ApiResponse(
        200,
        formattedAlumni,
        "All alumni records retrieved successfully"
      ));
  } catch (error) {
    console.error("Error in getAllAlumni:", error);
    throw new ApiError(500, error.message || "Error retrieving alumni records");
  }
});

// Send donation email
const sendDonationEmail = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const alumni = await Alumni.findOne({ user: userId })
    .populate('user', 'email')
    .exec();

  if (!alumni) {
    throw new ApiError(404, "Alumni profile not found");
  }

  if (!alumni.user?.email) {
    throw new ApiError(400, "Alumni email not found");
  }

  // console.log("Printing alumni", alumni);

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.AUTH_EMAIL,
      pass: process.env.AUTH_PASSWORD
    }
  });

  const mailOptions = {
    from: process.env.AUTH_EMAIL,
    to: "ankitvsv0311@gmail.com", // CSE Department email
    cc: alumni.user.email, // Alumni email
    subject: "Alumni Donation Interest",
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
          .highlight {
            font-weight: bold;
            color: #007bff;
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
            Alumni Donation Interest
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>An alumni has expressed interest in making a donation to the institution. Below are their details:</p>
            <p><span class="highlight">Name:</span> ${alumni.name}</p>
            <p><span class="highlight">Email:</span> ${alumni.user.email}</p>
            <p><span class="highlight">Batch:</span> ${alumni.batch}</p>
            <p><span class="highlight">Program:</span> ${alumni.program}</p>
            <p><span class="highlight">Graduation Year:</span> ${alumni.graduationYear}</p>
            <p>Thank you for fostering a culture of giving and supporting our institution's growth and development.</p>
            <p>Best regards,</p>
            <p>TEAM BITAcademia</p>
          </div>
          <div class="footer">
            &copy; BITAcademia 2024. All rights reserved.
          </div>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Donation interest email sent successfully"));
});

// Get alumni profile
const getAlumniProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const alumni = await Alumni.findOne({ user: userId })
    .populate('user', 'email')
    .exec();

  if (!alumni) {
    throw new ApiError(404, "Alumni profile not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, alumni, "Alumni profile retrieved successfully"));
});

export {
  createAlumni,
  getAlumniStatus,
  addWorkExperience,
  getWorkExperiences,
  getAllAlumni,
  sendDonationEmail,
  getAlumniProfile
};
