import nodemailer from "nodemailer";
import { HigherEducation } from "../models/higher-education.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Create alumni profile
const createAlumni = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user: user._id,
        name: user.fullName,
        batch: user.batch,
        branch: user.branch,
      },
      "Alumni profile retrieved successfully"
    )
  );
});

// Get alumni profile status
const getAlumniStatus = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const user = await User.findById(userId).select("_id");

  return res.status(200).json(
    new ApiResponse(
      200,
      { exists: !!user },
      "Alumni status retrieved successfully"
    )
  );
});

// Add work experience
const addWorkExperience = asyncHandler(async (req, res) => {
  const { company, role, startDate, endDate, isCurrentlyWorking } = req.body;
  const userId = req.user._id;

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
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
    isCurrentlyWorking,
  };

  if (!isCurrentlyWorking && endDate) {
    workExp.endDate = new Date(endDate);
  }

  user.alumniWorkExperiences.push(workExp);
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Work experience added successfully"));
});

// Get work experiences
const getWorkExperiences = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const user = await User.findById(userId).select("alumniWorkExperiences");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const sortedExperiences = [...(user.alumniWorkExperiences || [])].sort(
    (a, b) => new Date(b.startDate) - new Date(a.startDate)
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        sortedExperiences,
        "Work experiences retrieved successfully"
      )
    );
});

const deleteWorkExperience = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { id } = req.params;

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const workExp = user.alumniWorkExperiences.id(id);
  if (!workExp) {
    throw new ApiError(404, "Work experience not found");
  }

  workExp.deleteOne();
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Work experience deleted"));
});

// Get all alumni (admin only)
const getAllAlumni = asyncHandler(async (req, res) => {
  try {
    const { batch } = req.query;

    if (!batch) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Batch is required."));
    }

    const batchNumber = Number(batch);
    if (Number.isNaN(batchNumber)) {
      throw new ApiError(400, "Invalid batch query parameter");
    }

    const users = await User.find({ batch: batchNumber })
      .select(
        "fullName email mobileNumber alternateEmail linkedin branch batch alumniWorkExperiences placementOne group MajorGroup"
      )
      .populate([
        { path: "placementOne", select: "company role ctc date doc" },
        {
          path: "group",
          populate: [
            { path: "org", select: "companyName" },
            { path: "summerAllocatedProf", select: "fullName" },
          ],
        },
        {
          path: "MajorGroup",
          populate: [
            { path: "org", select: "companyName" },
            { path: "majorAllocatedProf", select: "fullName" },
          ],
        },
      ])
      .lean();

    if (!users || users.length === 0) {
      return res
        .status(200)
        .json(new ApiResponse(200, [], "No Alumni Records Found"));
    }

    const userIds = users.map((u) => u._id);
    const higherEducations = await HigherEducation.find({
      name: { $in: userIds },
    })
      .select("name institution degree fieldOfStudy startDate endDate docs")
      .lean();

    const higherEdByUser = new Map();
    higherEducations.forEach((edu) => {
      const key = edu.name.toString();
      if (!higherEdByUser.has(key)) higherEdByUser.set(key, []);
      higherEdByUser.get(key).push(edu);
    });

    const formattedAlumni = users.map((user) => {
      const workExperiences = (user.alumniWorkExperiences || []).sort(
        (a, b) => new Date(b.startDate) - new Date(a.startDate)
      );

      const summerGroup = user.group;
      const majorGroup = user.MajorGroup;

      return {
        _id: user._id,
        name: user.fullName || "",
        batch: user.batch,
        branch: user.branch || "",
        email: user.email || "",
        mobileNumber: user.mobileNumber || "",
        alternateEmail: user.alternateEmail || "",
        linkedin: user.linkedin || "",
        placement: user.placementOne
          ? {
              company: user.placementOne.company || "",
              role: user.placementOne.role || "",
              ctc: user.placementOne.ctc ?? "",
              date: user.placementOne.date
                ? new Date(user.placementOne.date).toISOString().slice(0, 10)
                : "",
              doc: user.placementOne.doc || "",
            }
          : null,
        summerIndustrial:
          summerGroup && summerGroup.typeOfSummer === "industrial"
            ? { org: summerGroup.org?.companyName || "BIT" }
            : null,
        majorIndustrial:
          majorGroup && majorGroup.type === "industrial"
            ? { org: majorGroup.org?.companyName || "BIT" }
            : null,
        higherEducations: higherEdByUser.get(user._id.toString()) || [],
        workExperiences,
        totalExperiences: workExperiences.length,
      };
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          formattedAlumni,
          "All alumni records retrieved successfully"
        )
      );
  } catch (error) {
    console.error("Error in getAllAlumni:", error);
    throw new ApiError(500, error.message || "Error retrieving alumni records");
  }
});

