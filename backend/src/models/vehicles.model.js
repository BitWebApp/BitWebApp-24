import mongoose from "mongoose";

const fourWheelerSchema = new mongoose.Schema({
    flatnumber: {
        type: String,
        required: true
    },
    reg_no: {
        type: String, 
        required: true,
        trim: true
    },
    colour: {
        type: String,
        trim: true
    },
    brand: {
        type: String,
        required: true,
        trim: true
    },
    model: {
        type: String,
        required: true,
        trim: true
    }
});

const twoWheelerSchema = new mongoose.Schema({
    flatnumber: {
        type: String,
        required: true
    },
    reg_no: {
        type: String, 
        required: true,
        trim: true
    },
    colour: {
        type: String,
        trim: true
    },
    brand: {
        type: String,
        required: true,
        trim: true
    },
    model: {
        type: String,
        required: true,
        trim: true
    }
});

const bicycleSchema = new mongoose.Schema({
    flatnumber: {
        type: String,
        required: true
    },
    colour: {
        type: String,
        trim: true
    },
    model: {
        type: String,
        required: true,
        trim: true
    }
});


const vehicleSchema = new mongoose.Schema({
    flatnumber: {
        type: Array,
        required: [true, "Flat number is required"],
        uppercase: true
    },
    fourWheeler: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FourWheeler'
    },
    twoWheeler: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TwoWheeler'
    },
    bicycle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bicycle'
    }
});

const FourWheeler = mongoose.model("FourWheeler", fourWheelerSchema);
const TwoWheeler = mongoose.model("TwoWheeler", twoWheelerSchema);
const Bicycle = mongoose.model("Bicycle", bicycleSchema);
const Vehicle = mongoose.model("Vehicle", vehicleSchema);

export { FourWheeler, TwoWheeler, Bicycle, Vehicle };
