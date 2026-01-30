import mongoose from "mongoose";

const discountRuleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ["Percentage", "Fixed"], required: true },
  value: { type: Number, required: true },
  category: { type: String, enum: ["Sibling", "Merit", "Staff Child", "Scholarship", "Early Bird", "Other"], required: true },
  applicableClasses: [{ type: String }],
  applicableFeeHeads: [{ type: String }],
  validFrom: { type: String, required: true },
  validTo: { type: String },
  isActive: { type: Boolean, default: true },
});

export const DiscountRule = mongoose.model("DiscountRule", discountRuleSchema);