const getAlumniBatches = asyncHandler(async (_req, res) => {
  const batches = await User.distinct("batch");
  const sorted = batches
    .filter((value) => value !== null && value !== undefined)
    .sort((a, b) => a - b);

  return res
    .status(200)
    .json(new ApiResponse(200, sorted, "Alumni batches retrieved"));
});

// Send donation email
const sendDonationEmail = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const user = await User.findById(userId).select(
    "fullName email batch"
  );

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (!user.email) {
    throw new ApiError(400, "Alumni email not found");
  }

  // console.log("Printing alumni", alumni);

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.AUTH_EMAIL,
      pass: process.env.AUTH_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.AUTH_EMAIL,
    to: "ankitvsv0311@gmail.com", // CSE Department email
    cc: user.email, // Alumni email
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
            <p><span class="highlight">Name:</span> ${user.fullName}</p>
            <p><span class="highlight">Email:</span> ${user.email}</p>
            <p><span class="highlight">Batch:</span> ${user.batch}</p>
            <p><span class="highlight">Program:</span> ${user.alumniProgram}</p>
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
    .json(
      new ApiResponse(200, null, "Donation interest email sent successfully")
    );
});

// Get alumni profile
const getAlumniProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const user = await User.findById(userId).select(
    "fullName email batch branch alumniWorkExperiences"
  );

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const alumniProfile = {
    user: user._id,
    name: user.fullName,
    batch: user.batch,
    branch: user.branch,
    workExperiences: user.alumniWorkExperiences || [],
  };

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        alumniProfile,
        "Alumni profile retrieved successfully"
      )
    );
});

const updateAlumniProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Alumni profile updated successfully"));
});

const getAlumniSummary = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const user = await User.findById(userId)
    .select(
      "fullName rollNumber email alternateEmail mobileNumber branch section batch linkedin placementOne placementTwo placementThree group MajorGroup alumniWorkExperiences"
    )
    .populate([
      { path: "placementOne", select: "company role ctc date doc" },
      { path: "placementTwo", select: "company role ctc date doc" },
      { path: "placementThree", select: "company role ctc date doc" },
      {
        path: "group",
        populate: [
          { path: "org", select: "companyName" },
          { path: "summerAllocatedProf", select: "fullName idNumber" },
        ],
      },
      {
        path: "MajorGroup",
        populate: [
          { path: "org", select: "companyName" },
          { path: "majorAllocatedProf", select: "fullName idNumber" },
        ],
      },
    ]);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const higherEducations = await HigherEducation.find({ name: userId }).select(
    "institution degree fieldOfStudy startDate endDate docs"
  );

  const summerGroup = user.group;
  const majorGroup = user.MajorGroup;

  const summary = {
    user,
    alumni: {
      user: user._id,
      name: user.fullName,
      batch: user.batch,
      branch: user.branch,
      workExperiences: user.alumniWorkExperiences || [],
    },
    higherEducations,
    placements: {
      placementOne: user.placementOne || null,
      placementTwo: user.placementTwo || null,
      placementThree: user.placementThree || null,
    },
    summerIndustrial:
      summerGroup && summerGroup.typeOfSummer === "industrial"
        ? {
            groupId: summerGroup.groupId,
            org: summerGroup.org?.companyName || "BIT",
            projectTitle: summerGroup.projectTitle || "",
            mentor: summerGroup.summerAllocatedProf?.fullName || "",
          }
        : null,
    majorIndustrial:
      majorGroup && majorGroup.type === "industrial"
        ? {
            groupId: majorGroup.groupId,
            org: majorGroup.org?.companyName || "BIT",
            projectTitle: majorGroup.projectTitle || "",
            mentor: majorGroup.majorAllocatedProf?.fullName || "",
          }
        : null,
    workExperiences: user.alumniWorkExperiences || [],
  };

  return res
    .status(200)
    .json(new ApiResponse(200, summary, "Alumni summary retrieved"));
});

