import mongoose from "mongoose";

const feeHeadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  amount: { type: Number, required: true },
}, { _id: false });

const challanSchema = new mongoose.Schema({
  challanNo: { type: String, required: true, unique: true },
  studentId: { type: String, required: true },
  studentName: { type: String, required: true },
  class: { type: String, required: true },
  section: { type: String, required: true },
  academicSession: { type: String, required: true },
  period: { type: String, required: true },
  feeStructureId: { type: String },
  feeHeads: [feeHeadSchema],
  totalAmount: { type: Number, required: true },
  discountId: { type: String },
  discountName: { type: String },
  discountAmount: { type: Number, default: 0 },
  lateFee: { type: Number, default: 0 },
  adjustments: { type: Number, default: 0 },
  netAmount: { type: Number, required: true },
  paidAmount: { type: Number, default: 0 },
  balanceAmount: { type: Number, required: true },
  dueDate: { type: String, required: true },
  issueDate: { type: String, required: true },
  status: { type: String, enum: ["Pending", "Partial", "Paid", "Overdue", "Cancelled"], default: "Pending" },
  installmentPlanId: { type: String },
  installmentNumber: { type: Number },
  createdAt: { type: Date, default: Date.now },
});

export const Challan = mongoose.model("Challan", challanSchema);
