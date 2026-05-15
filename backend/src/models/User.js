import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: [255, 'Email too long'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false, // never returned in queries unless explicitly requested
    },
    name: {
      type: String,
      trim: true,
      maxlength: [100, 'Name too long'],
      default: null,
    },
  },
  { timestamps: true }
);

// Clean up _id / __v from JSON responses
userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    delete ret.password;
    return ret;
  },
});

export default mongoose.model('User', userSchema);
