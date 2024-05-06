import { Internship } from "../models/internship.model";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js"

const addInternship = asyncHandler(async(req, res) => {
    const {studentid, company, role, startDate, endDate} = req.body
    if (
        [studentid, company, role, startDate, endDate].some((field) => field?.trim() === "")){
        throw new ApiError(400, "All fields are required:");
    }
    const internRecord = await Internship.create({
        student: studentid,
        company,
        role, 
        startDate,
        endDate
    })
    const createdInternRecord = await Internship.findById(internRecord._id)
    if(!createdInternRecord)
    throw new ApiError(500, "Something went wrong")
    return res.status(200).json(new ApiResponse(200, createdInternRecord, "Intern record created successfully"))
})
const addInternDocs = asyncHandler(async(req, res) => {
    const {_id} = req.body
    const internRecord = await Internship.findById(_id)
    if(!internRecord)
    throw new ApiError(404, "Intern Record not found")
    const InternDocsLocalPath = req.files?.doc[0]?.path
    console.log("intern doc path", InternDocsLocalPath)
    if(!InternDocsLocalPath)
    throw new ApiError(400, "Document is neccesary")
    const InternDocs = await uploadOnCloudinary(InternDocsLocalPath)
    if(!InternDocs){
        throw new ApiError(400, "Not uploaded on Closuinary. something went wrong")
    }
    const newInternRecord = await Internship.updateOne({_id}, {$set: {doc: InternDocs.url}})
    res.status(200).json(new ApiResponse(200, newInternRecord, "Document added successfully"))
})
const getAllInternshipData = asyncHandler(async(req, res) => {
    const response = await Internship.find().populate('student')
    res.status(200).json(new ApiResponse(200, {response}, "All Intern Data fetched"))
})
const getInternshipDataforStudent = asyncHandler(async(req, res) => {
    const {student_id} = req.body
    const response = await Internship.find({student: student_id}).populate('student')
    res.status(200).json(new ApiResponse(200, {response}, "All Intern Data fetched"))
})
export {addInternship, addInternDocs, getAllInternshipData, getInternshipDataforStudent}