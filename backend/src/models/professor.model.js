import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const professorSchema = new Schema(
  {
    idNumber: {
      type: String,
      required: [true, "Professor ID number is required!"],
      unique: true,
    },
    fullName: {
      type: String,
      required: [true, "Professor's full name is required!"],
    },
    contact: {
      type: String,
      required: [true, "Phone number is required!"],
    },
    email: {
      type: String,
      required: true,
    },
    projects: {
      type: Schema.Types.ObjectId,
      ref: "Project",
    },
    password: {
      type: String,
      required: true,
    },
    limits: {
      summer_training: {
        type: Number,
        default: 5,
      },
      minor_project: {
        type: Number,
        default: 5,
      },
      major_project: {
        type: Number,
        default: 5,
      },
    },
    currentCount: {
      summer_training: {
        type: Number,
        default: 0,
      },
      minor_project: {
        type: Number,
        default: 0,
      },
      major_project: {
        type: Number,
        default: 0,
      },
    },
    students: {
      summer_training: [
        {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      minor_project: [
        {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      major_project: [
        {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
      ],
    },
  },
  { timestamps: true }
);

professorSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});
professorSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};
professorSchema.methods.generateAccessToken = function () {
  return jwt.sign({ _id: this._id }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
  });
};

professorSchema.methods.generateRefreshToken = function () {
  return jwt.sign({ id: this._id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
  });
};
export const Professor = mongoose.model("Professor", professorSchema);
