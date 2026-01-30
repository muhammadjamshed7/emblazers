import mongoose, { Schema, Document } from "mongoose";

export interface IVacancy extends Document {
  title: string;
  department: string;
  designation: string;
  positions: number;
  employmentType: "Permanent" | "Contract" | "Visiting";
  salaryRange?: string;
  qualifications: string;
  experience: string;
  description: string;
  lastDate: string;
  status: "Open" | "Closed" | "On Hold";
  createdAt: Date;
  updatedAt: Date;
}

const VacancySchema = new Schema<IVacancy>(
  {
    title: { type: String, required: true },
    department: { type: String, required: true },
    designation: { type: String, required: true },
    positions: { type: Number, required: true, default: 1 },
    employmentType: { type: String, enum: ["Permanent", "Contract", "Visiting"], default: "Permanent" },
    salaryRange: { type: String },
    qualifications: { type: String, required: true },
    experience: { type: String, required: true },
    description: { type: String, required: true },
    lastDate: { type: String, required: true },
    status: { type: String, enum: ["Open", "Closed", "On Hold"], default: "Open" },
  },
  { timestamps: true }
);

export default mongoose.model<IVacancy>("Vacancy", VacancySchema);
