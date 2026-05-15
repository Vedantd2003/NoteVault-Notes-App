import mongoose from 'mongoose';

export const VALID_COLORS = [
  'default', 'red', 'orange', 'yellow',
  'green', 'blue', 'purple', 'pink',
];

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [255, 'Title too long'],
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
      maxlength: [50000, 'Content too long'],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    // Array of user IDs the note has been shared with
    sharedWith: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isPinned: {
      type: Boolean,
      default: false,
    },
    // Extra Feature: colour label for visual organisation
    color: {
      type: String,
      enum: VALID_COLORS,
      default: 'default',
    },
    // Extra Feature: free-text category tag
    tag: {
      type: String,
      trim: true,
      maxlength: [50, 'Tag too long'],
      default: null,
    },
  },
  { timestamps: true }
);

// Compound indexes for fast "notes visible to userId" queries
noteSchema.index({ owner: 1, updatedAt: -1 });
noteSchema.index({ sharedWith: 1 });
// Text index enables MongoDB's $text operator for full-text search
noteSchema.index({ title: 'text', content: 'text' });

export default mongoose.model('Note', noteSchema);
