import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Academics } from "../models/academic.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createAcademicRecord = asyncHandler(async (req, res) => {
    const { userId, semester, gpa } = req.body;
    if (!userId || !semester || !gpa) {
        throw new ApiError(400, "UserId, Semester and GPA are required fields.");
    }
    try {
        let academicRecord = await Academics.findOne({name : userId});

        if(!academicRecord) { // If no record exists, create a new one
            academicRecord = new Academics({
                name: userId,
                academicsRecords: [], // Initialize the array
            })
        }

        academicRecord.academicRecords.push({semester, gpa});
        await academicRecord.save();

        return res.status(201).json(
            new ApiResponse(200, "Academic record created successfully")
        )
    } catch (error) {
        console.error("Error creating academic record:", error);
    }
});

const getAcademicRecords = asyncHandler(async (req, res) => {

    const userId = req.user._id;

    // Retrieve all academic records
    const userExists = await Academics.exists({name: userId});
    if(!userExists){
        return res.status(404).json(
            new ApiResponse(404, null, "User not found.")
        );
    }

    const academicRecords = await Academics.findOne({name: userId}).select("-__v");

    return res.status(200).json(
        new ApiResponse(200, academicRecords, "Academic records retrieved successfully.")
    );
});

const updateAcademicRecords = asyncHandler(async (req, res) => {
    const { semester, gpa } = req.body;
    const academicId = req.params.id;

    if (!semester || !gpa) {
        throw new ApiError(400, "Semester and GPA are required fields.");
    }

    const userExists = await Academics.exists({_id : academicId});
    if(!userExists){
        return res.status(404).json(
            new ApiResponse(404, null, "User not found.")
        )
    }

    const updatedAcademicRecord = await Academics.findOneAndUpdate(
        { _id: academicId, "academicRecords.semester": semester },
        { $set: { "academicRecords.$.gpa": gpa } },
        { new: true }
    ).select("-__v");

    return res.status(200).json(
        new ApiResponse(200, updatedAcademicRecord, "Academic record updated successfully.")
    );
});

const deleteAcademicRecord = asyncHandler(async(req, res)=>{
    const academicId = req.params.id;

    const userExists = await Academics.exists({_id: academicId});
    if(!userExists){
        return res.status(404).json(
            new ApiResponse(404, null, "User not found")
        )
    }

    await Academics.findByIdAndDelete(academicId);

    return res.status(200).json(
        new ApiResponse(200, null, "Academic Record deleted successfully.")
    )
})

export { 
    createAcademicRecord, 
    getAcademicRecords, 
    updateAcademicRecords, 
    deleteAcademicRecord
};
