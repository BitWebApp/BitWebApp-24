import mongoose, { Schema } from 'mongoose';
import { User } from './user.model.js';

const peCourseSchema = new Schema(
  {
    courseCode: {
      type: String,
      required: true,
      unique: true,
    },
    courseName: {
      type: String,
      required: true,
    },
    branch: {
      type: String,
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

export const PeCourse = mongoose.model('PeCourse', peCourseSchema);