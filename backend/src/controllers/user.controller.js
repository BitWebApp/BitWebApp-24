import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { Otp } from "../models/otp.model.js";
import { Placement } from "../models/placement.model.js";
import nodemailer from "nodemailer";
import bcrypt from "bcrypt";
import cron from "node-cron";
import { Professor } from "../models/professor.model.js";

const generateAcessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and acess token!"
    );
  }
};

const verifyMail = asyncHandler(async (req, res) => {
  try {
    const { email } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000);
    const existedUser = await User.findOne({ email });

    if (existedUser) {
      throw new ApiError(409, "User with email/username already exists");
    }
    await Otp.create({ email, otp });

    const tOtp = await Otp.findOne({ email });
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
      subject: "OTP for Verification",
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
            .otp {
              font-weight: bold;
              color: #007bff;
              font-size: 22px;
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
              OTP for Verification
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>Thank you for choosing BITAcademia. To complete your verification process, please use the following One-Time Password (OTP):</p>
              <p class="otp">${tOtp.otp}</p>
              <p>If you did not request this OTP, please ignore this email or contact our support team.</p>
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

    res.status(200).send("Mail sent!");
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

const registerUser = asyncHandler(async (req, res) => {
  const { username, password, fullName, rollNumber, email, usrOTP, batch } = req.body;
  const otpEntry = await Otp.findOne({ email });

  if (!otpEntry || usrOTP.toString() !== otpEntry.otp.toString()) {
    console.log("Invalid OTP:", usrOTP, otpEntry.otp);
    return res.status(400).json({
      success: false,
      message: "Invalid OTP",
    });
    // throw new ApiError(400, "wrong otp, validation failed");
  }

  await Otp.deleteOne({ email });

  // Validate required string fields
  const stringFields = [username, password, fullName, rollNumber, email];
  const hasInvalidStringField = stringFields.some(
    (f) => typeof f !== "string" || f.trim() === ""
  );
  if (hasInvalidStringField) {
    console.log("All fields are req");
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  // Validate batch separately (accept number or numeric string)
  const batchNumber = Number(batch);
  if (batch === undefined || batch === null || batch === "" || Number.isNaN(batchNumber)) {
    console.log("Batch is required and must be a valid number");
    return res.status(400).json({
      success: false,
      message: "Batch is required and must be a valid number",
    });
  }
  // use numeric batch value going forward
  req.body.batch = batchNumber;

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    console.log("User with email/username already exists");
    return res.status(409).json({
      success: false,
      message: "User with email/username already exists",
    });
    // throw new ApiError(409, "User with email/username already exists");
  }

  const idLocalPath = req.files?.idCard[0]?.path;
  if (!idLocalPath) {
    console.log("idCard file is required");
    return res.status(400).json({
      success: false,
      message: "idCard file is required",
    });
    // throw new ApiError(400, "idCard file is required:");
  }

  const idCard = await uploadOnCloudinary(idLocalPath);
  if (!idCard) {
    console.log("id card file is cannot be uploaded");
    return res.status(500).json({
      success: false,
      message: "id card file is cannot be uploaded",
    });
    // throw new ApiError(500, "id card file is cannot be uploaded");
  }

  const user = await User.create({
    username: username.toLowerCase(),
    password,
    fullName,
    rollNumber,
    email,
    idCard: idCard.url,
    batch,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    console.log("Something went wrong while registering the user");
    return res.status(500).json({
      success: false,
      message: "Something went wrong while registering the user",
    });
    // throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    console.log("Email is required");
    return res.status(400).json({
      success: false,
      message: "Email is required",
    });
  }
  const user = await User.findOne({
    email: email.toLowerCase(),
  });

  if (!user) {
    console.log("User does not exists.");
    return res.status(404).json({
      success: false,
      message: "User does not exists",
    });
  }
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    console.log("Invalid Credentials!");
    return res.status(401).json({
      success: false,
      message: "Invalid Credentials!",
    });
    // throw new ApiError(401, "Invalid Credentials!");
  }
  const { accessToken, refreshToken } = await generateAcessAndRefreshToken(
    user._id
  );
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!user.isVerified) {
    console.log("You are not verified yet!");
    return res.status(403).json({
      success: false,
      message: "You are not verified yet!",
    });

    //throw new ApiError(403, "You are not verified yet!");
  }
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User loggedIn successfully!"
      )
    );
});
export const otpForgotPass = asyncHandler(async (req, res) => {
  // console.log(req.body);
  const { email } = req.body;
  console.log(email);
  if (!email) {
    throw new ApiError(400, "email is req");
  }
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new ApiError(404, "User does not exists");
  }
  const otp = `${Math.floor(Math.random() * 9000 + 1000)}`;
  await Otp.create({ email, otp });

  const tOtp = await Otp.findOne({ email });
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
    subject: "Forgot Password",
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
            .otp {
              font-weight: bold;
              color: #007bff;
              font-size: 22px;
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
              OTP for Verification
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>Thank you for choosing BITAcademia. To reset your password, please use the following One-Time Password (OTP):</p>
              <p class="otp">${tOtp.otp}</p>
              <p>If you did not request this OTP, please ignore this email or contact our support team.</p>
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
  res.status(200).send("Mail sent!");
});

