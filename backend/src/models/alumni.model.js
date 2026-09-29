import mongoose, { Schema } from "mongoose";

const workExperienceSchema = new Schema({
  company: {
    type: String,
    required: [true, "Company name is required"],
  },
  role: {
    type: String,
    required: [true, "Role is required"],
  },
  startDate: {
    type: Date,
    required: [true, "Start date is required"],
  },
  endDate: {
    type: Date,
    default: null,
  },
  isCurrentlyWorking: {
    type: Boolean,
    default: false,
  },
});

const alumniSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    batch: {
      type: Number,
      required: [true, "Batch is required"],
    },
    program: {
      type: String,
      required: [true, "Program is required"],
    },
    branch: {
      type: String,
      required: [true, "Graduation year is required"],
    },
    hasSubmittedForm: {
      type: Boolean,
      default: false,
    },
    workExperiences: [workExperienceSchema],
  },
  { timestamps: true }
);

// Validation for work experience dates
alumniSchema.pre("save", function (next) {
  if (this.isModified("workExperiences")) {
    for (const exp of this.workExperiences) {
      if (
        !exp.isCurrentlyWorking &&
        exp.endDate &&
        exp.startDate > exp.endDate
      ) {
        throw new Error("Start date cannot be after end date");
      }
    }
  }
  next();
});

export const Alumni = mongoose.model("Alumni", alumniSchema);
