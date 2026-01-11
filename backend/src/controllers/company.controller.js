import { Company } from "../models/company.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
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

const getAllCompanies = asyncHandler(async (req, res) => {
  const companies = await Company.find();
  if (!companies) {
    throw new ApiError(404, "No companies found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, companies, "Companies fetched successfully"));
});

// const assignCompany = asyncHandler(async (req, res) => {
//   const { companyId, rollNumber } = req.body;
//   const company = await Company.findById(companyId);
//   if (!company) {
//     throw new ApiError(404, "Company not found");
//   }
//   const user = await User.findOne({ rollNumber: rollNumber });
//   if (!user) {
//     throw new ApiError(404, "User not found");
//   }
//   user.companyInterview.push(companyId);
//   await user.save();
//   return res
//     .status(200)
//     .json(new ApiResponse(200, user, "Company assigned to user successfully"));
// });

const assignCompany = asyncHandler(async (req, res) => {
  const { companyId, rollNumbers } = req.body;

  try {
    const company = await Company.findById(companyId);
    if (!company) {
      throw new ApiError(404, "Company not found");
    }

    const users = await User.find({ rollNumber: { $in: rollNumbers } });

    if (users.length === 0) {
      throw new ApiError(404, "Users not found");
    }

    await Promise.all(
      users.map(async (user) => {
        if (!user.companyInterview.includes(companyId)) {
          user.companyInterview.push(companyId);
          await user.save();
        }
      })
    );

    return res
      .status(200)
      .json(
        new ApiResponse(200, users, "Company assigned to users successfully")
      );
  } catch (err) {
    throw new ApiError(500, err.message || "Something went wrong");
  }
});

const getUserCompanies = asyncHandler(async (req, res) => {
  const requestedUser = req.user;
  const user = await User.findById(requestedUser._id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  const companies = await Company.find({ _id: { $in: user.companyInterview } });
  if (!companies) {
    throw new ApiError(404, "No companies found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, companies, "Companies fetched successfully"));
});

export { addCompany, assignCompany, getAllCompanies, getUserCompanies };
