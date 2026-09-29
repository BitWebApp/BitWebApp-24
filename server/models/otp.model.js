import mongoose, { Schema } from "mongoose";
import { User } from "./user.model.js";

// timestamps must stay on: the collection has a TTL index on createdAt
// (expireAfterSeconds: 600). Without the field Mongo can never expire a
// document, so OTPs pile up forever.
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
  },
  { timestamps: true }
);

export const Otp = mongoose.model("Otp", otpSchema);
