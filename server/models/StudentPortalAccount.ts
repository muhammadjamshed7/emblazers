import mongoose, { Schema, Document } from "mongoose";

export interface IStudentPortalAccount extends Document {
  studentId: string;
  studentName: string;
  className: string;
  section: string;
  passwordHash: string;
  isFirstLogin: boolean;
  isActive: boolean;
  lastLogin: Date | null;
  createdAt: Date;
}

const StudentPortalAccountSchema = new Schema<IStudentPortalAccount>(
  {
    studentId: { type: String, required: true, unique: true },
    studentName: { type: String, required: true },
    className: { type: String, required: true },
    section: { type: String, required: true },
    passwordHash: { type: String, required: true },
    isFirstLogin: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model<IStudentPortalAccount>("StudentPortalAccount", StudentPortalAccountSchema);
