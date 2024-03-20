import mongoose, {Schema} from "mongoose";

const renterSchema = new mongoose.Schema({
    flatnumber: {
        type: Array,
        required: [true, "Flat number is required"],
        uppercase: true
    },
    name: {
        type: String,
        uppercase: true,
        trim: true,
        required: [true, "Renter's Name is required"]
    },
    mobile: {
        type: String,
        uppercase: true,
        trim: true,
        required: [true, "Renter's Mobile is required"]
    },
    aadhar: {
        type: String,
        uppercase: true,
        trim: true,
        required: [true, "Renter's Aadhar is required"]
    },
    email: {
        type: String,
        lowercase: true,
        trim: true,
        required: [true, "Renter's email is required"]
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
});

export const Renter = mongoose.model("Renter", renterSchema);

