import mongoose, { Schema, Document } from "mongoose";

export interface IPOSItem extends Document {
  itemCode: string;
  name: string;
  category: string;
  price: number;
  stock: number;
}

const POSItemSchema = new Schema<IPOSItem>(
  {
    itemCode: { type: String, required: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model<IPOSItem>("POSItem", POSItemSchema);
