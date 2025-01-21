import { Company } from "../models/company.model.js";
import { InterviewExp } from "../models/interviewExp.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";

const addInterviewExp = asyncHandler(async (req, res) => {
  const {
    companyId,
    role,
    interviewYear,
    cgpa,
    ctc,
    stipend,
    experience,
    referenceMaterialLinks,
  } = req.body;
  const _id = req?.user?._id;
  if (!_id) {
    throw new ApiError(401, "Unauthorized");
  }
  const company = await Company.findById(companyId);
  if (!company) {
    throw new ApiError(404, "Company not found");
  }
  const user = await User.findById(_id);
  if (!user.companyInterview.includes(companyId)) {
    throw new ApiError(401, "Company not assigned to user");
  }
  const newInterviewExp = await InterviewExp.create({
    company: companyId,
    student: _id,
    role,
    interviewYear,
    cgpa,
    ctc,
    stipend,
    experience,
    referenceMaterialLinks,
  });
  if (!newInterviewExp) {
    throw new ApiError(500, "Something went wrong");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        newInterviewExp,
        "Interview experience added successfully"
      )
    );
});

const getAllInterviewExps = asyncHandler(async (req, res) => {
  const {
    companyId,
    studentId,
    page = 1,
    limit = 10,
    sort = "-createdAt",
  } = req.query;

  const filter = {};

  if (companyId) {
    filter.company = companyId;
  }

  if (studentId) {
    filter.student = studentId;
  }

  const skip = (page - 1) * limit;

  const interviewExps = await InterviewExp.find(filter)
    .populate("company", "companyName")
    .populate("student", "fullName email")
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit, 10));

  const totalRecords = await InterviewExp.countDocuments(filter);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { interviewExps, totalRecords },
        "Interview experiences fetched successfully"
      )
    );
});

export { addInterviewExp, getAllInterviewExps };
