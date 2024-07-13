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

const addBacklogbyUser = asyncHandler(async(req, res) => {
  const backlogid = req.body
  const user = req?.user
  const student = User.findById({_id: user._id})
  if(!student) throw new ApiError(401, "Student not found")
  if(student.backlogs.includes(backlogid)) throw new ApiError(400, "Backlog already added")
  student.backlogs.push(backlogid)
  student.save();
})


export { addbacklogSubject, getAllBacklogSubjects, addBacklogbyUser };
