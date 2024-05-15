import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js"
import {Award} from "../models/award.model.js"

const addAward = asyncHandler(async(req, res) => {
    const { title, description, date, student} = req.body;
    if (!title || !description || !date || !student) {
        return next(new ApiError(400, "All fields are required"));
    }
    const docPath = req.files?.doc[0]?.path
    if(!docPath)
    throw new ApiError(400, "Document is required")
    const uploadedDocPath = await uploadOnCloudinary(docPath)
    if(!uploadedDocPath)
    throw new ApiError(400, "not able to upload something went wrong")
    const award = await Award.create({
        student,
        title,
        description,
        date,
        doc: uploadedDocPath.url
    })
    res.status(200).json(new ApiResponse(200, {award}, "Award added successfully"))
})
const getAwardByStudentId = asyncHandler(async(req, res) => {
    const {studentid} = req.body
    const response = await Award.findOne({student: studentid})
    res.status(200).json(new ApiResponse(200, {response}, "Award data fetched"))
})
export {addAward, getAwardByStudentId}
