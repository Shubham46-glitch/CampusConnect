import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema(
  {
    assignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment',
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    content: {
      type: String,
      default: '',
      trim: true,
    },
    fileName: {
      type: String,
      default: '',
      trim: true,
    },
    fileUrl: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['submitted', 'graded', 'evaluated', 'late'],
      default: 'submitted',
    },
    marks: {
      type: Number,
      default: 0,
      min: [0, 'Marks cannot be negative'],
    },
    feedback: {
      type: String,
      default: '',
      trim: true,
    },
    gradedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate active submission per student per assignment (can be updated)
submissionSchema.index({ assignment: 1, student: 1 }, { unique: true });

const Submission = mongoose.model('Submission', submissionSchema);
export default Submission;
