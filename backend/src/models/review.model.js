import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "userModel",
    },
    userModel: {
      type: String,
      required: true,
      enum: ["User", "Professor"],
    },
    content: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const Review = mongoose.model("Review", reviewSchema);
