import mongoose, { Schema } from "mongoose";

const awardSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required!"],
    },
    description: {
      type: String,
      required: [true, "Description is required!"],
    },
    date: {
      type: Date,
      required: [true, "Date is required!"],
    },
    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    doc: {
      type: String,
      required: [true, "Add supporting docs!"],
    },
  },
  { timestamps: true }
);

export const Award = mongoose.model("Award", awardSchema);
