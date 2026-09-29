import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import { Backlog } from "../models/backlog.model.js";

const addbacklogSubject = asyncHandler(async (req, res) => {
  const { subjectCode, subjectName } = req.body;
  console.log(subjectCode, subjectName);
  if (!subjectCode || !subjectName) {
    throw new ApiError(400, "Subject code and name are required");
  }

  const existing = await Backlog.findOne({
    subjectCode: subjectCode,
  });
  if (existing) {
    throw new ApiError(400, "Subject already exists");
  }
  const backlog = await Backlog.create({ subjectCode, subjectName });
  if (!backlog) {
    throw new ApiError(500, "Something went wrong while adding the subject");
  }
  return res
    .status(201)
    .json(new ApiResponse(200, backlog, "Subject added successfully"));
});

const getAllBacklogSubjects = asyncHandler(async (req, res) => {
  const backlogs = await Backlog.find();
  if (!backlogs) {
    throw new ApiError(404, "No subjects found");
  }
  return res.status(200).json(new ApiResponse(200, backlogs, "Subjects found"));
});

const addBacklogbyUser = asyncHandler(async (req, res) => {
  const { backlogid } = req.body;

  if (!mongoose.Types.ObjectId.isValid(backlogid)) {
    throw new ApiError(400, "Invalid backlog ID");
  }

  // console.log('Backlog ID:', backlogid);

  const user = req?.user;
  // console.log('User:', user);

  if (!user) throw new ApiError(401, "User not authenticated");

  const student = await User.findById(user._id);
  // console.log('Student:', student);

  if (!student) throw new ApiError(401, "Student not found");
  const backlogExists = student.backlogs.some((id) => id.equals(backlogid));
  if (backlogExists) {
    throw new ApiError(400, "Backlog already added");
  }

  student.backlogs.push(backlogid);
  await student.save();

  res.status(200).json({
    success: true,
    message: "Backlog added successfully",
    data: student.backlogs,
  });
});

const getBacklogsbyUser = asyncHandler(async (req, res) => {
  const user = req?.user;
  // console.log('User:', user);

  if (!user) throw new ApiError(401, "User not authenticated");

  const student = await User.findById(user._id).populate("backlogs");
  // console.log('Student:', student);
  const backlog = student.backlogs;
  return res
    .status(200)
    .json(new ApiResponse(200, backlog, "All backlogs fetched"));
});

export {
  addbacklogSubject,
  getAllBacklogSubjects,
  addBacklogbyUser,
  getBacklogsbyUser,
};