const changepassword = asyncHandler(async (req, res) => {
  try {
    // console.log("hello")
    const { email, otp, newpassword } = req.body;
    if (!email || !otp || !newpassword)
      throw new ApiError(400, "enter all fields");
    const user = await User.findOne({ email });
    // console.log(user)
    const otpverify = await Otp.find({
      email,
    });
    // console.log(otpverify)
    if (otpverify.length <= 0) {
      throw new ApiError(
        401,
        "Account record doesn't exist or has been verified already. please login"
      );
    }
    const hashedOTP = otpverify[0].otp;
    // console.log(hashedOTP)
    const validOTP = otp === hashedOTP;
    // console.log(validOTP)
    if (!validOTP) {
      throw new ApiError("Invalid code. Check your Inbox");
    } else {
      const savepass = await bcrypt.hash(newpassword, 12);
      const response = await User.updateOne(
        { _id: user?._id },
        { $set: { password: savepass } }
      );
      await Otp.deleteMany({ email });
      return res.json({
        status: "Verified",
        message: "user email verified successfully",
        response,
      });
    }
  } catch (error) {
    console.log(error);
    res.json({
      status: "Failed",
      message: error.message,
    });
  }
});
const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
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
    .json(new ApiResponse(200, {}, "User logged out successfully!"));
});

const updateUser1 = asyncHandler(async (req, res) => {
  const {
    fullName,
    rollNumber,
    email,
    branch,
    section,
    mobileNumber,
    semester,
    cgpa,
    leetcode,
    codeforces,
    codechef,
    github,
    atcoder,
    linkedin,
    abcId,
    graduationYear,
    workExp,
    // New fields from req.body
    alternateEmail,
    fatherName,
    fatherMobileNumber,
    motherName,
    residentialAddress,
  } = req.body;

  const updateFields = {};

  // Handle image upload
  if (req.files && req.files.image && req.files.image[0]) {
    const imageLocalPath = req.files.image[0].path;

    try {
      const imagePath = await uploadOnCloudinary(imageLocalPath);
      if (!imagePath) {
        throw new ApiError(400, "Image upload failed");
      }
      updateFields["image"] = imagePath.url;
    } catch (error) {
      throw new ApiError(400, `Image upload failed: ${error.message}`);
    }
  }

  // Handle resume upload
  if (req.files && req.files.resume && req.files.resume[0]) {
    const resumeLocalPath = req.files.resume[0].path;

    try {
      const resumePath = await uploadOnCloudinary(resumeLocalPath);
      if (!resumePath) {
        throw new ApiError(400, "Resume upload failed");
      }
      updateFields["resume"] = resumePath.url;
    } catch (error) {
      throw new ApiError(400, `Resume upload failed: ${error.message}`);
    }
  }

  // Define fields to update
  const fieldsToUpdate = {
    fullName,
    rollNumber,
    email,
    branch,
    section,
    mobileNumber,
    semester,
    cgpa,
    "codingProfiles.leetcode": leetcode,
    "codingProfiles.codeforces": codeforces,
    "codingProfiles.codechef": codechef,
    "codingProfiles.atcoder": atcoder,
    "codingProfiles.github": github,
    linkedin,
    abcId,
    graduationYear,
    workExp,
    // New fields mapping
    alternateEmail,
    fatherName,
    fatherMobileNumber,
    motherName,
    residentialAddress,
  };

  // Add provided fields to updateFields
  Object.keys(fieldsToUpdate).forEach((field) => {
    if (fieldsToUpdate[field]) {
      updateFields[field] = fieldsToUpdate[field];
    }
  });

  // Ensure at least one field is provided for update
  if (Object.keys(updateFields).length === 0) {
    throw new ApiError(400, "At least one field is required for update");
  }

  try {
    // Update user details
    const user = await User.findByIdAndUpdate(
      req.user?._id,
      { $set: updateFields },
      { new: true, runValidators: true } // Ensure validators are run
    ).select("-password");

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, user, "User details updated successfully!"));
  } catch (error) {
    throw new ApiError(500, `Internal server error: ${error.message}`);
  }
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const _id = req?.user?._id;
  const user = await User.findById({ _id });
  if (!user) throw new ApiError(404, "user not found");
  // console.log(user)
  res.status(200).json(new ApiResponse(200, user, "user fetched"));
});

