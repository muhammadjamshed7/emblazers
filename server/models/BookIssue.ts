import mongoose, { Schema, Document } from "mongoose";

export interface IBookIssue extends Document {
  bookId: string;
  bookTitle: string;
  accessionNo: string;
  memberId: string;
  memberName: string;
  memberType: "Student" | "Staff";
  class?: string;
  section?: string;
  issueDate: string;
  dueDate: string;
  returnDate?: string;
  fine: number;
  finePaid: boolean;
  status: "Issued" | "Returned" | "Overdue";
}

const BookIssueSchema = new Schema<IBookIssue>(
  {
    bookId: { type: String, required: true },
    bookTitle: { type: String, required: true },
    accessionNo: { type: String, required: true },
    memberId: { type: String, required: true },
    memberName: { type: String, required: true },
    memberType: { type: String, enum: ["Student", "Staff"], required: true },
    class: { type: String },
    section: { type: String },
    issueDate: { type: String, required: true },
    dueDate: { type: String, required: true },
    returnDate: { type: String },
    fine: { type: Number, default: 0 },
    finePaid: { type: Boolean, default: false },
    status: { type: String, enum: ["Issued", "Returned", "Overdue"], default: "Issued" },
  },
  { timestamps: true }
);

export default mongoose.model<IBookIssue>("BookIssue", BookIssueSchema);
