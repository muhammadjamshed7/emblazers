import mongoose from "mongoose";

const vendorSchema = new mongoose.Schema({
  vendorId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  contactPerson: { type: String },
  phone: { type: String, required: true },
  email: { type: String },
  address: { type: String, required: true },
  category: { type: String, enum: ["Supplier", "Contractor", "Service Provider", "Utility", "Other"], required: true },
  bankName: { type: String },
  accountNo: { type: String },
  taxId: { type: String },
  status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  createdAt: { type: Date, default: Date.now },
});

export const Vendor = mongoose.model("Vendor", vendorSchema);
