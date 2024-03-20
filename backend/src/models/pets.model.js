import mongoose from "mongoose";

const petSchema = new mongoose.Schema({
    flatnumber: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['cat', 'dog']
    },
    breed: {
        type: String,
        required: true,
        trim: true
    }
});

const Pet = mongoose.model("Pet", petSchema);

export default Pet;
