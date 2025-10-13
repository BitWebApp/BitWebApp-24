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
    alternateEmail: {
      type: String,
      default: "",
    },

    fatherName: {
      type: String,
      default: "",
    },
    fatherMobileNumber: {
      type: String,
      default: "",
    },
    motherName: {
      type: String,
      default: "",
    },
    residentialAddress: {
      type: String,
      default: "",
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
      default: "",
    },
    codingProfiles: {
      github: {
        type: String,
        default: "",
      },
      leetcode: {
        type: String,
        default: "",
        match: [
          /^https?:\/\/(www\.)?leetcode\.com\/.+$/,
          "Enter a valid LeetCode profile URL!",
        ],
      },
      codeforces: {
        type: String,
        default: "",
        match: [
          /^https?:\/\/(www\.)?codeforces\.com\/profile\/.+$/,
          "Enter a valid Codeforces profile URL!",
        ],
      },
      codechef: {
        type: String,
        default: "",
        match: [
          /^https?:\/\/(www\.)?codechef\.com\/users\/.+$/,
          "Enter a valid CodeChef profile URL!",
        ],
      },
      atcoder: {
        type: String,
        default: "",
        match: [
          /^https?:\/\/(www\.)?atcoder\.jp\/users\/.+$/,
          "Enter a valid AtCoder profile URL!",
        ],
      },
    },
    mobileNumber: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          return /^\d{10}$/.test(v);
        },
        message: "Enter 10 digits of your mobile number!",
      },
      default: "0000000000",
    },
    semester: {
      type: String,
      default: "",
    },
    graduationYear: {
      type: Date,
      default: "",
    },
    workExp: [
      {
        company: {
          type: String,
          default: "",
        },
        role: {
          type: String,
          default: "",
        },
        startDate: {
          type: Date,
          default: "",
        },
        endDate: {
          type: Date,
          default: "",
        },
        description: {
          type: String,
          default: "",
        },
      },
    ],
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
    academics: [
      {
        type: Schema.Types.ObjectId,
        ref: "Academics",
      },
    ],
    alumni: [
      {
        type: Schema.Types.ObjectId,
        ref: "Alumni",
      },
    ],
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
    summerAppliedProfs: [
      {
        type: Schema.Types.ObjectId,
        ref: "Professor",
      },
    ],
    group: {
      type: Schema.Types.ObjectId,
      ref: "Group",
    },
    summerAllocatedProf: {
      type: Schema.Types.ObjectId,
      ref: "Professor",
    },
    isSummerAllocated: {
      type: Boolean,
      default: false,
    },
    marks: {
      summerTraining: {
        type: Number,
        default: 0,
      },
      minorProject: {
        type: Number,
        default: 0,
      },
      majorProject: {
        type: Number,
        default: 0,
      },
    },
    batch: {
      type: Number,
      required: [true, "Batch is required"],
      index: true,
    },
    groupReq:[{
      type: Schema.Types.ObjectId,
      ref: "Group"
    }],

    minorAppliedProfs: [
      {
        type: Schema.Types.ObjectId,
        ref: "Professor",
      },
    ],
    MinorGroup: {
      type: Schema.Types.ObjectId,
      ref: "Minor"
    },
    minorAllocatedProf: {
      type: Schema.Types.ObjectId,
      ref: "Professor",
    },
    isMinorAllocated: {
      type: Boolean,
      default: false,
    },
    MinorGroupReq:[{
      type: Schema.Types.ObjectId,
      ref: "Minor"
    }],
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
