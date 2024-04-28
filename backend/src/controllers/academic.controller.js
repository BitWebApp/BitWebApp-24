import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { Academics } from "../models/academic.model.js"
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createAcademicRecord = asyncHandler(async(req, res)=>{
    const {name, semester, cgpa} = req.body;

    if(!semester || !cgpa){
        throw new ApiError(400, "Semester and CGPA are required fields.");
    }

    const academicRecord = await Academics.create({
        name,
        semester,
        cgpa,
    });

    return res.status(201).json(
        new ApiResponse(200, "Academic record created successfully.")
    );
});

const getAcademicRecords = asyncHandler(async(req, res)=>{
    const userId = req.user._id;

    const academicRecords = await Academics.find({name : userId}).select("-__v");

    return res.status(200).json(
        new ApiResponse(200, academicRecords, "Academic records retrieved successfully.")
    );
});

const updateAcademicRecords = asyncHandler(async(req, res)=>{
    const { semester, cgpa } = req.body;
    const academicId = req.params.id;

    if(!semester || !cgpa){
        throw new ApiError(400, "Semester and CGPA are required fields.");
    }

    const updatedAcademicRecord = await Academics.findByIdAndUpdate(
        academicId, 
        { $set: {semester, cgpa}},
        { new: true}
    ).select("-__v");

    return res.status(200).json(
        new ApiResponse(200, updatedAcademicRecord, "Academic record updated successfully.")
    );
});

export { createAcademicRecord , getAcademicRecords, updateAcademicRecords };
