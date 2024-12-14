import { Company } from "../models/company.model.js";
import { InterviewExp } from "../models/interviewExp.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const addInterviewExp = asyncHandler(async (req, res) => {
  const {
    company,
    role,
    interviewYear,
    cgpa,
    ctc,
    stipend,
    experience,
    referenceMaterialLinks,
  } = req.body;
  const newInterviewExp = await InterviewExp.create({
    company,
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
        "Interview Experience added successfully"
      )
    );
});
