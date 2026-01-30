import mongoose from "mongoose";

const chartOfAccountsSchema = new mongoose.Schema({
  accountCode: { type: String, required: true, unique: true },
  accountName: { type: String, required: true },
  accountType: { type: String, enum: ["Asset", "Liability", "Equity", "Income", "Expense"], required: true },
  parentAccountId: { type: String },
  level: { type: Number, default: 1 },
  description: { type: String },
  openingBalance: { type: Number, default: 0 },
  currentBalance: { type: Number, default: 0 },
  isSystemAccount: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

export const ChartOfAccounts = mongoose.model("ChartOfAccounts", chartOfAccountsSchema);
