import mongoose, { Schema } from "mongoose";

const BugTrackerSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Bug report title is required!"],
    },
    reporter: {
      kind: { type: String, required: true, enum: ["User", "Professor"] },
      id: {
        type: Schema.Types.ObjectId,
        required: true,
        refPath: "reporter.kind",
      },
    },
    status: {
      type: String,
      enum: ["Open", "In Progress", "Resolved", "Closed"],
      default: "Open",
    },
    reportDescription: { type: String, required: true },
    links: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

export const BugTracker = mongoose.model("BugTracker", BugTrackerSchema);
