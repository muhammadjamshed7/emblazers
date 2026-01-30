import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userRoles = [
  "Student",
  "HR",
  "Fee",
  "Payroll",
  "Finance",
  "Attendance",
  "Timetable",
  "Datesheet",
  "Curriculum",
  "POS",
  "Library",
  "Transport",
  "Hostel",
] as const;

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: userRoles,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model<IUser>("User", UserSchema);
export { userRoles };
