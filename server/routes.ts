import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import { storage } from "./storage";
import { ModuleUser } from "./models/ModuleUser";
import { authenticateToken, requireModule } from "./middleware/auth";
import { isDBConnected } from "./db";
import {
  checkStudentReferences,
  checkStaffReferences,
  checkAccountReferences,
  checkRouteReferences,
  checkVehicleReferences,
  checkHostelRoomReferences,
  checkBookReferences,
  checkLibraryMemberReferences,
  checkExamReferences,
  checkVacancyReferences,
  checkHostelResidentReferences,
} from "./validation";
import {
  studentSchema,
  insertStudentSchema,
  insertStaffSchema,
  insertVacancySchema,
  insertApplicantSchema,
  insertFeeVoucherSchema,
  insertPayrollSchema,
  insertAccountSchema,
  insertFinanceVoucherSchema,
  insertTimetableSchema,
  insertDateSheetSchema,
  insertCurriculumSchema,
  insertExamSchema,
  insertResultSchema,
  insertPosItemSchema,
  insertSaleSchema,
  insertBookSchema,
  insertBookCategorySchema,
  insertLibraryMemberSchema,
  insertBookIssueSchema,
  insertRouteSchema,
  insertVehicleSchema,
  insertDriverSchema,
  insertStudentTransportSchema,
  insertHostelRoomSchema,
  insertHostelResidentSchema,
  insertHostelFeeSchema,
  insertNotificationSchema,
  insertActivityLogSchema,
  insertFeeStructureSchema,
  insertDiscountRuleSchema,
  insertLateFeeRuleSchema,
  insertInstallmentPlanSchema,
  insertChallanSchema,
  insertPaymentSchema,
  insertVendorSchema,
  insertExpenseSchema,
  insertChartOfAccountsSchema,
  insertLedgerEntrySchema,
  insertJournalEntrySchema,
  insertAttendanceRecordSchema,
  insertQuestionSchema,
  insertQuizSchema,
  insertQuizAttemptSchema,
  type ModuleType,
  type Notification,
  moduleUserCredentials,
} from "@shared/schema";

const clients = new Set<WebSocket>();

