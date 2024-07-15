import mongoose, { Schema } from "mongoose";
import { User } from "./user.model.js";

const otpSchema = new Schema(
  {
    email: {
      type: String,
      ref: "User",
      required: true,
      lowercase: true,
      trim: true,
    },
    otp: {
      type: String,
      required: true,
    },
  }
);

export const Otp = mongoose.model("Otp", otpSchema);
