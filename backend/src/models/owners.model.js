import mongoose, { Schema } from "mongoose"

const ownerSchema = mongoose.Schema({
    flatnumber: {
        type: [String],
        required: [true, "Flat number is required"],
        uppercase: true
    },
    name: {
        type: String,
        uppercase: true,
        trim: true,
        required: [true, "Owner's Name is required"]
    },
    mobile: {
        type: String,
        uppercase: true,
        trim: true,
        required: [true, "Owner's Mobile is required"]
    },
    aadhar: {
        type: String,
        uppercase: true,
        trim: true,
        required: [true, "Owner's Aadhar is required"]
    },
    email: {
        type: String,
        lowercase: true,
        trim: true,
        required: [true, "Owner's email is required"]
    },
    spouse_name: {
        type: String,
        uppercase: true
    },
    spouse_mobile: {
        type: String,
        uppercase: true
    },
    spouse_aadhar: {
        type: String,
        uppercase: true
    },
    spouse_email: {
        type: String,
        lowercase: true
    }
})

export const Owner = mongoose.model("Owner", ownerSchema)