import mongoose, { Schema } from "mongoose";

const courseDocumentSchema = new Schema(
  {
    course: {
      type: String,
      required: [true, "Course name is required"],
      enum: [
        "MCA Minor Project",
        "MCA Major Project",
        "MTech Thesis 1",
        "MTech Thesis 2",
      ],
      trim: true,
    },
    batch: {
      type: String,
      required: [true, "Batch is required"],
      enum: ["K22", "K23", "K24", "K25", "K26"],
      trim: true,
    },
    pdfUrl: {
      type: String,
      required: [true, "PDF URL is required"],
    },
    originalFileName: {
      type: String,
      default: "",
    },
    publicId: {
      type: String,
      default: "",
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  { timestamps: true }
);

courseDocumentSchema.index({ course: 1, batch: 1 }, { unique: true });

export const CourseDocument = mongoose.model(
  "CourseDocument",
  courseDocumentSchema
);
