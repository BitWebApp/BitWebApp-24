import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

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
export { getUnverifiedUsers };
