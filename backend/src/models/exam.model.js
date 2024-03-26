import mongoose, { Schema } from "mongoose";
const examSchema = new Schema(
  {
    name: {
      type: Schema.Types.ObjectId,
      ref: User,
    },
    examRoll: {
      type: String,
      required: [true, "Registration/Roll Number needed!"],
    },
    rollNumber: {
      type: Schema.Types.ObjectId,
      ref: User,
    },
    examName: {
      type: String,
      required: [true, "Exam name required!"],
    },
    docs: {
      type: String,
      required: [true, "Add supporting docs!"],
    },
    isSelected: {
      type: Boolean,
      required: [true, "Plz select result!"],
    },
    score: {
      type: String,
      required: [true, "Enter score!"],
    },
  },
  { timestamps: true }
);
export const Exam = mongoose.model("Exam", examSchema);
