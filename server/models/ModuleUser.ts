import mongoose, { Schema, Document } from "mongoose";

export interface IModuleUser extends Document {
  module: string;
  email: string;
  passwordHash: string;
  name: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const moduleTypes = [
  "student",
  "hr",
  "fee",
  "payroll",
  "finance",
  "attendance",
  "timetable",
  "datesheet",
  "curriculum",
  "pos",
  "library",
  "transport",
  "hostel",
] as const;

const ModuleUserSchema = new Schema<IModuleUser>(
  {
    module: {
      type: String,
      required: true,
      enum: moduleTypes,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      default: "admin",
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

ModuleUserSchema.index({ module: 1 }, { unique: true });

export const ModuleUser = mongoose.model<IModuleUser>("ModuleUser", ModuleUserSchema);
