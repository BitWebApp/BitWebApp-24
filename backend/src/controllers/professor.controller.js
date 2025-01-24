import { Professor } from "../models/professor.model.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Internship } from "../models/internship.model.js";
import crypto from "crypto";
import nodemailer from "nodemailer";
import bcrypt from "bcrypt";
import mongoose, { mongo } from "mongoose";
const url = "https://bitacademia.vercel.app/log.a";

const addProf = asyncHandler(async (req, res) => {
  const { idNumber, fullName, contact, email } = req.body;
  if (!idNumber || !fullName || !contact || !email) {
    throw new ApiError(
      400,
      "All fields (idNumber, fullName, contact, email) are required!"
    );
  }
  const existingProfessor = await Professor.findOne({ idNumber });
  const existingEmail = await Professor.findOne({ email });
  if (existingEmail) {
    throw new ApiError(409, "Professor with this email already exists!");
  }
  if (existingProfessor) {
    throw new ApiError(409, "Professor with this ID number already exists!");
  }
  const password = crypto.randomInt(100000, 1000000).toString();
  const hashedPassword = await bcrypt.hash(password, 10);
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
    subject: "Your Account Password",
    html: `
      <body>
        <h2>Welcome to BITAcademia!</h2>
        <p>Your account has been created. Below are your credentials:</p>
        <p>Email: <strong>${email}</strong></p>
        <p>Password: <strong>${password}</strong></p>
        <p>Click <a href="${url}">here</a> to login.</p>
        <p>If you did not request this account, please contact our support team.</p>
        <footer>
          <p>&copy; BITAcademia 2024. All rights reserved.</p>
        </footer>
      </body>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent to:", email);
  } catch (error) {
    console.error("Error sending email to:", email, error.message);
    return res
      .status(500)
      .json(new ApiError(500, `Error sending email to: ${email}`));
  }

  const professor = await Professor.create({
    idNumber,
    fullName,
    contact,
    email,
    password: hashedPassword,
  });

  res
    .status(201)
    .json(new ApiResponse(201, "Professor added successfully!", professor));
});

const getProf = asyncHandler(async (req, res) => {
  const professors = await Professor.find();
  res
    .status(200)
    .json(
      new ApiResponse(200, "Professors retrieved successfully!", professors)
    );
});

const generateAcessAndRefreshToken = async (profId) => {
  try {
    const prof = await Professor.findById(profId);
    const accessToken = prof.generateAccessToken();
    const refreshToken = prof.generateRefreshToken();
    prof.refreshToken = refreshToken;
    await prof.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    console.log(error);
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and acess token!"
    );
  }
};
const loginProf = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new ApiError(400, "Email and password are required!");
  }
  const professor = await Professor.findOne({ email });
  if (!professor) {
    throw new ApiError(404, "Professor not found!");
  }
  const isPasswordValid = await professor.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password!");
  }
  const { accessToken, refreshToken } = await generateAcessAndRefreshToken(
    professor._id
  );
  const loggedInProfessor = await Professor.findById(professor._id).select(
    "-password -refeshToken"
  );
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
          professor: loggedInProfessor,
          accessToken,
          refreshToken,
        },
        "User loggedIn successfully!"
      )
    );
});
const logoutProf = asyncHandler(async (req, res) => {
  await Professor.findByIdAndUpdate(
    req.professor._id,
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
    .json(new ApiResponse(200, {}, "Prof logged out successfully!"));
});

//***************************************************/
const applyToSummer = asyncHandler(async (req, res) => {
  const { profId } = req.body;
  // console.log(profId);
  const user = await User.findById(req.user._id);

  const prof = await Professor.findById(profId);
  if (!prof) {
    throw new ApiError(404, "Professor not found!");
  }
  if (!user) {
    throw new ApiError(404, "User not found!");
  }
  if (user.isSummerAllocated) {
    throw new ApiError(400, "You have already been allocated a professor!");
  }
  if (user.summerAppliedProfs.includes(profId)) {
    throw new ApiError(400, "You have already applied to this professor!");
  }
  user.summerAppliedProfs.push(profId);
  await user.save();
  res
    .status(200)
    .json(new ApiResponse(200, "Applied to professor successfully!", user));
});

//*************************************************************** */
const getAppliedStudents = asyncHandler(async (req, res) => {
  try {
    const profId = req.professor._id;
    const professor = await Professor.findById(profId);
    if (!professor) {
      throw new ApiError(404, "Professor not found!");
    }
    const students = await User.find({
      summerAppliedProfs: profId,
      isSummerAllocated: false,
    });
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          "Applied students retrieved successfully!",
          students
        )
      );
  } catch (error) {
    console.log(error);
    throw new ApiError(
      500,
      "Something went wrong while getting applied students!",
      error.message
    );
  }
});

const selectSummerStudents = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const profId = req.professor._id;
    const { selectedStudents } = req.body;
    const professor = await Professor.findById(profId).session(session);
    if (!professor) {
      throw new ApiError(404, "Professor not found!");
    }
    const remainingCap =
      professor.limits.summer_training - professor.currentCount.summer_training;
    if (selectedStudents.length > remainingCap) {
      throw new ApiError(
        400,
        `Cannot select more than ${remainingCap} students!`
      );
    }
    const students = await User.find({
      _id: { $in: selectedStudents },
      summerAppliedProfs: profId,
      isSummerAllocated: false,
    }).session(session);
    if (students.length !== selectedStudents.length) {
      throw new ApiError(400, "Invalid student ID's provided!");
    }
    for (const student of students) {
      // console.log(student);
      student.isSummerAllocated = true;
      student.summerAllocatedProf = profId;
      // console.log("check!");
      student.summerAppliedProfs = student.summerAppliedProfs.filter(
        (id) => id.toString() !== profId.toString()
      );
      await student.save({ session });
      // console.log("check2!");
      const internRecord = await Internship.create(
        [
          {
            student: student._id,
            type: "research",
            location: "inside_bit",
            mentor: profId,
            startDate: new Date(),
            endDate: new Date(),
          },
        ],
        { session }
      );
      // console.log("check3!");
      if (!internRecord) {
        throw new ApiError(500, "Failed to create internship record!");
      }
    }
    professor.students.summer_training.push(...selectedStudents);
    professor.currentCount.summer_training += selectedStudents.length;
    await professor.save({ session });
    await session.commitTransaction();
    res
      .status(200)
      .json(new ApiResponse(200, "Students selected successfully!", students));
  } catch (error) {
    await session.abortTransaction();
    console.log(error);
    throw new ApiError(
      500,
      "Something went wrong while selecting students!",
      error.message
    );
  } finally {
    session.endSession();
  }
});

export {
  addProf,
  getProf,
  loginProf,
  logoutProf,
  applyToSummer,
  getAppliedStudents,
  selectSummerStudents,
};
