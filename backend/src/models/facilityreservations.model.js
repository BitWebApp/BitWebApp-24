import mongoose from "mongoose";

const facilityReservationSchema = new mongoose.Schema({
    flatnumber: {
        type: String,
        required: true
    },
    purpose: {
        type: String,
        required: true,
        trim: true
    },
    from_date: {
        type: Date,
        required: true
    },
    to_date: {
        type: Date,
        required: true
    }
});

const FacilityReservation = mongoose.model("FacilityReservation", facilityReservationSchema);

export default FacilityReservation;
