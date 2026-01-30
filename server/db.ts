import mongoose from "mongoose";

export async function connectDB(): Promise<void> {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.error("MONGO_URI environment variable is not set");
    return;
  }

  try {
    await mongoose.connect(mongoUri);
    console.log("MongoDB connected successfully");
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
