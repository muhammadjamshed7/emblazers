import mongoose, { Schema, Document } from "mongoose";

export interface IBookIssue extends Document {
  bookId: string;
  bookTitle: string;
  memberId: string;
  memberName: string;
  issueDate: string;
  dueDate: string;
  returnDate?: string;
  fine: number;
  status: "Issued" | "Returned" | "Overdue";
}

const BookIssueSchema = new Schema<IBookIssue>(
  {
    bookId: { type: String, required: true },
    bookTitle: { type: String, required: true },
    memberId: { type: String, required: true },
    memberName: { type: String, required: true },
    issueDate: { type: String, required: true },
    dueDate: { type: String, required: true },
    returnDate: { type: String },
    fine: { type: Number, default: 0 },
    status: { type: String, enum: ["Issued", "Returned", "Overdue"], default: "Issued" },
  },
  { timestamps: true }
);

export default mongoose.model<IBookIssue>("BookIssue", BookIssueSchema);
