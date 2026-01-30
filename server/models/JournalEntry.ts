import mongoose from "mongoose";

const journalLineSchema = new mongoose.Schema({
  accountId: { type: String, required: true },
  accountCode: { type: String, required: true },
  accountName: { type: String, required: true },
  debit: { type: Number, default: 0 },
  credit: { type: Number, default: 0 },
}, { _id: false });

const journalEntrySchema = new mongoose.Schema({
  journalNo: { type: String, required: true, unique: true },
  date: { type: String, required: true },
  description: { type: String, required: true },
  entries: [journalLineSchema],
  totalDebit: { type: Number, required: true },
  totalCredit: { type: Number, required: true },
  status: { type: String, enum: ["Draft", "Posted", "Reversed"], default: "Draft" },
  createdBy: { type: String },
  approvedBy: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export const JournalEntry = mongoose.model("JournalEntry", journalEntrySchema);
