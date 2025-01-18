import mongoose, { Schema } from "mongoose";

const requestProjSchema = new Schema(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Student ID is required!"],
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "ProfProject",
      required: [true, "Project ID is required!"],
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    applicationDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export const RequestProj = mongoose.model("RequestProj", requestProjSchema);