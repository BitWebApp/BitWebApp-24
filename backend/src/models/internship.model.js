import mongoose, { Schema } from "mongoose";

const internshipSchema = new Schema(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["industrial", "research"],
      required: [true, "Internship type is required!"],
    },
    location: {
      type: String,
      enum: ["inside_bit", "outside_bit"],
      required: [true, "Internship location is required!"],
    },
    company: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: function () {
        return this.type === "industrial";
      },
    },
    mentor: {
      type: Schema.Types.ObjectId,
      ref: "Professor",
      required: true,
    },
  },
  { timestamps: true }
);

export const Internship = mongoose.model("Internship", internshipSchema);
