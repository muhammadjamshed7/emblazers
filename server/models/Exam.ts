import mongoose, { Schema, Document } from "mongoose";

export interface IExam extends Document {
  name: string;
  term: string;
  classRange: string;
  startDate: string;
  endDate: string;
}

const ExamSchema = new Schema<IExam>(
  {
    name: { type: String, required: true },
    term: { type: String, required: true },
    classRange: { type: String, required: true },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IExam>("Exam", ExamSchema);
