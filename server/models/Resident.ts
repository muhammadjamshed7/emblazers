import mongoose, { Schema, Document } from "mongoose";

export interface IResident extends Document {
  residentId: string;
  studentId: string;
  studentName: string;
  class: string;
  section: string;
  roomId: string;
  roomNumber: string;
  building: string;
  checkInDate: string;
  checkOutDate?: string;
  guardianName: string;
  guardianContact: string;
  emergencyContact: string;
  monthlyRent: number;
  status: "Active" | "Checked Out" | "Suspended";
  createdAt: Date;
  updatedAt: Date;
}

const ResidentSchema = new Schema<IResident>(
  {
    residentId: { type: String, required: true, unique: true },
    studentId: { type: String, required: true },
    studentName: { type: String, required: true },
    class: { type: String, required: true },
    section: { type: String, required: true },
    roomId: { type: String, required: true },
    roomNumber: { type: String, required: true },
    building: { type: String, required: true },
    checkInDate: { type: String, required: true },
    checkOutDate: { type: String },
    guardianName: { type: String, required: true },
    guardianContact: { type: String, required: true },
    emergencyContact: { type: String, required: true },
    monthlyRent: { type: Number, required: true },
    status: { type: String, enum: ["Active", "Checked Out", "Suspended"], default: "Active" },
  },
  { timestamps: true }
);

export default mongoose.model<IResident>("Resident", ResidentSchema);
