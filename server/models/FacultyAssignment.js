import mongoose from 'mongoose';

const facultyAssignmentSchema = new mongoose.Schema(
  {
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Faculty user is required'],
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Subject is required'],
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

facultyAssignmentSchema.index({ faculty: 1, subject: 1, academicClass: 1 }, { unique: true });

const FacultyAssignment = mongoose.model('FacultyAssignment', facultyAssignmentSchema);
export default FacultyAssignment;
