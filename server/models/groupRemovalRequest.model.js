import mongoose, { Schema } from "mongoose";

const groupRemovalRequestSchema = new Schema(
  {
    groupType: {
      type: String,
      enum: ["summer", "major", "minor", "project1"],
      required: true,
      index: true,
    },
    groupId: {
      type: String,
      required: true,
      index: true,
    },
    groupRef: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: "groupModel",
    },
    groupModel: {
      type: String,
      required: true,
      enum: ["Group", "Major", "Minor", "Project1"],
    },
    professor: {
      type: Schema.Types.ObjectId,
      ref: "Professor",
      required: true,
      index: true,
    },
    batch: {
      type: Number,
      required: true,
      index: true,
    },
    reason: {
      type: String,
      required: [true, "Reason for removal is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    actionBy: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
    },
    actionComment: {
      type: String,
      default: "",
    },
    actionAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

export const GroupRemovalRequest = mongoose.model(
  "GroupRemovalRequest",
  groupRemovalRequestSchema
);
