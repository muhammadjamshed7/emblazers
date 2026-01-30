import mongoose, { Schema, Document } from "mongoose";

export interface IStaff extends Document {
  staffId: string;
  name: string;
  gender: "Male" | "Female" | "Other";
  dob: string;
  email: string;
  phone: string;
  address: string;
  designation: string;
  department: string;
  campus: string;
  employmentType: "Full-time" | "Part-time" | "Contract";
  status: "Active" | "Probation" | "On Leave" | "Terminated";
  joiningDate: string;
  basicSalary: number;
  paymentMode: "Bank Transfer" | "Cash" | "Cheque";
  photo?: string;
  createdAt: Date;
  updatedAt: Date;
}

const StaffSchema = new Schema<IStaff>(
  {
    staffId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
    dob: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    designation: { type: String, required: true },
    department: { type: String, required: true },
    campus: { type: String, required: true },
    employmentType: { type: String, enum: ["Full-time", "Part-time", "Contract"], required: true },
    status: { type: String, enum: ["Active", "Probation", "On Leave", "Terminated"], required: true },
    joiningDate: { type: String, required: true },
    basicSalary: { type: Number, required: true },
    paymentMode: { type: String, enum: ["Bank Transfer", "Cash", "Cheque"], required: true },
    photo: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IStaff>("Staff", StaffSchema);
