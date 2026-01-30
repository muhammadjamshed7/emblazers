import mongoose, { Schema, Document } from "mongoose";

export interface IVehicle extends Document {
  vehicleId: string;
  registrationNumber: string;
  type: "Bus" | "Van" | "Coaster" | "Car";
  capacity: number;
  model: string;
  make: string;
  year: number;
  driverId?: string;
  driverName?: string;
  routeId?: string;
  routeName?: string;
  status: "Active" | "Under Maintenance" | "Inactive";
  insuranceExpiry: string;
  fitnessExpiry: string;
  createdAt: Date;
  updatedAt: Date;
}

const VehicleSchema = new Schema<IVehicle>(
  {
    vehicleId: { type: String, required: true, unique: true },
    registrationNumber: { type: String, required: true, unique: true },
    type: { type: String, enum: ["Bus", "Van", "Coaster", "Car"], required: true },
    capacity: { type: Number, required: true },
    model: { type: String, required: true },
    make: { type: String, required: true },
    year: { type: Number, required: true },
    driverId: { type: String },
    driverName: { type: String },
    routeId: { type: String },
    routeName: { type: String },
    status: { type: String, enum: ["Active", "Under Maintenance", "Inactive"], default: "Active" },
    insuranceExpiry: { type: String, required: true },
    fitnessExpiry: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IVehicle>("Vehicle", VehicleSchema);