const updatePlacementOne = asyncHandler(async (req, res) => {
  const { company, role, ctc, date } = req.body;

  if (!company || !role || !ctc || !date) {
    throw new ApiError(400, "All fields are required");
  }

  const idLocalPath = req.files?.doc[0]?.path;
  if (!idLocalPath) {
    throw new ApiError(400, "doc file is required");
  }

  const doc = await uploadOnCloudinary(idLocalPath);
  if (!doc) {
    throw new ApiError(400, "doc file is required");
  }

  const placement = await Placement.create({
    student: req.user._id,
    company,
    role,
    ctc,
    date,
    doc: doc.url,
  });

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        placementOne: placement._id,
      },
    },
    { new: true }
  );

  if (!updatedUser) {
    throw new ApiError(
      500,
      "Something went wrong while updating the placement details"
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedUser,
        "Placement details updated successfully!"
      )
    );
});
const updatePlacementTwo = asyncHandler(async (req, res) => {
  const { company, role, ctc, date } = req.body;

  if (!company || !role || !ctc || !date) {
    throw new ApiError(400, "All fields are required");
  }

  const idLocalPath = req.files?.doc[0]?.path;
  if (!idLocalPath) {
    throw new ApiError(400, "doc file is required");
  }

  const doc = await uploadOnCloudinary(idLocalPath);
  if (!doc) {
    throw new ApiError(400, "doc file is required");
  }

  const placement = await Placement.create({
    student: req.user._id,
    company,
    role,
    ctc,
    date,
    doc: doc.url,
  });

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        placementTwo: placement._id,
      },
    },
    { new: true }
  );

  if (!updatedUser) {
    throw new ApiError(
      500,
      "Something went wrong while updating the placement details"
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedUser,
        "Placement details updated successfully!"
      )
    );
});

const updatePlacementThree = asyncHandler(async (req, res) => {
  const { company, role, ctc, date } = req.body;

  if (!company || !role || !ctc || !date) {
    throw new ApiError(400, "All fields are required");
  }

  const idLocalPath = req.files?.doc[0]?.path;
  if (!idLocalPath) {
    throw new ApiError(400, "doc file is required");
  }

  const doc = await uploadOnCloudinary(idLocalPath);
  if (!doc) {
    throw new ApiError(400, "doc file is required");
  }

  const placement = await Placement.create({
    student: req.user._id,
    company,
    role,
    ctc,
    date,
    doc: doc.url,
  });

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        placementThree: placement._id,
      },
    },
    { new: true }
  );

  if (!updatedUser) {
    throw new ApiError(
      500,
      "Something went wrong while updating the placement details"
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedUser,
        "Placement details updated successfully!"
      )
    );
});

const getPlacementOne = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("placementOne");
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const placement = user.placementOne;
    if (!placement) {
      return res
        .status(200)
        .json(new ApiResponse(200, null, "No placement data found"));
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, placement, "Placement data retrieved successfully")
      );
  } catch (error) {
    throw new ApiError(
      500,
      "An error occurred while retrieving placement data"
    );
  }
});

const getPlacementTwo = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("placementTwo");
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const placement = user.placementTwo;
    if (!placement) {
      return res
        .status(200)
        .json(new ApiResponse(200, null, "No placement data found"));
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, placement, "Placement data retrieved successfully")
      );
  } catch (error) {
    throw new ApiError(
      500,
      "An error occurred while retrieving placement data"
    );
  }
});

const getPlacementThree = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("placementThree");
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const placement = user.placementThree;
    if (!placement) {
      return res
        .status(200)
        .json(new ApiResponse(200, null, "No placement data found"));
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, placement, "Placement data retrieved successfully")
      );
  } catch (error) {
    throw new ApiError(
      500,
      "An error occurred while retrieving placement data"
    );
  }
});

const fetchBranch = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("branch");
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user.branch, "Branch fetched successfully"));
});