export function broadcastNotification(notification: Notification) {
  const message = JSON.stringify({ type: "notification", data: notification });
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  const asyncHandler = (fn: (req: any, res: any, next?: any) => Promise<any>) =>
    (req: any, res: any, next: any) => {
      Promise.resolve(fn(req, res, next)).catch((err) => {
        console.error(`[API Error] ${req.method} ${req.path}:`, err);
        if (!res.headersSent) {
          res.status(500).json({ error: err.message || "Internal server error" });
        }
      });
    };

  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { error: "Too many login attempts. Please try again after 15 minutes." },
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, db: isDBConnected() });
  });

  // ============== PUBLIC ROUTES (No Auth Required) ==============
  // Public vacancy listing - only show Open vacancies
  app.get("/api/public/vacancies", async (_req, res) => {
    try {
      const vacancies = await storage.getVacancies();
      res.json(vacancies);
    } catch (error) {
      console.error("Error fetching public vacancies:", error);
      res.status(500).json({ error: "Failed to fetch vacancies" });
    }
  });

  // Public vacancy detail
  app.get("/api/public/vacancies/:id", async (req, res) => {
    try {
      const vacancy = await storage.getVacancy(req.params.id);
      if (!vacancy) return res.status(404).json({ error: "Vacancy not found" });
      res.json(vacancy);
    } catch (error) {
      console.error("Error fetching vacancy:", error);
      res.status(500).json({ error: "Failed to fetch vacancy" });
    }
  });

  // Public application submission
  app.post("/api/public/applications", async (req, res) => {
    try {
      const parsed = insertApplicantSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors });
      }

      // Verify the vacancy exists and is open
      const vacancy = await storage.getVacancy(parsed.data.vacancyId);
      if (!vacancy) {
        return res.status(404).json({ error: "Vacancy not found" });
      }
      if (vacancy.status !== "Open") {
        return res.status(400).json({ error: "This vacancy is no longer accepting applications" });
      }

      const applicant = await storage.createApplicant(parsed.data);
      res.status(201).json(applicant);
    } catch (error) {
      console.error("Error submitting application:", error);
      res.status(500).json({ error: "Failed to submit application" });
    }
  });

  app.post("/api/auth/login", loginLimiter, async (req, res) => {
    const { email, password, module } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    if (!module) {
      return res.status(400).json({ error: "Module is required" });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error("JWT_SECRET environment variable is not set");
      return res.status(500).json({ error: "Server configuration error" });
    }

    try {
      const moduleType = module as ModuleType;
      const defaultCreds = moduleUserCredentials[moduleType];

      if (!defaultCreds) {
        return res.status(400).json({ error: "Invalid module" });
      }

      const dbUser = await ModuleUser.findOne({ module: moduleType });

      if (dbUser && email.toLowerCase() === dbUser.email.toLowerCase()) {
        const isValidPassword = await bcrypt.compare(password, dbUser.passwordHash);
        if (isValidPassword) {
          const token = jwt.sign(
            { userId: dbUser._id.toString(), email: dbUser.email, role: dbUser.role, module: moduleType },
            jwtSecret,
            { expiresIn: "3d" } // 3 days session validity
          );
          return res.json({
            success: true,
            token,
            module: moduleType,
            user: {
              email: dbUser.email,
              role: dbUser.role,
              name: dbUser.name,
            },
          });
        }
      }

      if (email.toLowerCase() === defaultCreds.email.toLowerCase() && password === defaultCreds.password) {
        const token = jwt.sign(
          { userId: `${moduleType}-admin`, email: defaultCreds.email, role: defaultCreds.role, module: moduleType },
          jwtSecret,
          { expiresIn: "3d" } // 3 days session validity
        );
        return res.json({
          success: true,
          token,
          module: moduleType,
          user: {
            email: defaultCreds.email,
            role: defaultCreds.role,
            name: defaultCreds.name,
          },
        });
      }

      return res.status(401).json({ error: "Invalid credentials" });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/auth/me", authenticateToken, (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    res.json({
      email: req.user.email,
      role: req.user.role,
    });
  });

  app.post("/api/auth/change-password", authenticateToken, async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Current password and new password are required" });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: "New password must be at least 8 characters" });
    }

    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const moduleType = req.user.module as ModuleType;
    const defaultCreds = moduleUserCredentials[moduleType];

    if (!defaultCreds) {
      return res.status(400).json({ error: "Invalid module" });
    }

    try {
      const dbUser = await ModuleUser.findOne({ module: moduleType });

      let isValidCurrentPassword = false;

      if (dbUser) {
        isValidCurrentPassword = await bcrypt.compare(currentPassword, dbUser.passwordHash);
      } else {
        isValidCurrentPassword = currentPassword === defaultCreds.password;
      }

      if (!isValidCurrentPassword) {
        return res.status(401).json({ error: "Current password is incorrect" });
      }

      const saltRounds = 10;
      const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

      if (dbUser) {
        await ModuleUser.findByIdAndUpdate(dbUser._id, { passwordHash: newPasswordHash });
      } else {
        await ModuleUser.create({
          module: moduleType,
          email: defaultCreds.email,
          passwordHash: newPasswordHash,
          name: defaultCreds.name,
          role: defaultCreds.role,
        });
      }

      return res.json({ success: true, message: "Password changed successfully" });
    } catch (error) {
      console.error("Password change error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/students", asyncHandler(async (req, res) => {
    const students = await storage.getStudents();
    const { query } = req.query;

    if (query && typeof query === "string") {
      const searchLower = query.toLowerCase().trim();
      const results = students.filter(student => {
        const studentIdMatch = student.studentId?.toLowerCase().includes(searchLower);
        const nameMatch = student.name?.toLowerCase().includes(searchLower);
        const bformMatch = student.bform?.toLowerCase().includes(searchLower);
        return studentIdMatch || nameMatch || bformMatch;
      });
      return res.json(results);
    }

    res.json(students);
  }));

  app.get("/api/students/:id", asyncHandler(async (req, res) => {
    const student = await storage.getStudent(req.params.id);
    if (!student) return res.status(404).json({ error: "Not found" });
    res.json(student);
  }));


  app.post("/api/students", async (req, res) => {
    try {
      const parsed = insertStudentSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: parsed.error });
      const student = await storage.createStudent(parsed.data);
      res.status(201).json(student);
    } catch (error: any) {
      if (error.message === "Student with this B-Form already exists" ||
          error.message?.includes("already exists") ||
          error.code === 11000) {
        return res.status(409).json({ error: error.message || "Student already exists" });
      }
      console.error("Failed to create student:", error);
      res.status(500).json({ error: "Failed to create student" });
    }
  });

  app.patch("/api/students/:id", async (req, res) => {
    try {
      const { id, ...updates } = req.body;
      const parsed = studentSchema.partial().omit({ id: true, studentId: true }).safeParse(updates);
      if (!parsed.success) return res.status(400).json({ error: parsed.error });
      const student = await storage.updateStudent(req.params.id, parsed.data);
      if (!student) return res.status(404).json({ error: "Not found" });
      res.json(student);
    } catch (error: any) {
      if (error.message === "Student with this B-Form already exists") {
        return res.status(409).json({ error: error.message });
      }
      console.error("Failed to update student:", error);
      res.status(500).json({ error: "Failed to update student" });
    }
  });

  app.delete("/api/students/:id", asyncHandler(async (req, res) => {
    const validation = await checkStudentReferences(req.params.id);
    if (!validation.canDelete) {
      return res.status(409).json({ error: validation.errorMessage, references: validation.references });
    }
    const deleted = await storage.deleteStudent(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ success: true });
  }));

  app.get("/api/staff", asyncHandler(async (req, res) => {
    const staff = await storage.getStaff();
    const { query } = req.query;

    if (query && typeof query === "string") {
      const searchLower = query.toLowerCase().trim();
      const results = staff.filter(member => {
        const staffIdMatch = member.staffId?.toLowerCase().includes(searchLower);
        const nameMatch = member.name?.toLowerCase().includes(searchLower);
        return staffIdMatch || nameMatch;
      });
      return res.json(results);
    }

    res.json(staff);
  }));

  app.get("/api/staff/:id", asyncHandler(async (req, res) => {
    const member = await storage.getStaffMember(req.params.id);
    if (!member) return res.status(404).json({ error: "Not found" });
    res.json(member);
  }));

  app.post("/api/staff", asyncHandler(async (req, res) => {
    const parsed = insertStaffSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const member = await storage.createStaff(parsed.data);
    res.status(201).json(member);
  }));

  app.patch("/api/staff/:id", asyncHandler(async (req, res) => {
    const { id, ...updates } = req.body;
    const parsed = insertStaffSchema.partial().safeParse(updates);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const member = await storage.updateStaff(req.params.id, parsed.data);
    if (!member) return res.status(404).json({ error: "Not found" });
    res.json(member);
  }));

  app.delete("/api/staff/:id", asyncHandler(async (req, res) => {
    const validation = await checkStaffReferences(req.params.id);
    if (!validation.canDelete) {
      return res.status(409).json({ error: validation.errorMessage, references: validation.references });
    }
    const deleted = await storage.deleteStaff(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ success: true });
  }));

  app.get("/api/vacancies", asyncHandler(async (_req, res) => {
    const vacancies = await storage.getVacancies();
    res.json(vacancies);
  }));

  app.get("/api/vacancies/:id", asyncHandler(async (req, res) => {
    const vacancy = await storage.getVacancy(req.params.id);
    if (!vacancy) return res.status(404).json({ error: "Not found" });
    res.json(vacancy);
  }));

  app.post("/api/vacancies", asyncHandler(async (req, res) => {
    const parsed = insertVacancySchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const vacancy = await storage.createVacancy(parsed.data);
    res.status(201).json(vacancy);
  }));

  app.patch("/api/vacancies/:id", asyncHandler(async (req, res) => {
    const { id, ...updates } = req.body;
    const parsed = insertVacancySchema.partial().safeParse(updates);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const vacancy = await storage.updateVacancy(req.params.id, parsed.data);
    if (!vacancy) return res.status(404).json({ error: "Not found" });
    res.json(vacancy);
  }));

  app.delete("/api/vacancies/:id", asyncHandler(async (req, res) => {
    const validation = await checkVacancyReferences(req.params.id);
    if (!validation.canDelete) {
      return res.status(409).json({ error: validation.errorMessage, references: validation.references });
    }
    const deleted = await storage.deleteVacancy(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ success: true });
  }));

  app.get("/api/applicants", asyncHandler(async (_req, res) => {
    const applicants = await storage.getApplicants();
    res.json(applicants);
  }));

  app.get("/api/applicants/:id", asyncHandler(async (req, res) => {
    const applicant = await storage.getApplicant(req.params.id);
    if (!applicant) return res.status(404).json({ error: "Not found" });
    res.json(applicant);
  }));

  app.post("/api/applicants", asyncHandler(async (req, res) => {
    const parsed = insertApplicantSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const applicant = await storage.createApplicant(parsed.data);
    res.status(201).json(applicant);
  }));

  app.patch("/api/applicants/:id", asyncHandler(async (req, res) => {
    const { id, ...updates } = req.body;
    const parsed = insertApplicantSchema.partial().safeParse(updates);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const applicant = await storage.updateApplicant(req.params.id, parsed.data);
    if (!applicant) return res.status(404).json({ error: "Not found" });
    res.json(applicant);
  }));

  app.delete("/api/applicants/:id", asyncHandler(async (req, res) => {
    const deleted = await storage.deleteApplicant(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ success: true });
  }));

  app.get("/api/fee-vouchers", asyncHandler(async (_req, res) => {
    const vouchers = await storage.getFeeVouchers();
    res.json(vouchers);
  }));

  app.get("/api/fee-vouchers/:id", asyncHandler(async (req, res) => {
    const voucher = await storage.getFeeVoucher(req.params.id);
    if (!voucher) return res.status(404).json({ error: "Not found" });
    res.json(voucher);
  }));

  app.post("/api/fee-vouchers", asyncHandler(async (req, res) => {
    const parsed = insertFeeVoucherSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const voucher = await storage.createFeeVoucher(parsed.data);
    res.status(201).json(voucher);
  }));

  app.patch("/api/fee-vouchers/:id", asyncHandler(async (req, res) => {
    const { id, ...updates } = req.body;
    const parsed = insertFeeVoucherSchema.partial().safeParse(updates);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const voucher = await storage.updateFeeVoucher(req.params.id, parsed.data);
    if (!voucher) return res.status(404).json({ error: "Not found" });
    res.json(voucher);
  }));

  app.delete("/api/fee-vouchers/:id", asyncHandler(async (req, res) => {
    const deleted = await storage.deleteFeeVoucher(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ success: true });
  }));

  app.get("/api/payrolls", asyncHandler(async (_req, res) => {
    const payrolls = await storage.getPayrolls();
    res.json(payrolls);
  }));

  app.get("/api/payrolls/:id", asyncHandler(async (req, res) => {
    const payroll = await storage.getPayroll(req.params.id);
    if (!payroll) return res.status(404).json({ error: "Not found" });
    res.json(payroll);
  }));

  app.post("/api/payrolls", async (req, res) => {
    try {
      const parsed = insertPayrollSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: parsed.error });
      const payroll = await storage.createPayroll(parsed.data);
      res.status(201).json(payroll);
    } catch (error) {
      console.error("Failed to create payroll:", error);
      res.status(500).json({ error: "Failed to create payroll" });
    }
  });

  app.patch("/api/payrolls/:id", asyncHandler(async (req, res) => {
    const { id, ...updates } = req.body;
    const existingPayroll = await storage.getPayroll(req.params.id);
    if (!existingPayroll) return res.status(404).json({ error: "Not found" });

    const parsed = insertPayrollSchema.partial().safeParse(updates);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const payroll = await storage.updatePayroll(req.params.id, parsed.data);
    if (!payroll) return res.status(404).json({ error: "Not found" });

    if (existingPayroll.status !== "Paid" && payroll.status === "Paid" && payroll.netSalary > 0) {
      const paidDate = payroll.paidDate || new Date().toISOString().split("T")[0];
      await (storage as any).createAutoPostedVoucher({
        type: "Payment",
        date: paidDate,
        debitAccountCode: "5001",
        creditAccountCode: "1001",
        amount: payroll.netSalary,
        narration: `Salary payment to ${payroll.staffName} for ${payroll.month}`,
        reference: payroll.id,
        referenceType: "SalaryPayment",
        createdBy: (req as any).user?.email || "system",
      });
    }

    res.json(payroll);
  }));

  app.delete("/api/payrolls/:id", asyncHandler(async (req, res) => {
    const deleted = await storage.deletePayroll(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ success: true });
  }));

  app.get("/api/accounts", asyncHandler(async (_req, res) => {
    const accounts = await storage.getAccounts();
    res.json(accounts);
  }));

  app.get("/api/accounts/:id", asyncHandler(async (req, res) => {
    const account = await storage.getAccount(req.params.id);
    if (!account) return res.status(404).json({ error: "Not found" });
    res.json(account);
  }));

  app.post("/api/accounts", asyncHandler(async (req, res) => {
    const parsed = insertAccountSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const account = await storage.createAccount(parsed.data);
    res.status(201).json(account);
  }));

  app.patch("/api/accounts/:id", asyncHandler(async (req, res) => {
    const { id, ...updates } = req.body;
    const parsed = insertAccountSchema.partial().safeParse(updates);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const account = await storage.updateAccount(req.params.id, parsed.data);
    if (!account) return res.status(404).json({ error: "Not found" });
    res.json(account);
  }));

  app.delete("/api/accounts/:id", asyncHandler(async (req, res) => {
    const validation = await checkAccountReferences(req.params.id);
    if (!validation.canDelete) {
      return res.status(409).json({ error: validation.errorMessage, references: validation.references });
    }
    const deleted = await storage.deleteAccount(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ success: true });
  }));

  app.get("/api/finance-vouchers", asyncHandler(async (_req, res) => {
    const vouchers = await storage.getFinanceVouchers();
    res.json(vouchers);
  }));

  app.get("/api/finance-vouchers/:id", asyncHandler(async (req, res) => {
    const voucher = await storage.getFinanceVoucher(req.params.id);
    if (!voucher) return res.status(404).json({ error: "Not found" });
    res.json(voucher);
  }));

  app.post("/api/finance-vouchers", asyncHandler(async (req, res) => {
    const parsed = insertFinanceVoucherSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const voucher = await storage.createFinanceVoucher(parsed.data);
    res.status(201).json(voucher);
  }));

  app.patch("/api/finance-vouchers/:id", async (req, res) => {
    try {
      const existing = await storage.getFinanceVoucher(req.params.id);
      if (!existing) return res.status(404).json({ error: "Not found" });
      if (existing.status === "Posted") return res.status(400).json({ error: "Cannot edit a Posted voucher" });
      if (existing.status === "Cancelled") return res.status(400).json({ error: "Cannot edit a Cancelled voucher" });
      const { id, ...updates } = req.body;
      const parsed = insertFinanceVoucherSchema.partial().safeParse(updates);
      if (!parsed.success) return res.status(400).json({ error: parsed.error });
      const voucher = await storage.updateFinanceVoucher(req.params.id, parsed.data);
      if (!voucher) return res.status(404).json({ error: "Not found" });
      res.json(voucher);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/finance-vouchers/:id", async (req, res) => {
    try {
      const existing = await storage.getFinanceVoucher(req.params.id);
      if (!existing) return res.status(404).json({ error: "Not found" });
      if (existing.status === "Posted") return res.status(400).json({ error: "Cannot delete a Posted voucher" });
      const deleted = await storage.deleteFinanceVoucher(req.params.id);
      if (!deleted) return res.status(404).json({ error: "Not found" });
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/finance-vouchers/:id/post", async (req, res) => {
    try {
      const postedBy = (req as any).user?.email || "system";
      const voucher = await storage.postFinanceVoucher(req.params.id, postedBy);
      if (!voucher) return res.status(404).json({ error: "Voucher not found" });
      res.json(voucher);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post("/api/finance-vouchers/:id/cancel", async (req, res) => {
    try {
      const cancelledBy = (req as any).user?.email || "system";
      const voucher = await storage.cancelFinanceVoucher(req.params.id, cancelledBy);
      if (!voucher) return res.status(404).json({ error: "Voucher not found" });
      res.json(voucher);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.get("/api/finance/dashboard", async (_req, res) => {
    try {
      const dashboard = await storage.getFinanceDashboard();
      res.json(dashboard);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/finance/reports/trial-balance", async (_req, res) => {
    try {
      const entries = await storage.getLedgerEntries();
      const accountBalances: Record<string, { accountCode: string; accountName: string; debit: number; credit: number }> = {};
      for (const entry of entries) {
        if (!accountBalances[entry.accountId]) {
          accountBalances[entry.accountId] = {
            accountCode: entry.accountCode,
            accountName: entry.accountName,
            debit: 0,
            credit: 0,
          };
        }
        accountBalances[entry.accountId].debit += entry.debit;
        accountBalances[entry.accountId].credit += entry.credit;
      }
      const trialBalance = Object.entries(accountBalances).map(([accountId, data]) => ({
        accountId,
        accountCode: data.accountCode,
        accountName: data.accountName,
        totalDebit: data.debit,
        totalCredit: data.credit,
        balance: data.debit - data.credit,
      }));
      trialBalance.sort((a, b) => a.accountCode.localeCompare(b.accountCode));
      const totalDebit = trialBalance.reduce((s, r) => s + r.totalDebit, 0);
      const totalCredit = trialBalance.reduce((s, r) => s + r.totalCredit, 0);
      res.json({ accounts: trialBalance, totalDebit, totalCredit });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });


  // ============== ATTENDANCE MODULE ==============
  app.get("/api/attendance-records", async (req, res) => {
    try {
      const { date, targetType, className, section } = req.query;
      const records = await storage.getAttendanceRecords({
        date: date as string | undefined,
        targetType: targetType as string | undefined,
        className: className as string | undefined,
        section: section as string | undefined,
      });
      res.json(records);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/attendance-records/:id", async (req, res) => {
    try {
      const record = await storage.getAttendanceRecord(req.params.id);
      if (!record) return res.status(404).json({ error: "Not found" });
      res.json(record);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/attendance-records", async (req, res) => {
    try {
      const records = Array.isArray(req.body) ? req.body : [req.body];
      const results = [];
      for (const record of records) {
        const parsed = insertAttendanceRecordSchema.safeParse(record);
        if (!parsed.success) {
          return res.status(400).json({ error: parsed.error });
        }
        const result = await storage.upsertAttendanceRecord(parsed.data);
        results.push(result);
      }
      res.json(results.length === 1 ? results[0] : results);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.patch("/api/attendance-records/:id", async (req, res) => {
    try {
      const { status, remarks } = req.body;
      const updates: any = {};
      if (status && ["PRESENT", "ABSENT", "LEAVE"].includes(status)) updates.status = status;
      if (remarks !== undefined) updates.remarks = remarks;
      const record = await storage.updateAttendanceRecord(req.params.id, updates);
      if (!record) return res.status(404).json({ error: "Not found" });
      res.json(record);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/attendance-records/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteAttendanceRecord(req.params.id);
      if (!deleted) return res.status(404).json({ error: "Not found" });
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/attendance/summary", async (req, res) => {
    try {
      const { date, targetType } = req.query;
      if (!date) return res.status(400).json({ error: "date query parameter is required" });
      const summary = await storage.getAttendanceSummary(date as string, targetType as string | undefined);
      res.json(summary);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/attendance/report", async (req, res) => {
    try {
      const { targetType, startDate, endDate, className, section } = req.query;
      if (!targetType || !startDate || !endDate) {
        return res.status(400).json({ error: "targetType, startDate, and endDate are required" });
      }
      const records = await storage.getAttendanceReport({
        targetType: targetType as string,
        startDate: startDate as string,
        endDate: endDate as string,
        className: className as string | undefined,
        section: section as string | undefined,
      });
      res.json(records);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/timetables", asyncHandler(async (_req, res) => {
    const timetables = await storage.getTimetables();
    res.json(timetables);
  }));

  app.get("/api/timetables/:id", asyncHandler(async (req, res) => {
    const timetable = await storage.getTimetable(req.params.id);
    if (!timetable) return res.status(404).json({ error: "Not found" });
    res.json(timetable);
  }));

  app.post("/api/timetables", asyncHandler(async (req, res) => {
    const parsed = insertTimetableSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const timetable = await storage.createTimetable(parsed.data);
    res.status(201).json(timetable);
  }));

  app.patch("/api/timetables/:id", asyncHandler(async (req, res) => {
    const { id, ...updates } = req.body;
    const parsed = insertTimetableSchema.partial().safeParse(updates);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const timetable = await storage.updateTimetable(req.params.id, parsed.data);
    if (!timetable) return res.status(404).json({ error: "Not found" });
    res.json(timetable);
  }));

  app.delete("/api/timetables/:id", asyncHandler(async (req, res) => {
    const deleted = await storage.deleteTimetable(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ success: true });
  }));

  app.get("/api/date-sheets", asyncHandler(async (_req, res) => {
    const dateSheets = await storage.getDateSheets();
    res.json(dateSheets);
  }));

  app.get("/api/date-sheets/:id", asyncHandler(async (req, res) => {
    const dateSheet = await storage.getDateSheet(req.params.id);
    if (!dateSheet) return res.status(404).json({ error: "Not found" });
    res.json(dateSheet);
  }));

  app.post("/api/date-sheets", asyncHandler(async (req, res) => {
    const parsed = insertDateSheetSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const dateSheet = await storage.createDateSheet(parsed.data);
    res.status(201).json(dateSheet);
  }));

  app.patch("/api/date-sheets/:id", asyncHandler(async (req, res) => {
    const { id, ...updates } = req.body;
    const parsed = insertDateSheetSchema.partial().safeParse(updates);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const dateSheet = await storage.updateDateSheet(req.params.id, parsed.data);
    if (!dateSheet) return res.status(404).json({ error: "Not found" });
    res.json(dateSheet);
  }));

  app.delete("/api/date-sheets/:id", asyncHandler(async (req, res) => {
    const deleted = await storage.deleteDateSheet(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ success: true });
  }));

  app.get("/api/curriculums", asyncHandler(async (_req, res) => {
    const curriculums = await storage.getCurriculums();
    res.json(curriculums);
  }));

  app.get("/api/curriculums/:id", asyncHandler(async (req, res) => {
    const curriculum = await storage.getCurriculum(req.params.id);
    if (!curriculum) return res.status(404).json({ error: "Not found" });
    res.json(curriculum);
  }));

  app.post("/api/curriculums", asyncHandler(async (req, res) => {
    const parsed = insertCurriculumSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const curriculum = await storage.createCurriculum(parsed.data);
    res.status(201).json(curriculum);
  }));

  app.patch("/api/curriculums/:id", asyncHandler(async (req, res) => {
    const { id, ...updates } = req.body;
    const parsed = insertCurriculumSchema.partial().safeParse(updates);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const curriculum = await storage.updateCurriculum(req.params.id, parsed.data);
    if (!curriculum) return res.status(404).json({ error: "Not found" });
    res.json(curriculum);
  }));

  app.delete("/api/curriculums/:id", asyncHandler(async (req, res) => {
    const deleted = await storage.deleteCurriculum(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ success: true });
  }));

  app.get("/api/exams", asyncHandler(async (_req, res) => {
    const exams = await storage.getExams();
    res.json(exams);
  }));

  app.get("/api/exams/:id", asyncHandler(async (req, res) => {
    const exam = await storage.getExam(req.params.id);
    if (!exam) return res.status(404).json({ error: "Not found" });
    res.json(exam);
  }));

  app.post("/api/exams", asyncHandler(async (req, res) => {
    const parsed = insertExamSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const exam = await storage.createExam(parsed.data);
    res.status(201).json(exam);
  }));

  app.patch("/api/exams/:id", asyncHandler(async (req, res) => {
    const { id, ...updates } = req.body;
    const parsed = insertExamSchema.partial().safeParse(updates);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const exam = await storage.updateExam(req.params.id, parsed.data);
    if (!exam) return res.status(404).json({ error: "Not found" });
    res.json(exam);
  }));

  app.delete("/api/exams/:id", asyncHandler(async (req, res) => {
    const validation = await checkExamReferences(req.params.id);
    if (!validation.canDelete) {
      return res.status(409).json({ error: validation.errorMessage, references: validation.references });
    }
    const deleted = await storage.deleteExam(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ success: true });
  }));

  app.get("/api/results", asyncHandler(async (_req, res) => {
    const results = await storage.getResults();
    res.json(results);
  }));

  app.get("/api/results/:id", asyncHandler(async (req, res) => {
    const result = await storage.getResult(req.params.id);
    if (!result) return res.status(404).json({ error: "Not found" });
    res.json(result);
  }));

  app.post("/api/results", async (req, res) => {
    try {
      const parsed = insertResultSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: parsed.error });
      const result = await storage.createResult(parsed.data);
      res.status(201).json(result);
    } catch (error: any) {
      console.error("Error creating result:", error);
      res.status(500).json({ error: error.message || "Failed to create result" });
    }
  });

  app.patch("/api/results/:id", async (req, res) => {
    try {
      const { id, ...updates } = req.body;
      const parsed = insertResultSchema.partial().safeParse(updates);
      if (!parsed.success) return res.status(400).json({ error: parsed.error });
      const result = await storage.updateResult(req.params.id, parsed.data);
      if (!result) return res.status(404).json({ error: "Not found" });
      res.json(result);
    } catch (error: any) {
      console.error("Error updating result:", error);
      res.status(500).json({ error: error.message || "Failed to update result" });
    }
  });

  app.delete("/api/results/:id", asyncHandler(async (req, res) => {
    const deleted = await storage.deleteResult(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ success: true });
  }));

  // ============== CURRICULUM ADMIN ROUTES ==============

  app.get("/api/curriculum/staff-teachers", asyncHandler(async (_req, res) => {
    const StaffModel = (await import("./models/Staff")).default;
    const staff = await StaffModel.find({ designation: { $regex: /teacher|professor|instructor/i } }).lean();
    const mapped = staff.map((s: any) => ({
      id: s._id.toString(),
      staffId: s.staffId || s._id.toString(),
      name: s.name,
      email: s.email,
      designation: s.designation,
      department: s.department,
    }));
    res.json(mapped);
  }));

  app.get("/api/curriculum/teacher-assignments", asyncHandler(async (req, res) => {
    const TeacherAssignmentModel = (await import("./models/TeacherAssignment")).default;
    const query: any = {};
    if (req.query.staffId) query.staffId = req.query.staffId;
    if (req.query.className) query.className = req.query.className;
    const docs = await TeacherAssignmentModel.find(query).sort({ createdAt: -1 }).lean();
    const mapped = docs.map((d: any) => ({ id: d._id.toString(), ...d, _id: undefined, __v: undefined, createdAt: d.createdAt?.toISOString() }));
    res.json(mapped);
  }));

  app.post("/api/curriculum/teacher-assignments", asyncHandler(async (req, res) => {
    const TeacherAssignmentModel = (await import("./models/TeacherAssignment")).default;
    const { insertTeacherAssignmentSchema } = await import("@shared/schema");
    const parsed = insertTeacherAssignmentSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const doc = await TeacherAssignmentModel.create(parsed.data);
    res.status(201).json({ id: doc._id.toString(), ...doc.toObject(), _id: undefined, __v: undefined });
  }));

  app.delete("/api/curriculum/teacher-assignments/:id", asyncHandler(async (req, res) => {
    const TeacherAssignmentModel = (await import("./models/TeacherAssignment")).default;
    const result = await TeacherAssignmentModel.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ error: "Not found" });
    res.json({ success: true });
  }));

  app.get("/api/curriculum/student-accounts", asyncHandler(async (_req, res) => {
    const StudentPortalAccountModel = (await import("./models/StudentPortalAccount")).default;
    const accounts = await StudentPortalAccountModel.find().sort({ createdAt: -1 }).lean();
    const mapped = accounts.map((a: any) => ({
      id: a._id.toString(),
      studentId: a.studentId,
      studentName: a.studentName,
      className: a.className,
      section: a.section,
      isFirstLogin: a.isFirstLogin,
      isActive: a.isActive,
      lastLogin: a.lastLogin?.toISOString() || null,
      createdAt: a.createdAt?.toISOString(),
    }));
    res.json(mapped);
  }));

  app.post("/api/curriculum/student-accounts/create", asyncHandler(async (req, res) => {
    const { studentId, className, section } = req.body;
    const StudentPortalAccountModel = (await import("./models/StudentPortalAccount")).default;
    const results = { created: 0, skipped: 0, errors: [] as string[] };

    const allStudents = await storage.getStudents();
    let targetStudents: typeof allStudents = [];

    if (studentId) {
      const student = allStudents.find(s => s.studentId === studentId || s.id === studentId);
      if (student) targetStudents = [student];
      else results.errors.push(`Student ${studentId} not found`);
    } else if (className) {
      targetStudents = allStudents.filter(s => s.class === className && (!section || s.section === section));
    } else {
      return res.status(400).json({ error: "Provide studentId or className (with optional section)" });
    }

    for (const student of targetStudents) {
      try {
        const existing = await StudentPortalAccountModel.findOne({ studentId: student.studentId });
        if (existing) {
          results.skipped++;
          continue;
        }

        const defaultPassword = "12345678";
        const passwordHash = await bcrypt.hash(defaultPassword, 10);

        await StudentPortalAccountModel.create({
          studentId: student.studentId,
          studentName: student.name,
          className: student.class,
          section: student.section,
          passwordHash,
        });
        results.created++;
      } catch (err: any) {
        results.errors.push(`${student.studentId}: ${err.message}`);
      }
    }

    res.json(results);
  }));

  app.post("/api/curriculum/student-accounts/reset-password/:studentId", asyncHandler(async (req, res) => {
    const StudentPortalAccountModel = (await import("./models/StudentPortalAccount")).default;
    const account = await StudentPortalAccountModel.findOne({ studentId: req.params.studentId });
    if (!account) return res.status(404).json({ error: "Account not found" });

    const defaultPassword = "12345678";
    account.passwordHash = await bcrypt.hash(defaultPassword, 10);
    account.isFirstLogin = true;
    await account.save();
    res.json({ success: true, message: "Password reset to default (12345678)" });
  }));

  app.patch("/api/curriculum/student-accounts/:id", asyncHandler(async (req, res) => {
    const StudentPortalAccountModel = (await import("./models/StudentPortalAccount")).default;
    const { isActive } = req.body;
    const account = await StudentPortalAccountModel.findByIdAndUpdate(req.params.id, { isActive }, { new: true });
    if (!account) return res.status(404).json({ error: "Account not found" });
    res.json({ success: true });
  }));

  app.get("/api/curriculum/quiz-overview", asyncHandler(async (_req, res) => {
    const TeacherQuizModel = (await import("./models/TeacherQuiz")).default;
    const StudentQuizAttemptModel = (await import("./models/StudentQuizAttempt")).default;
    const quizzes = await TeacherQuizModel.find().sort({ createdAt: -1 }).lean();

    const result = await Promise.all((quizzes as any[]).map(async (q: any) => {
      const attemptCount = await StudentQuizAttemptModel.countDocuments({ quizId: q._id.toString() });
      return {
        id: q._id.toString(),
        title: q.title,
        teacherName: q.teacherName,
        className: q.className,
        section: q.section,
        subject: q.subject,
        totalMarks: q.totalMarks,
        isPublished: q.isPublished,
        questionsCount: q.questions?.length || 0,
        attemptCount,
        createdAt: q.createdAt?.toISOString(),
      };
    }));

    res.json(result);
  }));

  // ============== TEACHER AUTH ROUTES ==============

  app.post("/api/teacher/login", loginLimiter, asyncHandler(async (req, res) => {
    const { staffEmail, password } = req.body;
    if (!staffEmail || !password) {
      return res.status(400).json({ error: "Staff email and password are required" });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) return res.status(500).json({ error: "Server configuration error" });

    const TeacherAssignmentModel = (await import("./models/TeacherAssignment")).default;
    const StaffModel = (await import("./models/Staff")).default;
    const TeacherAuthPasswordModel = (await import("./models/TeacherAuthPassword")).default;

    const staff = await StaffModel.findOne({ email: { $regex: new RegExp(`^${staffEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } });
    if (!staff) return res.status(404).json({ error: "Staff not found" });

    const assignments = await TeacherAssignmentModel.find({ staffId: staff._id.toString(), isActive: true }).lean();
    if (assignments.length === 0) {
      return res.status(403).json({ error: "You have not been assigned any class. Contact admin.", code: "NO_ASSIGNMENT" });
    }

    const staffIdValue = staff.staffId || staff._id.toString();
    let authRecord = await TeacherAuthPasswordModel.findOne({ staffId: staffIdValue });

    if (!authRecord) {
      const defaultHash = await bcrypt.hash(staffIdValue, 10);
      authRecord = await TeacherAuthPasswordModel.create({
        staffId: staffIdValue,
        passwordHash: defaultHash,
      });
    }

    const isValid = await bcrypt.compare(password, authRecord.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: "Invalid password" });
    }

    const token = jwt.sign(
      { userId: staff._id.toString(), email: staff.email, staffName: staff.name, role: "teacher", module: "curriculum", staffId: staff._id.toString() },
      jwtSecret,
      { expiresIn: "3d" }
    );

    const mappedAssignments = (assignments as any[]).map((a: any) => ({
      id: a._id.toString(),
      className: a.className,
      section: a.section,
      subject: a.subject,
    }));

    return res.json({
      success: true,
      token,
      module: "curriculum",
      user: {
        email: staff.email,
        role: "teacher",
        name: staff.name,
        staffId: staff._id.toString(),
        staffEmail: staff.email,
      },
      assignments: mappedAssignments,
    });
  }));

  app.post("/api/teacher/change-password", asyncHandler(async (req, res) => {
    const user = (req as any).user;
    if (!user?.staffId) return res.status(401).json({ error: "Not authenticated as teacher" });

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Current password and new password are required" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: "New password must be at least 6 characters" });
    }

    const StaffModel = (await import("./models/Staff")).default;
    const TeacherAuthPasswordModel = (await import("./models/TeacherAuthPassword")).default;

    const staff = await StaffModel.findById(user.staffId);
    if (!staff) return res.status(404).json({ error: "Staff not found" });

    const staffIdValue = staff.staffId || staff._id.toString();
    let authRecord = await TeacherAuthPasswordModel.findOne({ staffId: staffIdValue });

    if (!authRecord) {
      const defaultHash = await bcrypt.hash(staffIdValue, 10);
      authRecord = await TeacherAuthPasswordModel.create({
        staffId: staffIdValue,
        passwordHash: defaultHash,
      });
    }

    const isValid = await bcrypt.compare(currentPassword, authRecord.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    authRecord.passwordHash = await bcrypt.hash(newPassword, 10);
    authRecord.updatedAt = new Date();
    await authRecord.save();

    return res.json({ success: true, message: "Password changed successfully" });
  }));

  // ============== TEACHER PORTAL ROUTES ==============

  app.get("/api/teacher/my-assignments", asyncHandler(async (req, res) => {
    const TeacherAssignmentModel = (await import("./models/TeacherAssignment")).default;
    const staffId = (req as any).user?.staffId;
    if (!staffId) return res.status(401).json({ error: "Not authenticated as teacher" });
    const docs = await TeacherAssignmentModel.find({ staffId, isActive: true }).lean();
    const mapped = (docs as any[]).map((d: any) => ({ id: d._id.toString(), ...d, _id: undefined, __v: undefined, createdAt: d.createdAt?.toISOString() }));
    res.json(mapped);
  }));

  app.get("/api/teacher/content", asyncHandler(async (req, res) => {
    const TeacherContentModel = (await import("./models/TeacherContent")).default;
    const staffId = (req as any).user?.staffId;
    if (!staffId) return res.status(401).json({ error: "Not authenticated as teacher" });
    const docs = await TeacherContentModel.find({ staffId }).sort({ createdAt: -1 }).lean();
    const mapped = (docs as any[]).map((d: any) => ({ id: d._id.toString(), ...d, _id: undefined, __v: undefined, createdAt: d.createdAt?.toISOString() }));
    res.json(mapped);
  }));

  app.post("/api/teacher/content", asyncHandler(async (req, res) => {
    const TeacherContentModel = (await import("./models/TeacherContent")).default;
    const StaffModel = (await import("./models/Staff")).default;
    const staffId = (req as any).user?.staffId;
    if (!staffId) return res.status(401).json({ error: "Not authenticated as teacher" });
    const staff = await StaffModel.findById(staffId).lean();
    const teacherName = req.body.teacherName || staff?.name || "Teacher";
    const doc = await TeacherContentModel.create({ ...req.body, staffId, teacherName });
    res.status(201).json({ id: doc._id.toString(), ...doc.toObject(), _id: undefined, __v: undefined });
  }));

  app.patch("/api/teacher/content/:id/toggle-publish", asyncHandler(async (req, res) => {
    const TeacherContentModel = (await import("./models/TeacherContent")).default;
    const staffId = (req as any).user?.staffId;
    const doc = await TeacherContentModel.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: "Not found" });
    if (doc.staffId !== staffId) return res.status(403).json({ error: "Unauthorized: You do not own this resource" });
    doc.isPublished = !doc.isPublished;
    await doc.save();
    res.json({ id: doc._id.toString(), isPublished: doc.isPublished });
  }));

  app.delete("/api/teacher/content/:id", asyncHandler(async (req, res) => {
    const TeacherContentModel = (await import("./models/TeacherContent")).default;
    const staffId = (req as any).user?.staffId;
    const doc = await TeacherContentModel.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: "Not found" });
    if (doc.staffId !== staffId) return res.status(403).json({ error: "Unauthorized: You do not own this resource" });
    await doc.deleteOne();
    res.json({ success: true });
  }));

  app.get("/api/teacher/quizzes", asyncHandler(async (req, res) => {
    const TeacherQuizModel = (await import("./models/TeacherQuiz")).default;
    const staffId = (req as any).user?.staffId;
    if (!staffId) return res.status(401).json({ error: "Not authenticated as teacher" });
    const docs = await TeacherQuizModel.find({ staffId }).sort({ createdAt: -1 }).lean();
    const mapped = (docs as any[]).map((d: any) => ({ id: d._id.toString(), ...d, _id: undefined, __v: undefined, createdAt: d.createdAt?.toISOString(), startDateTime: d.startDateTime?.toISOString(), endDateTime: d.endDateTime?.toISOString() }));
    res.json(mapped);
  }));

  app.post("/api/teacher/quizzes", asyncHandler(async (req, res) => {
    const TeacherQuizModel = (await import("./models/TeacherQuiz")).default;
    const StaffModel = (await import("./models/Staff")).default;
    const staffId = (req as any).user?.staffId;
    if (!staffId) return res.status(401).json({ error: "Not authenticated as teacher" });
    const staff = await StaffModel.findById(staffId).lean();
    const teacherName = req.body.teacherName || staff?.name || "Teacher";
    const questions = (req.body.questions || []).map((q: any) => ({
      ...q,
      questionType: q.questionType === "true_false" ? "truefalse" : q.questionType,
    }));
    const doc = await TeacherQuizModel.create({ ...req.body, staffId, teacherName, questions });
    res.status(201).json({ id: doc._id.toString(), ...doc.toObject(), _id: undefined, __v: undefined });
  }));

  app.put("/api/teacher/quizzes/:id", asyncHandler(async (req, res) => {
    const TeacherQuizModel = (await import("./models/TeacherQuiz")).default;
    const StudentQuizAttemptModel = (await import("./models/StudentQuizAttempt")).default;
    const staffId = (req as any).user?.staffId;
    const existing = await TeacherQuizModel.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: "Not found" });
    if (existing.staffId !== staffId) return res.status(403).json({ error: "Unauthorized: You do not own this resource" });
    const attemptCount = await StudentQuizAttemptModel.countDocuments({ quizId: req.params.id });
    if (attemptCount > 0) {
      return res.status(400).json({ error: "Cannot update quiz that already has student attempts" });
    }
    const doc = await TeacherQuizModel.findByIdAndUpdate(req.params.id, req.body, { new: true }).lean();
    if (!doc) return res.status(404).json({ error: "Not found" });
    const d = doc as any;
    res.json({ id: d._id.toString(), ...d, _id: undefined, __v: undefined });
  }));

  app.delete("/api/teacher/quizzes/:id", asyncHandler(async (req, res) => {
    const TeacherQuizModel = (await import("./models/TeacherQuiz")).default;
    const StudentQuizAttemptModel = (await import("./models/StudentQuizAttempt")).default;
    const staffId = (req as any).user?.staffId;
    const doc = await TeacherQuizModel.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: "Not found" });
    if (doc.staffId !== staffId) return res.status(403).json({ error: "Unauthorized: You do not own this resource" });
    const attemptCount = await StudentQuizAttemptModel.countDocuments({ quizId: req.params.id });
    if (attemptCount > 0) {
      return res.status(400).json({ error: "Cannot delete quiz that already has student attempts" });
    }
    await doc.deleteOne();
    res.json({ success: true });
  }));

  app.patch("/api/teacher/quizzes/:id/toggle-publish", asyncHandler(async (req, res) => {
    const TeacherQuizModel = (await import("./models/TeacherQuiz")).default;
    const staffId = (req as any).user?.staffId;
    const doc = await TeacherQuizModel.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: "Not found" });
    if (doc.staffId !== staffId) return res.status(403).json({ error: "Unauthorized: You do not own this resource" });
    doc.isPublished = !doc.isPublished;
    await doc.save();
    res.json({ id: doc._id.toString(), isPublished: doc.isPublished });
  }));

  app.get("/api/teacher/quizzes/:id/attempts", asyncHandler(async (req, res) => {
    const StudentQuizAttemptModel = (await import("./models/StudentQuizAttempt")).default;
    const TeacherQuizModel = (await import("./models/TeacherQuiz")).default;
    const staffId = (req as any).user?.staffId;
    const quiz = await TeacherQuizModel.findById(req.params.id);
    if (!quiz) return res.status(404).json({ error: "Quiz not found" });
    if (quiz.staffId !== staffId) return res.status(403).json({ error: "Unauthorized: You do not own this resource" });
    const docs = await StudentQuizAttemptModel.find({ quizId: req.params.id }).sort({ submittedAt: -1 }).lean();
    const mapped = (docs as any[]).map((d: any) => ({ id: d._id.toString(), ...d, _id: undefined, __v: undefined, submittedAt: d.submittedAt?.toISOString() }));
    res.json(mapped);
  }));

  app.patch("/api/teacher/quizzes/:id/attempts/:attemptId/grade-short", asyncHandler(async (req, res) => {
    const { attemptId } = req.params;
    if (!attemptId || attemptId === "null" || attemptId === "undefined" || !/^[a-f\d]{24}$/i.test(attemptId)) {
      return res.status(400).json({ error: "Invalid attempt ID" });
    }
    const StudentQuizAttemptModel = (await import("./models/StudentQuizAttempt")).default;
    const TeacherQuizModel = (await import("./models/TeacherQuiz")).default;
    const { questionIndex, marksAwarded } = req.body;

    const attempt = await StudentQuizAttemptModel.findById(attemptId);
    if (!attempt) return res.status(404).json({ error: "Attempt not found" });

    const quiz = await TeacherQuizModel.findById(req.params.id);
    if (!quiz) return res.status(404).json({ error: "Quiz not found" });

    const staffId = (req as any).user?.staffId;
    if (quiz.staffId !== staffId) return res.status(403).json({ error: "Unauthorized: You do not own this resource" });

    if (questionIndex < 0 || questionIndex >= attempt.answers.length) {
      return res.status(400).json({ error: "Invalid question index" });
    }

    attempt.answers[questionIndex].marksAwarded = marksAwarded;
    attempt.answers[questionIndex].isCorrect = marksAwarded > 0;

    const totalMarksObtained = attempt.answers.reduce((sum: number, a: any) => sum + (a.marksAwarded || 0), 0);
    attempt.totalMarksObtained = totalMarksObtained;
    attempt.percentage = attempt.totalMarks > 0 ? Math.round((totalMarksObtained / attempt.totalMarks) * 100) : 0;
    attempt.isPassed = totalMarksObtained >= quiz.passingMarks;

    const { calculateGrade } = await import("./utils/grade");
    attempt.grade = calculateGrade(attempt.percentage);

    await attempt.save();
    res.json({ id: attempt._id.toString(), ...attempt.toObject(), _id: undefined, __v: undefined });
  }));

  // ============== STUDENT PUBLISHED CONTENT (read-only for students) ==============

  app.get("/api/curriculum/published-content", asyncHandler(async (req, res) => {
    const TeacherContentModel = (await import("./models/TeacherContent")).default;
    const query: any = { isPublished: true };
    if (req.query.className) query.className = req.query.className;
    if (req.query.section) query.section = req.query.section;
    if (req.query.subject) query.subject = req.query.subject;
    const docs = await TeacherContentModel.find(query).sort({ createdAt: -1 }).lean();
    const mapped = (docs as any[]).map((d: any) => ({ id: d._id.toString(), ...d, _id: undefined, __v: undefined, createdAt: d.createdAt?.toISOString() }));
    res.json(mapped);
  }));

  app.get("/api/curriculum/published-quizzes", asyncHandler(async (req, res) => {
    const TeacherQuizModel = (await import("./models/TeacherQuiz")).default;
    const query: any = { isPublished: true };
    if (req.query.className) query.className = req.query.className;
    if (req.query.section) query.section = req.query.section;
    const docs = await TeacherQuizModel.find(query).sort({ createdAt: -1 }).lean();
    const mapped = (docs as any[]).map((d: any) => ({ id: d._id.toString(), ...d, _id: undefined, __v: undefined, createdAt: d.createdAt?.toISOString(), startDateTime: d.startDateTime?.toISOString(), endDateTime: d.endDateTime?.toISOString() }));
    res.json(mapped);
  }));

  // ============== STUDENT PORTAL ROUTES ==============

  app.post("/api/student-portal/login", loginLimiter, asyncHandler(async (req, res) => {
    const { studentId, password } = req.body;
    if (!studentId || !password) {
      return res.status(400).json({ error: "Student ID and password are required" });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) return res.status(500).json({ error: "Server configuration error" });

    const StudentPortalAccountModel = (await import("./models/StudentPortalAccount")).default;
    const account = await StudentPortalAccountModel.findOne({ studentId, isActive: true });
    if (!account) return res.status(401).json({ error: "Student portal account not found. Contact admin." });

    const isValid = await bcrypt.compare(password, account.passwordHash);
    if (!isValid) return res.status(401).json({ error: "Invalid password" });

    account.lastLogin = new Date();
    await account.save();

    const token = jwt.sign(
      { userId: account._id.toString(), email: studentId, role: "student", module: "curriculum", studentId: account.studentId, studentName: account.studentName, className: account.className, section: account.section },
      jwtSecret,
      { expiresIn: "3d" }
    );

    return res.json({
      success: true,
      token,
      module: "curriculum",
      user: {
        email: studentId,
        role: "student",
        name: account.studentName,
        studentId: account.studentId,
        className: account.className,
        section: account.section,
        isFirstLogin: account.isFirstLogin,
      },
    });
  }));

  app.post("/api/student-portal/change-password", asyncHandler(async (req, res) => {
    const user = (req as any).user;
    if (!user?.studentId) return res.status(401).json({ error: "Not authenticated as student" });

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Current password and new password are required" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: "New password must be at least 6 characters" });
    }

    const StudentPortalAccountModel = (await import("./models/StudentPortalAccount")).default;
    const account = await StudentPortalAccountModel.findOne({ studentId: user.studentId, isActive: true });
    if (!account) return res.status(404).json({ error: "Account not found" });

    const isValid = await bcrypt.compare(currentPassword, account.passwordHash);
    if (!isValid) return res.status(401).json({ error: "Current password is incorrect" });

    account.passwordHash = await bcrypt.hash(newPassword, 10);
    account.isFirstLogin = false;
    await account.save();

    return res.json({ success: true, message: "Password changed successfully" });
  }));

  app.get("/api/student-portal/dashboard", asyncHandler(async (req, res) => {
    const user = (req as any).user;
    if (!user?.studentId) return res.status(401).json({ error: "Not authenticated as student" });

    const TeacherQuizModel = (await import("./models/TeacherQuiz")).default;
    const StudentQuizAttemptModel = (await import("./models/StudentQuizAttempt")).default;

    const allStudents = await storage.getStudents();
    const studentProfile = allStudents.find(s => s.studentId === user.studentId);

    const now = new Date();
    const publishedQuizzes = await TeacherQuizModel.find({
      className: user.className,
      section: user.section,
      isPublished: true,
    }).lean();

    const myAttempts = await StudentQuizAttemptModel.find({ studentId: user.studentId }).lean();
    const attemptedQuizIds = new Set((myAttempts as any[]).map((a: any) => a.quizId));

    const activeQuizzesCount = (publishedQuizzes as any[]).filter((q: any) => {
      const start = new Date(q.startDateTime);
      const end = new Date(q.endDateTime);
      return now >= start && now <= end && !attemptedQuizIds.has(q._id.toString());
    }).length;

    const completedQuizzesCount = myAttempts.length;

    let pendingFeesTotal = 0;
    try {
      const FeeVoucherModel = (await import("./models/FeeVoucher")).default;
      const feeVouchers = await FeeVoucherModel.find({ studentId: user.studentId, status: { $nin: ["Paid", "paid"] } }).lean();
      pendingFeesTotal = (feeVouchers as any[]).reduce((sum: number, v: any) => sum + ((v.totalAmount || 0) - (v.paidAmount || 0)), 0);
    } catch {}

    let thisMonthAttendance = 0;
    try {
      const AttendanceRecordModel = (await import("./models/AttendanceRecord")).default;
      const startOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
      const endOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-31`;
      const records = await AttendanceRecordModel.find({
        studentId: user.studentId,
        date: { $gte: startOfMonth, $lte: endOfMonth },
      }).lean();
      const total = records.length;
      const present = (records as any[]).filter((r: any) => r.status?.toUpperCase() === "PRESENT").length;
      thisMonthAttendance = total > 0 ? Math.round((present / total) * 100) : 0;
    } catch {}

    res.json({
      profile: studentProfile ? { name: studentProfile.name, studentId: studentProfile.studentId, class: studentProfile.class, section: studentProfile.section, dob: studentProfile.dob, parentName: studentProfile.parentName } : null,
      activeQuizzesCount,
      completedQuizzesCount,
      pendingFeesTotal,
      thisMonthAttendance,
    });
  }));

  app.get("/api/student-portal/content", asyncHandler(async (req, res) => {
    const user = (req as any).user;
    if (!user?.studentId) return res.status(401).json({ error: "Not authenticated as student" });

    const TeacherContentModel = (await import("./models/TeacherContent")).default;
    const docs = await TeacherContentModel.find({
      className: user.className,
      section: user.section,
      isPublished: true,
    }).sort({ createdAt: -1 }).lean();

    const grouped: Record<string, any[]> = {};
    for (const d of docs as any[]) {
      const subject = d.subject || "General";
      if (!grouped[subject]) grouped[subject] = [];
      grouped[subject].push({
        id: d._id.toString(),
        title: d.title,
        description: d.description,
        contentType: d.contentType,
        fileData: d.fileData,
        fileName: d.fileName,
        teacherName: d.teacherName,
        subject: d.subject,
        createdAt: d.createdAt?.toISOString(),
      });
    }

    res.json({ content: grouped, total: docs.length });
  }));

  app.get("/api/student-portal/quizzes", asyncHandler(async (req, res) => {
    const user = (req as any).user;
    if (!user?.studentId) return res.status(401).json({ error: "Not authenticated as student" });

    const TeacherQuizModel = (await import("./models/TeacherQuiz")).default;
    const StudentQuizAttemptModel = (await import("./models/StudentQuizAttempt")).default;

    const quizzes = await TeacherQuizModel.find({
      className: user.className,
      section: user.section,
      isPublished: true,
    }).sort({ createdAt: -1 }).lean();

    const myAttempts = await StudentQuizAttemptModel.find({ studentId: user.studentId }).lean();
    const attemptMap = new Map((myAttempts as any[]).map((a: any) => [a.quizId, a]));

    const now = new Date();
    const result = (quizzes as any[]).map((q: any) => {
      const start = new Date(q.startDateTime);
      const end = new Date(q.endDateTime);
      let status: "upcoming" | "active" | "expired" = "expired";
      if (now < start) status = "upcoming";
      else if (now >= start && now <= end) status = "active";

      const attempt = attemptMap.get(q._id.toString());

      return {
        id: q._id.toString(),
        title: q.title,
        subject: q.subject,
        instructions: q.instructions,
        timeLimitMinutes: q.timeLimitMinutes,
        totalMarks: q.totalMarks,
        passingMarks: q.passingMarks,
        questionsCount: q.questions?.length || 0,
        startDateTime: q.startDateTime?.toISOString(),
        endDateTime: q.endDateTime?.toISOString(),
        teacherName: q.teacherName,
        status,
        attempted: !!attempt,
        myResult: attempt ? {
          grade: attempt.grade,
          percentage: attempt.percentage,
          isPassed: attempt.isPassed,
          totalMarksObtained: attempt.totalMarksObtained,
        } : null,
      };
    });

    res.json(result);
  }));

  app.get("/api/student-portal/quizzes/:id/start", asyncHandler(async (req, res) => {
    const user = (req as any).user;
    if (!user?.studentId) return res.status(401).json({ error: "Not authenticated as student" });

    const TeacherQuizModel = (await import("./models/TeacherQuiz")).default;
    const StudentQuizAttemptModel = (await import("./models/StudentQuizAttempt")).default;

    const quiz = await TeacherQuizModel.findById(req.params.id).lean() as any;
    if (!quiz) return res.status(404).json({ error: "Quiz not found" });
    if (!quiz.isPublished) return res.status(400).json({ error: "Quiz is not published" });

    const now = new Date();
    const start = new Date(quiz.startDateTime);
    const end = new Date(quiz.endDateTime);
    if (now < start) return res.status(400).json({ error: "Quiz has not started yet. Starts at " + start.toLocaleString() });
    if (now > end) return res.status(400).json({ error: "Quiz time slot has expired" });

    const existing = await StudentQuizAttemptModel.findOne({ quizId: req.params.id, studentId: user.studentId });
    if (existing) return res.status(400).json({ error: "Already submitted" });

    const sanitizedQuestions = (quiz.questions || []).map((q: any, idx: number) => ({
      questionIndex: idx,
      questionText: q.questionText,
      questionType: q.questionType,
      options: q.options || [],
      marks: q.marks,
    }));

    res.json({
      id: quiz._id.toString(),
      title: quiz.title,
      subject: quiz.subject,
      instructions: quiz.instructions,
      timeLimitMinutes: quiz.timeLimitMinutes,
      totalMarks: quiz.totalMarks,
      passingMarks: quiz.passingMarks,
      questions: sanitizedQuestions,
      startDateTime: quiz.startDateTime?.toISOString(),
      endDateTime: quiz.endDateTime?.toISOString(),
    });
  }));

  app.post("/api/student-portal/quizzes/:id/submit", asyncHandler(async (req, res) => {
    const user = (req as any).user;
    if (!user?.studentId) return res.status(401).json({ error: "Not authenticated as student" });

    const TeacherQuizModel = (await import("./models/TeacherQuiz")).default;
    const StudentQuizAttemptModel = (await import("./models/StudentQuizAttempt")).default;

    const quiz = await TeacherQuizModel.findById(req.params.id);
    if (!quiz) return res.status(404).json({ error: "Quiz not found" });

    const existing = await StudentQuizAttemptModel.findOne({ quizId: req.params.id, studentId: user.studentId });
    if (existing) return res.status(400).json({ error: "Already submitted" });

    const now = new Date();
    if (now < quiz.startDateTime) {
      return res.status(400).json({ error: "Quiz has not started yet" });
    }
    if (now > quiz.endDateTime) {
      return res.status(400).json({ error: "Quiz time slot has ended" });
    }

    const { answers, timeTakenMinutes } = req.body;

    const gradedAnswers = (answers || []).map((ans: any) => {
      const question = quiz.questions[ans.questionIndex];
      if (!question) return { ...ans, isCorrect: false, marksAwarded: 0 };

      if (question.questionType === "short") {
        return { questionIndex: ans.questionIndex, givenAnswer: ans.givenAnswer || "", isCorrect: null, marksAwarded: 0 };
      }

      const isCorrect = ans.givenAnswer?.trim().toLowerCase() === question.correctAnswer?.trim().toLowerCase();
      return {
        questionIndex: ans.questionIndex,
        givenAnswer: ans.givenAnswer || "",
        isCorrect,
        marksAwarded: isCorrect ? question.marks : 0,
      };
    });

    const totalMarksObtained = gradedAnswers.reduce((sum: number, a: any) => sum + a.marksAwarded, 0);
    const percentage = quiz.totalMarks > 0 ? Math.round((totalMarksObtained / quiz.totalMarks) * 100) : 0;
    const isPassed = totalMarksObtained >= quiz.passingMarks;

    const { calculateGrade } = await import("./utils/grade");
    const grade = calculateGrade(percentage);

    const doc = await StudentQuizAttemptModel.create({
      quizId: req.params.id,
      studentId: user.studentId,
      studentName: user.studentName || "Student",
      className: user.className,
      section: user.section,
      answers: gradedAnswers,
      totalMarksObtained,
      totalMarks: quiz.totalMarks,
      percentage,
      grade,
      isPassed,
      timeTakenMinutes: timeTakenMinutes || 0,
    });

    const detailedAnswers = gradedAnswers.map((ga: any) => {
      const question = quiz.questions[ga.questionIndex];
      return {
        questionText: question?.questionText || "",
        questionType: question?.questionType || "",
        givenAnswer: ga.givenAnswer,
        correctAnswer: question?.correctAnswer || "",
        isCorrect: ga.isCorrect,
        marks: question?.marks || 0,
        marksObtained: ga.marksAwarded,
        options: question?.options || [],
      };
    });

    res.status(201).json({
      id: doc._id.toString(),
      totalMarksObtained,
      totalMarks: quiz.totalMarks,
      percentage,
      grade,
      isPassed,
      timeTakenMinutes: doc.timeTakenMinutes,
      answers: detailedAnswers,
    });
  }));

  app.get("/api/student-portal/results", asyncHandler(async (req, res) => {
    const user = (req as any).user;
    if (!user?.studentId) return res.status(401).json({ error: "Not authenticated as student" });

    const StudentQuizAttemptModel = (await import("./models/StudentQuizAttempt")).default;
    const TeacherQuizModel = (await import("./models/TeacherQuiz")).default;

    const attempts = await StudentQuizAttemptModel.find({ studentId: user.studentId }).sort({ submittedAt: -1 }).lean();

    const quizIds = [...new Set((attempts as any[]).map((a: any) => a.quizId))];
    const quizzes = await TeacherQuizModel.find({ _id: { $in: quizIds } }).lean();
    const quizMap = new Map((quizzes as any[]).map((q: any) => [q._id.toString(), q]));

    const result = (attempts as any[]).map((a: any) => {
      const quiz = quizMap.get(a.quizId);
      return {
        id: a._id.toString(),
        quizId: a.quizId,
        quizTitle: (quiz as any)?.title || "Unknown Quiz",
        subject: (quiz as any)?.subject || "",
        teacherName: (quiz as any)?.teacherName || "",
        totalMarksObtained: a.totalMarksObtained,
        totalMarks: a.totalMarks,
        percentage: a.percentage,
        grade: a.grade,
        isPassed: a.isPassed,
        timeTakenMinutes: a.timeTakenMinutes,
        submittedAt: a.submittedAt?.toISOString(),
      };
    });

    res.json(result);
  }));

  app.get("/api/student-portal/fees", asyncHandler(async (req, res) => {
    const user = (req as any).user;
    if (!user?.studentId) return res.status(401).json({ error: "Not authenticated as student" });

    try {
      const FeeVoucherModel = (await import("./models/FeeVoucher")).default;
      const vouchers = await FeeVoucherModel.find({ studentId: user.studentId }).sort({ createdAt: -1 }).lean();
      const mapped = (vouchers as any[]).map((v: any) => ({
        id: v._id.toString(),
        month: v.month || v.feeMonth,
        totalAmount: v.totalAmount || v.amount,
        paidAmount: v.paidAmount || 0,
        dueDate: v.dueDate?.toISOString() || v.dueDate,
        status: v.status,
      }));
      res.json(mapped);
    } catch {
      res.json([]);
    }
  }));

  app.get("/api/student-portal/attendance", asyncHandler(async (req, res) => {
    const user = (req as any).user;
    if (!user?.studentId) return res.status(401).json({ error: "Not authenticated as student" });

    try {
      const AttendanceRecordModel = (await import("./models/AttendanceRecord")).default;
      const records = await AttendanceRecordModel.find({ studentId: user.studentId }).sort({ date: -1 }).lean();

      const monthlyMap: Record<string, { present: number; absent: number; total: number }> = {};
      for (const r of records as any[]) {
        const d = new Date(r.date);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (!monthlyMap[key]) monthlyMap[key] = { present: 0, absent: 0, total: 0 };
        monthlyMap[key].total++;
        if (r.status?.toUpperCase() === "PRESENT") monthlyMap[key].present++;
        else monthlyMap[key].absent++;
      }

      const result = Object.entries(monthlyMap).map(([month, data]) => ({
        month,
        presentDays: data.present,
        absentDays: data.absent,
        percentage: data.total > 0 ? Math.round((data.present / data.total) * 100) : 0,
      })).sort((a, b) => b.month.localeCompare(a.month));

      res.json(result);
    } catch {
      res.json([]);
    }
  }));

  // ============== QUIZ ROUTES ==============
  app.get("/api/questions", asyncHandler(async (req, res) => {
    const questions = await storage.getQuestions();
    if (req.query.class || req.query.subject) {
      const filtered = questions.filter(q => {
        if (req.query.class && q.class !== req.query.class) return false;
        if (req.query.subject && q.subject !== req.query.subject) return false;
        return true;
      });
      return res.json(filtered);
    }
    res.json(questions);
  }));

  app.get("/api/questions/:id", asyncHandler(async (req, res) => {
    const question = await storage.getQuestion(req.params.id);
    if (!question) return res.status(404).json({ error: "Question not found" });
    res.json(question);
  }));

  app.post("/api/questions", asyncHandler(async (req, res) => {
    const parsed = insertQuestionSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const question = await storage.createQuestion(parsed.data);
    res.status(201).json(question);
  }));

  app.patch("/api/questions/:id", asyncHandler(async (req, res) => {
    const question = await storage.updateQuestion(req.params.id, req.body);
    if (!question) return res.status(404).json({ error: "Question not found" });
    res.json(question);
  }));

  app.delete("/api/questions/:id", asyncHandler(async (req, res) => {
    const deleted = await storage.deleteQuestion(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Question not found" });
    res.json({ success: true });
  }));

  app.get("/api/quizzes", asyncHandler(async (_req, res) => {
    const quizzes = await storage.getQuizzes();
    res.json(quizzes);
  }));

  app.get("/api/quizzes/:id", asyncHandler(async (req, res) => {
    const quiz = await storage.getQuiz(req.params.id);
    if (!quiz) return res.status(404).json({ error: "Quiz not found" });
    res.json(quiz);
  }));

  app.post("/api/quizzes", asyncHandler(async (req, res) => {
    const parsed = insertQuizSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const data = { ...parsed.data, createdAt: new Date().toISOString() };
    const quiz = await storage.createQuiz(data);
    res.status(201).json(quiz);
  }));

  app.patch("/api/quizzes/:id", asyncHandler(async (req, res) => {
    const quiz = await storage.updateQuiz(req.params.id, req.body);
    if (!quiz) return res.status(404).json({ error: "Quiz not found" });
    res.json(quiz);
  }));

  app.delete("/api/quizzes/:id", asyncHandler(async (req, res) => {
    const deleted = await storage.deleteQuiz(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Quiz not found" });
    res.json({ success: true });
  }));

  app.get("/api/quiz-attempts", asyncHandler(async (req, res) => {
    if (req.query.quizId) {
      const attempts = await storage.getQuizAttemptsByQuiz(req.query.quizId as string);
      return res.json(attempts);
    }
    const attempts = await storage.getQuizAttempts();
    res.json(attempts);
  }));

  app.get("/api/quiz-attempts/:id", asyncHandler(async (req, res) => {
    const attempt = await storage.getQuizAttempt(req.params.id);
    if (!attempt) return res.status(404).json({ error: "Attempt not found" });
    res.json(attempt);
  }));

  app.post("/api/quiz-attempts", async (req, res) => {
    try {
      const parsed = insertQuizAttemptSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: parsed.error });

      const quiz = await storage.getQuiz(parsed.data.quizId);
      if (!quiz) return res.status(404).json({ error: "Quiz not found" });

      let score = 0;
      let hasShortAnswer = false;
      const answers = parsed.data.answers || [];

      for (const ans of answers) {
        const question = await storage.getQuestion(ans.questionId);
        if (!question) continue;

        if (question.type === "ShortAnswer") {
          hasShortAnswer = true;
          continue;
        }

        const qRef = quiz.questions.find(q => q.questionId === ans.questionId);
        const marks = qRef?.marks || question.marks || 1;

        if (ans.answer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase()) {
          score += marks;
        }
      }

      const attemptData = {
        ...parsed.data,
        score,
        maxScore: quiz.totalMarks,
        autoGraded: !hasShortAnswer,
        status: hasShortAnswer ? "Submitted" as const : "Graded" as const,
        submittedAt: new Date().toISOString(),
      };

      const attempt = await storage.createQuizAttempt(attemptData);
      res.status(201).json(attempt);
    } catch (error) {
      console.error("Failed to create quiz attempt:", error);
      res.status(500).json({ error: "Failed to submit quiz attempt" });
    }
  });

  app.patch("/api/quiz-attempts/:id", asyncHandler(async (req, res) => {
    const attempt = await storage.updateQuizAttempt(req.params.id, req.body);
    if (!attempt) return res.status(404).json({ error: "Attempt not found" });
    res.json(attempt);
  }));

  app.delete("/api/quiz-attempts/:id", asyncHandler(async (req, res) => {
    const deleted = await storage.deleteQuizAttempt(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Attempt not found" });
    res.json({ success: true });
  }));

  // ============== POS ROUTES ==============
  app.get("/api/pos-items", asyncHandler(async (_req, res) => {
    const items = await storage.getPosItems();
    res.json(items);
  }));

  app.get("/api/pos-items/:id", asyncHandler(async (req, res) => {
    const item = await storage.getPosItem(req.params.id);
    if (!item) return res.status(404).json({ error: "Not found" });
    res.json(item);
  }));

  app.post("/api/pos-items", asyncHandler(async (req, res) => {
    const parsed = insertPosItemSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const item = await storage.createPosItem(parsed.data);
    res.status(201).json(item);
  }));

  app.patch("/api/pos-items/:id", asyncHandler(async (req, res) => {
    const { id, ...updates } = req.body;
    const parsed = insertPosItemSchema.partial().safeParse(updates);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const item = await storage.updatePosItem(req.params.id, parsed.data);
    if (!item) return res.status(404).json({ error: "Not found" });
    res.json(item);
  }));

  app.delete("/api/pos-items/:id", asyncHandler(async (req, res) => {
    const deleted = await storage.deletePosItem(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ success: true });
  }));

  app.get("/api/sales", asyncHandler(async (_req, res) => {
    const sales = await storage.getSales();
    res.json(sales);
  }));

  app.get("/api/sales/:id", asyncHandler(async (req, res) => {
    const sale = await storage.getSale(req.params.id);
    if (!sale) return res.status(404).json({ error: "Not found" });
    res.json(sale);
  }));

  app.post("/api/sales", asyncHandler(async (req, res) => {
    const parsed = insertSaleSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const sale = await storage.createSale(parsed.data);
    res.status(201).json(sale);
  }));

  app.patch("/api/sales/:id", asyncHandler(async (req, res) => {
    const { id, ...updates } = req.body;
    const parsed = insertSaleSchema.partial().safeParse(updates);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const sale = await storage.updateSale(req.params.id, parsed.data);
    if (!sale) return res.status(404).json({ error: "Not found" });
    res.json(sale);
  }));

  app.delete("/api/sales/:id", asyncHandler(async (req, res) => {
    const deleted = await storage.deleteSale(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ success: true });
  }));

  app.get("/api/books", asyncHandler(async (_req, res) => {
    const books = await storage.getBooks();
    res.json(books);
  }));

  app.get("/api/books/:id", asyncHandler(async (req, res) => {
    const book = await storage.getBook(req.params.id);
    if (!book) return res.status(404).json({ error: "Not found" });
    res.json(book);
  }));

  app.post("/api/books", asyncHandler(async (req, res) => {
    const parsed = insertBookSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const book = await storage.createBook(parsed.data);
    res.status(201).json(book);
  }));

  app.patch("/api/books/:id", asyncHandler(async (req, res) => {
    const { id, ...updates } = req.body;
    const parsed = insertBookSchema.partial().safeParse(updates);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const book = await storage.updateBook(req.params.id, parsed.data);
    if (!book) return res.status(404).json({ error: "Not found" });
    res.json(book);
  }));

  app.delete("/api/books/:id", asyncHandler(async (req, res) => {
    const validation = await checkBookReferences(req.params.id);
    if (!validation.canDelete) {
      return res.status(409).json({ error: validation.errorMessage, references: validation.references });
    }
    const deleted = await storage.deleteBook(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ success: true });
  }));

  // Book Category Routes
  app.get("/api/book-categories", asyncHandler(async (_req, res) => {
    const categories = await storage.getBookCategories();
    res.json(categories);
  }));

  app.get("/api/book-categories/:id", asyncHandler(async (req, res) => {
    const category = await storage.getBookCategory(req.params.id);
    if (!category) return res.status(404).json({ error: "Not found" });
    res.json(category);
  }));

  app.post("/api/book-categories", asyncHandler(async (req, res) => {
    const parsed = insertBookCategorySchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const category = await storage.createBookCategory(parsed.data);
    res.status(201).json(category);
  }));

  app.patch("/api/book-categories/:id", asyncHandler(async (req, res) => {
    const { id, ...updates } = req.body;
    const parsed = insertBookCategorySchema.partial().safeParse(updates);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const category = await storage.updateBookCategory(req.params.id, parsed.data);
    if (!category) return res.status(404).json({ error: "Not found" });
    res.json(category);
  }));

  app.delete("/api/book-categories/:id", asyncHandler(async (req, res) => {
    const category = await storage.getBookCategory(req.params.id);
    if (!category) return res.status(404).json({ error: "Not found" });
    if (category.isDefault) {
      return res.status(400).json({ error: "Cannot delete default categories" });
    }
    const deleted = await storage.deleteBookCategory(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ success: true });
  }));

  app.get("/api/library-members", asyncHandler(async (_req, res) => {
    const members = await storage.getLibraryMembers();
    res.json(members);
  }));

  app.get("/api/library-members/:id", asyncHandler(async (req, res) => {
    const member = await storage.getLibraryMember(req.params.id);
    if (!member) return res.status(404).json({ error: "Not found" });
    res.json(member);
  }));

  app.post("/api/library-members", asyncHandler(async (req, res) => {
    const parsed = insertLibraryMemberSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const member = await storage.createLibraryMember(parsed.data);
    res.status(201).json(member);
  }));

  app.patch("/api/library-members/:id", asyncHandler(async (req, res) => {
    const { id, ...updates } = req.body;
    const parsed = insertLibraryMemberSchema.partial().safeParse(updates);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const member = await storage.updateLibraryMember(req.params.id, parsed.data);
    if (!member) return res.status(404).json({ error: "Not found" });
    res.json(member);
  }));

  app.delete("/api/library-members/:id", asyncHandler(async (req, res) => {
    const validation = await checkLibraryMemberReferences(req.params.id);
    if (!validation.canDelete) {
      return res.status(409).json({ error: validation.errorMessage, references: validation.references });
    }
    const deleted = await storage.deleteLibraryMember(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ success: true });
  }));

  app.get("/api/book-issues", asyncHandler(async (_req, res) => {
    const issues = await storage.getBookIssues();

    // Update overdue status automatically
    const now = new Date();
    for (const issue of issues) {
      if (issue.status === "Issued" && new Date(issue.dueDate) < now) {
        await storage.updateBookIssue(issue.id, { status: "Overdue" });
        issue.status = "Overdue";
      }
    }

    res.json(issues);
  }));

  app.get("/api/book-issues/:id", asyncHandler(async (req, res) => {
    const issue = await storage.getBookIssue(req.params.id);
    if (!issue) return res.status(404).json({ error: "Not found" });
    res.json(issue);
  }));

  app.post("/api/book-issues", asyncHandler(async (req, res) => {
    const parsed = insertBookIssueSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });

    // Check book availability
    const book = await storage.getBook(parsed.data.bookId);
    if (!book) return res.status(404).json({ error: "Book not found" });

    if (book.availableCopies <= 0) {
      return res.status(400).json({ error: "Book is not available for issue" });
    }

    // Create issue
    const issue = await storage.createBookIssue(parsed.data);

    // Update book availability
    const newAvailable = book.availableCopies - 1;
    const newStatus = newAvailable === 0 ? "Out of Stock" : book.status;
    await storage.updateBook(book.id, {
      availableCopies: newAvailable,
      status: newStatus
    });

    res.status(201).json(issue);
  }));

  app.patch("/api/book-issues/:id", asyncHandler(async (req, res) => {
    const { id, ...updates } = req.body;
    const parsed = insertBookIssueSchema.partial().safeParse(updates);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });

    const issue = await storage.getBookIssue(req.params.id);
    if (!issue) return res.status(404).json({ error: "Not found" });

    // If returning a book
    const finalUpdates = { ...parsed.data };

    if (parsed.data.returnDate && !issue.returnDate) {
      // Calculate fine if overdue
      const dueDate = new Date(issue.dueDate);
      const returnDate = new Date(parsed.data.returnDate);

      // Reset fine to 0 initially
      finalUpdates.fine = 0;

      if (returnDate > dueDate) {
        const daysOverdue = Math.ceil((returnDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
        const finePerDay = 5; // $5 per day
        finalUpdates.fine = daysOverdue * finePerDay;
      }

      finalUpdates.status = "Returned";

      // Update book availability
      const book = await storage.getBook(issue.bookId);
      if (book) {
        const newAvailable = (book.availableCopies || 0) + 1;
        await storage.updateBook(book.id, {
          availableCopies: newAvailable,
          status: newAvailable > 0 ? "Available" : book.status
        });
      }
    }

    const updatedIssue = await storage.updateBookIssue(req.params.id, finalUpdates);
    if (!updatedIssue) return res.status(404).json({ error: "Not found" });
    res.json(updatedIssue);
  }));

  app.delete("/api/book-issues/:id", asyncHandler(async (req, res) => {
    const deleted = await storage.deleteBookIssue(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ success: true });
  }));

  // Library Statistics Endpoint
  app.get("/api/library/statistics", asyncHandler(async (_req, res) => {
    const books = await storage.getBooks();
    const issues = await storage.getBookIssues();

    const totalBooks = books.reduce((sum, book) => sum + (book.totalCopies || 1), 0);
    const availableBooks = books.reduce((sum, book) => sum + (book.availableCopies || (book.status === "Available" ? 1 : 0)), 0);
    const issuedBooks = issues.filter(i => i.status === "Issued" || i.status === "Overdue").length;

    const now = new Date();
    const overdueBooks = issues.filter(i =>
      (i.status === "Issued" || i.status === "Overdue") &&
      new Date(i.dueDate) < now
    ).length;

    const totalFines = issues.reduce((sum, i) => sum + (i.fine || 0), 0);
    const pendingFines = issues.filter(i => (i.fine || 0) > 0 && !i.finePaid).reduce((sum, i) => sum + (i.fine || 0), 0);

    // Category counts
    const categoryCounts: { [key: string]: number } = {};
    books.forEach(book => {
      categoryCounts[book.category] = (categoryCounts[book.category] || 0) + (book.totalCopies || 1);
    });

    const categoryData = Object.entries(categoryCounts).map(([category, count]) => ({
      category,
      count
    }));

    res.json({
      totalBooks,
      issuedBooks,
      availableBooks,
      overdueBooks,
      totalFines,
      pendingFines,
      categoryCounts: categoryData
    });
  }));

  // Library Student Search Endpoint
  app.get("/api/library/search-students", asyncHandler(async (req, res) => {
    const { query } = req.query;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: "Search query is required" });
    }

    // Get all students from the Student module
    const allStudents = await storage.getStudents();

    // Search by ID or name (case-insensitive, partial match)
    const searchLower = query.toLowerCase().trim();

    const results = allStudents.filter(student => {
      const studentIdMatch = student.studentId?.toLowerCase().includes(searchLower);
      const nameMatch = student.name?.toLowerCase().includes(searchLower);

      return studentIdMatch || nameMatch;
    });

    // Return full student details
    res.json(results);
  }));

  // Library Staff Search Endpoint
  app.get("/api/library/search-staff", asyncHandler(async (req, res) => {
    const { query } = req.query;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: "Search query is required" });
    }

    // Get all staff from the HR/Staff module
    const allStaff = await storage.getStaff();

    // Search by ID or name (case-insensitive, partial match)
    const searchLower = query.toLowerCase().trim();

    const results = allStaff.filter(staff => {
      const staffIdMatch = staff.staffId?.toLowerCase().includes(searchLower);
      const nameMatch = staff.name?.toLowerCase().includes(searchLower);

      return staffIdMatch || nameMatch;
    });

    // Return full staff details
    res.json(results);
  }));

  app.get("/api/routes", asyncHandler(async (_req, res) => {
    const routes = await storage.getRoutes();
    res.json(routes);
  }));

  app.get("/api/routes/:id", asyncHandler(async (req, res) => {
    const route = await storage.getRoute(req.params.id);
    if (!route) return res.status(404).json({ error: "Not found" });
    res.json(route);
  }));

  app.post("/api/routes", asyncHandler(async (req, res) => {
    const parsed = insertRouteSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const route = await storage.createRoute(parsed.data);
    res.status(201).json(route);
  }));

  app.patch("/api/routes/:id", asyncHandler(async (req, res) => {
    const { id, ...updates } = req.body;
    const parsed = insertRouteSchema.partial().safeParse(updates);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const route = await storage.updateRoute(req.params.id, parsed.data);
    if (!route) return res.status(404).json({ error: "Not found" });
    res.json(route);
  }));

  app.delete("/api/routes/:id", asyncHandler(async (req, res) => {
    const validation = await checkRouteReferences(req.params.id);
    if (!validation.canDelete) {
      return res.status(409).json({ error: validation.errorMessage, references: validation.references });
    }
    const deleted = await storage.deleteRoute(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ success: true });
  }));

  app.get("/api/vehicles", asyncHandler(async (_req, res) => {
    const vehicles = await storage.getVehicles();
    res.json(vehicles);
  }));

  app.get("/api/vehicles/:id", asyncHandler(async (req, res) => {
    const vehicle = await storage.getVehicle(req.params.id);
    if (!vehicle) return res.status(404).json({ error: "Not found" });
    res.json(vehicle);
  }));

  app.post("/api/vehicles", asyncHandler(async (req, res) => {
    const parsed = insertVehicleSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const vehicle = await storage.createVehicle(parsed.data);
    res.status(201).json(vehicle);
  }));

  app.patch("/api/vehicles/:id", asyncHandler(async (req, res) => {
    const { id, ...updates } = req.body;
    const parsed = insertVehicleSchema.partial().safeParse(updates);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const vehicle = await storage.updateVehicle(req.params.id, parsed.data);
    if (!vehicle) return res.status(404).json({ error: "Not found" });
    res.json(vehicle);
  }));

  app.delete("/api/vehicles/:id", asyncHandler(async (req, res) => {
    const validation = await checkVehicleReferences(req.params.id);
    if (!validation.canDelete) {
      return res.status(409).json({ error: validation.errorMessage, references: validation.references });
    }
    const deleted = await storage.deleteVehicle(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ success: true });
  }));

  app.get("/api/drivers", asyncHandler(async (_req, res) => {
    const drivers = await storage.getDrivers();
    res.json(drivers);
  }));

  app.get("/api/drivers/:id", asyncHandler(async (req, res) => {
    const driver = await storage.getDriver(req.params.id);
    if (!driver) return res.status(404).json({ error: "Not found" });
    res.json(driver);
  }));

  app.post("/api/drivers", asyncHandler(async (req, res) => {
    const parsed = insertDriverSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const driver = await storage.createDriver(parsed.data);
    res.status(201).json(driver);
  }));

  app.patch("/api/drivers/:id", asyncHandler(async (req, res) => {
    const { id, ...updates } = req.body;
    const parsed = insertDriverSchema.partial().safeParse(updates);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const driver = await storage.updateDriver(req.params.id, parsed.data);
    if (!driver) return res.status(404).json({ error: "Not found" });
    res.json(driver);
  }));

  app.delete("/api/drivers/:id", asyncHandler(async (req, res) => {
    const deleted = await storage.deleteDriver(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ success: true });
  }));

  app.get("/api/student-transports", asyncHandler(async (_req, res) => {
    const transports = await storage.getStudentTransports();
    res.json(transports);
  }));

  app.get("/api/student-transports/:id", asyncHandler(async (req, res) => {
    const transport = await storage.getStudentTransport(req.params.id);
    if (!transport) return res.status(404).json({ error: "Not found" });
    res.json(transport);
  }));

  app.post("/api/student-transports", asyncHandler(async (req, res) => {
    const parsed = insertStudentTransportSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const transport = await storage.createStudentTransport(parsed.data);
    res.status(201).json(transport);
  }));

  app.patch("/api/student-transports/:id", asyncHandler(async (req, res) => {
    const { id, ...updates } = req.body;
    const parsed = insertStudentTransportSchema.partial().safeParse(updates);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const transport = await storage.updateStudentTransport(req.params.id, parsed.data);
    if (!transport) return res.status(404).json({ error: "Not found" });
    res.json(transport);
  }));

  app.delete("/api/student-transports/:id", asyncHandler(async (req, res) => {
    const deleted = await storage.deleteStudentTransport(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ success: true });
  }));

  app.get("/api/hostel-rooms", asyncHandler(async (_req, res) => {
    const rooms = await storage.getHostelRooms();
    res.json(rooms);
  }));

  app.get("/api/hostel-rooms/:id", asyncHandler(async (req, res) => {
    const room = await storage.getHostelRoom(req.params.id);
    if (!room) return res.status(404).json({ error: "Not found" });
    res.json(room);
  }));

  app.post("/api/hostel-rooms", asyncHandler(async (req, res) => {
    const parsed = insertHostelRoomSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const room = await storage.createHostelRoom(parsed.data);
    res.status(201).json(room);
  }));

  app.patch("/api/hostel-rooms/:id", asyncHandler(async (req, res) => {
    const { id, ...updates } = req.body;
    const parsed = insertHostelRoomSchema.partial().safeParse(updates);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const room = await storage.updateHostelRoom(req.params.id, parsed.data);
    if (!room) return res.status(404).json({ error: "Not found" });
    res.json(room);
  }));

  app.delete("/api/hostel-rooms/:id", asyncHandler(async (req, res) => {
    const validation = await checkHostelRoomReferences(req.params.id);
    if (!validation.canDelete) {
      return res.status(409).json({ error: validation.errorMessage, references: validation.references });
    }
    const deleted = await storage.deleteHostelRoom(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ success: true });
  }));

  app.get("/api/hostel-residents", asyncHandler(async (_req, res) => {
    const residents = await storage.getHostelResidents();
    res.json(residents);
  }));

  app.get("/api/hostel-residents/:id", asyncHandler(async (req, res) => {
    const resident = await storage.getHostelResident(req.params.id);
    if (!resident) return res.status(404).json({ error: "Not found" });
    res.json(resident);
  }));

  app.post("/api/hostel-residents", asyncHandler(async (req, res) => {
    const parsed = insertHostelResidentSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const resident = await storage.createHostelResident(parsed.data);
    res.status(201).json(resident);
  }));

  app.patch("/api/hostel-residents/:id", asyncHandler(async (req, res) => {
    const { id, ...updates } = req.body;
    const parsed = insertHostelResidentSchema.partial().safeParse(updates);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const resident = await storage.updateHostelResident(req.params.id, parsed.data);
    if (!resident) return res.status(404).json({ error: "Not found" });
    res.json(resident);
  }));

  app.delete("/api/hostel-residents/:id", asyncHandler(async (req, res) => {
    const validation = await checkHostelResidentReferences(req.params.id);
    if (!validation.canDelete) {
      return res.status(409).json({ error: validation.errorMessage, references: validation.references });
    }
    const deleted = await storage.deleteHostelResident(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ success: true });
  }));

  app.get("/api/hostel-fees", asyncHandler(async (_req, res) => {
    const fees = await storage.getHostelFees();
    res.json(fees);
  }));

  app.get("/api/hostel-fees/:id", asyncHandler(async (req, res) => {
    const fee = await storage.getHostelFee(req.params.id);
    if (!fee) return res.status(404).json({ error: "Not found" });
    res.json(fee);
  }));

  app.post("/api/hostel-fees", asyncHandler(async (req, res) => {
    const parsed = insertHostelFeeSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const fee = await storage.createHostelFee(parsed.data);
    res.status(201).json(fee);
  }));

  app.patch("/api/hostel-fees/:id", asyncHandler(async (req, res) => {
    const { id, ...updates } = req.body;
    const parsed = insertHostelFeeSchema.partial().safeParse(updates);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const fee = await storage.updateHostelFee(req.params.id, parsed.data);
    if (!fee) return res.status(404).json({ error: "Not found" });
    res.json(fee);
  }));

  app.delete("/api/hostel-fees/:id", asyncHandler(async (req, res) => {
    const deleted = await storage.deleteHostelFee(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ success: true });
  }));

  // Notification endpoints
  app.get("/api/notifications", asyncHandler(async (req, res) => {
    const module = req.query.module as string | undefined;
    const notifications = await storage.getNotifications(module);
    res.json(notifications);
  }));

  app.get("/api/notifications/unread-count", asyncHandler(async (req, res) => {
    const module = req.query.module as string | undefined;
    const count = await storage.getUnreadNotificationCount(module);
    res.json({ count });
  }));

  app.post("/api/notifications", asyncHandler(async (req, res) => {
    const parsed = insertNotificationSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const notification = await storage.createNotification(parsed.data);
    broadcastNotification(notification);
    res.status(201).json(notification);
  }));

  app.patch("/api/notifications/:id/read", asyncHandler(async (req, res) => {
    const notification = await storage.markNotificationRead(req.params.id);
    if (!notification) return res.status(404).json({ error: "Not found" });
    res.json(notification);
  }));

  app.patch("/api/notifications/mark-all-read", asyncHandler(async (req, res) => {
    const module = req.query.module as string | undefined;
    await storage.markAllNotificationsRead(module);
    res.json({ success: true });
  }));

  app.delete("/api/notifications/:id", asyncHandler(async (req, res) => {
    const deleted = await storage.deleteNotification(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ success: true });
  }));

  // Activity Log endpoints
  app.get("/api/activity-logs", asyncHandler(async (req, res) => {
    const module = req.query.module as string | undefined;
    const logs = await storage.getActivityLogs(module);
    res.json(logs);
  }));

  app.post("/api/activity-logs", asyncHandler(async (req, res) => {
    const parsed = insertActivityLogSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const log = await storage.createActivityLog(parsed.data);
    res.status(201).json(log);
  }));

  // ============== BULK OPERATION ENDPOINTS ==============

  // Bulk student admission
  app.post("/api/bulk/students", asyncHandler(async (req, res) => {
    const { students } = req.body;
    if (!Array.isArray(students)) {
      return res.status(400).json({ success: 0, failed: 0, errors: [{ row: 0, message: "Students array required" }] });
    }

    const results = { success: 0, failed: 0, errors: [] as { row: number; message: string }[] };
    const validGenders = ["Male", "Female", "Other"];
    const validStatuses = ["Active", "Inactive", "Alumni", "Left"];

    for (let i = 0; i < students.length; i++) {
      // Normalize gender casing
      let normalizedGender = students[i].gender;
      if (typeof normalizedGender === "string") {
        const genderLower = normalizedGender.trim().toLowerCase();
        const matchedGender = validGenders.find(g => g.toLowerCase() === genderLower);
        normalizedGender = matchedGender || normalizedGender;
      }

      // Normalize status casing
      let normalizedStatus = students[i].status || "Active";
      if (typeof normalizedStatus === "string") {
        const statusLower = normalizedStatus.trim().toLowerCase();
        const matchedStatus = validStatuses.find(s => s.toLowerCase() === statusLower);
        normalizedStatus = matchedStatus || normalizedStatus;
      }

      const studentData = {
        ...students[i],
        gender: normalizedGender,
        status: normalizedStatus,
      };
      const parsed = insertStudentSchema.safeParse(studentData);
      if (!parsed.success) {
        results.failed++;
        results.errors.push({ row: i + 1, message: parsed.error.errors.map(e => e.message).join(", ") });
      } else {
        try {
          await storage.createStudent(parsed.data);
          results.success++;
        } catch (err) {
          results.failed++;
          results.errors.push({ row: i + 1, message: String(err) });
        }
      }
    }

    res.json(results);
  }));

  app.post("/api/bulk/fee-vouchers", asyncHandler(async (req, res) => {
    const { vouchers } = req.body;
    if (!Array.isArray(vouchers)) {
      return res.status(400).json({ success: 0, failed: 0, errors: [{ row: 0, message: "Vouchers array required" }] });
    }

    const results = { success: 0, failed: 0, errors: [] as { row: number; message: string }[] };

    for (let i = 0; i < vouchers.length; i++) {
      const v = vouchers[i];
      const feeHeads = [];
      if (v.tuitionFee) feeHeads.push({ name: "Tuition Fee", amount: Number(v.tuitionFee) });
      if (v.transportFee) feeHeads.push({ name: "Transport Fee", amount: Number(v.transportFee) });
      if (v.otherFee) feeHeads.push({ name: "Other Fee", amount: Number(v.otherFee) });

      const totalAmount = feeHeads.reduce((sum, h) => sum + h.amount, 0);
      const discount = Number(v.discount) || 0;
      const netAmount = totalAmount - discount;

      const voucherData = {
        voucherId: `BV${Date.now()}${i}`,
        studentId: v.studentId,
        studentName: v.studentName,
        class: v.class,
        section: v.section,
        month: v.month,
        feeHeads,
        totalAmount,
        discount,
        fine: 0,
        netAmount,
        paidAmount: 0,
        dueDate: v.dueDate,
        status: "Unpaid" as const,
        paymentHistory: [],
      };

      const parsed = insertFeeVoucherSchema.safeParse(voucherData);
      if (!parsed.success) {
        results.failed++;
        results.errors.push({ row: i + 1, message: parsed.error.errors.map(e => e.message).join(", ") });
      } else {
        try {
          await storage.createFeeVoucher(parsed.data);
          results.success++;
        } catch (err) {
          results.failed++;
          results.errors.push({ row: i + 1, message: String(err) });
        }
      }
    }

    res.json(results);
  }));


  app.post("/api/bulk/results", asyncHandler(async (req, res) => {
    const { results: resultData, examId } = req.body;
    if (!Array.isArray(resultData) || !examId) {
      return res.status(400).json({ success: 0, failed: 0, errors: [{ row: 0, message: "Results array and examId required" }] });
    }

    const results = { success: 0, failed: 0, errors: [] as { row: number; message: string }[] };

    for (let i = 0; i < resultData.length; i++) {
      const marksObtained = resultData[i].marksObtained;
      const maxMarks = resultData[i].maxMarks;
      const parsedMarks = marksObtained !== undefined && marksObtained !== "" ? Number(marksObtained) : 0;
      const parsedMaxMarks = maxMarks !== undefined && maxMarks !== "" ? Number(maxMarks) : 100;

      const data = {
        ...resultData[i],
        examId,
        marksObtained: isNaN(parsedMarks) ? 0 : parsedMarks,
        maxMarks: isNaN(parsedMaxMarks) ? 100 : parsedMaxMarks,
      };

      const parsed = insertResultSchema.safeParse(data);
      if (!parsed.success) {
        results.failed++;
        results.errors.push({ row: i + 1, message: parsed.error.errors.map(e => e.message).join(", ") });
      } else {
        try {
          await storage.createResult(parsed.data);
          results.success++;
        } catch (err) {
          results.failed++;
          results.errors.push({ row: i + 1, message: String(err) });
        }
      }
    }

    res.json(results);
  }));

  // ============== FEE STRUCTURE ENDPOINTS ==============
  app.get("/api/fee-structures", asyncHandler(async (_req, res) => {
    const structures = await storage.getFeeStructures();
    res.json(structures);
  }));

  app.get("/api/fee-structures/:id", asyncHandler(async (req, res) => {
    const structure = await storage.getFeeStructure(req.params.id);
    if (!structure) return res.status(404).json({ error: "Fee structure not found" });
    res.json(structure);
  }));

  app.post("/api/fee-structures", asyncHandler(async (req, res) => {
    const parsed = insertFeeStructureSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const structure = await storage.createFeeStructure(parsed.data);
    res.json(structure);
  }));

  app.patch("/api/fee-structures/:id", asyncHandler(async (req, res) => {
    const structure = await storage.updateFeeStructure(req.params.id, req.body);
    if (!structure) return res.status(404).json({ error: "Fee structure not found" });
    res.json(structure);
  }));

  app.delete("/api/fee-structures/:id", asyncHandler(async (req, res) => {
    const success = await storage.deleteFeeStructure(req.params.id);
    if (!success) return res.status(404).json({ error: "Fee structure not found" });
    res.json({ success: true });
  }));

  // ============== DISCOUNT RULES ENDPOINTS ==============
  app.get("/api/discount-rules", asyncHandler(async (_req, res) => {
    const rules = await storage.getDiscountRules();
    res.json(rules);
  }));

  app.get("/api/discount-rules/:id", asyncHandler(async (req, res) => {
    const rule = await storage.getDiscountRule(req.params.id);
    if (!rule) return res.status(404).json({ error: "Discount rule not found" });
    res.json(rule);
  }));

  app.post("/api/discount-rules", asyncHandler(async (req, res) => {
    const parsed = insertDiscountRuleSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const rule = await storage.createDiscountRule(parsed.data);
    res.json(rule);
  }));

  app.patch("/api/discount-rules/:id", asyncHandler(async (req, res) => {
    const rule = await storage.updateDiscountRule(req.params.id, req.body);
    if (!rule) return res.status(404).json({ error: "Discount rule not found" });
    res.json(rule);
  }));

  app.delete("/api/discount-rules/:id", asyncHandler(async (req, res) => {
    const success = await storage.deleteDiscountRule(req.params.id);
    if (!success) return res.status(404).json({ error: "Discount rule not found" });
    res.json({ success: true });
  }));

  // ============== LATE FEE RULES ENDPOINTS ==============
  app.get("/api/late-fee-rules", asyncHandler(async (_req, res) => {
    const rules = await storage.getLateFeeRules();
    res.json(rules);
  }));

  app.get("/api/late-fee-rules/:id", asyncHandler(async (req, res) => {
    const rule = await storage.getLateFeeRule(req.params.id);
    if (!rule) return res.status(404).json({ error: "Late fee rule not found" });
    res.json(rule);
  }));

  app.post("/api/late-fee-rules", asyncHandler(async (req, res) => {
    const parsed = insertLateFeeRuleSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const rule = await storage.createLateFeeRule(parsed.data);
    res.json(rule);
  }));

  app.patch("/api/late-fee-rules/:id", asyncHandler(async (req, res) => {
    const rule = await storage.updateLateFeeRule(req.params.id, req.body);
    if (!rule) return res.status(404).json({ error: "Late fee rule not found" });
    res.json(rule);
  }));

  app.delete("/api/late-fee-rules/:id", asyncHandler(async (req, res) => {
    const success = await storage.deleteLateFeeRule(req.params.id);
    if (!success) return res.status(404).json({ error: "Late fee rule not found" });
    res.json({ success: true });
  }));

  // ============== INSTALLMENT PLANS ENDPOINTS ==============
  app.get("/api/installment-plans", asyncHandler(async (_req, res) => {
    const plans = await storage.getInstallmentPlans();
    res.json(plans);
  }));

  app.get("/api/installment-plans/:id", asyncHandler(async (req, res) => {
    const plan = await storage.getInstallmentPlan(req.params.id);
    if (!plan) return res.status(404).json({ error: "Installment plan not found" });
    res.json(plan);
  }));

  app.post("/api/installment-plans", asyncHandler(async (req, res) => {
    const parsed = insertInstallmentPlanSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const plan = await storage.createInstallmentPlan(parsed.data);
    res.json(plan);
  }));

  app.patch("/api/installment-plans/:id", asyncHandler(async (req, res) => {
    const plan = await storage.updateInstallmentPlan(req.params.id, req.body);
    if (!plan) return res.status(404).json({ error: "Installment plan not found" });
    res.json(plan);
  }));

  app.delete("/api/installment-plans/:id", asyncHandler(async (req, res) => {
    const success = await storage.deleteInstallmentPlan(req.params.id);
    if (!success) return res.status(404).json({ error: "Installment plan not found" });
    res.json({ success: true });
  }));

  // ============== CHALLAN ENDPOINTS ==============
  app.get("/api/challans", asyncHandler(async (_req, res) => {
    const challans = await storage.getChallans();
    res.json(challans);
  }));

  app.get("/api/challans/:id", asyncHandler(async (req, res) => {
    const challan = await storage.getChallan(req.params.id);
    if (!challan) return res.status(404).json({ error: "Challan not found" });
    res.json(challan);
  }));

  app.get("/api/challans/student/:studentId", asyncHandler(async (req, res) => {
    const challans = await storage.getChallansByStudent(req.params.studentId);
    res.json(challans);
  }));

  app.post("/api/challans", asyncHandler(async (req, res) => {
    const parsed = insertChallanSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const challan = await storage.createChallan(parsed.data);
    res.json(challan);
  }));

  app.patch("/api/challans/:id", asyncHandler(async (req, res) => {
    const challan = await storage.updateChallan(req.params.id, req.body);
    if (!challan) return res.status(404).json({ error: "Challan not found" });
    res.json(challan);
  }));

  app.delete("/api/challans/:id", asyncHandler(async (req, res) => {
    const success = await storage.deleteChallan(req.params.id);
    if (!success) return res.status(404).json({ error: "Challan not found" });
    res.json({ success: true });
  }));

  // ============== PAYMENT ENDPOINTS ==============
  app.get("/api/payments", asyncHandler(async (_req, res) => {
    const payments = await storage.getPayments();
    res.json(payments);
  }));

  app.get("/api/payments/:id", asyncHandler(async (req, res) => {
    const payment = await storage.getPayment(req.params.id);
    if (!payment) return res.status(404).json({ error: "Payment not found" });
    res.json(payment);
  }));

  app.get("/api/payments/challan/:challanId", asyncHandler(async (req, res) => {
    const payments = await storage.getPaymentsByChallan(req.params.challanId);
    res.json(payments);
  }));

  app.post("/api/payments", asyncHandler(async (req, res) => {
    const parsed = insertPaymentSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const payment = await storage.createPayment(parsed.data);

    // Update challan paid amount and status
    const challan = await storage.getChallan(parsed.data.challanId);
    if (challan && parsed.data.type === "Payment") {
      const newPaidAmount = challan.paidAmount + parsed.data.amount;
      const newBalance = challan.netAmount - newPaidAmount;
      const newStatus = newBalance <= 0 ? "Paid" : newBalance < challan.netAmount ? "Partial" : challan.status;
      await storage.updateChallan(challan.id, {
        paidAmount: newPaidAmount,
        balanceAmount: Math.max(0, newBalance),
        status: newStatus,
      });
    }

    if (parsed.data.type === "Payment" && parsed.data.amount > 0) {
      const paymentModeToAccount: Record<string, string> = {
        "Cash": "1001",
        "Bank Transfer": "1002",
        "Cheque": "1002",
        "Online": "1002",
        "Card": "1002",
      };
      const debitAccountCode = paymentModeToAccount[parsed.data.paymentMode] || "1001";
      await (storage as any).createAutoPostedVoucher({
        type: "Receipt",
        date: parsed.data.paymentDate,
        debitAccountCode,
        creditAccountCode: "4001",
        amount: parsed.data.amount,
        narration: `Fee collection from ${parsed.data.studentName} - Receipt #${payment.receiptNo}`,
        reference: payment.receiptNo,
        referenceType: "FeeCollection",
        createdBy: parsed.data.receivedBy || "system",
      });
    }

    res.json(payment);
  }));

  app.patch("/api/payments/:id", asyncHandler(async (req, res) => {
    const payment = await storage.updatePayment(req.params.id, req.body);
    if (!payment) return res.status(404).json({ error: "Payment not found" });
    res.json(payment);
  }));

  app.delete("/api/payments/:id", asyncHandler(async (req, res) => {
    const success = await storage.deletePayment(req.params.id);
    if (!success) return res.status(404).json({ error: "Payment not found" });
    res.json({ success: true });
  }));

  // ============== VENDOR ENDPOINTS ==============
  app.get("/api/vendors", asyncHandler(async (_req, res) => {
    const vendors = await storage.getVendors();
    res.json(vendors);
  }));

  app.get("/api/vendors/:id", asyncHandler(async (req, res) => {
    const vendor = await storage.getVendor(req.params.id);
    if (!vendor) return res.status(404).json({ error: "Vendor not found" });
    res.json(vendor);
  }));

  app.post("/api/vendors", asyncHandler(async (req, res) => {
    const parsed = insertVendorSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const vendor = await storage.createVendor(parsed.data);
    res.json(vendor);
  }));

  app.patch("/api/vendors/:id", asyncHandler(async (req, res) => {
    const vendor = await storage.updateVendor(req.params.id, req.body);
    if (!vendor) return res.status(404).json({ error: "Vendor not found" });
    res.json(vendor);
  }));

  app.delete("/api/vendors/:id", asyncHandler(async (req, res) => {
    const success = await storage.deleteVendor(req.params.id);
    if (!success) return res.status(404).json({ error: "Vendor not found" });
    res.json({ success: true });
  }));

  // ============== EXPENSE ENDPOINTS ==============
  app.get("/api/expenses", asyncHandler(async (_req, res) => {
    const expenses = await storage.getExpenses();
    res.json(expenses);
  }));

  app.get("/api/expenses/:id", asyncHandler(async (req, res) => {
    const expense = await storage.getExpense(req.params.id);
    if (!expense) return res.status(404).json({ error: "Expense not found" });
    res.json(expense);
  }));

  app.post("/api/expenses", asyncHandler(async (req, res) => {
    const parsed = insertExpenseSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const expense = await storage.createExpense(parsed.data);
    res.json(expense);
  }));

  app.patch("/api/expenses/:id", asyncHandler(async (req, res) => {
    const expense = await storage.updateExpense(req.params.id, req.body);
    if (!expense) return res.status(404).json({ error: "Expense not found" });
    res.json(expense);
  }));

  app.delete("/api/expenses/:id", asyncHandler(async (req, res) => {
    const success = await storage.deleteExpense(req.params.id);
    if (!success) return res.status(404).json({ error: "Expense not found" });
    res.json({ success: true });
  }));

  // ============== CHART OF ACCOUNTS ENDPOINTS ==============
  app.get("/api/chart-of-accounts", asyncHandler(async (_req, res) => {
    const accounts = await storage.getChartOfAccounts();
    res.json(accounts);
  }));

  app.get("/api/chart-of-accounts/:id", asyncHandler(async (req, res) => {
    const account = await storage.getChartOfAccount(req.params.id);
    if (!account) return res.status(404).json({ error: "Account not found" });
    res.json(account);
  }));

  app.post("/api/chart-of-accounts", asyncHandler(async (req, res) => {
    const parsed = insertChartOfAccountsSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const account = await storage.createChartOfAccount(parsed.data);
    res.json(account);
  }));

  app.patch("/api/chart-of-accounts/:id", asyncHandler(async (req, res) => {
    const account = await storage.updateChartOfAccount(req.params.id, req.body);
    if (!account) return res.status(404).json({ error: "Account not found" });
    res.json(account);
  }));

  app.delete("/api/chart-of-accounts/:id", asyncHandler(async (req, res) => {
    const success = await storage.deleteChartOfAccount(req.params.id);
    if (!success) return res.status(404).json({ error: "Account not found" });
    res.json({ success: true });
  }));

  // ============== LEDGER ENTRY ENDPOINTS ==============
  app.get("/api/ledger-entries", async (req, res) => {
    try {
      const { accountId, fromDate, toDate } = req.query;
      if (accountId || fromDate || toDate) {
        const entries = await storage.getLedgerEntriesByAccountAndDate(
          accountId as string | undefined,
          fromDate as string | undefined,
          toDate as string | undefined,
        );
        return res.json(entries);
      }
      const entries = await storage.getLedgerEntries();
      res.json(entries);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/ledger-entries/:id", asyncHandler(async (req, res) => {
    const entry = await storage.getLedgerEntry(req.params.id);
    if (!entry) return res.status(404).json({ error: "Ledger entry not found" });
    res.json(entry);
  }));

  app.get("/api/ledger-entries/account/:accountId", asyncHandler(async (req, res) => {
    const entries = await storage.getLedgerEntriesByAccount(req.params.accountId);
    res.json(entries);
  }));

  app.post("/api/ledger-entries", asyncHandler(async (req, res) => {
    const parsed = insertLedgerEntrySchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const entry = await storage.createLedgerEntry(parsed.data);
    res.json(entry);
  }));

  app.patch("/api/ledger-entries/:id", asyncHandler(async (req, res) => {
    const entry = await storage.updateLedgerEntry(req.params.id, req.body);
    if (!entry) return res.status(404).json({ error: "Ledger entry not found" });
    res.json(entry);
  }));

  app.delete("/api/ledger-entries/:id", asyncHandler(async (req, res) => {
    const success = await storage.deleteLedgerEntry(req.params.id);
    if (!success) return res.status(404).json({ error: "Ledger entry not found" });
    res.json({ success: true });
  }));

  // ============== JOURNAL ENTRY ENDPOINTS ==============
  app.get("/api/journal-entries", asyncHandler(async (_req, res) => {
    const entries = await storage.getJournalEntries();
    res.json(entries);
  }));

  app.get("/api/journal-entries/:id", asyncHandler(async (req, res) => {
    const entry = await storage.getJournalEntry(req.params.id);
    if (!entry) return res.status(404).json({ error: "Journal entry not found" });
    res.json(entry);
  }));

  app.post("/api/journal-entries", asyncHandler(async (req, res) => {
    const parsed = insertJournalEntrySchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const entry = await storage.createJournalEntry(parsed.data);
    res.json(entry);
  }));

  app.patch("/api/journal-entries/:id", asyncHandler(async (req, res) => {
    const entry = await storage.updateJournalEntry(req.params.id, req.body);
    if (!entry) return res.status(404).json({ error: "Journal entry not found" });
    res.json(entry);
  }));

  app.delete("/api/journal-entries/:id", asyncHandler(async (req, res) => {
    const success = await storage.deleteJournalEntry(req.params.id);
    if (!success) return res.status(404).json({ error: "Journal entry not found" });
    res.json({ success: true });
  }));

  // WebSocket server setup for real-time notifications
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });
  wss.on("connection", (ws) => {
    clients.add(ws);
    ws.on("close", () => clients.delete(ws));
    ws.on("error", () => clients.delete(ws));
  });

  return httpServer;
}
