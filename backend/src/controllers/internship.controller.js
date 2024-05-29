import { Internship } from "../models/internship.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js"; // Make sure you have a utility function to upload files to Cloudinary
import {User} from "../models/user.model.js"
const addInternship = asyncHandler(async (req, res) => {
    const { studentid, company, role, startDate, endDate } = req.body;
  
    // Check if all required fields are present and not empty
    if ([studentid, company, role, startDate, endDate].some(field => !field || field.trim() === "")) {
      throw new ApiError(400, "All fields are required");
    }
  
    // Handle document upload if provided
    let docUrl = null;
    if (req.file) { // Use req.file instead of req.files
      const docLocalPath = req.file.path;
      const uploadedDoc = await uploadOnCloudinary(docLocalPath);
      if (!uploadedDoc) {
        throw new ApiError(400, "Document upload failed");
      }
      docUrl = uploadedDoc.url;
    }
  
    // Create the internship record
    const createdInternRecord = await Internship.create({
      student: studentid,
      company,
      role,
      startDate,
      endDate,
      doc: docUrl,
    });
  
    if (!createdInternRecord) {
      throw new ApiError(500, "Something went wrong");
    }
  
    // Find the student and update their internship list
    const student = await User.findById(studentid);
    if (!student) {
      throw new ApiError(404, "Student not found");
    }
  
    // Ensure internShip is an array
    if (!student.internShip) {
      student.internShip = [];
    }
  
    student.internShip.push(createdInternRecord._id);
    await student.save();
  
    return res.status(200).json(new ApiResponse(200, createdInternRecord, "Intern record created successfully"));
  });
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