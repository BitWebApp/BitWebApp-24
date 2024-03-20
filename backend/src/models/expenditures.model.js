import mongoose from "mongoose";

const expenditureSchema = new mongoose.Schema({
    modeofpayment: {
        type: String,
        required: true,
        trim: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    executive_name: {
        type: String,
        required: true,
        trim: true
    },
    department: {
        type: String,
        required: true,
        trim: true
    },
    partyname: {
        type: String,
        required: true,
        trim: true
    },
    partycontact: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    }
});

const Expenditure = mongoose.model("Expenditure", expenditureSchema);

export default Expenditure;
