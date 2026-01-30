import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  receiptNo: { type: String, required: true, unique: true },
  challanId: { type: String, required: true },
  challanNo: { type: String, required: true },
  studentId: { type: String, required: true },
  studentName: { type: String, required: true },
  amount: { type: Number, required: true },
  paymentMode: { type: String, enum: ["Cash", "Bank Transfer", "Cheque", "Online", "Card"], required: true },
  transactionRef: { type: String },
  bankName: { type: String },
  chequeNo: { type: String },
  chequeDate: { type: String },
  paymentDate: { type: String, required: true },
  receivedBy: { type: String, required: true },
  notes: { type: String },
  type: { type: String, enum: ["Payment", "Refund", "Adjustment"], default: "Payment" },
  status: { type: String, enum: ["Completed", "Pending", "Cancelled", "Bounced"], default: "Completed" },
  createdAt: { type: Date, default: Date.now },
});

export const Payment = mongoose.model("Payment", paymentSchema);
