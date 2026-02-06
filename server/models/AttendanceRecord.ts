import mongoose, { Schema, Document } from "mongoose";

export interface IAttendanceRecord extends Document {
  date: string;
  targetType: "STUDENT" | "STAFF";
  studentId: string | null;
  staffId: string | null;
  entityName: string;
  className: string | null;
  section: string | null;
  status: "PRESENT" | "ABSENT" | "LEAVE";
  markedBy: string;
  remarks: string;
  markedAt: Date;
  updatedAt: Date;
}

const AttendanceRecordSchema = new Schema<IAttendanceRecord>(
  {
    date: { type: String, required: true },
    targetType: { type: String, enum: ["STUDENT", "STAFF"], required: true },
    studentId: { type: String, default: null },
    staffId: { type: String, default: null },
    entityName: { type: String, required: true },
    className: { type: String, default: null },
    section: { type: String, default: null },
    status: { type: String, enum: ["PRESENT", "ABSENT", "LEAVE"], required: true },
    markedBy: { type: String, default: "Attendance Admin" },
    remarks: { type: String, default: "" },
    markedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

AttendanceRecordSchema.index({ date: 1 });
AttendanceRecordSchema.index({ className: 1, section: 1, date: 1 });
AttendanceRecordSchema.index({ studentId: 1, date: 1 }, { unique: true, sparse: true });
AttendanceRecordSchema.index({ staffId: 1, date: 1 }, { unique: true, sparse: true });
AttendanceRecordSchema.index({ status: 1, date: 1 });
AttendanceRecordSchema.index({ targetType: 1, date: 1 });

export default mongoose.model<IAttendanceRecord>("AttendanceRecord", AttendanceRecordSchema);
