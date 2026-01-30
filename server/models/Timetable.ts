import mongoose, { Schema, Document } from "mongoose";

export interface ITimetableSlot {
  day: string;
  period: number;
  subject: string;
  teacherId: string;
  teacherName: string;
}

export interface ITimetable extends Document {
  class: string;
  section: string;
  slots: ITimetableSlot[];
  updatedAt: string;
}

const TimetableSlotSchema = new Schema({
  day: { type: String, required: true },
  period: { type: Number, required: true },
  subject: { type: String, required: true },
  teacherId: { type: String, required: true },
  teacherName: { type: String, required: true },
});

const TimetableSchema = new Schema<ITimetable>(
  {
    class: { type: String, required: true },
    section: { type: String, required: true },
    slots: [TimetableSlotSchema],
    updatedAt: { type: String, default: () => new Date().toISOString() },
  },
  { timestamps: false }
);

export default mongoose.model<ITimetable>("Timetable", TimetableSchema);
