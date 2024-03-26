import mongoose, { Schema } from "mongoose";

const academicSchema = new Schema(
    {
        name:{
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        semester:{
            type: Number,
            required: [true, "Semester is required!"]
        },
        gpa:{
            type: Number, 
            required: [true, "GPA is required!"]
        }
    },
    { timestamps: true }
)

export const Academics = mongoose.model("Academics", academicSchema);
