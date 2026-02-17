import mongoose, { Schema, Document } from "mongoose";

export interface IQuizAnswer {
  questionId: string;
  answer: string;
}

export interface IQuizAttempt extends Document {
  quizId: string;
  quizTitle: string;
  studentId: string;
  studentName: string;
  class: string;
  section?: string;
  answers: IQuizAnswer[];
  score: number;
  maxScore: number;
  autoGraded: boolean;
  status: "Submitted" | "Graded";
  submittedAt?: string;
}

const QuizAnswerSchema = new Schema({
  questionId: { type: String, required: true },
  answer: { type: String, required: true },
}, { _id: false });

const QuizAttemptSchema = new Schema<IQuizAttempt>(
  {
    quizId: { type: String, required: true },
    quizTitle: { type: String, required: true },
    studentId: { type: String, required: true },
    studentName: { type: String, required: true },
    class: { type: String, required: true },
    section: { type: String },
    answers: [QuizAnswerSchema],
    score: { type: Number, default: 0 },
    maxScore: { type: Number, required: true },
    autoGraded: { type: Boolean, default: true },
    status: { type: String, enum: ["Submitted", "Graded"], default: "Submitted" },
    submittedAt: { type: String },
  },
  { timestamps: true }
);

QuizAttemptSchema.index({ quizId: 1, studentId: 1 });

export default mongoose.model<IQuizAttempt>("QuizAttempt", QuizAttemptSchema);
