import mongoose, { Schema, Document } from "mongoose";

export interface IQuestion extends Document {
  subject: string;
  class: string;
  type: "MCQ" | "TrueFalse" | "ShortAnswer";
  prompt: string;
  options?: string[];
  correctAnswer: string;
  marks: number;
  difficulty?: "Easy" | "Medium" | "Hard";
}

const QuestionSchema = new Schema<IQuestion>(
  {
    subject: { type: String, required: true },
    class: { type: String, required: true },
    type: { type: String, enum: ["MCQ", "TrueFalse", "ShortAnswer"], required: true },
    prompt: { type: String, required: true },
    options: [{ type: String }],
    correctAnswer: { type: String, required: true },
    marks: { type: Number, default: 1 },
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard"] },
  },
  { timestamps: true }
);

QuestionSchema.index({ subject: 1, class: 1 });

export default mongoose.model<IQuestion>("Question", QuestionSchema);
