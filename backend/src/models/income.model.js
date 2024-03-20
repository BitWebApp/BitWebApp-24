import mongoose from "mongoose";

const incomeSchema = new mongoose.Schema({
    flatnumber: {
        type: String,
        required: true
    },
    modeofpayment: {
        type: String,
        enum: ['cash', 'bank'],
        required: true
    },
    source_type: {
        type: String,
        required: true,
        trim: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    from_month: {
        type: String,
        trim: true
    },
    to_month: {
        type: String,
        trim: true
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    }
});

const Income = mongoose.model("Income", incomeSchema);

export default Income;
