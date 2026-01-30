import mongoose from "mongoose";

const lateFeeRuleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ["Fixed", "Percentage", "Daily"], required: true },
  value: { type: Number, required: true },
  gracePeriodDays: { type: Number, required: true },
  maxLateFee: { type: Number },
  applicableClasses: [{ type: String }],
  isActive: { type: Boolean, default: true },
});

export const LateFeeRule = mongoose.model("LateFeeRule", lateFeeRuleSchema);
