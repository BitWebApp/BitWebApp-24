import jwt from "jsonwebtoken";
import { Admin } from "../models/admin.model.js";
import { Professor } from "../models/professor.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");
    // console.log(token);
    if (!token) {
      throw new ApiError(401, "Unauthorized request!");
    }
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );
    if (!user) {
      throw new ApiError(401, "Invalid Acess Token");
    }
    if (!user.isVerified) {
      throw new ApiError(403, "You are not verified yet!");
    }
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Access Token");
  }
});

const verifyAdmin = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      throw new ApiError(401, "Unauthorized request!");
    }
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    if (!decodedToken.isAdmin) {
      throw new ApiError(403, "Access forbidden: Admins only");
    }
    const admin = await Admin.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );
    if (!admin) {
      throw new ApiError(401, "Invalid Access Token!");
    }
    // if (!admin.isAdmin) {
    //   throw new ApiError(403, "You are not verified as an admin yet!");
    // }
    req.admin = admin;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Access Token!!");
  }
});

const verifyProfessor = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      throw new ApiError(401, "Unauthorized request!");
    }
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const professor = await Professor.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );
    if (!professor) {
      throw new ApiError(401, "Invalid Access Token");
    }
    req.professor = professor;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Access Token");
  }
});

/**
 * Middleware to verify that the admin is a master admin.
 * Must be used after verifyAdmin middleware or in place of it.
 */
const verifyMasterAdmin = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      throw new ApiError(401, "Unauthorized request!");
    }
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    if (!decodedToken.isAdmin) {
      throw new ApiError(403, "Access forbidden: Admins only");
    }
    const admin = await Admin.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );
    if (!admin) {
      throw new ApiError(401, "Invalid Access Token!");
    }
    if (admin.role !== "master") {
      throw new ApiError(403, "Access forbidden: Master admins only");
    }
    req.admin = admin;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Access Token!!");
  }
});

/**
 * Middleware factory to verify that the admin has access to a specific batch.
 * @param {Function} getBatchFromReq - Function that extracts batch number from request
 * @returns {Function} Express middleware
 */
const verifyBatchAccess = (getBatchFromReq) =>
  asyncHandler(async (req, res, next) => {
    const admin = req.admin;
    if (!admin) {
      throw new ApiError(401, "Admin not authenticated");
    }

    // Master admins have access to all batches
    if (admin.role === "master") {
      return next();
    }

    const batch = getBatchFromReq(req);
    if (batch === null || batch === undefined) {
      // If no batch is specified, allow access (will be filtered later)
      return next();
    }

    // Coerce batch to number for consistent comparison with assignedBatches
    const batchId = Number(batch);
    if (Number.isNaN(batchId)) {
      // Invalid batch value, treat as no batch specified
      return next();
    }

    // Check if admin has access to this batch
    if (!admin.assignedBatches || !admin.assignedBatches.includes(batchId)) {
      throw new ApiError(403, `Access forbidden: You don't have access to batch K${batchId}`);
    }

    next();
  });

export { verifyAdmin, verifyBatchAccess, verifyJWT, verifyMasterAdmin, verifyProfessor };

