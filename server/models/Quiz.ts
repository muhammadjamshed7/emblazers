import mongoose, { Schema, Document } from "mongoose";

export interface IQuizQuestionRef {
  questionId: string;
  marks: number;
}

export interface IQuiz extends Document {
  title: string;
  class: string;
  section?: string;
  subject: string;
  term?: string;
  totalMarks: number;
  timeLimit?: number;
  questions: IQuizQuestionRef[];
  assignedBy?: string;
  status: "Draft" | "Published" | "Closed";
  createdAt?: string;
}

const QuizQuestionRefSchema = new Schema({
  questionId: { type: String, required: true },
  marks: { type: Number, required: true },
}, { _id: false });

const QuizSchema = new Schema<IQuiz>(
  {
    title: { type: String, required: true },
    class: { type: String, required: true },
    section: { type: String },
    subject: { type: String, required: true },
    term: { type: String },
    totalMarks: { type: Number, required: true },
    timeLimit: { type: Number },
    questions: [QuizQuestionRefSchema],
    assignedBy: { type: String },
    status: { type: String, enum: ["Draft", "Published", "Closed"], default: "Draft" },
  },
  { timestamps: true }
);

export default mongoose.model<IQuiz>("Quiz", QuizSchema);
