import mongoose from "mongoose";

async function fixAttendanceIndexes(): Promise<void> {
  try {
    const db = mongoose.connection.db;
    if (!db) return;
    const collection = db.collection("attendancerecords");
    const indexes = await collection.indexes();
    for (const idx of indexes) {
      if (
        idx.key &&
        ((idx.key.studentId && idx.key.date && idx.sparse) ||
         (idx.key.staffId && idx.key.date && idx.sparse))
      ) {
        console.log(`Dropping old sparse index: ${idx.name}`);
        await collection.dropIndex(idx.name!);
      }
    }
    await collection.deleteMany({ staffId: null, targetType: "STAFF" });
    await collection.deleteMany({ studentId: null, targetType: "STUDENT" });
    await collection.updateMany(
      { targetType: "STUDENT", staffId: null },
      { $unset: { staffId: "" } }
    );
    await collection.updateMany(
      { targetType: "STAFF", studentId: null },
      { $unset: { studentId: "" } }
    );
    console.log("Attendance indexes fixed");
  } catch (err) {
    console.log("Index fix skipped (may already be correct):", (err as Error).message);
  }
}

export async function connectDB(): Promise<void> {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.error("MONGO_URI environment variable is not set");
    return;
  }

  try {
    await mongoose.connect(mongoUri);
    console.log("MongoDB connected successfully");
    await fixAttendanceIndexes();
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }

  mongoose.connection.on("error", (err) => {
    console.error("MongoDB connection error:", err);
  });

  mongoose.connection.on("disconnected", () => {
    console.log("MongoDB disconnected");
  });
}

export function isDBConnected(): boolean {
  return mongoose.connection.readyState === 1;
}
