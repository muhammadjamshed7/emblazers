import mongoose, { Schema, Document } from "mongoose";

export interface ITopic {
  topic: string;
  status: "Not Started" | "In Progress" | "Completed";
}

export interface IAssignedTeacher {
  teacherId: string;
  teacherName: string;
}

export interface ICurriculum extends Document {
  class: string;
  subject: string;
  topics: ITopic[];
  assignedTeachers: IAssignedTeacher[];
}

const TopicSchema = new Schema({
  topic: { type: String, required: true },
  status: { type: String, enum: ["Not Started", "In Progress", "Completed"], default: "Not Started" },
});

const AssignedTeacherSchema = new Schema({
  teacherId: { type: String, required: true },
  teacherName: { type: String, required: true },
}, { _id: false });

const CurriculumSchema = new Schema<ICurriculum>(
  {
    class: { type: String, required: true },
    subject: { type: String, required: true },
    topics: [TopicSchema],
    assignedTeachers: { type: [AssignedTeacherSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model<ICurriculum>("Curriculum", CurriculumSchema);
