import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { storage } from "./storage";
import { User } from "./models/User";
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
  insertAttendanceRecordSchema,
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

  app.post("/api/auth/login", async (req, res) => {
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
            { expiresIn: "30d" } // 30 days - practically permanent, no automatic logout
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
          { expiresIn: "30d" } // 30 days - practically permanent, no automatic logout
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

  app.get("/api/students", async (req, res) => {
    const students = await storage.getStudents();
    const { query } = req.query;

    if (query && typeof query === "string") {
      const searchLower = query.toLowerCase().trim();
      const results = students.filter(student => {
        const studentIdMatch = student.studentId?.toLowerCase().includes(searchLower);
        const nameMatch = student.name?.toLowerCase().includes(searchLower);
        return studentIdMatch || nameMatch;
      });
      return res.json(results);
    }

    res.json(students);
  });

  app.get("/api/students/:id", async (req, res) => {
    const student = await storage.getStudent(req.params.id);
    if (!student) return res.status(404).json({ error: "Not found" });
    res.json(student);
  });

  app.get("/api/students/:id/attendance", async (req, res) => {
    const student = await storage.getStudent(req.params.id);
    if (!student) return res.status(404).json({ error: "Student not found" });
    const records = await storage.getStudentAttendance(student.studentId);
    res.json(records);
  });

  app.post("/api/students", async (req, res) => {
    try {
      const parsed = insertStudentSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: parsed.error });
      const student = await storage.createStudent(parsed.data);
      res.status(201).json(student);
    } catch (error) {
      console.error("Failed to create student:", error);
      res.status(500).json({ error: "Failed to create student" });
    }
  });

  app.patch("/api/students/:id", async (req, res) => {
    const { id, ...updates } = req.body;
    const parsed = studentSchema.partial().omit({ id: true, studentId: true }).safeParse(updates);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const student = await storage.updateStudent(req.params.id, parsed.data);
    if (!student) return res.status(404).json({ error: "Not found" });
    res.json(student);
  });

  app.delete("/api/students/:id", async (req, res) => {
    const validation = await checkStudentReferences(req.params.id);
    if (!validation.canDelete) {
      return res.status(409).json({ error: validation.errorMessage, references: validation.references });
    }
    const deleted = await storage.deleteStudent(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ success: true });
  });

  app.get("/api/staff", async (req, res) => {
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
  });

  app.get("/api/staff/:id", async (req, res) => {
    const member = await storage.getStaffMember(req.params.id);
    if (!member) return res.status(404).json({ error: "Not found" });
    res.json(member);
  });

  app.post("/api/staff", async (req, res) => {
    const parsed = insertStaffSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const member = await storage.createStaff(parsed.data);
    res.status(201).json(member);
  });

  app.patch("/api/staff/:id", async (req, res) => {
    const { id, ...updates } = req.body;
    const parsed = insertStaffSchema.partial().safeParse(updates);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const member = await storage.updateStaff(req.params.id, parsed.data);
    if (!member) return res.status(404).json({ error: "Not found" });
    res.json(member);
  });

  app.delete("/api/staff/:id", async (req, res) => {
    const validation = await checkStaffReferences(req.params.id);
    if (!validation.canDelete) {
      return res.status(409).json({ error: validation.errorMessage, references: validation.references });
    }
    const deleted = await storage.deleteStaff(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ success: true });
  });

  app.get("/api/vacancies", async (_req, res) => {
    const vacancies = await storage.getVacancies();
    res.json(vacancies);
  });

  app.get("/api/vacancies/:id", async (req, res) => {
    const vacancy = await storage.getVacancy(req.params.id);
    if (!vacancy) return res.status(404).json({ error: "Not found" });
    res.json(vacancy);
  });

  app.post("/api/vacancies", async (req, res) => {
    const parsed = insertVacancySchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const vacancy = await storage.createVacancy(parsed.data);
    res.status(201).json(vacancy);
  });

  app.patch("/api/vacancies/:id", async (req, res) => {
    const { id, ...updates } = req.body;
    const parsed = insertVacancySchema.partial().safeParse(updates);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const vacancy = await storage.updateVacancy(req.params.id, parsed.data);
    if (!vacancy) return res.status(404).json({ error: "Not found" });
    res.json(vacancy);
  });

  app.delete("/api/vacancies/:id", async (req, res) => {
    const validation = await checkVacancyReferences(req.params.id);
    if (!validation.canDelete) {
      return res.status(409).json({ error: validation.errorMessage, references: validation.references });
    }
    const deleted = await storage.deleteVacancy(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ success: true });
  });

  app.get("/api/applicants", async (_req, res) => {
    const applicants = await storage.getApplicants();
    res.json(applicants);
  });

  app.get("/api/applicants/:id", async (req, res) => {
    const applicant = await storage.getApplicant(req.params.id);
    if (!applicant) return res.status(404).json({ error: "Not found" });
    res.json(applicant);
  });

  app.post("/api/applicants", async (req, res) => {
    const parsed = insertApplicantSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const applicant = await storage.createApplicant(parsed.data);
    res.status(201).json(applicant);
  });

  app.patch("/api/applicants/:id", async (req, res) => {
    const { id, ...updates } = req.body;
    const parsed = insertApplicantSchema.partial().safeParse(updates);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const applicant = await storage.updateApplicant(req.params.id, parsed.data);
    if (!applicant) return res.status(404).json({ error: "Not found" });
    res.json(applicant);
  });

  app.delete("/api/applicants/:id", async (req, res) => {
    const deleted = await storage.deleteApplicant(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ success: true });
  });

  app.get("/api/fee-vouchers", async (_req, res) => {
    const vouchers = await storage.getFeeVouchers();
    res.json(vouchers);
  });

  app.get("/api/fee-vouchers/:id", async (req, res) => {
    const voucher = await storage.getFeeVoucher(req.params.id);
    if (!voucher) return res.status(404).json({ error: "Not found" });
    res.json(voucher);
  });

  app.post("/api/fee-vouchers", async (req, res) => {
    const parsed = insertFeeVoucherSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const voucher = await storage.createFeeVoucher(parsed.data);
    res.status(201).json(voucher);
  });

  app.patch("/api/fee-vouchers/:id", async (req, res) => {
    const { id, ...updates } = req.body;
    const parsed = insertFeeVoucherSchema.partial().safeParse(updates);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const voucher = await storage.updateFeeVoucher(req.params.id, parsed.data);
    if (!voucher) return res.status(404).json({ error: "Not found" });
    res.json(voucher);
  });

  app.delete("/api/fee-vouchers/:id", async (req, res) => {
    const deleted = await storage.deleteFeeVoucher(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ success: true });
  });

  app.get("/api/payrolls", async (_req, res) => {
    const payrolls = await storage.getPayrolls();
    res.json(payrolls);
  });

  app.get("/api/payrolls/:id", async (req, res) => {
    const payroll = await storage.getPayroll(req.params.id);
    if (!payroll) return res.status(404).json({ error: "Not found" });
    res.json(payroll);
  });

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

  app.patch("/api/payrolls/:id", async (req, res) => {
    const { id, ...updates } = req.body;
    const parsed = insertPayrollSchema.partial().safeParse(updates);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const payroll = await storage.updatePayroll(req.params.id, parsed.data);
    if (!payroll) return res.status(404).json({ error: "Not found" });
    res.json(payroll);
  });

  app.delete("/api/payrolls/:id", async (req, res) => {
    const deleted = await storage.deletePayroll(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ success: true });
  });

  app.get("/api/accounts", async (_req, res) => {
    const accounts = await storage.getAccounts();
    res.json(accounts);
  });

  app.get("/api/accounts/:id", async (req, res) => {
    const account = await storage.getAccount(req.params.id);
    if (!account) return res.status(404).json({ error: "Not found" });
    res.json(account);
  });

  app.post("/api/accounts", async (req, res) => {
    const parsed = insertAccountSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const account = await storage.createAccount(parsed.data);
    res.status(201).json(account);
  });

  app.patch("/api/accounts/:id", async (req, res) => {
    const { id, ...updates } = req.body;
    const parsed = insertAccountSchema.partial().safeParse(updates);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const account = await storage.updateAccount(req.params.id, parsed.data);
    if (!account) return res.status(404).json({ error: "Not found" });
    res.json(account);
  });

  app.delete("/api/accounts/:id", async (req, res) => {
    const validation = await checkAccountReferences(req.params.id);
    if (!validation.canDelete) {
      return res.status(409).json({ error: validation.errorMessage, references: validation.references });
    }
    const deleted = await storage.deleteAccount(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ success: true });
  });

  app.get("/api/finance-vouchers", async (_req, res) => {
    const vouchers = await storage.getFinanceVouchers();
    res.json(vouchers);
  });

  app.get("/api/finance-vouchers/:id", async (req, res) => {
    const voucher = await storage.getFinanceVoucher(req.params.id);
    if (!voucher) return res.status(404).json({ error: "Not found" });
    res.json(voucher);
  });

  app.post("/api/finance-vouchers", async (req, res) => {
    const parsed = insertFinanceVoucherSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const voucher = await storage.createFinanceVoucher(parsed.data);
    res.status(201).json(voucher);
  });

  app.patch("/api/finance-vouchers/:id", async (req, res) => {
    const { id, ...updates } = req.body;
    const parsed = insertFinanceVoucherSchema.partial().safeParse(updates);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const voucher = await storage.updateFinanceVoucher(req.params.id, parsed.data);
    if (!voucher) return res.status(404).json({ error: "Not found" });
    res.json(voucher);
  });

  app.delete("/api/finance-vouchers/:id", async (req, res) => {
    const deleted = await storage.deleteFinanceVoucher(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ success: true });
  });

  app.get("/api/attendance-records", async (req, res) => {
    const { date, class: className, section } = req.query;

    if (date && className && section) {
      const records = await storage.getAttendanceByClassAndDate(
        className as string,
        section as string,
        date as string
      );
      return res.json(records);
    }

    const { studentId } = req.query;
    if (studentId) {
      const records = await storage.getStudentAttendance(studentId as string);
      return res.json(records);
    }

    const records = await storage.getAttendanceRecords();
    res.json(records);
  });

  app.get("/api/attendance-records/:id", async (req, res) => {
    const record = await storage.getAttendanceRecord(req.params.id);
    if (!record) return res.status(404).json({ error: "Not found" });
    res.json(record);
  });

  app.post("/api/attendance-records", async (req, res) => {
    const parsed = insertAttendanceRecordSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const record = await storage.createAttendanceRecord(parsed.data);
    res.status(201).json(record);
  });

  app.patch("/api/attendance-records/:id", async (req, res) => {
    const { id, ...updates } = req.body;
    const parsed = insertAttendanceRecordSchema.partial().safeParse(updates);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const record = await storage.updateAttendanceRecord(req.params.id, parsed.data);
    if (!record) return res.status(404).json({ error: "Not found" });
    res.json(record);
  });

  app.delete("/api/attendance-records/:id", async (req, res) => {
    const deleted = await storage.deleteAttendanceRecord(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ success: true });
  });

  app.get("/api/timetables", async (_req, res) => {
    const timetables = await storage.getTimetables();
    res.json(timetables);
  });

  app.get("/api/timetables/:id", async (req, res) => {
    const timetable = await storage.getTimetable(req.params.id);
    if (!timetable) return res.status(404).json({ error: "Not found" });
    res.json(timetable);
  });

  app.post("/api/timetables", async (req, res) => {
    const parsed = insertTimetableSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const timetable = await storage.createTimetable(parsed.data);
    res.status(201).json(timetable);
  });

  app.patch("/api/timetables/:id", async (req, res) => {
    const { id, ...updates } = req.body;
    const parsed = insertTimetableSchema.partial().safeParse(updates);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const timetable = await storage.updateTimetable(req.params.id, parsed.data);
    if (!timetable) return res.status(404).json({ error: "Not found" });
    res.json(timetable);
  });

  app.delete("/api/timetables/:id", async (req, res) => {
    const deleted = await storage.deleteTimetable(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ success: true });
  });

  app.get("/api/date-sheets", async (_req, res) => {
    const dateSheets = await storage.getDateSheets();
    res.json(dateSheets);
  });

  app.get("/api/date-sheets/:id", async (req, res) => {
    const dateSheet = await storage.getDateSheet(req.params.id);
    if (!dateSheet) return res.status(404).json({ error: "Not found" });
    res.json(dateSheet);
  });

  app.post("/api/date-sheets", async (req, res) => {
    const parsed = insertDateSheetSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const dateSheet = await storage.createDateSheet(parsed.data);
    res.status(201).json(dateSheet);
  });

  app.patch("/api/date-sheets/:id", async (req, res) => {
    const { id, ...updates } = req.body;
    const parsed = insertDateSheetSchema.partial().safeParse(updates);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const dateSheet = await storage.updateDateSheet(req.params.id, parsed.data);
    if (!dateSheet) return res.status(404).json({ error: "Not found" });
    res.json(dateSheet);
  });

  app.delete("/api/date-sheets/:id", async (req, res) => {
    const deleted = await storage.deleteDateSheet(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ success: true });
  });

  app.get("/api/curriculums", async (_req, res) => {
    const curriculums = await storage.getCurriculums();
    res.json(curriculums);
  });

  app.get("/api/curriculums/:id", async (req, res) => {
    const curriculum = await storage.getCurriculum(req.params.id);
    if (!curriculum) return res.status(404).json({ error: "Not found" });
    res.json(curriculum);
  });

  app.post("/api/curriculums", async (req, res) => {
    const parsed = insertCurriculumSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const curriculum = await storage.createCurriculum(parsed.data);
    res.status(201).json(curriculum);
  });

  app.patch("/api/curriculums/:id", async (req, res) => {
    const { id, ...updates } = req.body;
    const parsed = insertCurriculumSchema.partial().safeParse(updates);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const curriculum = await storage.updateCurriculum(req.params.id, parsed.data);
    if (!curriculum) return res.status(404).json({ error: "Not found" });
    res.json(curriculum);
  });

  app.delete("/api/curriculums/:id", async (req, res) => {
    const deleted = await storage.deleteCurriculum(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ success: true });
  });

  app.get("/api/exams", async (_req, res) => {
    const exams = await storage.getExams();
    res.json(exams);
  });

  app.get("/api/exams/:id", async (req, res) => {
    const exam = await storage.getExam(req.params.id);
    if (!exam) return res.status(404).json({ error: "Not found" });
    res.json(exam);
  });

  app.post("/api/exams", async (req, res) => {
    const parsed = insertExamSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const exam = await storage.createExam(parsed.data);
    res.status(201).json(exam);
  });

  app.patch("/api/exams/:id", async (req, res) => {
    const { id, ...updates } = req.body;
    const parsed = insertExamSchema.partial().safeParse(updates);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const exam = await storage.updateExam(req.params.id, parsed.data);
    if (!exam) return res.status(404).json({ error: "Not found" });
    res.json(exam);
  });

  app.delete("/api/exams/:id", async (req, res) => {
    const validation = await checkExamReferences(req.params.id);
    if (!validation.canDelete) {
      return res.status(409).json({ error: validation.errorMessage, references: validation.references });
    }
    const deleted = await storage.deleteExam(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ success: true });
  });

  app.get("/api/results", async (_req, res) => {
    const results = await storage.getResults();
    res.json(results);
  });

  app.get("/api/results/:id", async (req, res) => {
    const result = await storage.getResult(req.params.id);
    if (!result) return res.status(404).json({ error: "Not found" });
    res.json(result);
  });

  app.post("/api/results", async (req, res) => {
    const parsed = insertResultSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const result = await storage.createResult(parsed.data);
    res.status(201).json(result);
  });

  app.patch("/api/results/:id", async (req, res) => {
    const { id, ...updates } = req.body;
    const parsed = insertResultSchema.partial().safeParse(updates);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const result = await storage.updateResult(req.params.id, parsed.data);
    if (!result) return res.status(404).json({ error: "Not found" });
    res.json(result);
  });

  app.delete("/api/results/:id", async (req, res) => {
    const deleted = await storage.deleteResult(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ success: true });
  });

  app.get("/api/pos-items", async (_req, res) => {
    const items = await storage.getPosItems();
    res.json(items);
  });

  app.get("/api/pos-items/:id", async (req, res) => {
    const item = await storage.getPosItem(req.params.id);
    if (!item) return res.status(404).json({ error: "Not found" });
    res.json(item);
  });

  app.post("/api/pos-items", async (req, res) => {
    const parsed = insertPosItemSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const item = await storage.createPosItem(parsed.data);
    res.status(201).json(item);
  });

  app.patch("/api/pos-items/:id", async (req, res) => {
    const { id, ...updates } = req.body;
    const parsed = insertPosItemSchema.partial().safeParse(updates);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const item = await storage.updatePosItem(req.params.id, parsed.data);
    if (!item) return res.status(404).json({ error: "Not found" });
    res.json(item);
  });

  app.delete("/api/pos-items/:id", async (req, res) => {
    const deleted = await storage.deletePosItem(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ success: true });
  });

  app.get("/api/sales", async (_req, res) => {
    const sales = await storage.getSales();
    res.json(sales);
  });

  app.get("/api/sales/:id", async (req, res) => {
    const sale = await storage.getSale(req.params.id);
    if (!sale) return res.status(404).json({ error: "Not found" });
    res.json(sale);
  });

  app.post("/api/sales", async (req, res) => {
    const parsed = insertSaleSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const sale = await storage.createSale(parsed.data);
    res.status(201).json(sale);
  });

  app.patch("/api/sales/:id", async (req, res) => {
    const { id, ...updates } = req.body;
    const parsed = insertSaleSchema.partial().safeParse(updates);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const sale = await storage.updateSale(req.params.id, parsed.data);
    if (!sale) return res.status(404).json({ error: "Not found" });
    res.json(sale);
  });

  app.delete("/api/sales/:id", async (req, res) => {
    const deleted = await storage.deleteSale(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ success: true });
  });

  app.get("/api/books", async (_req, res) => {
    const books = await storage.getBooks();
    res.json(books);
  });

  app.get("/api/books/:id", async (req, res) => {
    const book = await storage.getBook(req.params.id);
    if (!book) return res.status(404).json({ error: "Not found" });
    res.json(book);
  });

  app.post("/api/books", async (req, res) => {
    const parsed = insertBookSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const book = await storage.createBook(parsed.data);
    res.status(201).json(book);
  });

  app.patch("/api/books/:id", async (req, res) => {
    const { id, ...updates } = req.body;
    const parsed = insertBookSchema.partial().safeParse(updates);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const book = await storage.updateBook(req.params.id, parsed.data);
    if (!book) return res.status(404).json({ error: "Not found" });
    res.json(book);
  });

  app.delete("/api/books/:id", async (req, res) => {
    const validation = await checkBookReferences(req.params.id);
    if (!validation.canDelete) {
      return res.status(409).json({ error: validation.errorMessage, references: validation.references });
    }
    const deleted = await storage.deleteBook(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ success: true });
  });

  // Book Category Routes
  app.get("/api/book-categories", async (_req, res) => {
    const categories = await storage.getBookCategories();
    res.json(categories);
  });

  app.get("/api/book-categories/:id", async (req, res) => {
    const category = await storage.getBookCategory(req.params.id);
    if (!category) return res.status(404).json({ error: "Not found" });
    res.json(category);
  });

  app.post("/api/book-categories", async (req, res) => {
    const parsed = insertBookCategorySchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const category = await storage.createBookCategory(parsed.data);
    res.status(201).json(category);
  });

  app.patch("/api/book-categories/:id", async (req, res) => {
    const { id, ...updates } = req.body;
    const parsed = insertBookCategorySchema.partial().safeParse(updates);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const category = await storage.updateBookCategory(req.params.id, parsed.data);
    if (!category) return res.status(404).json({ error: "Not found" });
    res.json(category);
  });

  app.delete("/api/book-categories/:id", async (req, res) => {
    const category = await storage.getBookCategory(req.params.id);
    if (!category) return res.status(404).json({ error: "Not found" });
    if (category.isDefault) {
      return res.status(400).json({ error: "Cannot delete default categories" });
    }
    const deleted = await storage.deleteBookCategory(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ success: true });
  });

  // DEPRECATED: Members functionality removed - use Student/Staff search instead
  // app.get("/api/library-members", async (_req, res) => {
  //   const members = await storage.getLibraryMembers();
  //   res.json(members);
  // });

  // app.get("/api/library-members/:id", async (req, res) => {
  //   const member = await storage.getLibraryMember(req.params.id);
  //   if (!member) return res.status(404).json({ error: "Not found" });
  //   res.json(member);
  // });

  // app.post("/api/library-members", async (req, res) => {
  //   const parsed = insertLibraryMemberSchema.safeParse(req.body);
  //   if (!parsed.success) return res.status(400).json({ error: parsed.error });
  //   const member = await storage.createLibraryMember(parsed.data);
  //   res.status(201).json(member);
  // });

  // app.patch("/api/library-members/:id", async (req, res) => {
  //   const { id, ...updates } = req.body;
  //   const parsed = insertLibraryMemberSchema.partial().safeParse(updates);
  //   if (!parsed.success) return res.status(400).json({ error: parsed.error });
  //   const member = await storage.updateLibraryMember(req.params.id, parsed.data);
  //   if (!member) return res.status(404).json({ error: "Not found" });
  //   res.json(member);
  // });

  // app.delete("/api/library-members/:id", async (req, res) => {
  //   const validation = await checkLibraryMemberReferences(req.params.id);
  //   if (!validation.canDelete) {
  //     return res.status(409).json({ error: validation.errorMessage, references: validation.references });
  //   }
  //   const deleted = await storage.deleteLibraryMember(req.params.id);
  //   if (!deleted) return res.status(404).json({ error: "Not found" });
  //   res.json({ success: true });
  // });

  app.get("/api/book-issues", async (_req, res) => {
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
  });

  app.get("/api/book-issues/:id", async (req, res) => {
    const issue = await storage.getBookIssue(req.params.id);
    if (!issue) return res.status(404).json({ error: "Not found" });
    res.json(issue);
  });

  app.post("/api/book-issues", async (req, res) => {
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
  });

  app.patch("/api/book-issues/:id", async (req, res) => {
    const { id, ...updates } = req.body;
    const parsed = insertBookIssueSchema.partial().safeParse(updates);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });

    const issue = await storage.getBookIssue(req.params.id);
    if (!issue) return res.status(404).json({ error: "Not found" });

    // If returning a book
    if (updates.returnDate && !issue.returnDate) {
      // Calculate fine if overdue
      const dueDate = new Date(issue.dueDate);
      const returnDate = new Date(updates.returnDate);

      if (returnDate > dueDate) {
        const daysOverdue = Math.ceil((returnDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
        const finePerDay = 5; // $5 per day
        updates.fine = daysOverdue * finePerDay;
      } else {
        updates.fine = 0;
      }

      updates.status = "Returned";

      // Update book availability
      const book = await storage.getBook(issue.bookId);
      if (book) {
        const newAvailable = book.availableCopies + 1;
        await storage.updateBook(book.id, {
          availableCopies: newAvailable,
          status: newAvailable > 0 ? "Available" : book.status
        });
      }
    }

    const updatedIssue = await storage.updateBookIssue(req.params.id, parsed.data);
    if (!updatedIssue) return res.status(404).json({ error: "Not found" });
    res.json(updatedIssue);
  });

  app.delete("/api/book-issues/:id", async (req, res) => {
    const deleted = await storage.deleteBookIssue(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ success: true });
  });

  // Library Statistics Endpoint
  app.get("/api/library/statistics", async (_req, res) => {
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
  });

  // Library Student Search Endpoint
  app.get("/api/library/search-students", async (req, res) => {
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
  });

  // Library Staff Search Endpoint
  app.get("/api/library/search-staff", async (req, res) => {
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
  });

  app.get("/api/routes", async (_req, res) => {
    const routes = await storage.getRoutes();
    res.json(routes);
  });

  app.get("/api/routes/:id", async (req, res) => {
    const route = await storage.getRoute(req.params.id);
    if (!route) return res.status(404).json({ error: "Not found" });
    res.json(route);
  });

  app.post("/api/routes", async (req, res) => {
    const parsed = insertRouteSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const route = await storage.createRoute(parsed.data);
    res.status(201).json(route);
  });

  app.patch("/api/routes/:id", async (req, res) => {
    const { id, ...updates } = req.body;
    const parsed = insertRouteSchema.partial().safeParse(updates);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const route = await storage.updateRoute(req.params.id, parsed.data);
    if (!route) return res.status(404).json({ error: "Not found" });
    res.json(route);
  });

  app.delete("/api/routes/:id", async (req, res) => {
    const validation = await checkRouteReferences(req.params.id);
    if (!validation.canDelete) {
      return res.status(409).json({ error: validation.errorMessage, references: validation.references });
    }
    const deleted = await storage.deleteRoute(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ success: true });
  });

  app.get("/api/vehicles", async (_req, res) => {
    const vehicles = await storage.getVehicles();
    res.json(vehicles);
  });

  app.get("/api/vehicles/:id", async (req, res) => {
    const vehicle = await storage.getVehicle(req.params.id);
    if (!vehicle) return res.status(404).json({ error: "Not found" });
    res.json(vehicle);
  });

  app.post("/api/vehicles", async (req, res) => {
    const parsed = insertVehicleSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const vehicle = await storage.createVehicle(parsed.data);
    res.status(201).json(vehicle);
  });

  app.patch("/api/vehicles/:id", async (req, res) => {
    const { id, ...updates } = req.body;
    const parsed = insertVehicleSchema.partial().safeParse(updates);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const vehicle = await storage.updateVehicle(req.params.id, parsed.data);
    if (!vehicle) return res.status(404).json({ error: "Not found" });
    res.json(vehicle);
  });

  app.delete("/api/vehicles/:id", async (req, res) => {
    const validation = await checkVehicleReferences(req.params.id);
    if (!validation.canDelete) {
      return res.status(409).json({ error: validation.errorMessage, references: validation.references });
    }
    const deleted = await storage.deleteVehicle(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ success: true });
  });

  app.get("/api/drivers", async (_req, res) => {
    const drivers = await storage.getDrivers();
    res.json(drivers);
  });

  app.get("/api/drivers/:id", async (req, res) => {
    const driver = await storage.getDriver(req.params.id);
    if (!driver) return res.status(404).json({ error: "Not found" });
    res.json(driver);
  });

  app.post("/api/drivers", async (req, res) => {
    const parsed = insertDriverSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const driver = await storage.createDriver(parsed.data);
    res.status(201).json(driver);
  });

  app.patch("/api/drivers/:id", async (req, res) => {
    const { id, ...updates } = req.body;
    const parsed = insertDriverSchema.partial().safeParse(updates);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const driver = await storage.updateDriver(req.params.id, parsed.data);
    if (!driver) return res.status(404).json({ error: "Not found" });
    res.json(driver);
  });

  app.delete("/api/drivers/:id", async (req, res) => {
    const deleted = await storage.deleteDriver(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ success: true });
  });

  app.get("/api/student-transports", async (_req, res) => {
    const transports = await storage.getStudentTransports();
    res.json(transports);
  });

  app.get("/api/student-transports/:id", async (req, res) => {
    const transport = await storage.getStudentTransport(req.params.id);
    if (!transport) return res.status(404).json({ error: "Not found" });
    res.json(transport);
  });

  app.post("/api/student-transports", async (req, res) => {
    const parsed = insertStudentTransportSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const transport = await storage.createStudentTransport(parsed.data);
    res.status(201).json(transport);
  });

  app.patch("/api/student-transports/:id", async (req, res) => {
    const { id, ...updates } = req.body;
    const parsed = insertStudentTransportSchema.partial().safeParse(updates);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const transport = await storage.updateStudentTransport(req.params.id, parsed.data);
    if (!transport) return res.status(404).json({ error: "Not found" });
    res.json(transport);
  });

  app.delete("/api/student-transports/:id", async (req, res) => {
    const deleted = await storage.deleteStudentTransport(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ success: true });
  });

  app.get("/api/hostel-rooms", async (_req, res) => {
    const rooms = await storage.getHostelRooms();
    res.json(rooms);
  });

  app.get("/api/hostel-rooms/:id", async (req, res) => {
    const room = await storage.getHostelRoom(req.params.id);
    if (!room) return res.status(404).json({ error: "Not found" });
    res.json(room);
  });

  app.post("/api/hostel-rooms", async (req, res) => {
    const parsed = insertHostelRoomSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const room = await storage.createHostelRoom(parsed.data);
    res.status(201).json(room);
  });

  app.patch("/api/hostel-rooms/:id", async (req, res) => {
    const { id, ...updates } = req.body;
    const parsed = insertHostelRoomSchema.partial().safeParse(updates);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const room = await storage.updateHostelRoom(req.params.id, parsed.data);
    if (!room) return res.status(404).json({ error: "Not found" });
    res.json(room);
  });

  app.delete("/api/hostel-rooms/:id", async (req, res) => {
    const validation = await checkHostelRoomReferences(req.params.id);
    if (!validation.canDelete) {
      return res.status(409).json({ error: validation.errorMessage, references: validation.references });
    }
    const deleted = await storage.deleteHostelRoom(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ success: true });
  });

  app.get("/api/hostel-residents", async (_req, res) => {
    const residents = await storage.getHostelResidents();
    res.json(residents);
  });

  app.get("/api/hostel-residents/:id", async (req, res) => {
    const resident = await storage.getHostelResident(req.params.id);
    if (!resident) return res.status(404).json({ error: "Not found" });
    res.json(resident);
  });

  app.post("/api/hostel-residents", async (req, res) => {
    const parsed = insertHostelResidentSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const resident = await storage.createHostelResident(parsed.data);
    res.status(201).json(resident);
  });

  app.patch("/api/hostel-residents/:id", async (req, res) => {
    const { id, ...updates } = req.body;
    const parsed = insertHostelResidentSchema.partial().safeParse(updates);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const resident = await storage.updateHostelResident(req.params.id, parsed.data);
    if (!resident) return res.status(404).json({ error: "Not found" });
    res.json(resident);
  });

  app.delete("/api/hostel-residents/:id", async (req, res) => {
    const validation = await checkHostelResidentReferences(req.params.id);
    if (!validation.canDelete) {
      return res.status(409).json({ error: validation.errorMessage, references: validation.references });
    }
    const deleted = await storage.deleteHostelResident(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ success: true });
  });

  app.get("/api/hostel-fees", async (_req, res) => {
    const fees = await storage.getHostelFees();
    res.json(fees);
  });

  app.get("/api/hostel-fees/:id", async (req, res) => {
    const fee = await storage.getHostelFee(req.params.id);
    if (!fee) return res.status(404).json({ error: "Not found" });
    res.json(fee);
  });

  app.post("/api/hostel-fees", async (req, res) => {
    const parsed = insertHostelFeeSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const fee = await storage.createHostelFee(parsed.data);
    res.status(201).json(fee);
  });

  app.patch("/api/hostel-fees/:id", async (req, res) => {
    const { id, ...updates } = req.body;
    const parsed = insertHostelFeeSchema.partial().safeParse(updates);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const fee = await storage.updateHostelFee(req.params.id, parsed.data);
    if (!fee) return res.status(404).json({ error: "Not found" });
    res.json(fee);
  });

  app.delete("/api/hostel-fees/:id", async (req, res) => {
    const deleted = await storage.deleteHostelFee(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ success: true });
  });

  // Notification endpoints
  app.get("/api/notifications", async (req, res) => {
    const module = req.query.module as string | undefined;
    const notifications = await storage.getNotifications(module);
    res.json(notifications);
  });

  app.get("/api/notifications/unread-count", async (req, res) => {
    const module = req.query.module as string | undefined;
    const count = await storage.getUnreadNotificationCount(module);
    res.json({ count });
  });

  app.post("/api/notifications", async (req, res) => {
    const parsed = insertNotificationSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const notification = await storage.createNotification(parsed.data);
    broadcastNotification(notification);
    res.status(201).json(notification);
  });

  app.patch("/api/notifications/:id/read", async (req, res) => {
    const notification = await storage.markNotificationRead(req.params.id);
    if (!notification) return res.status(404).json({ error: "Not found" });
    res.json(notification);
  });

  app.patch("/api/notifications/mark-all-read", async (req, res) => {
    const module = req.query.module as string | undefined;
    await storage.markAllNotificationsRead(module);
    res.json({ success: true });
  });

  app.delete("/api/notifications/:id", async (req, res) => {
    const deleted = await storage.deleteNotification(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ success: true });
  });

  // Activity Log endpoints
  app.get("/api/activity-logs", async (req, res) => {
    const module = req.query.module as string | undefined;
    const logs = await storage.getActivityLogs(module);
    res.json(logs);
  });

  app.post("/api/activity-logs", async (req, res) => {
    const parsed = insertActivityLogSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const log = await storage.createActivityLog(parsed.data);
    res.status(201).json(log);
  });

  // ============== BULK OPERATION ENDPOINTS ==============

  // Bulk student admission
  app.post("/api/bulk/students", async (req, res) => {
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
  });

  // Bulk fee voucher generation
  app.post("/api/bulk/fee-vouchers", async (req, res) => {
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
  });

  // Bulk attendance marking
  app.post("/api/bulk/attendance", async (req, res) => {
    const { records } = req.body;
    if (!Array.isArray(records)) {
      return res.status(400).json({ success: 0, failed: 0, errors: [{ row: 0, message: "Records array required" }] });
    }

    const results = { success: 0, failed: 0, errors: [] as { row: number; message: string }[] };
    const validStatuses = ["Present", "Absent", "Late", "Leave"];

    for (let i = 0; i < records.length; i++) {
      // Normalize status to proper casing
      let normalizedStatus = records[i].status;
      if (typeof normalizedStatus === "string") {
        const statusLower = normalizedStatus.trim().toLowerCase();
        const matchedStatus = validStatuses.find(s => s.toLowerCase() === statusLower);
        normalizedStatus = matchedStatus || normalizedStatus;
      }

      const normalizedRecord = {
        ...records[i],
        status: normalizedStatus,
      };

      const parsed = insertAttendanceRecordSchema.safeParse(normalizedRecord);
      if (!parsed.success) {
        results.failed++;
        results.errors.push({ row: i + 1, message: parsed.error.errors.map(e => e.message).join(", ") });
      } else {
        try {
          await storage.createAttendanceRecord(parsed.data);
          results.success++;
        } catch (err) {
          results.failed++;
          results.errors.push({ row: i + 1, message: String(err) });
        }
      }
    }

    res.json(results);
  });

  // Bulk result entry
  app.post("/api/bulk/results", async (req, res) => {
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
  });

  // ============== FEE STRUCTURE ENDPOINTS ==============
  app.get("/api/fee-structures", async (_req, res) => {
    const structures = await storage.getFeeStructures();
    res.json(structures);
  });

  app.get("/api/fee-structures/:id", async (req, res) => {
    const structure = await storage.getFeeStructure(req.params.id);
    if (!structure) return res.status(404).json({ error: "Fee structure not found" });
    res.json(structure);
  });

  app.post("/api/fee-structures", async (req, res) => {
    const parsed = insertFeeStructureSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const structure = await storage.createFeeStructure(parsed.data);
    res.json(structure);
  });

  app.patch("/api/fee-structures/:id", async (req, res) => {
    const structure = await storage.updateFeeStructure(req.params.id, req.body);
    if (!structure) return res.status(404).json({ error: "Fee structure not found" });
    res.json(structure);
  });

  app.delete("/api/fee-structures/:id", async (req, res) => {
    const success = await storage.deleteFeeStructure(req.params.id);
    if (!success) return res.status(404).json({ error: "Fee structure not found" });
    res.json({ success: true });
  });

  // ============== DISCOUNT RULES ENDPOINTS ==============
  app.get("/api/discount-rules", async (_req, res) => {
    const rules = await storage.getDiscountRules();
    res.json(rules);
  });

  app.get("/api/discount-rules/:id", async (req, res) => {
    const rule = await storage.getDiscountRule(req.params.id);
    if (!rule) return res.status(404).json({ error: "Discount rule not found" });
    res.json(rule);
  });

  app.post("/api/discount-rules", async (req, res) => {
    const parsed = insertDiscountRuleSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const rule = await storage.createDiscountRule(parsed.data);
    res.json(rule);
  });

  app.patch("/api/discount-rules/:id", async (req, res) => {
    const rule = await storage.updateDiscountRule(req.params.id, req.body);
    if (!rule) return res.status(404).json({ error: "Discount rule not found" });
    res.json(rule);
  });

  app.delete("/api/discount-rules/:id", async (req, res) => {
    const success = await storage.deleteDiscountRule(req.params.id);
    if (!success) return res.status(404).json({ error: "Discount rule not found" });
    res.json({ success: true });
  });

  // ============== LATE FEE RULES ENDPOINTS ==============
  app.get("/api/late-fee-rules", async (_req, res) => {
    const rules = await storage.getLateFeeRules();
    res.json(rules);
  });

  app.get("/api/late-fee-rules/:id", async (req, res) => {
    const rule = await storage.getLateFeeRule(req.params.id);
    if (!rule) return res.status(404).json({ error: "Late fee rule not found" });
    res.json(rule);
  });

  app.post("/api/late-fee-rules", async (req, res) => {
    const parsed = insertLateFeeRuleSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const rule = await storage.createLateFeeRule(parsed.data);
    res.json(rule);
  });

  app.patch("/api/late-fee-rules/:id", async (req, res) => {
    const rule = await storage.updateLateFeeRule(req.params.id, req.body);
    if (!rule) return res.status(404).json({ error: "Late fee rule not found" });
    res.json(rule);
  });

  app.delete("/api/late-fee-rules/:id", async (req, res) => {
    const success = await storage.deleteLateFeeRule(req.params.id);
    if (!success) return res.status(404).json({ error: "Late fee rule not found" });
    res.json({ success: true });
  });

  // ============== INSTALLMENT PLANS ENDPOINTS ==============
  app.get("/api/installment-plans", async (_req, res) => {
    const plans = await storage.getInstallmentPlans();
    res.json(plans);
  });

  app.get("/api/installment-plans/:id", async (req, res) => {
    const plan = await storage.getInstallmentPlan(req.params.id);
    if (!plan) return res.status(404).json({ error: "Installment plan not found" });
    res.json(plan);
  });

  app.post("/api/installment-plans", async (req, res) => {
    const parsed = insertInstallmentPlanSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const plan = await storage.createInstallmentPlan(parsed.data);
    res.json(plan);
  });

  app.patch("/api/installment-plans/:id", async (req, res) => {
    const plan = await storage.updateInstallmentPlan(req.params.id, req.body);
    if (!plan) return res.status(404).json({ error: "Installment plan not found" });
    res.json(plan);
  });

  app.delete("/api/installment-plans/:id", async (req, res) => {
    const success = await storage.deleteInstallmentPlan(req.params.id);
    if (!success) return res.status(404).json({ error: "Installment plan not found" });
    res.json({ success: true });
  });

  // ============== CHALLAN ENDPOINTS ==============
  app.get("/api/challans", async (_req, res) => {
    const challans = await storage.getChallans();
    res.json(challans);
  });

  app.get("/api/challans/:id", async (req, res) => {
    const challan = await storage.getChallan(req.params.id);
    if (!challan) return res.status(404).json({ error: "Challan not found" });
    res.json(challan);
  });

  app.get("/api/challans/student/:studentId", async (req, res) => {
    const challans = await storage.getChallansByStudent(req.params.studentId);
    res.json(challans);
  });

  app.post("/api/challans", async (req, res) => {
    const parsed = insertChallanSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const challan = await storage.createChallan(parsed.data);
    res.json(challan);
  });

  app.patch("/api/challans/:id", async (req, res) => {
    const challan = await storage.updateChallan(req.params.id, req.body);
    if (!challan) return res.status(404).json({ error: "Challan not found" });
    res.json(challan);
  });

  app.delete("/api/challans/:id", async (req, res) => {
    const success = await storage.deleteChallan(req.params.id);
    if (!success) return res.status(404).json({ error: "Challan not found" });
    res.json({ success: true });
  });

  // ============== PAYMENT ENDPOINTS ==============
  app.get("/api/payments", async (_req, res) => {
    const payments = await storage.getPayments();
    res.json(payments);
  });

  app.get("/api/payments/:id", async (req, res) => {
    const payment = await storage.getPayment(req.params.id);
    if (!payment) return res.status(404).json({ error: "Payment not found" });
    res.json(payment);
  });

  app.get("/api/payments/challan/:challanId", async (req, res) => {
    const payments = await storage.getPaymentsByChallan(req.params.challanId);
    res.json(payments);
  });

  app.post("/api/payments", async (req, res) => {
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

    res.json(payment);
  });

  app.patch("/api/payments/:id", async (req, res) => {
    const payment = await storage.updatePayment(req.params.id, req.body);
    if (!payment) return res.status(404).json({ error: "Payment not found" });
    res.json(payment);
  });

  app.delete("/api/payments/:id", async (req, res) => {
    const success = await storage.deletePayment(req.params.id);
    if (!success) return res.status(404).json({ error: "Payment not found" });
    res.json({ success: true });
  });

  // ============== VENDOR ENDPOINTS ==============
  app.get("/api/vendors", async (_req, res) => {
    const vendors = await storage.getVendors();
    res.json(vendors);
  });

  app.get("/api/vendors/:id", async (req, res) => {
    const vendor = await storage.getVendor(req.params.id);
    if (!vendor) return res.status(404).json({ error: "Vendor not found" });
    res.json(vendor);
  });

  app.post("/api/vendors", async (req, res) => {
    const parsed = insertVendorSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const vendor = await storage.createVendor(parsed.data);
    res.json(vendor);
  });

  app.patch("/api/vendors/:id", async (req, res) => {
    const vendor = await storage.updateVendor(req.params.id, req.body);
    if (!vendor) return res.status(404).json({ error: "Vendor not found" });
    res.json(vendor);
  });

  app.delete("/api/vendors/:id", async (req, res) => {
    const success = await storage.deleteVendor(req.params.id);
    if (!success) return res.status(404).json({ error: "Vendor not found" });
    res.json({ success: true });
  });

  // ============== EXPENSE ENDPOINTS ==============
  app.get("/api/expenses", async (_req, res) => {
    const expenses = await storage.getExpenses();
    res.json(expenses);
  });

  app.get("/api/expenses/:id", async (req, res) => {
    const expense = await storage.getExpense(req.params.id);
    if (!expense) return res.status(404).json({ error: "Expense not found" });
    res.json(expense);
  });

  app.post("/api/expenses", async (req, res) => {
    const parsed = insertExpenseSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const expense = await storage.createExpense(parsed.data);
    res.json(expense);
  });

  app.patch("/api/expenses/:id", async (req, res) => {
    const expense = await storage.updateExpense(req.params.id, req.body);
    if (!expense) return res.status(404).json({ error: "Expense not found" });
    res.json(expense);
  });

  app.delete("/api/expenses/:id", async (req, res) => {
    const success = await storage.deleteExpense(req.params.id);
    if (!success) return res.status(404).json({ error: "Expense not found" });
    res.json({ success: true });
  });

  // ============== CHART OF ACCOUNTS ENDPOINTS ==============
  app.get("/api/chart-of-accounts", async (_req, res) => {
    const accounts = await storage.getChartOfAccounts();
    res.json(accounts);
  });

  app.get("/api/chart-of-accounts/:id", async (req, res) => {
    const account = await storage.getChartOfAccount(req.params.id);
    if (!account) return res.status(404).json({ error: "Account not found" });
    res.json(account);
  });

  app.post("/api/chart-of-accounts", async (req, res) => {
    const parsed = insertChartOfAccountsSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const account = await storage.createChartOfAccount(parsed.data);
    res.json(account);
  });

  app.patch("/api/chart-of-accounts/:id", async (req, res) => {
    const account = await storage.updateChartOfAccount(req.params.id, req.body);
    if (!account) return res.status(404).json({ error: "Account not found" });
    res.json(account);
  });

  app.delete("/api/chart-of-accounts/:id", async (req, res) => {
    const success = await storage.deleteChartOfAccount(req.params.id);
    if (!success) return res.status(404).json({ error: "Account not found" });
    res.json({ success: true });
  });

  // ============== LEDGER ENTRY ENDPOINTS ==============
  app.get("/api/ledger-entries", async (_req, res) => {
    const entries = await storage.getLedgerEntries();
    res.json(entries);
  });

  app.get("/api/ledger-entries/:id", async (req, res) => {
    const entry = await storage.getLedgerEntry(req.params.id);
    if (!entry) return res.status(404).json({ error: "Ledger entry not found" });
    res.json(entry);
  });

  app.get("/api/ledger-entries/account/:accountId", async (req, res) => {
    const entries = await storage.getLedgerEntriesByAccount(req.params.accountId);
    res.json(entries);
  });

  app.post("/api/ledger-entries", async (req, res) => {
    const parsed = insertLedgerEntrySchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const entry = await storage.createLedgerEntry(parsed.data);
    res.json(entry);
  });

  app.patch("/api/ledger-entries/:id", async (req, res) => {
    const entry = await storage.updateLedgerEntry(req.params.id, req.body);
    if (!entry) return res.status(404).json({ error: "Ledger entry not found" });
    res.json(entry);
  });

  app.delete("/api/ledger-entries/:id", async (req, res) => {
    const success = await storage.deleteLedgerEntry(req.params.id);
    if (!success) return res.status(404).json({ error: "Ledger entry not found" });
    res.json({ success: true });
  });

  // ============== JOURNAL ENTRY ENDPOINTS ==============
  app.get("/api/journal-entries", async (_req, res) => {
    const entries = await storage.getJournalEntries();
    res.json(entries);
  });

  app.get("/api/journal-entries/:id", async (req, res) => {
    const entry = await storage.getJournalEntry(req.params.id);
    if (!entry) return res.status(404).json({ error: "Journal entry not found" });
    res.json(entry);
  });

  app.post("/api/journal-entries", async (req, res) => {
    const parsed = insertJournalEntrySchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    const entry = await storage.createJournalEntry(parsed.data);
    res.json(entry);
  });

  app.patch("/api/journal-entries/:id", async (req, res) => {
    const entry = await storage.updateJournalEntry(req.params.id, req.body);
    if (!entry) return res.status(404).json({ error: "Journal entry not found" });
    res.json(entry);
  });

  app.delete("/api/journal-entries/:id", async (req, res) => {
    const success = await storage.deleteJournalEntry(req.params.id);
    if (!success) return res.status(404).json({ error: "Journal entry not found" });
    res.json({ success: true });
  });

  // WebSocket server setup for real-time notifications
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });
  wss.on("connection", (ws) => {
    clients.add(ws);
    ws.on("close", () => clients.delete(ws));
    ws.on("error", () => clients.delete(ws));
  });

  return httpServer;
}
