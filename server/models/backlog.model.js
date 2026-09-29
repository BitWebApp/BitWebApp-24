import mongoose, { Schema } from "mongoose";

const backlogSchema = new Schema(
  {
    subjectCode: {
      type: String,
      required: [true, "Enter subject code!"],
    },
    subjectName: {
      type: String,
      required: [true, "Enter subject name!"],
    },
  },
  { timestamps: true }
);
export const Backlog = mongoose.model("Backlog", backlogSchema);
