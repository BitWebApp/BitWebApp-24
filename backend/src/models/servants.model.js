import mongoose from "mongoose";

const servantSchema = new mongoose.Schema({
    flatnumber: {
        type: [String]
    },
    name: {
        type: String,
        required: [true, "Servant's Name is required"],
        trim: true
    },
    mobile: {
        type: String,
        required: [true, "Servant's Mobile is required"],
        trim: true
    },
    type: {
        type: String,
        required: true,
        enum: ['driver', 'bodyguard']
    },
    aadhar: {
        type: String,
        trim: true
    }
});

const Servant = mongoose.model("Servant", servantSchema);

export default Servant;
