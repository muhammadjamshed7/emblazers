import mongoose, { Schema, Document } from "mongoose";

export interface IFeeHead {
  name: string;
  amount: number;
}

export interface IPaymentHistory {
  date: string;
  amount: number;
  method: string;
  receivedBy: string;
}

export interface IFeeVoucher extends Document {
  voucherId: string;
  studentId: string;
  studentName: string;
  class: string;
  section: string;
  month: string;
  feeHeads: IFeeHead[];
  totalAmount: number;
  discount: number;
  fine: number;
  netAmount: number;
  paidAmount: number;
  dueDate: string;
  status: "Paid" | "Unpaid" | "Partial";
  paymentHistory: IPaymentHistory[];
  createdAt: Date;
  updatedAt: Date;
}

const FeeHeadSchema = new Schema({
  name: { type: String, required: true },
  amount: { type: Number, required: true },
});

const PaymentHistorySchema = new Schema({
  date: { type: String, required: true },
  amount: { type: Number, required: true },
  method: { type: String, required: true },
  receivedBy: { type: String, required: true },
});

const FeeVoucherSchema = new Schema<IFeeVoucher>(
  {
    voucherId: { type: String, required: true, unique: true },
    studentId: { type: String, required: true },
    studentName: { type: String, required: true },
    class: { type: String, required: true },
    section: { type: String, required: true },
    month: { type: String, required: true },
    feeHeads: [FeeHeadSchema],
    totalAmount: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    fine: { type: Number, default: 0 },
    netAmount: { type: Number, required: true },
    paidAmount: { type: Number, default: 0 },
    dueDate: { type: String, required: true },
    status: { type: String, enum: ["Paid", "Unpaid", "Partial"], default: "Unpaid" },
    paymentHistory: [PaymentHistorySchema],
  },
  { timestamps: true }
);

export default mongoose.model<IFeeVoucher>("FeeVoucher", FeeVoucherSchema);
