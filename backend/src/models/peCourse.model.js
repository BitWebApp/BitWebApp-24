import mongoose, { Schema } from 'mongoose';
import { User } from './user.model.js';

const peCourseSchema = new Schema(
  {
    courseCode: {
      type: String,
      required: true,
    },
    courseName: {
      type: String,
      required: true,
    },
    branch: {
      type: String,
      required: true,
    },
    batch: {
      type: Number,
      required: [true, "Batch is required"],
      index: true,
    },
    type: {
      type: String,
      enum: ['pe4', 'pe5'],
      required: true,
    },
    students: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { timestamps: true }
);

peCourseSchema.index({ courseCode: 1, branch: 1, batch: 1 }, { unique: true });

export const PeCourse = mongoose.model('PeCourse', peCourseSchema);
