import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const userRoles = [
  "Student",
  "HR",
  "Fee",
  "Payroll",
  "Finance",
  "Attendance",
  "Timetable",
  "Datesheet",
  "Curriculum",
  "POS",
  "Library",
  "Transport",
  "Hostel",
] as const;

interface SeedUser {
  email: string;
  password: string;
  role: typeof userRoles[number];
}

const seedUsers: SeedUser[] = [
  { email: "student@emblazers.com", password: "12345678", role: "Student" },
  { email: "hr@emblazers.com", password: "12345678", role: "HR" },
  { email: "fee@emblazers.com", password: "12345678", role: "Fee" },
  { email: "payroll@emblazers.com", password: "12345678", role: "Payroll" },
  { email: "finance@emblazers.com", password: "12345678", role: "Finance" },
  { email: "attendance@emblazers.com", password: "12345678", role: "Attendance" },
  { email: "timetable@emblazers.com", password: "12345678", role: "Timetable" },
  { email: "datesheet@emblazers.com", password: "12345678", role: "Datesheet" },
  { email: "curriculum@emblazers.com", password: "12345678", role: "Curriculum" },
  { email: "pos@emblazers.com", password: "12345678", role: "POS" },
  { email: "library@emblazers.com", password: "12345678", role: "Library" },
  { email: "transport@emblazers.com", password: "12345678", role: "Transport" },
  { email: "hostel@emblazers.com", password: "12345678", role: "Hostel" },
];

async function seed() {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.error("MONGO_URI environment variable is not set");
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB");

    const UserSchema = new mongoose.Schema(
      {
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        passwordHash: { type: String, required: true },
        role: { type: String, required: true, enum: userRoles },
        isActive: { type: Boolean, default: true },
      },
      { timestamps: true }
    );

    const User = mongoose.models.User || mongoose.model("User", UserSchema);

    for (const userData of seedUsers) {
      const existingUser = await User.findOne({ email: userData.email });

      if (existingUser) {
        console.log(`User ${userData.email} already exists, skipping...`);
        continue;
      }

      const passwordHash = await bcrypt.hash(userData.password, 12);

      await User.create({
        email: userData.email,
        passwordHash,
        role: userData.role,
        isActive: true,
      });

      console.log(`Created user: ${userData.email} (${userData.role})`);
    }

    console.log("\nSeed completed successfully!");
    console.log("\nModule users created:");
    seedUsers.forEach((u) => {
      console.log(`  ${u.role}: ${u.email}`);
    });

  } catch (error) {
    console.error("Seed error:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB");
  }
}

seed();
