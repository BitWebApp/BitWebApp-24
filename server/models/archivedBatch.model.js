import mongoose, { Schema } from "mongoose";
import { PROGRAM_VALUES } from "../utils/programs.js";

/**
 * A batch of a program that the master admin has archived, e.g. B.Tech K22
 * after it passed out. Archived batches are hidden by default in lists and
 * filters but stay fully viewable and editable when chosen explicitly.
 */
const archivedBatchSchema = new Schema(
  {
    program: {
      type: String,
      enum: PROGRAM_VALUES,
      required: true,
    },
    batch: {
      type: Number,
      required: true,
    },
    archivedBy: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  { timestamps: true }
);

archivedBatchSchema.index({ program: 1, batch: 1 }, { unique: true });

export const ArchivedBatch = mongoose.model(
  "ArchivedBatch",
  archivedBatchSchema
);
