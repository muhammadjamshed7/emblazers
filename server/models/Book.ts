import mongoose, { Schema, Document } from "mongoose";

export interface IBook extends Document {
  accessionNo: string;
  title: string;
  author: string;
  category: string;
  isbn: string;
  totalCopies: number;
  availableCopies: number;
  status: "Available" | "Issued" | "Out of Stock";
}

const BookSchema = new Schema<IBook>(
  {
    accessionNo: { type: String, required: true },
    title: { type: String, required: true },
    author: { type: String, required: true },
    category: { type: String, required: true },
    isbn: { type: String, default: "" },
    totalCopies: { type: Number, default: 1 },
    availableCopies: { type: Number, default: 1 },
    status: { type: String, enum: ["Available", "Issued", "Out of Stock"], default: "Available" },
  },
  { timestamps: true }
);

export default mongoose.model<IBook>("Book", BookSchema);
