import mongoose, { Schema, Document } from "mongoose";

export interface IBook extends Document {
  accessionNo: string;
  title: string;
  author: string;
  category: string;
  isbn: string;
  status: "Available" | "Issued";
}

const BookSchema = new Schema<IBook>(
  {
    accessionNo: { type: String, required: true },
    title: { type: String, required: true },
    author: { type: String, required: true },
    category: { type: String, required: true },
    isbn: { type: String, default: "" },
    status: { type: String, enum: ["Available", "Issued"], default: "Available" },
  },
  { timestamps: true }
);

export default mongoose.model<IBook>("Book", BookSchema);
