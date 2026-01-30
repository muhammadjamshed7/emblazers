import mongoose, { Schema, Document } from "mongoose";

export interface ILibraryMember extends Document {
  memberId: string;
  name: string;
  type: "Student" | "Staff";
  contact: string;
  referenceId: string;
}

const LibraryMemberSchema = new Schema<ILibraryMember>(
  {
    memberId: { type: String, required: true },
    name: { type: String, required: true },
    type: { type: String, enum: ["Student", "Staff"], required: true },
    contact: { type: String, default: "" },
    referenceId: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<ILibraryMember>("LibraryMember", LibraryMemberSchema);
