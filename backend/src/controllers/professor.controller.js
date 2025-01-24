import { Professor } from "../models/professor.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import crypto from "crypto";
import nodemailer from "nodemailer";
import bcrypt from "bcrypt";
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

export { addProf, getProf };
