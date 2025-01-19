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
      type: String,
      uppercase: true,
      required: function () {
        return this.type === "industrial";
      },
    },
    role: {
      type: String,
      uppercase: true,
      required: function () {
        return this.type === "industrial";
      },
    },
    mentor: {
      type: String,
      required: function () {
        return this.type === "research";
      },
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required!"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required!"],
    },
    doc: {
      type: String,
      required: function () {
        return this.location === "outside_bit";
      },
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Internship = mongoose.model("Internship", internshipSchema);
