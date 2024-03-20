import mongoose from "mongoose";

const maintenanceSchema = new mongoose.Schema({
    flatnumber: {
        type: String,
        required: true
    },
    paid: {
        type: Boolean,
        required: true,
        default: false
    },
    date: {
        type: Date,
        required: function() {
            return this.paid;
        }
    }
});

const Maintenance = mongoose.model("Maintenance", maintenanceSchema);

export default Maintenance;
