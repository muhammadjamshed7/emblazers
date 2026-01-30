import mongoose, { Schema, Document } from "mongoose";

export interface IAllowance {
  name: string;
  amount: number;
}

export interface IDeduction {
  name: string;
  amount: number;
}

export interface IPayroll extends Document {
  payrollId: string;
  staffId: string;
  staffName: string;
  department: string;
  designation: string;
  month: string;
  basicSalary: number;
  allowances: IAllowance[];
  deductions: IDeduction[];
  grossSalary: number;
  netSalary: number;
  status: "Paid" | "Unpaid";
  paidDate?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AllowanceSchema = new Schema({
  name: { type: String, required: true },
  amount: { type: Number, required: true },
}, { _id: false });

const DeductionSchema = new Schema({
  name: { type: String, required: true },
  amount: { type: Number, required: true },
}, { _id: false });

const PayrollSchema = new Schema<IPayroll>(
  {
    payrollId: { type: String, required: true, unique: true },
    staffId: { type: String, required: true },
    staffName: { type: String, required: true },
    department: { type: String, required: true },
    designation: { type: String, required: true },
    month: { type: String, required: true },
    basicSalary: { type: Number, required: true },
    allowances: [AllowanceSchema],
    deductions: [DeductionSchema],
    grossSalary: { type: Number, required: true },
    netSalary: { type: Number, required: true },
    status: { type: String, enum: ["Paid", "Unpaid"], default: "Unpaid" },
    paidDate: { type: String },
  },
  { timestamps: true }
);

PayrollSchema.index({ staffId: 1, month: 1 }, { unique: true });

export default mongoose.model<IPayroll>("Payroll", PayrollSchema);
