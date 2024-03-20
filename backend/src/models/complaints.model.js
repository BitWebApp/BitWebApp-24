import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema({
    flatnumber: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    department: {
        type: String,
        required: true,
        trim: true
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    closedAt: {
        type: Date
    }
});

const Complaint = mongoose.model("Complaint", complaintSchema);

export default Complaint;
