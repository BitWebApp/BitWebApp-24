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
        email: {
            type: String,
            required: true
        },
        projects: {
            type: Schema.Types.ObjectId,
            ref: 'Project'
        },
        password:{
            type: String,
            required: true
        },
        limits:{
            summer_training:{
                type: Number
            },
            minor_project:{
                type:Number
            },
            major_project:{
                type:Number
            }
        }
    },
    { timestamps: true }
)

export const Professor = mongoose.model("Professor", professorSchema);