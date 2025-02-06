import mongoose, { Schema } from "mongoose";
const groupSchema = new Schema(
  {
    groupId: {
        type: String,
        unique: true,  
        required: true, 
        index: true  
    },
    type: {
        type: String,
        enum: ["summer", "minor"]
    },
    leader: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    members: [{
        type: Schema.Types.ObjectId,
        ref: "User"
    }],
    summerAppliedProfs: [
        {
            type: Schema.Types.ObjectId,
            ref: "Professor",
        },
    ],
    summerAllocatedProf: {
        type: Schema.Types.ObjectId,
        ref: "Professor",
    },
    deniedProf:[{
        type: Schema.Types.ObjectId,
        ref: "Professor"
    }],
    discussion: [{
        _id: {
            type: Schema.Types.ObjectId,
            auto: true
        },
        date: {
            type: Date,
            default: new Date()
        },
        absent: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        description: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        remark: {
            type: String
        }
    }]
  }
);
export const Group = mongoose.model("Group", groupSchema);
