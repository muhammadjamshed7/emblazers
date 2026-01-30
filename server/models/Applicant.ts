import mongoose, { Schema, Document } from "mongoose";

export interface IApplicant extends Document {
  vacancyId: string;
  vacancyTitle: string;
  name: string;
  email: string;
  phone: string;
  cnic: string;
  address?: string;
  qualification: string;
  experience: string;
  expectedSalary?: number;
  appliedDate: string;
  status: "New" | "Shortlisted" | "Interviewed" | "Offered" | "Hired" | "Rejected";
  createdAt: Date;
  updatedAt: Date;
}

const ApplicantSchema = new Schema<IApplicant>(
  {
    vacancyId: { type: String, required: true },
    vacancyTitle: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    cnic: { type: String, required: true },
    address: { type: String },
    qualification: { type: String, required: true },
    experience: { type: String, required: true },
    expectedSalary: { type: Number },
    appliedDate: { type: String, required: true },
    status: { type: String, enum: ["New", "Shortlisted", "Interviewed", "Offered", "Hired", "Rejected"], default: "New" },
  },
  { timestamps: true }
);

export default mongoose.model<IApplicant>("Applicant", ApplicantSchema);
