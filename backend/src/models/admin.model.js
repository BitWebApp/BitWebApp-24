import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose, { Schema } from "mongoose";
const adminSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, "Username cannot be empty!"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password cannot be empty!"],
      minLength: [6, "Password needs to be have atleast 6 chars!"],
    },
    email: {
      type: String,
      required: [true, "Email is required!"],
      unique: true,
      lowercase: true,
    },
    isAdmin: {
      type: Boolean,
      default: true,
    },
    role: {
      type: String,
      enum: ["master", "batch_admin"],
      default: "batch_admin",
      required: true,
    },
    assignedBatches: [
      {
        type: Number, // e.g., 22 for K22, 23 for K23
      },
    ],
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
});
adminSchema.methods.isPasswordCorrect = async function (password) {
  return bcrypt.compare(password, this.password);
};
adminSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      username: this.username,
      email: this.email,
      isAdmin: true,
      role: this.role,
      assignedBatches: this.assignedBatches,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};
adminSchema.methods.generateRefreshToken = function () {
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

export const Admin = new mongoose.model("Admin", adminSchema);
