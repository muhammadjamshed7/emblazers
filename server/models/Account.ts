import mongoose, { Schema, Document } from "mongoose";

export interface IAccount extends Document {
  accountId: string;
  code: string;
  name: string;
  type: "Asset" | "Liability" | "Equity" | "Income" | "Expense";
  parentAccountId?: string;
  balance: number;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AccountSchema = new Schema<IAccount>(
  {
    accountId: { type: String, required: true, unique: true },
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    type: { type: String, enum: ["Asset", "Liability", "Equity", "Income", "Expense"], required: true },
    parentAccountId: { type: String },
    balance: { type: Number, default: 0 },
    description: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<IAccount>("Account", AccountSchema);
