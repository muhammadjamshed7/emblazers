import mongoose from "mongoose";

const installmentSchema = new mongoose.Schema({
  installmentNumber: { type: Number, required: true },
  percentage: { type: Number, required: true },
  dueDate: { type: String, required: true },
}, { _id: false });

const installmentPlanSchema = new mongoose.Schema({
  name: { type: String, required: true },
  numberOfInstallments: { type: Number, required: true },
  installments: [installmentSchema],
  applicableClasses: [{ type: String }],
  isActive: { type: Boolean, default: true },
});

export const InstallmentPlan = mongoose.model("InstallmentPlan", installmentPlanSchema);
