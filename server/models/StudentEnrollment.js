import mongoose from 'mongoose';

const studentEnrollmentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student is required'],
      unique: true,
    },
    academicClass: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AcademicClass',
      required: [true, 'Academic Class is required'],
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department is required'],
    },
    rollNumber: {
      type: String,
      required: [true, 'Roll number is required'],
      trim: true,
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

const StudentEnrollment = mongoose.model('StudentEnrollment', studentEnrollmentSchema);
export default StudentEnrollment;
