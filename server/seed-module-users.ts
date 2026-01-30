import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { ModuleUser } from "./models/ModuleUser";

const moduleTypes = [
  "student",
  "hr",
  "fee",
  "payroll",
  "finance",
  "attendance",
  "timetable",
  "datesheet",
  "curriculum",
  "pos",
  "library",
  "transport",
  "hostel",
] as const;

const moduleNames: Record<string, string> = {
  student: "Student Management",
  hr: "HR Management",
  fee: "Fee Management",
  payroll: "Payroll Management",
  finance: "Finance Management",
  attendance: "Attendance Management",
  timetable: "Timetable Management",
  datesheet: "DateSheet Management",
  curriculum: "Curriculum Management",
  pos: "POS Management",
  library: "Library Management",
  transport: "Transport Management",
  hostel: "Hostel Management",
};

export async function seedModuleUsers() {
  const defaultPassword = "12345678";
  const passwordHash = await bcrypt.hash(defaultPassword, 10);

  console.log("Seeding module users...");

  for (const module of moduleTypes) {
    const email = `${module}@emblazers.com`;
    
    const existingUser = await ModuleUser.findOne({ module });
    
    if (existingUser) {
      console.log(`  ✓ ${module} user already exists`);
      continue;
    }

    await ModuleUser.create({
      module,
      email,
      passwordHash,
      name: moduleNames[module] || `${module} Admin`,
      role: "admin",
      isActive: true,
    });

    console.log(`  + Created ${module} user (${email})`);
  }

  console.log("Module users seeding complete!");
}

const isMainModule = import.meta.url === `file://${process.argv[1]}`;

if (isMainModule) {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("MONGO_URI not set");
    process.exit(1);
  }

  mongoose.connect(uri).then(async () => {
    console.log("Connected to MongoDB");
    await seedModuleUsers();
    await mongoose.disconnect();
    console.log("Done");
  }).catch((err) => {
    console.error("Error:", err);
    process.exit(1);
  });
}
