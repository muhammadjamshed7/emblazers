import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema({
  module: { type: String, required: true },
  action: { 
    type: String, 
    enum: ["create", "update", "delete", "generate", "payment", "status_change", "export", "import", "login", "other"],
    required: true 
  },
  entityType: { type: String, required: true },
  entityId: { type: String },
  entityName: { type: String },
  description: { type: String, required: true },
  userId: { type: String },
  userEmail: { type: String },
  metadata: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
});

activityLogSchema.index({ module: 1, createdAt: -1 });
activityLogSchema.index({ createdAt: -1 });

export const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);
