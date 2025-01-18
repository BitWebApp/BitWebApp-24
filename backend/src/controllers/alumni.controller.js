import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Alumni } from "../models/alumni.model.js";
import nodemailer from "nodemailer";

// Create alumni profile
const createAlumni = asyncHandler(async (req, res) => {
  const { name, batch, program, graduationYear } = req.body;
  const userId = req.user._id;

  // Check if alumni profile already exists
  const existingAlumni = await Alumni.findOne({ user: userId });
  if (existingAlumni) {
    throw new ApiError(400, "Alumni profile already exists");
  }

  // Create new alumni profile
  const alumni = await Alumni.create({
    user: userId,
    name,
    batch,
    program,
    graduationYear,
    hasSubmittedForm: true
  });

  return res
    .status(201)
    .json(new ApiResponse(201, alumni, "Alumni profile created successfully"));
});

// Get alumni profile status
const getAlumniStatus = asyncHandler(async (req, res) => {
  const userId = req.user._id;

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

  const alumni = await Alumni.findOne({ user: userId });
  if (!alumni) {
    throw new ApiError(404, "Alumni profile not found");
  }

  console.log("Printing alumni", alumni);
  
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.AUTH_EMAIL,
      pass: process.env.AUTH_PASSWORD
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: "ankitvsv0311@gmail.com",
    subject: "Alumni Donation Interest",
    text: `
      Alumni Details:
      Name: ${alumni.name}
      Batch: ${alumni.batch}
      Program: ${alumni.program}
      Graduation Year: ${alumni.graduationYear}
      
      This alumni has expressed interest in making a donation to the institution.
    `
  };

  await transporter.sendMail(mailOptions);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Donation interest email sent successfully"));
});

// Get alumni profile
const getAlumniProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const alumni = await Alumni.findOne({ user: userId });
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
