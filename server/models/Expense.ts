import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema({
  expenseId: { type: String, required: true, unique: true },
  date: { type: String, required: true },
  category: { type: String, enum: ["Utilities", "Supplies", "Maintenance", "Salary", "Transport", "Events", "Marketing", "IT", "Other"], required: true },
  subcategory: { type: String },
  description: { type: String, required: true },
  vendorId: { type: String },
  vendorName: { type: String },
  amount: { type: Number, required: true },
  paymentMode: { type: String, enum: ["Cash", "Bank Transfer", "Cheque", "Online"], required: true },
  transactionRef: { type: String },
  invoiceNo: { type: String },
  invoiceDate: { type: String },
  accountId: { type: String },
  accountName: { type: String },
  voucherId: { type: String },
  status: { type: String, enum: ["Pending", "Approved", "Paid", "Cancelled"], default: "Pending" },
  approvedBy: { type: String },
  paidBy: { type: String },
  notes: { type: String },
  attachments: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
});

export const Expense = mongoose.model("Expense", expenseSchema);
