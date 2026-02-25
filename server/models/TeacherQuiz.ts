import mongoose, { Schema, Document } from "mongoose";

export interface ITeacherQuizQuestion {
  questionText: string;
  questionType: "mcq" | "truefalse" | "short";
  options: string[];
  correctAnswer: string;
  marks: number;
}

export interface ITeacherQuiz extends Document {
  staffId: string;
  teacherName: string;
  className: string;
  section: string;
  subject: string;
  title: string;
  instructions: string;
  timeLimitMinutes: number;
  startDateTime: Date;
  endDateTime: Date;
  passingMarks: number;
  totalMarks: number;
  isPublished: boolean;
  questions: ITeacherQuizQuestion[];
  createdAt: Date;
}

const QuizQuestionSchema = new Schema(
  {
    questionText: { type: String, required: true },
    questionType: { type: String, enum: ["mcq", "truefalse", "short"], required: true },
    options: [{ type: String }],
    correctAnswer: { type: String, required: true },
    marks: { type: Number, required: true, default: 1 },
  },
  { _id: false }
);

const TeacherQuizSchema = new Schema<ITeacherQuiz>(
  {
    staffId: { type: String, required: true },
    teacherName: { type: String, required: true },
    className: { type: String, required: true },
    section: { type: String, required: true },
    subject: { type: String, required: true },
    title: { type: String, required: true },
    instructions: { type: String, default: "" },
    timeLimitMinutes: { type: Number, required: true, default: 30 },
    startDateTime: { type: Date, required: true },
    endDateTime: { type: Date, required: true },
    passingMarks: { type: Number, required: true },
    totalMarks: { type: Number, required: true },
    isPublished: { type: Boolean, default: false },
    questions: [QuizQuestionSchema],
  },
  { timestamps: true }
);

export default mongoose.model<ITeacherQuiz>("TeacherQuiz", TeacherQuizSchema);
