import mongoose, { Schema } from "mongoose";
const groupSchema = new Schema({
  groupId: {
    type: String,
    unique: true,
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: ["summer", "minor"],
  },
  typeOfSummer: {
    type: String,
    enum: ["industrial", "research"],
    required: [true, "Internship type is required!"],
  },
  org: {
    type: Schema.Types.ObjectId,
    ref: "Company",
    required: function () {
      return this.type === "industrial";
    },
  },

  leader: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  members: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
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
  deniedProf: [
    {
      type: Schema.Types.ObjectId,
      ref: "Professor",
    },
  ],
  discussion: [
    {
      _id: {
        type: Schema.Types.ObjectId,
        auto: true,
      },
      date: {
        type: Date,
        default: new Date(),
      },
      absent: [
        {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      description: {
        type: String,
      },
      remark: {
        type: String,
      },
    },
  ],
  preferenceLastMovedAt: {
    type: Date,
    default: Date.now,
  },
  chats: {
    type: String,
    ref: "Chat",
  },
});
export const Group = mongoose.model("Group", groupSchema);
