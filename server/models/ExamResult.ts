import mongoose, { Schema, Document } from "mongoose";

export interface IExamResult extends Document {
  resultId: string;
  examId: string;
  studentId: string;
  studentName: string;
  class: string;
  subject: string;
  marksObtained: number;
  maxMarks: number;
  grade: string;
  createdAt: Date;
  updatedAt: Date;
}

const ExamResultSchema = new Schema<IExamResult>(
  {
    resultId: { type: String, required: true, unique: true },
    examId: { type: String, required: true },
    studentId: { type: String, required: true },
    studentName: { type: String, required: true },
    class: { type: String, required: true },
    subject: { type: String, required: true },
    marksObtained: { type: Number, required: true },
    maxMarks: { type: Number, required: true },
    grade: { type: String, required: true },
  },
  { timestamps: true }
);

ExamResultSchema.index({ examId: 1, studentId: 1, subject: 1 }, { unique: true });

export default mongoose.model<IExamResult>("ExamResult", ExamResultSchema);
