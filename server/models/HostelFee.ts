import mongoose, { Schema, Document } from "mongoose";

export interface IHostelFee extends Document {
  feeId: string;
  residentId: string;
  studentId: string;
  studentName: string;
  roomNumber: string;
  month: string;
  year: number;
  rentAmount: number;
  messAmount: number;
  utilitiesAmount: number;
  otherCharges: number;
  totalAmount: number;
  paidAmount: number;
  dueDate: string;
  status: "Pending" | "Paid" | "Partial" | "Overdue";
  paymentDate?: string;
  paymentMethod?: string;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

const HostelFeeSchema = new Schema<IHostelFee>(
  {
    feeId: { type: String, required: true, unique: true },
    residentId: { type: String, required: true },
    studentId: { type: String, required: true },
    studentName: { type: String, required: true },
    roomNumber: { type: String, required: true },
    month: { type: String, required: true },
    year: { type: Number, required: true },
    rentAmount: { type: Number, required: true },
    messAmount: { type: Number, default: 0 },
    utilitiesAmount: { type: Number, default: 0 },
    otherCharges: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    paidAmount: { type: Number, default: 0 },
    dueDate: { type: String, required: true },
    status: { type: String, enum: ["Pending", "Paid", "Partial", "Overdue"], default: "Pending" },
    paymentDate: { type: String },
    paymentMethod: { type: String },
    remarks: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IHostelFee>("HostelFee", HostelFeeSchema);
