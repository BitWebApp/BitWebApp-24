import mongoose, { Schema } from "mongoose";

const internshipSchema = new Schema(
    {
        student: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Student ID is required!"],
        },
        company: {
            type: String,
            required: [true, "Company name is required!"],
        },
        role: {
            type: String,
            required: [true, "Role is required!"],
        },
        startDate: {
            type: Date,
            required: [true, "Start date is required!"],
        },
        endDate: {
            type: Date,
            required: [true, "End date is required!"],
        },
    },
    { timestamps: true }
);

export const Internship = mongoose.model("Internship", internshipSchema);
