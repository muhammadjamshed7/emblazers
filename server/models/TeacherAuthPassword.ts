import mongoose from "mongoose";

const teacherAuthPasswordSchema = new mongoose.Schema({
  staffId: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model("TeacherAuthPassword", teacherAuthPasswordSchema, "teacherAuthPasswords");
