import mongoose, { Schema } from "mongoose";
import { Placement } from "./placement.model";
import { Project } from "./project.model";
import { Award } from "./award.model";
import { Internship } from "./internship.model";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: [
        true,
        "Enter roll number in small case without special chars!",
      ],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minLength: [6, "Password needs to be have atleast 6 chars!"],
    },
    fullName: {
      type: String,
      required: [true, "Full Name is required!"],
    },
    rollNumber: {
      type: String,
      required: [true, "Roll Number is required!"],
    },
    idCard: {
      type: String,
      required: [true, "Id card is required for verification!"],
    },
    branch: {
      type: String,
      required: [true, "Branch is required!"],
    },
    section: {
      type: String,
    },
    image: {
      type: String,
    },
    mobileNumber: {
      type: String,
      minLength: [10, "Enter 10 digits of your mobile number!"],
      maxLength: [10, "Enter 10 digits of your mobile number!"],
    },
    emailAddress: {
      type: String,
      unique: true,
      lowercase: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    placementOne: {
      type: Schema.Types.ObjectId,
      ref: Placement,
    },
    placementTwo: {
      type: Schema.Types.ObjectId,
      ref: Placement,
    },
    placementThree: {
      type: Schema.Types.ObjectId,
      ref: Placement,
    },
    proj: [
      {
        type: Schema.Types.ObjectId,
        ref: Project,
      },
    ],
    awards: [
      {
        type: Schema.Types.ObjectId,
        ref: Award,
      },
    ],
    higherEd: [
      {
        type: Schema.Types.ObjectId,
        ref: HigherEducation,
      },
    ],
    internShips: [
      {
        type: Schema.Types.ObjectId,
        ref: Internship,
      },
    ],
  },
  { timestamps: true }
);
export const User = mongoose.model("User", userSchema);
