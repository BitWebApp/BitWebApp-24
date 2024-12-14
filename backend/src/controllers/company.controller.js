import { Internship } from "../models/internship.model.js";
import { Company } from "../models/company.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
const addCompany = asyncHandler(async (req, res) => {
  const { companyName } = req.body;
  if (!companyName || companyName.trim() === "") {
    throw new ApiError(400, "Company name is required");
  }
  const existingCompany = await Company.findOne({ companyName });
  if (existingCompany) {
    throw new ApiError(400, "Company already exists");
  }
  const newCompany = await Company.create({ companyName });
  if (!newCompany) {
    throw new ApiError(500, "Something went wrong");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, newCompany, "Company added successfully"));
});

export { addCompany };
