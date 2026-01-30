import mongoose, { Schema, Document } from "mongoose";

export interface IStudent extends Document {
  studentId: string;
  name: string;
  gender: "Male" | "Female" | "Other";
  dob: string;
  parentName: string;
  parentContact: string;
  parentEmail: string;
  fatherCnic?: string;
  motherCnic?: string;
  address: string;
  class: string;
  section: string;
  previousSchool?: string;
  previousClass?: string;
  admissionDate: string;
  status: "Active" | "Inactive" | "Alumni" | "Left";
  notes?: string;
  photo?: string;
  createdAt: Date;
  updatedAt: Date;
}

const StudentSchema = new Schema<IStudent>(
  {
    studentId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
    dob: { type: String, required: true },
    parentName: { type: String, required: true },
    parentContact: { type: String, required: true },
    parentEmail: { type: String },
    fatherCnic: { type: String },
    motherCnic: { type: String },
    address: { type: String },
    class: { type: String, required: true },
    section: { type: String, required: true },
    previousSchool: { type: String },
    previousClass: { type: String },
    admissionDate: { type: String, required: true },
    status: { type: String, enum: ["Active", "Inactive", "Alumni", "Left"], default: "Active" },
    notes: { type: String },
    photo: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IStudent>("Student", StudentSchema);
