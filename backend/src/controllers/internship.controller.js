import { Internship } from "../models/internship.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js"; // Make sure you have a utility function to upload files to Cloudinary
import {User} from "../models/user.model.js"
const addInternship = asyncHandler(async (req, res) => {
  const {
    type,
    location,
    company,
    role,
    mentor,
    startDate,
    endDate,
  } = req.body;
  const studentid = req?.user?._id
  if (!studentid || !type || !location || !startDate || !endDate) {
    throw new ApiError(400, "Missing required fields!");
  }


  const prevRecord = await Internship.find({student: studentid})
  if(prevRecord.length > 0) throw new ApiError(400, `Record already exists`)


  if (type === "industrial" && (!company || !role)) {
    throw new ApiError(400, "Company and Role are required for industrial internships!");
  }

  if (type === "research" && !mentor) {
    throw new ApiError(400, "Mentor is required for research internships!");
  }

  let docUrl = null;
  if (location === "outside_bit" && req.file) {
    const docLocalPath = req.file.path;
    const uploadedDoc = await uploadOnCloudinary(docLocalPath);
    if (!uploadedDoc) {
      throw new ApiError(400, "Document upload failed!");
    }
    docUrl = uploadedDoc.url;
  } else if (location === "outside_bit" && !req.file) {
    throw new ApiError(400, "Document is required for outside BIT internships!");
  }

  if (new Date(startDate) > new Date(endDate)) {
    throw new ApiError(400, "Start date cannot be after end date!");
  }

  const student = await User.findById(studentid);
  if (!student) {
    throw new ApiError(404, "Student not found!");
  }

  if(student.isSummerAllocated) throw new ApiError(400, "Student already has a project alloted.")

  const createdInternship = await Internship.create({
    student: studentid,
    type,
    location,
    company: type === "industrial" ? company.toUpperCase() : undefined,
    role: type === "industrial" ? role.toUpperCase() : undefined,
    mentor: type === "research" ? mentor : undefined,
    startDate,
    endDate,
    doc: docUrl,
    verified: false,
  });

  if (!createdInternship) {
    throw new ApiError(500, "Failed to create internship record!");
  }

  if (!Array.isArray(student.internShips)) {
    student.internShips = [];
  }
  student.internShips.push(createdInternship._id);
  await student.save();

  return res
    .status(201)
    .json(new ApiResponse(201, createdInternship, "Internship record created successfully!"));
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
    const response = await Internship.find({verified: false}).populate('student')
    res.status(200).json(new ApiResponse(200, {response}, "All Intern Data fetched"))
})

const getAllVerifiedInternshipData = asyncHandler(async(req, res) => {
  const response = await Internship.find().populate('student').populate('company').populate('mentor')
  res.status(200).json(new ApiResponse(200, {response}, "All Intern Data fetched"))
})

const getInternshipDataforStudent = asyncHandler(async(req, res) => {
    const {student_id} = req.body
    const response = await Internship.find({student: student_id}, {verfied: true}).populate('student').populate('company')
    res.status(200).json(new ApiResponse(200, {response}, "All Intern Data fetched"))
})

const verifyIntern = asyncHandler(async(req, res) => {
  const {internid} = req.body
  const intern = await Internship.findById({_id: internid})
  intern.verified = true;
  await intern.save()
  res.status(200).json(new ApiResponse(200, "Verified Successfully"))
})
export {addInternship, addInternDocs, getAllInternshipData, getInternshipDataforStudent, verifyIntern, getAllVerifiedInternshipData}