const getAlumniReport = asyncHandler(async (req, res) => {
  const { batch } = req.query;
  if (!batch) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Batch is required."));
  }

  const batchNumber = Number(batch);
  if (Number.isNaN(batchNumber)) {
    throw new ApiError(400, "Invalid batch query parameter");
  }

  const users = await User.find({ batch: batchNumber })
    .select(
      "fullName rollNumber email alternateEmail mobileNumber branch section batch alumniWorkExperiences placementOne placementTwo placementThree group MajorGroup"
    )
    .populate([
      { path: "placementOne", select: "company role ctc date" },
      { path: "placementTwo", select: "company role ctc date" },
      { path: "placementThree", select: "company role ctc date" },
      {
        path: "group",
        populate: [
          { path: "org", select: "companyName" },
          { path: "summerAllocatedProf", select: "fullName idNumber" },
        ],
      },
      {
        path: "MajorGroup",
        populate: [
          { path: "org", select: "companyName" },
          { path: "majorAllocatedProf", select: "fullName idNumber" },
        ],
      },
    ])
    .lean();

  if (!users || users.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, [], "No Alumni Records Found"));
  }

  const userIds = users.map((user) => user._id);

  const higherEducations = await HigherEducation.find({
    name: { $in: userIds },
  }).select("name institution degree fieldOfStudy startDate endDate");

  const higherEdByUser = new Map();
  higherEducations.forEach((edu) => {
    const key = edu.name.toString();
    if (!higherEdByUser.has(key)) {
      higherEdByUser.set(key, []);
    }
    higherEdByUser.get(key).push(edu);
  });

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "";
    }
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) {
      return "";
    }
    return date.toISOString().slice(0, 10);
  };

  const formatPlacement = (placement) => {
    if (!placement) {
      return "";
    }
    const date = formatDate(placement.date);
    return `${placement.company || ""} | ${placement.role || ""} | ${
      placement.ctc ?? ""
    } | ${date}`.trim();
  };

  const formatHigherEducation = (entries) => {
    if (!entries || entries.length === 0) {
      return "";
    }
    return entries
      .map((edu) => {
        const start = formatDate(edu.startDate);
        const end = formatDate(edu.endDate);
        return `${edu.institution || ""} (${edu.degree || ""}, ${
          edu.fieldOfStudy || ""
        }) ${start}-${end}`.trim();
      })
      .join(" | ");
  };

  const formatWorkExperiences = (entries) => {
    if (!entries || entries.length === 0) {
      return "";
    }
    return entries
      .map((exp) => {
        const start = formatDate(exp.startDate);
        const end = exp.isCurrentlyWorking
          ? "Present"
          : formatDate(exp.endDate);
        return `${exp.company || ""} (${exp.role || ""}, ${start}-${end})`;
      })
      .join(" | ");
  };

  const reportRows = users.map((user) => {
    const summerGroup = user.group;
    const majorGroup = user.MajorGroup;

    const summerIndustrial =
      summerGroup && summerGroup.typeOfSummer === "industrial"
        ? `${summerGroup.org?.companyName || "BIT"} | ${
            summerGroup.projectTitle || ""
          }`
        : "";

    const majorIndustrial =
      majorGroup && majorGroup.type === "industrial"
        ? `${majorGroup.org?.companyName || "BIT"} | ${
            majorGroup.projectTitle || ""
          }`
        : "";

    const higherEd = higherEdByUser.get(user._id?.toString()) || [];

    return {
      name: user.fullName || "",
      rollNumber: user.rollNumber || "",
      email: user.email || "",
      alternateEmail: user.alternateEmail || "",
      mobileNumber: user.mobileNumber || "",
      branch: user.branch || "",
      batch: user.batch || "",
      higherEducation: formatHigherEducation(higherEd),
      placementOne: formatPlacement(user.placementOne),
      placementTwo: formatPlacement(user.placementTwo),
      placementThree: formatPlacement(user.placementThree),
      summerIndustrial,
      majorIndustrial,
      workExperiences: formatWorkExperiences(user.alumniWorkExperiences || []),
    };
  });

  return res
    .status(200)
    .json(new ApiResponse(200, reportRows, "Alumni report retrieved"));
});

export {
  addWorkExperience,
  createAlumni,
  deleteWorkExperience,
  getAlumniBatches,
  getAllAlumni,
  getAlumniProfile,
  getAlumniStatus,
  getAlumniSummary,
  getAlumniReport,
  getWorkExperiences,
  sendDonationEmail,
  updateAlumniProfile,
};
