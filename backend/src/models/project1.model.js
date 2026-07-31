import mongoose, { Schema } from "mongoose";

const project1Schema = new Schema(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    appliedProfs: [
      {
        type: Schema.Types.ObjectId,
        ref: "Professor",
      },
    ],
    allocatedProf: {
      type: Schema.Types.ObjectId,
      ref: "Professor",
    },
    deniedProf: [
      {
        type: Schema.Types.ObjectId,
        ref: "Professor",
      },
    ],
    projectTitle: {
      type: String,
      default: "",
    },
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
    marks: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export const Project1 = mongoose.model("Project1", project1Schema);
