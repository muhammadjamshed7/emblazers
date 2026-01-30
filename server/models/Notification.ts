import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ["fee_due", "fee_overdue", "attendance_alert", "payroll_pending", "payroll_processed", "low_stock", "library_overdue", "system", "action_log"],
    required: true 
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  module: { type: String, required: true },
  priority: { 
    type: String, 
    enum: ["low", "medium", "high"],
    default: "medium" 
  },
  read: { type: Boolean, default: false },
  link: { type: String },
  metadata: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
});

notificationSchema.index({ module: 1, read: 1, createdAt: -1 });
notificationSchema.index({ createdAt: -1 });

export const Notification = mongoose.model("Notification", notificationSchema);
