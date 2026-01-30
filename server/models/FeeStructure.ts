import mongoose from "mongoose";

const feeHeadItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  amount: { type: Number, required: true },
  frequency: { type: String, enum: ["Monthly", "Quarterly", "Half-Yearly", "Yearly", "One-Time"], required: true },
  optional: { type: Boolean, default: false },
}, { _id: false });

const feeStructureSchema = new mongoose.Schema({
  structureId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  academicSession: { type: String, required: true },
  class: { type: String, required: true },
  description: { type: String },
  feeHeads: [feeHeadItemSchema],
  totalAmount: { type: Number, required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

export const FeeStructure = mongoose.model("FeeStructure", feeStructureSchema);
