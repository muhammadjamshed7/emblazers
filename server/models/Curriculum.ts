import mongoose, { Schema, Document } from "mongoose";

export interface ITopic {
  topic: string;
  status: "Not Started" | "In Progress" | "Completed";
}

export interface ICurriculum extends Document {
  class: string;
  subject: string;
  topics: ITopic[];
}

const TopicSchema = new Schema({
  topic: { type: String, required: true },
  status: { type: String, enum: ["Not Started", "In Progress", "Completed"], default: "Not Started" },
});

const CurriculumSchema = new Schema<ICurriculum>(
  {
    class: { type: String, required: true },
    subject: { type: String, required: true },
    topics: [TopicSchema],
  },
  { timestamps: true }
);

export default mongoose.model<ICurriculum>("Curriculum", CurriculumSchema);
