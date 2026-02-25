import mongoose, { Schema, Document } from "mongoose";

export interface IStudentQuizAnswer {
  questionIndex: number;
  givenAnswer: string;
  isCorrect: boolean;
  marksAwarded: number;
}

export interface IStudentQuizAttempt extends Document {
  quizId: string;
  studentId: string;
  studentName: string;
  className: string;
  section: string;
  answers: IStudentQuizAnswer[];
  totalMarksObtained: number;
  totalMarks: number;
  percentage: number;
  grade: string;
  isPassed: boolean;
  timeTakenMinutes: number;
  submittedAt: Date;
}

const AnswerSchema = new Schema(
  {
    questionIndex: { type: Number, required: true },
    givenAnswer: { type: String, default: "" },
    isCorrect: { type: Boolean, default: false },
    marksAwarded: { type: Number, default: 0 },
  },
  { _id: false }
);

const StudentQuizAttemptSchema = new Schema<IStudentQuizAttempt>(
  {
    quizId: { type: String, required: true },
    studentId: { type: String, required: true },
    studentName: { type: String, required: true },
    className: { type: String, required: true },
    section: { type: String, required: true },
    answers: [AnswerSchema],
    totalMarksObtained: { type: Number, default: 0 },
    totalMarks: { type: Number, required: true },
    percentage: { type: Number, default: 0 },
    grade: { type: String, default: "F" },
    isPassed: { type: Boolean, default: false },
    timeTakenMinutes: { type: Number, default: 0 },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

StudentQuizAttemptSchema.index({ quizId: 1, studentId: 1 }, { unique: true });

export default mongoose.model<IStudentQuizAttempt>("StudentQuizAttempt", StudentQuizAttemptSchema);
