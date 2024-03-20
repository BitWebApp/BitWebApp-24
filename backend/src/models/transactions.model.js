import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
    flatnumber: {
        type: String,
        required: true
    },
    purpose: {
        type: String,
        required: true,
        trim: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    datetime: {
        type: Date,
        required: true,
        default: Date.now
    }
});

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;
