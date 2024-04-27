import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { Placement } from "../models/placement.model.js";

const generateAcessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and acess token!"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  //   const { fullName, email, username, password } = req.body;
  const { username, password, fullName, rollNumber, email } = req.body;
  console.log("email:", email);
  if (
    [username, password, fullName, rollNumber, email].some(
      (field) => field?.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required:");
  }
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    throw new ApiError(409, "User with email/username already exists");
  }
  const idLocalPath = req.files?.idCard[0]?.path;
  if (!idLocalPath) {
    throw new ApiError(400, "idCard file is required:");
  }
  const idCard = await uploadOnCloudinary(idLocalPath);
  if (!idCard) {
    throw new ApiError(400, "Avatar file is required:");
  }
  const user = await User.create({
    username: username.toLowerCase(),
    password,
    fullName,
    rollNumber,
    email,
    idCard: idCard.url,
  });
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  console.log(req.body);
  const { username, password } = req.body;
  console.log(username);
  if (!username) {
    throw new ApiError(400, "username is req");
  }
  const user = await User.findOne({ username: username.toLowerCase() });
  if (!user) {
    throw new ApiError(404, "User does not exists");
  }
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid Credentials!");
  }
  const { accessToken, refreshToken } = await generateAcessAndRefreshToken(
    user._id
  );
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User loggedIn successfully!"
      )
    );
});
const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: { refreshToken: 1 },
    },
    {
      new: true,
    }
  );
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "User logged out successfully!"));
});

const updateUser1 = asyncHandler(async (req, res) => {
  const {
    fullName,
    rollNumber,
    email,
    branch,
    section,
    mobileNumber,
    semester,
  } = req.body;
  if (
    !fullName ||
    !rollNumber ||
    !email ||
    !branch ||
    !section ||
    !mobileNumber ||
    !semester
  ) {
    throw new ApiError(400, "All fields are required");
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName,
        rollNumber,
        email,
        branch,
        section,
        mobileNumber,
        semester,
      },
    },
    { new: true }
  ).select("-password");
  return res
    .status(200)
    .json(new ApiResponse(200, user, "User details updated successfully!"));
});

const updatePlacementOne = asyncHandler(async (req, res) => {
  const { company, ctc, date } = req.body;
  console.log("company", company);
  if (!company || !ctc || !date) {
    throw new ApiError(400, "All fields are required");
  }
  const idLocalPath = req.files?.doc[0]?.path;
  if (!idLocalPath) {
    throw new ApiError(400, "doc file is required:");
  }
  const doc = await uploadOnCloudinary(idLocalPath);
  if (!doc) {
    throw new ApiError(400, "doc file is required:");
  }

  const placement = await Placement.create({
    student: req.user._id,
    company,
    ctc,
    date,
    doc: doc.url,
  });
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        placementOne: placement._id,
      },
    },
    { new: true }
  );
  if (!updatedUser) {
    throw new ApiError(
      500,
      "Something went wrong while updating the placement details"
    );
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedUser,
        "Placement details updated successfully!"
      )
    );
});
const updatePlacementTwo = asyncHandler(async (req, res) => {
  const { company, ctc, date } = req.body;
  console.log("company", company);
  if (!company || !ctc || !date) {
    throw new ApiError(400, "All fields are required");
  }
  const idLocalPath = req.files?.doc[0]?.path;
  if (!idLocalPath) {
    throw new ApiError(400, "doc file is required:");
  }
  const doc = await uploadOnCloudinary(idLocalPath);
  if (!doc) {
    throw new ApiError(400, "doc file is required:");
  }

  const placement = await Placement.create({
    student: req.user._id,
    company,
    ctc,
    date,
    doc: doc.url,
  });
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        placementTwo: placement._id,
      },
    },
    { new: true }
  );
  if (!updatedUser) {
    throw new ApiError(
      500,
      "Something went wrong while updating the placement details"
    );
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedUser,
        "Placement details updated successfully!"
      )
    );
});
const updatePlacementThree = asyncHandler(async (req, res) => {
  const { company, ctc, date } = req.body;
  console.log("company", company);
  if (!company || !ctc || !date) {
    throw new ApiError(400, "All fields are required");
  }
  const idLocalPath = req.files?.doc[0]?.path;
  if (!idLocalPath) {
    throw new ApiError(400, "doc file is required:");
  }
  const doc = await uploadOnCloudinary(idLocalPath);
  if (!doc) {
    throw new ApiError(400, "doc file is required:");
  }

  const placement = await Placement.create({
    student: req.user._id,
    company,
    ctc,
    date,
    doc: doc.url,
  });
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        placementThree: placement._id,
      },
    },
    { new: true }
  );
  if (!updatedUser) {
    throw new ApiError(
      500,
      "Something went wrong while updating the placement details"
    );
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedUser,
        "Placement details updated successfully!"
      )
    );
});

export {
  registerUser,
  loginUser,
  logoutUser,
  updateUser1,
  updatePlacementOne,
  updatePlacementTwo,
  updatePlacementThree,
};
