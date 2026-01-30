import mongoose, { Schema, Document } from "mongoose";

export interface ITransportAllocation extends Document {
  allocationId: string;
  studentId: string;
  studentName: string;
  class: string;
  section: string;
  routeId: string;
  routeName: string;
  stopName: string;
  pickupTime: string;
  dropTime: string;
  monthlyFee: number;
  startDate: string;
  endDate?: string;
  status: "Active" | "Inactive";
  createdAt: Date;
  updatedAt: Date;
}

const TransportAllocationSchema = new Schema<ITransportAllocation>(
  {
    allocationId: { type: String, required: true, unique: true },
    studentId: { type: String, required: true },
    studentName: { type: String, required: true },
    class: { type: String, required: true },
    section: { type: String, required: true },
    routeId: { type: String, required: true },
    routeName: { type: String, required: true },
    stopName: { type: String, required: true },
    pickupTime: { type: String, required: true },
    dropTime: { type: String, required: true },
    monthlyFee: { type: Number, required: true },
    startDate: { type: String, required: true },
    endDate: { type: String },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  },
  { timestamps: true }
);

export default mongoose.model<ITransportAllocation>("TransportAllocation", TransportAllocationSchema);
