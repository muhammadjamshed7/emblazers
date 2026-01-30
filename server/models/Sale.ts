import mongoose, { Schema, Document } from "mongoose";

export interface ISaleItem {
  itemId: string;
  itemName: string;
  quantity: number;
  price: number;
  total: number;
}

export interface ISale extends Document {
  invoiceNo: string;
  date: string;
  customer: string;
  items: ISaleItem[];
  grandTotal: number;
}

const SaleItemSchema = new Schema({
  itemId: { type: String, required: true },
  itemName: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  total: { type: Number, required: true },
});

const SaleSchema = new Schema<ISale>(
  {
    invoiceNo: { type: String, required: true, unique: true },
    date: { type: String, required: true },
    customer: { type: String, required: true },
    items: [SaleItemSchema],
    grandTotal: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<ISale>("Sale", SaleSchema);
