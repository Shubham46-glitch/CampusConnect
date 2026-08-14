import mongoose from 'mongoose';

const academicClassSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Class name / division is required'],
      trim: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department is required'],
    },
    year: {
      type: String,
      required: [true, 'Academic year is required'],
      enum: ['First Year', 'Second Year', 'Third Year', 'Fourth Year'],
      default: 'Second Year',
    },
    semester: {
      type: Number,
      required: [true, 'Semester is required'],
      min: 1,
      max: 8,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

// Ensure unique class name per department
academicClassSchema.index({ department: 1, name: 1 }, { unique: true });

const AcademicClass = mongoose.model('AcademicClass', academicClassSchema);
export default AcademicClass;
