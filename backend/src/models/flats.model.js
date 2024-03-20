import mongoose, { Schema } from "mongoose"

const flatSchema = mongoose.Schema({
    flatnumber: {
        type: String,
        required: true,
        trim: true,
        uppercase: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    position: {
        type: String,
        required: true,
        trim: true
    },
    owner: [
        {
            type: Schema.Types.ObjectId,
            ref: "Owner"
        }
    ],
    renter: [
        {
            type: Schema.Types.ObjectId,
            ref: "Renter"
        }
    ],
    vehicle: [
        {
            type: Schema.Types.ObjectId,
            ref: "Vehicle"
        }
    ],
    maid: [
        {
            type: Schema.Types.ObjectId,
            ref: "Maid"
        }
    ],
    pet: [
        {
            type: Schema.Types.ObjectId,
            ref: "Pet"
        }
    ],
    servant: [
        {
            type: Schema.Types.ObjectId,
            ref: "Servant"
        }
    ],
    visitors: [
        {
            type: Schema.Types.ObjectId,
            ref: "Visitor"
        }
    ],
    transactions: [
        {
            type: Schema.Types.ObjectId,
            ref: "Transaction"
        }
    ],
    facilitybooked: [
        {
            type: Schema.Types.ObjectId,
            ref: "FacilityReservation"
        }
    ],
    complains_filed: [
        {
            type: Schema.Types.ObjectId,
            ref: "Complaint"
        }
    ]
})

export const Flat = mongoose.model("Flat", flatSchema)