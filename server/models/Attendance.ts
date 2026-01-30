import mongoose, { Schema, Document } from "mongoose";

export interface IAttendanceRecord {
  entityId: string;
  entityName: string;
  status: "Present" | "Absent" | "Late" | "Leave";
}

export interface IAttendance extends Document {
  date: string;
  class?: string;
  section?: string;
  type: "student" | "staff";
  records: IAttendanceRecord[];
  markedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceRecordSchema = new Schema({
  entityId: { type: String, required: true },
  entityName: { type: String, required: true },
  status: { type: String, enum: ["Present", "Absent", "Late", "Leave"], required: true },
});

const AttendanceSchema = new Schema<IAttendance>(
  {
    date: { type: String, required: true },
    class: { type: String },
    section: { type: String },
    type: { type: String, enum: ["student", "staff"], required: true },
    records: [AttendanceRecordSchema],
    markedBy: { type: String, required: true },
  },
  { timestamps: true }
);

AttendanceSchema.index({ date: 1, class: 1, section: 1, type: 1 }, { unique: true });

export default mongoose.model<IAttendance>("Attendance", AttendanceSchema);
