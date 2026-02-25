import mongoose, { Schema, Document } from "mongoose";

export interface ITeacherAssignment extends Document {
  staffId: string;
  staffName: string;
  staffEmail: string;
  className: string;
  section: string;
  subject: string;
  assignedBy: string;
  isActive: boolean;
  createdAt: Date;
}

const TeacherAssignmentSchema = new Schema<ITeacherAssignment>(
  {
    staffId: { type: String, required: true },
    staffName: { type: String, required: true },
    staffEmail: { type: String, required: true },
    className: { type: String, required: true },
    section: { type: String, required: true },
    subject: { type: String, required: true },
    assignedBy: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

TeacherAssignmentSchema.index({ staffId: 1, className: 1, section: 1, subject: 1 }, { unique: true });

export default mongoose.model<ITeacherAssignment>("TeacherAssignment", TeacherAssignmentSchema);
