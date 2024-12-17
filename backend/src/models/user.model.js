import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

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
      lowercase: true,
    },
    rollNumber: {
      type: String,
      required: [true, "Roll Number is required!"],
      unique: true,
    },
    email: {
      type: String,
      required: [true, "Email is required!"],
      unique: true,
      lowercase: true,
    },
    resume: {
      type: String,  
    },
    idCard: {
      type: String,
      required: [true, "Id card is required for verification!"],
    },
    branch: {
      type: String,
      default: "",
    },
    section: {
      type: String,
      default: "",
    },
    image: {
      type: String,
      default: "",
    },
    linkedin: {
      type: String,
      default: "",
    },
    abcId: {
      type: String,
      default: ""
    },
    codingProfiles: {
      github: {
        type: String,
        default: "",
      },
      leetcode: {
        type: String,
        default: "",
        match: [/^https?:\/\/(www\.)?leetcode\.com\/.+$/, "Enter a valid LeetCode profile URL!"],
      },
      codeforces: {
        type: String,
        default: "",
        match: [/^https?:\/\/(www\.)?codeforces\.com\/profile\/.+$/, "Enter a valid Codeforces profile URL!"],
      },
      codechef: {
        type: String,
        default: "",
        match: [/^https?:\/\/(www\.)?codechef\.com\/users\/.+$/, "Enter a valid CodeChef profile URL!"],
      },
      atcoder: {
        type: String,
        default: "",
        match: [/^https?:\/\/(www\.)?atcoder\.jp\/users\/.+$/, "Enter a valid AtCoder profile URL!"],
      },
    },    
    mobileNumber: {
      type: String,
      minLength: [10, "Enter 10 digits of your mobile number!"],
      maxLength: [10, "Enter 10 digits of your mobile number!"],
      default: "0000000000",
    },
    semester: {
      type: String,
      default: "",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    placementOne: {
      type: Schema.Types.ObjectId,
      ref: "Placement",
    },
    placementTwo: {
      type: Schema.Types.ObjectId,
      ref: "Placement",
    },
    placementThree: {
      type: Schema.Types.ObjectId,
      ref: "Placement",
    },
    proj: [
      {
        type: Schema.Types.ObjectId,
        ref: "Project",
      },
    ],
    awards: [
      {
        type: Schema.Types.ObjectId,
        ref: "Award",
      },
    ],
    higherEd: [
      {
        type: Schema.Types.ObjectId,
        ref: "HigherEducation",
      },
    ],
    internShips: [
      {
        type: Schema.Types.ObjectId,
        ref: "Internship",
      },
    ],
    exams: [
      {
        type: Schema.Types.ObjectId,
        ref: "Exam",
      },
    ],
    academics: 
    {
      type: Schema.Types.ObjectId,
      ref: "Academics",
    },
    cgpa: {
      type: String,
      default: "",
    },
    backlogs: [
      {
        type: Schema.Types.ObjectId,
        ref: "Backlog",
      },
    ],
    peCourses: [
      {
        type: Schema.Types.ObjectId,
        ref: "PeCourse",
      },
    ],
    companyInterview: [
      {
        type: Schema.Types.ObjectId,
        ref: "Company",
      },
    ],
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      branch: this.branch,
      email: this.email,
      username: this.username,
      fullName: this.fullName,
      isAdmin: false,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const User = mongoose.model("User", userSchema);
