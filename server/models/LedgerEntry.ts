import mongoose from "mongoose";

const ledgerEntrySchema = new mongoose.Schema({
  entryNo: { type: String, required: true, unique: true },
  date: { type: String, required: true },
  accountId: { type: String, required: true },
  accountCode: { type: String, required: true },
  accountName: { type: String, required: true },
  description: { type: String, required: true },
  referenceType: { type: String, enum: ["Challan", "Payment", "Expense", "Payroll", "Journal", "Opening", "Voucher", "FeeCollection", "SalaryPayment"], required: true },
  referenceId: { type: String },
  referenceNo: { type: String },
  debit: { type: Number, default: 0 },
  credit: { type: Number, default: 0 },
  balance: { type: Number, default: 0 },
  createdBy: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export const LedgerEntry = mongoose.model("LedgerEntry", ledgerEntrySchema);
