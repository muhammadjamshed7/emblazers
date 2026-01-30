import mongoose, { Schema, Document } from "mongoose";

export interface IVoucherEntry {
  accountId: string;
  accountName: string;
  debit: number;
  credit: number;
  description?: string;
}

export interface IFinanceVoucher extends Document {
  voucherId: string;
  voucherNumber: string;
  type: "Receipt" | "Payment" | "Journal" | "Contra";
  date: string;
  entries: IVoucherEntry[];
  totalDebit: number;
  totalCredit: number;
  narration: string;
  reference?: string;
  status: "Draft" | "Posted" | "Cancelled";
  createdBy: string;
  postedBy?: string;
  postedAt?: string;
  createdAt: Date;
  updatedAt: Date;
}

const VoucherEntrySchema = new Schema({
  accountId: { type: String, required: true },
  accountName: { type: String, required: true },
  debit: { type: Number, default: 0 },
  credit: { type: Number, default: 0 },
  description: { type: String },
});

const FinanceVoucherSchema = new Schema<IFinanceVoucher>(
  {
    voucherId: { type: String, required: true, unique: true },
    voucherNumber: { type: String, required: true, unique: true },
    type: { type: String, enum: ["Receipt", "Payment", "Journal", "Contra"], required: true },
    date: { type: String, required: true },
    entries: [VoucherEntrySchema],
    totalDebit: { type: Number, required: true },
    totalCredit: { type: Number, required: true },
    narration: { type: String, required: true },
    reference: { type: String },
    status: { type: String, enum: ["Draft", "Posted", "Cancelled"], default: "Draft" },
    createdBy: { type: String, required: true },
    postedBy: { type: String },
    postedAt: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IFinanceVoucher>("FinanceVoucher", FinanceVoucherSchema);
