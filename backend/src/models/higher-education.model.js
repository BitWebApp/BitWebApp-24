import mongoose, { Schema } from "mongoose";

const higherEducationSchema = new Schema(
  {
    name: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    institution: {
      type: String,
      required: [true, "Institution name is required!"],
    },
    degree: {
      type: String,
      required: [true, "Degree name is required!"],
    },
    fieldOfStudy: {
      type: String,
      required: [true, "Field of study is required!"],
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required!"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required!"],
    },
    docs: {
      type: [String], 
      required: [true, "Add supporting docs!"],
    },
  },
  {
    timestamps: true,
  }
);

export const HigherEducation = mongoose.model("HigherEducation", higherEducationSchema);