const getUserbyRoll = asyncHandler(async (req, res) => {
  const { rollNumber, isAdmin } = req.body;

  let query = User.findOne({ rollNumber: rollNumber });


  if (!isAdmin) {
    query = query.select(
      "-password -username -refreshToken -fatherName -fatherMobileNumber -motherName -residentialAddress -alternateEmail -alumni -awards -backlogs -codingProfiles -companyInterview -createdAt -exams -graduationYear -group -groupReq -higherEd -idCard -isSummerAllocated -isVerified -linkedin -marks -mobileNumber -peCourses -proj -resume -summerAppliedProfs -updatedAt -workExp -__v -abcId"
    );
    query = query
      .populate("internShips", "company role startDate endDate")
      .populate("placementOne", "company role ctc date")
      .populate("placementTwo", "company role ctc date")
      .populate("placementThree", "company role ctc date");
  } else {
    query = query
      .populate("placementOne")
      .populate("placementTwo")
      .populate("placementThree")
      .populate("proj")
      .populate("awards")
      .populate("higherEd")
      .populate("internShips")
      .populate("exams")
      .populate("academics")
      .populate("backlogs");
  }

  const user = await query;

  if (!user) {
    return res.status(404).json(new ApiResponse(404, null, "User not found"));
  }

  return res.status(200).json(new ApiResponse(200, user, "User data fetched"));
});

const getPlacementDetails = asyncHandler(async (req, res) => {
  try {
    const { batch } = req.query;

    // Convert batch query (string) to number and validate
    const filter = {};
    if (batch !== undefined) {
      const batchNumber = Number(batch);
      if (Number.isNaN(batchNumber)) {
        throw new ApiError(400, "Invalid batch query parameter");
      }
      filter.batch = batchNumber;
    }

    const users = await User.find(filter).populate([
      { path: "placementOne", select: "company ctc", model: Placement },
      { path: "placementTwo", select: "company ctc" },
      { path: "placementThree", select: "company ctc" },
    ]);

    const us = users.map((user) => ({
      fullName: user.fullName,
      rollNumber: user.rollNumber,
      branch: user.branch,
      placementOne: user.placementOne
        ? { company: user.placementOne.company, ctc: user.placementOne.ctc }
        : null,
      placementTwo: user.placementTwo
        ? { company: user.placementTwo.company, ctc: user.placementTwo.ctc }
        : null,
      placementThree: user.placementThree
        ? { company: user.placementThree.company, ctc: user.placementThree.ctc }
        : null,
    }));
    return res
      .status(200)
      .json(
        new ApiResponse(200, us, "Placement details fetched successfully!")
      );
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while fetching placement details"
    );
  }
});
const getAllUsers = asyncHandler(async (req, res) => {
  const { batch } = req.query;

  // Convert batch query (string) to number and validate
  const filter = {};
  if (batch !== undefined) {
    const batchNumber = Number(batch);
    if (Number.isNaN(batchNumber)) {
      throw new ApiError(400, "Invalid batch query parameter");
    }
    filter.batch = batchNumber;
  }

  const users = await User.find(filter)
    .populate("placementOne")
    .populate("placementTwo")
    .populate("placementThree")
    .populate("proj")
    .populate("awards")
    .populate("higherEd")
    .populate("internShips")
    .populate("exams")
    .populate("academics")
    .populate("cgpa")
    .populate("backlogs");
  return res
    .status(200)
    .json(new ApiResponse(200, { users }, "all users fetched"));
});

cron.schedule("0 0 1 1,8 *", async () => {
  console.log("Running semester update...");
  await updateSemesterForAllUsers();
  console.log("Semester update completed!");
});

const getAppliedProfs = asyncHandler(async (req, res) => {
  const userid = req?.user?._id;
  const user = await User.findById(userid).populate("summerAppliedProfs");

  let prof = null;

  if (user.isSummerAllocated && user.summerAllocatedProf) {
    prof = await Professor.findById(user.summerAllocatedProf);
  }
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        summerAppliedProfs: user.summerAppliedProfs,
        isSummerAllocated: user.isSummerAllocated,
        prof: prof,
      },
      "Applied profs and allocation details returned"
    )
  );
});

const summerSorted = asyncHandler(async (req, res) => {
  const summer = await User.findById(req?.user?._id);
  return res
    .status(200)
    .json(
      new ApiResponse(200, summer.isSummerAllocated, "Returned summer status")
    );
});
export {
  registerUser,
  loginUser,
  logoutUser,
  updateUser1,
  updatePlacementOne,
  updatePlacementTwo,
  updatePlacementThree,
  getPlacementDetails,
  getCurrentUser,
  getUserbyRoll,
  getPlacementOne,
  getPlacementTwo,
  getPlacementThree,
  getAllUsers,
  verifyMail,
  fetchBranch,
  changepassword,
  getAppliedProfs,
  summerSorted,
};
