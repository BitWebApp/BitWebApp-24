import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true 
    },
    rollNumber: { 
      type: String, 
      required: true 
    },
    content: { 
      type: String, 
      required: true 
    },
  }, 
  { timestamps: true }
);

export const Review = mongoose.model('Review', reviewSchema);
