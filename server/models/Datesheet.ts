import mongoose, { Schema, Document } from "mongoose";

export interface IDatesheetEntry {
  subject: string;
  date: string;
  startTime: string;
  endTime: string;
  room: string;
  invigilatorId: string;
  invigilatorName: string;
}

export interface IDatesheet extends Document {
  examName: string;
  examType: "Monthly" | "Term" | "Annual";
  class: string;
  startDate: string;
  endDate: string;
  entries: IDatesheetEntry[];
  createdAt: Date;
  updatedAt: Date;
}

const DatesheetEntrySchema = new Schema({
  subject: { type: String, required: true },
  date: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  room: { type: String, default: "" },
  invigilatorId: { type: String, default: "" },
  invigilatorName: { type: String, default: "" },
});

const DatesheetSchema = new Schema<IDatesheet>(
  {
    examName: { type: String, required: true },
    examType: { type: String, enum: ["Monthly", "Term", "Annual"], required: true },
    class: { type: String, required: true },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    entries: [DatesheetEntrySchema],
  },
  { timestamps: true }
);

export default mongoose.model<IDatesheet>("Datesheet", DatesheetSchema);
