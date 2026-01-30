import mongoose, { Schema, Document } from "mongoose";

export interface IRoom extends Document {
  hostelName: string;
  roomNumber: string;
  bedCount: number;
  occupiedBeds: number;
  status: "Available" | "Full" | "Maintenance";
  createdAt: Date;
  updatedAt: Date;
}

const RoomSchema = new Schema<IRoom>(
  {
    hostelName: { type: String, required: true },
    roomNumber: { type: String, required: true },
    bedCount: { type: Number, required: true },
    occupiedBeds: { type: Number, default: 0 },
    status: { type: String, enum: ["Available", "Full", "Maintenance"], default: "Available" },
  },
  { timestamps: true }
);

export default mongoose.model<IRoom>("Room", RoomSchema);
