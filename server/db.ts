import mongoose from "mongoose";
import { ChartOfAccounts as ChartOfAccountsModel } from "./models/ChartOfAccounts";

async function seedDefaultAccounts(): Promise<void> {
  try {
    const count = await ChartOfAccountsModel.countDocuments();
    if (count > 0) return;

    const defaultAccounts = [
      { accountCode: "1001", accountName: "Cash", accountType: "Asset" },
      { accountCode: "1002", accountName: "Bank", accountType: "Asset" },
      { accountCode: "2001", accountName: "Accounts Payable", accountType: "Liability" },
      { accountCode: "3001", accountName: "Capital/Equity", accountType: "Equity" },
      { accountCode: "4001", accountName: "Fee Income", accountType: "Income" },
      { accountCode: "4002", accountName: "Admission Income", accountType: "Income" },
      { accountCode: "4003", accountName: "Fine Income", accountType: "Income" },
      { accountCode: "4004", accountName: "Other Income", accountType: "Income" },
      { accountCode: "5001", accountName: "Salary Expense", accountType: "Expense" },
      { accountCode: "5002", accountName: "Utilities Expense", accountType: "Expense" },
      { accountCode: "5003", accountName: "Maintenance Expense", accountType: "Expense" },
      { accountCode: "5004", accountName: "Supplies Expense", accountType: "Expense" },
      { accountCode: "5005", accountName: "Transport Expense", accountType: "Expense" },
      { accountCode: "5006", accountName: "Events Expense", accountType: "Expense" },
      { accountCode: "5007", accountName: "Marketing Expense", accountType: "Expense" },
      { accountCode: "5008", accountName: "IT Expense", accountType: "Expense" },
      { accountCode: "5009", accountName: "Miscellaneous Expense", accountType: "Expense" },
    ];

    await ChartOfAccountsModel.insertMany(
      defaultAccounts.map((acc) => ({
        ...acc,
        level: 1,
        openingBalance: 0,
        currentBalance: 0,
        isSystemAccount: true,
        isActive: true,
        createdAt: new Date(),
      }))
    );
    console.log("Default chart of accounts seeded successfully");
  } catch (err) {
    console.error("Failed to seed default accounts:", err);
  }
}

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
    await seedDefaultAccounts();
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
