import mongoose, { Schema, Document } from "mongoose";

export interface IDriver extends Document {
  driverId: string;
  name: string;
  cnic: string;
  contact: string;
  address: string;
  licenseNumber: string;
  licenseExpiry: string;
  experience: number;
  vehicleId?: string;
  routeId?: string;
  salary: number;
  status: "Active" | "On Leave" | "Inactive";
  photo?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DriverSchema = new Schema<IDriver>(
  {
    driverId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    cnic: { type: String, required: true },
    contact: { type: String, required: true },
    address: { type: String },
    licenseNumber: { type: String, required: true },
    licenseExpiry: { type: String, required: true },
    experience: { type: Number, required: true },
    vehicleId: { type: String },
    routeId: { type: String },
    salary: { type: Number, required: true },
    status: { type: String, enum: ["Active", "On Leave", "Inactive"], default: "Active" },
    photo: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IDriver>("Driver", DriverSchema);
