import { Review } from "../models/review.model.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Professor } from "../models/professor.model.js";
const addReview = asyncHandler(async (req, res) => {
  const { name, rollNumber, content } = req.body;

  if (!name || !rollNumber || !content) {
    throw new ApiError(400, "Name, RollNumber, and Content are required fields.");
  }

  try {
    console.log("Checking user or professor roll number");

    let user = await User.findOne({ rollNumber });
    let userModel = "User";

    if (!user) {
      user = await Professor.findOne({ idNumber: rollNumber });
      userModel = "Professor";
    }

    if (!user) {
      return res.status(400).json({ message: "Invalid roll number" });
    }

    const newReview = new Review({
      user: user._id,
      userModel: userModel,
      content: content,
    });

    await newReview.save();

    return res.status(201).json(new ApiResponse(201, newReview, "Review added successfully"));
  } catch (error) {
    console.error("Error adding review:", error);
    throw new ApiError(500, "Internal Server Error");
  }
});

const addReviewByProfessor = asyncHandler(async (req, res) => {
  const { prof, content } = req.body;

  if (!prof || !content) {
    throw new ApiError(400, "Professor ID and Content are required fields.");
  }

  const review = new Review({
    user: prof,
    userModel: "Professor",
    content: content,
  });
  try {
    await review.save();
    return res.status(201).json(new ApiResponse(201, review, "Review added successfully"));
  } catch (error) {
    console.error("Error adding review:", error);
    throw new ApiError(500, "Internal Server Error");
  }
});

const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find();
    return res
      .status(200)
      .json(new ApiResponse(200, reviews, "Reviews fetched successfully."));
  } catch (error) {
    return res
      .status(500)
      .json(
        new ApiResponse(500, null, "An error occurred while fetching reviews.")
      );
  }
};

export { addReview, getReviews, addReviewByProfessor};
