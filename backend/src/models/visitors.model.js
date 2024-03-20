import mongoose from "mongoose";

const visitorSchema = new mongoose.Schema({
    flatnumber: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    mobile: {
        type: String,
        required: true,
        trim: true
    },
    purpose: {
        type: String,
        required: true,
        trim: true
    },
    checkin: {
        type: Date,
        required: true,
        default: Date.now
    },
    checkout: {
        type: Date
    }
});

const Visitor = mongoose.model("Visitor", visitorSchema);

export default Visitor;
