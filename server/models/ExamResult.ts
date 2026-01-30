import mongoose, { Schema, Document } from "mongoose";

export interface ISubjectResult {
  subject: string;
  marksObtained: number;
  totalMarks: number;
  grade?: string;
  remarks?: string;
}

export interface IExamResult extends Document {
  resultId: string;
  examId: string;
  examName: string;
  studentId: string;
  studentName: string;
  class: string;
  section: string;
  subjects: ISubjectResult[];
  totalMarksObtained: number;
  totalMaxMarks: number;
  percentage: number;
  grade: string;
  rank?: number;
  status: "Pass" | "Fail" | "Absent";
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SubjectResultSchema = new Schema({
  subject: { type: String, required: true },
  marksObtained: { type: Number, required: true },
  totalMarks: { type: Number, required: true },
  grade: { type: String },
  remarks: { type: String },
});

const ExamResultSchema = new Schema<IExamResult>(
  {
    resultId: { type: String, required: true, unique: true },
    examId: { type: String, required: true },
    examName: { type: String, required: true },
    studentId: { type: String, required: true },
    studentName: { type: String, required: true },
    class: { type: String, required: true },
    section: { type: String, required: true },
    subjects: [SubjectResultSchema],
    totalMarksObtained: { type: Number, required: true },
    totalMaxMarks: { type: Number, required: true },
    percentage: { type: Number, required: true },
    grade: { type: String, required: true },
    rank: { type: Number },
    status: { type: String, enum: ["Pass", "Fail", "Absent"], required: true },
    remarks: { type: String },
  },
  { timestamps: true }
);

ExamResultSchema.index({ examId: 1, studentId: 1 }, { unique: true });

export default mongoose.model<IExamResult>("ExamResult", ExamResultSchema);
