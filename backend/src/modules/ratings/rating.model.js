import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    artisanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      maxlength: 500,
      default: ''
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

ratingSchema.index({ userId: 1, artisanId: 1 }, { unique: true });

export const Rating = mongoose.model('Rating', ratingSchema);
