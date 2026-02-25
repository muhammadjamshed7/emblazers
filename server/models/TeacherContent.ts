import mongoose, { Schema, Document } from "mongoose";

export interface ITeacherContent extends Document {
  staffId: string;
  teacherName: string;
  className: string;
  section: string;
  subject: string;
  title: string;
  description: string;
  contentType: "pdf" | "image" | "note" | "link";
  fileData: string;
  fileName: string;
  isPublished: boolean;
  createdAt: Date;
}

const TeacherContentSchema = new Schema<ITeacherContent>(
  {
    staffId: { type: String, required: true },
    teacherName: { type: String, required: true },
    className: { type: String, required: true },
    section: { type: String, required: true },
    subject: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    contentType: { type: String, enum: ["pdf", "image", "note", "link"], required: true },
    fileData: { type: String, default: "" },
    fileName: { type: String, default: "" },
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<ITeacherContent>("TeacherContent", TeacherContentSchema);
