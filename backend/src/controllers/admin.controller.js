import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { Admin } from "../models/admin.model.js";

const getUnverifiedUsers = asyncHandler(async (req, res) => {
  try {
    const users = await User.find({ isVerified: false }).select(
      "-password -refreshToken"
    );
    const us = users.map((user) => ({
      _id: user._id,
      name: user.name,
      rollNumer: user.rollNumber,
      idCard: user.idCard,
    }));
    return res.json(new ApiResponse(200, { us }));
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while fetching unverified users"
    );
  }
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
  if (!admin.isAdmin) {
    throw new ApiError(403, "You are not verified as an admin yet!");
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

export {
  getUnverifiedUsers,
  verifyUser,
  registerAdmin,
  loginAdmin,
  logoutAdmin,
  getCurrendAdmin,
};
