import mongoose, { Schema } from "mongoose";

const professorSchema = new Schema(
    {
        idNumber: {
            type: String,
            required: [true, "Professor ID number is required!"],
            unique: true,
        },
        fullName: {
            type: String,
            required: [true, "Professor's full name is required!"]
        },
        contact: {
            type: String,
            required: [true, "Phone number is required!"]
        },
        avatar: {
            type: String
        },
        joining_date: {
            type: Date,
            required: [true, "Joining date is required!"]
        },
        published_papers: [{
            type: Schema.Types.ObjectId,
            ref: "Paper", // Reference to the Paper model
        }]
    },
    { timestamps: true }
)

export const Professor = mongoose.model("Professor", professorSchema);