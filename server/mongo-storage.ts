import {
  type Student, type InsertStudent,
  type BookCategory, type InsertBookCategory,
  type Staff, type InsertStaff,
  type Vacancy, type InsertVacancy,
  type Applicant, type InsertApplicant,
  type FeeVoucher, type InsertFeeVoucher,
  type Payroll, type InsertPayroll,
  type Account, type InsertAccount,
  type FinanceVoucher, type InsertFinanceVoucher,
  type Timetable, type InsertTimetable,
  type DateSheet, type InsertDateSheet,
  type Curriculum, type InsertCurriculum,
  type Exam, type InsertExam,
  type Result, type InsertResult,
  type PosItem, type InsertPosItem,
  type Sale, type InsertSale,
  type Book, type InsertBook,
  type LibraryMember, type InsertLibraryMember,
  type BookIssue, type InsertBookIssue,
  type Route, type InsertRoute,
  type Vehicle, type InsertVehicle,
  type Driver, type InsertDriver,
  type StudentTransport, type InsertStudentTransport,
  type HostelRoom, type InsertHostelRoom,
  type HostelResident, type InsertHostelResident,
  type HostelFee, type InsertHostelFee,
  type Notification, type InsertNotification,
  type ActivityLog, type InsertActivityLog,
  type FeeStructure, type InsertFeeStructure,
  type DiscountRule, type InsertDiscountRule,
  type LateFeeRule, type InsertLateFeeRule,
  type InstallmentPlan, type InsertInstallmentPlan,
  type Challan, type InsertChallan,
  type Payment, type InsertPayment,
  type Vendor, type InsertVendor,
  type Expense, type InsertExpense,
  type ChartOfAccounts, type InsertChartOfAccounts,
  type LedgerEntry, type InsertLedgerEntry,
  type JournalEntry, type InsertJournalEntry,
  type AttendanceRecord, type InsertAttendanceRecord,
  type AttendanceSummary,
  moduleUserCredentials,
  type ModuleType,
  type UserRole,
} from "@shared/schema";
import { type IStorage, type LoginResult } from "./storage";
import {
  Student as StudentModel,
  Staff as StaffModel,
  Vacancy as VacancyModel,
  Applicant as ApplicantModel,
  FeeVoucher as FeeVoucherModel,
  Payroll as PayrollModel,
  Account as AccountModel,
  FinanceVoucher as FinanceVoucherModel,
  Timetable as TimetableModel,
  Datesheet as DatesheetModel,
  Curriculum as CurriculumModel,
  Exam as ExamModel,
  ExamResult as ExamResultModel,
  POSItem as POSItemModel,
  Sale as SaleModel,
  Counter as CounterModel,

  Book as BookModel,
  LibraryMember as LibraryMemberModel,
  BookIssue as BookIssueModel,
  Route as RouteModel,
  Vehicle as VehicleModel,
  Driver as DriverModel,
  TransportAllocation as TransportAllocationModel,
  Room as RoomModel,
  Resident as ResidentModel,
  HostelFee as HostelFeeModel,
  ActivityLog as ActivityLogModel,
  Notification as NotificationModel,
  BookCategory as BookCategoryModel,
  AttendanceRecord as AttendanceRecordModel,
} from "./models";
import { FeeStructure as FeeStructureModel } from "./models/FeeStructure";
import { DiscountRule as DiscountRuleModel } from "./models/DiscountRule";
import { LateFeeRule as LateFeeRuleModel } from "./models/LateFeeRule";
import { InstallmentPlan as InstallmentPlanModel } from "./models/InstallmentPlan";
import { Challan as ChallanModel } from "./models/Challan";
import { Payment as PaymentModel } from "./models/Payment";
import { Vendor as VendorModel } from "./models/Vendor";
import { Expense as ExpenseModel } from "./models/Expense";
import { ChartOfAccounts as ChartOfAccountsModel } from "./models/ChartOfAccounts";
import { LedgerEntry as LedgerEntryModel } from "./models/LedgerEntry";
import { JournalEntry as JournalEntryModel } from "./models/JournalEntry";

function toDTO<T>(doc: any): T {
  if (!doc) return doc;
  const obj = doc.toObject ? doc.toObject() : doc;
  const { _id, __v, ...rest } = obj;
  return { id: _id?.toString() || obj.id, ...rest } as T;
}

function toDTOArray<T>(docs: any[]): T[] {
  return docs.map(doc => toDTO<T>(doc));
}

export class MongoStorage implements IStorage {
  async validateLogin(module: ModuleType, email: string, password: string): Promise<LoginResult> {
    const creds = moduleUserCredentials[module];
    if (!creds) return { valid: false };
    if (email.toLowerCase() === creds.email.toLowerCase() && password === creds.password) {
      return { valid: true, role: creds.role as UserRole, name: creds.name };
    }
    return { valid: false };
  }

  async getStudents(): Promise<Student[]> {
    const docs = await StudentModel.find().sort({ createdAt: -1 });
    return toDTOArray<Student>(docs);
  }

  async getStudent(id: string): Promise<Student | undefined> {
    const doc = await StudentModel.findById(id);
    return doc ? toDTO<Student>(doc) : undefined;
  }

  async createStudent(student: InsertStudent): Promise<Student> {
    const count = await StudentModel.countDocuments();
    const studentId = `STU${String(count + 1).padStart(4, "0")}`;
    const doc = await StudentModel.create({ ...student, studentId });
    return toDTO<Student>(doc);
  }

  async updateStudent(id: string, updates: Partial<Student>): Promise<Student | undefined> {
    const existing = await StudentModel.findById(id);
    if (!existing) return undefined;

    const doc = await StudentModel.findByIdAndUpdate(id, updates, { new: true });
    if (!doc) return undefined;


    return toDTO<Student>(doc);
  }

  async deleteStudent(id: string): Promise<boolean> {
    const result = await StudentModel.findByIdAndDelete(id);
    return !!result;
  }

  async getStaff(): Promise<Staff[]> {
    const docs = await StaffModel.find().sort({ createdAt: -1 });
    return toDTOArray<Staff>(docs);
  }

  async getStaffMember(id: string): Promise<Staff | undefined> {
    const doc = await StaffModel.findById(id);
    return doc ? toDTO<Staff>(doc) : undefined;
  }

  async createStaff(staff: InsertStaff): Promise<Staff> {
    const count = await StaffModel.countDocuments();
    const staffId = `STF${String(count + 1).padStart(4, "0")}`;
    const doc = await StaffModel.create({ ...staff, staffId });
    return toDTO<Staff>(doc);
  }

  async updateStaff(id: string, updates: Partial<Staff>): Promise<Staff | undefined> {
    const doc = await StaffModel.findByIdAndUpdate(id, updates, { new: true });
    return doc ? toDTO<Staff>(doc) : undefined;
  }

  async deleteStaff(id: string): Promise<boolean> {
    const result = await StaffModel.findByIdAndDelete(id);
    return !!result;
  }

  async getVacancies(): Promise<Vacancy[]> {
    const docs = await VacancyModel.find().sort({ createdAt: -1 });
    return toDTOArray<Vacancy>(docs);
  }

  async getVacancy(id: string): Promise<Vacancy | undefined> {
    const doc = await VacancyModel.findById(id);
    return doc ? toDTO<Vacancy>(doc) : undefined;
  }

  async createVacancy(vacancy: InsertVacancy): Promise<Vacancy> {
    const doc = await VacancyModel.create(vacancy);
    return toDTO<Vacancy>(doc);
  }

  async updateVacancy(id: string, updates: Partial<Vacancy>): Promise<Vacancy | undefined> {
    const doc = await VacancyModel.findByIdAndUpdate(id, updates, { new: true });
    return doc ? toDTO<Vacancy>(doc) : undefined;
  }

  async deleteVacancy(id: string): Promise<boolean> {
    const result = await VacancyModel.findByIdAndDelete(id);
    return !!result;
  }

  async getApplicants(): Promise<Applicant[]> {
    const docs = await ApplicantModel.find().sort({ createdAt: -1 });
    return toDTOArray<Applicant>(docs);
  }

  async getApplicant(id: string): Promise<Applicant | undefined> {
    const doc = await ApplicantModel.findById(id);
    return doc ? toDTO<Applicant>(doc) : undefined;
  }

  async createApplicant(applicant: InsertApplicant): Promise<Applicant> {
    const doc = await ApplicantModel.create(applicant);
    return toDTO<Applicant>(doc);
  }

  async updateApplicant(id: string, updates: Partial<Applicant>): Promise<Applicant | undefined> {
    const doc = await ApplicantModel.findByIdAndUpdate(id, updates, { new: true });
    return doc ? toDTO<Applicant>(doc) : undefined;
  }

  async deleteApplicant(id: string): Promise<boolean> {
    const result = await ApplicantModel.findByIdAndDelete(id);
    return !!result;
  }

  async getFeeVouchers(): Promise<FeeVoucher[]> {
    const docs = await FeeVoucherModel.find().sort({ createdAt: -1 });
    return toDTOArray<FeeVoucher>(docs);
  }

  async getFeeVoucher(id: string): Promise<FeeVoucher | undefined> {
    const doc = await FeeVoucherModel.findById(id);
    return doc ? toDTO<FeeVoucher>(doc) : undefined;
  }

  async createFeeVoucher(voucher: InsertFeeVoucher): Promise<FeeVoucher> {
    const count = await FeeVoucherModel.countDocuments();
    const voucherId = `FV${String(count + 1).padStart(5, "0")}`;
    const doc = await FeeVoucherModel.create({ ...voucher, voucherId });
    return toDTO<FeeVoucher>(doc);
  }

  async updateFeeVoucher(id: string, updates: Partial<FeeVoucher>): Promise<FeeVoucher | undefined> {
    const doc = await FeeVoucherModel.findByIdAndUpdate(id, updates, { new: true });
    return doc ? toDTO<FeeVoucher>(doc) : undefined;
  }

  async deleteFeeVoucher(id: string): Promise<boolean> {
    const result = await FeeVoucherModel.findByIdAndDelete(id);
    return !!result;
  }

  async getPayrolls(): Promise<Payroll[]> {
    const docs = await PayrollModel.find().sort({ createdAt: -1 });
    return toDTOArray<Payroll>(docs);
  }

  async getPayroll(id: string): Promise<Payroll | undefined> {
    const doc = await PayrollModel.findById(id);
    return doc ? toDTO<Payroll>(doc) : undefined;
  }

  async createPayroll(payroll: InsertPayroll): Promise<Payroll> {
    const count = await PayrollModel.countDocuments();
    const payrollId = `PAY${String(count + 1).padStart(5, "0")}`;
    const doc = await PayrollModel.create({ ...payroll, payrollId });
    return toDTO<Payroll>(doc);
  }

  async updatePayroll(id: string, updates: Partial<Payroll>): Promise<Payroll | undefined> {
    const doc = await PayrollModel.findByIdAndUpdate(id, updates, { new: true });
    return doc ? toDTO<Payroll>(doc) : undefined;
  }

  async deletePayroll(id: string): Promise<boolean> {
    const result = await PayrollModel.findByIdAndDelete(id);
    return !!result;
  }

  async getAccounts(): Promise<Account[]> {
    const docs = await AccountModel.find().sort({ code: 1 });
    return toDTOArray<Account>(docs);
  }

  async getAccount(id: string): Promise<Account | undefined> {
    const doc = await AccountModel.findById(id);
    return doc ? toDTO<Account>(doc) : undefined;
  }

  async createAccount(account: InsertAccount): Promise<Account> {
    const count = await AccountModel.countDocuments();
    const accountId = `ACC${String(count + 1).padStart(4, "0")}`;
    const doc = await AccountModel.create({ ...account, accountId });
    return toDTO<Account>(doc);
  }

  async updateAccount(id: string, updates: Partial<Account>): Promise<Account | undefined> {
    const doc = await AccountModel.findByIdAndUpdate(id, updates, { new: true });
    return doc ? toDTO<Account>(doc) : undefined;
  }

  async deleteAccount(id: string): Promise<boolean> {
    const result = await AccountModel.findByIdAndDelete(id);
    return !!result;
  }

  async getFinanceVouchers(): Promise<FinanceVoucher[]> {
    const docs = await FinanceVoucherModel.find().sort({ createdAt: -1 });
    return toDTOArray<FinanceVoucher>(docs);
  }

  async getFinanceVoucher(id: string): Promise<FinanceVoucher | undefined> {
    const doc = await FinanceVoucherModel.findById(id);
    return doc ? toDTO<FinanceVoucher>(doc) : undefined;
  }

  async createFinanceVoucher(voucher: InsertFinanceVoucher): Promise<FinanceVoucher> {
    const count = await FinanceVoucherModel.countDocuments();
    const voucherId = `VCH${String(count + 1).padStart(5, "0")}`;
    const voucherNumber = `VCH-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;
    const doc = await FinanceVoucherModel.create({ ...voucher, voucherId, voucherNumber });
    return toDTO<FinanceVoucher>(doc);
  }

  async updateFinanceVoucher(id: string, updates: Partial<FinanceVoucher>): Promise<FinanceVoucher | undefined> {
    const doc = await FinanceVoucherModel.findByIdAndUpdate(id, updates, { new: true });
    return doc ? toDTO<FinanceVoucher>(doc) : undefined;
  }

  async deleteFinanceVoucher(id: string): Promise<boolean> {
    const result = await FinanceVoucherModel.findByIdAndDelete(id);
    return !!result;
  }


  async getTimetables(): Promise<Timetable[]> {
    const docs = await TimetableModel.find().sort({ createdAt: -1 });
    return toDTOArray<Timetable>(docs);
  }

  async getTimetable(id: string): Promise<Timetable | undefined> {
    const doc = await TimetableModel.findById(id);
    return doc ? toDTO<Timetable>(doc) : undefined;
  }

  async createTimetable(timetable: InsertTimetable): Promise<Timetable> {
    // Check if a timetable already exists for this class-section
    const existing = await TimetableModel.findOne({
      class: timetable.class,
      section: timetable.section
    });

    if (existing) {
      // Merge new slots with existing slots
      // Remove duplicate slots (same day + period) and add new ones
      const existingSlots = existing.slots || [];
      const newSlots = timetable.slots || [];

      // Create a map of existing slots by day-period key
      const slotMap = new Map();
      existingSlots.forEach((slot: any) => {
        const key = `${slot.day}-${slot.period}`;
        slotMap.set(key, slot);
      });

      // Add or update with new slots
      newSlots.forEach((slot: any) => {
        const key = `${slot.day}-${slot.period}`;
        slotMap.set(key, slot);
      });

      // Convert map back to array
      existing.slots = Array.from(slotMap.values());
      existing.updatedAt = timetable.updatedAt;

      await existing.save();
      return toDTO<Timetable>(existing);
    } else {
      // Create new timetable
      const doc = await TimetableModel.create(timetable);
      return toDTO<Timetable>(doc);
    }
  }

  async updateTimetable(id: string, updates: Partial<Timetable>): Promise<Timetable | undefined> {
    const doc = await TimetableModel.findByIdAndUpdate(id, updates, { new: true });
    return doc ? toDTO<Timetable>(doc) : undefined;
  }

  async deleteTimetable(id: string): Promise<boolean> {
    const result = await TimetableModel.findByIdAndDelete(id);
    return !!result;
  }

  async getDateSheets(): Promise<DateSheet[]> {
    const docs = await DatesheetModel.find().sort({ createdAt: -1 });
    return toDTOArray<DateSheet>(docs);
  }

  async getDateSheet(id: string): Promise<DateSheet | undefined> {
    const doc = await DatesheetModel.findById(id);
    return doc ? toDTO<DateSheet>(doc) : undefined;
  }

  async createDateSheet(dateSheet: InsertDateSheet): Promise<DateSheet> {
    const doc = await DatesheetModel.create(dateSheet);
    return toDTO<DateSheet>(doc);
  }

  async updateDateSheet(id: string, updates: Partial<DateSheet>): Promise<DateSheet | undefined> {
    const doc = await DatesheetModel.findByIdAndUpdate(id, updates, { new: true });
    return doc ? toDTO<DateSheet>(doc) : undefined;
  }

  async deleteDateSheet(id: string): Promise<boolean> {
    const result = await DatesheetModel.findByIdAndDelete(id);
    return !!result;
  }

  async getCurriculums(): Promise<Curriculum[]> {
    const docs = await CurriculumModel.find().sort({ createdAt: -1 });
    return toDTOArray<Curriculum>(docs);
  }

  async getCurriculum(id: string): Promise<Curriculum | undefined> {
    const doc = await CurriculumModel.findById(id);
    return doc ? toDTO<Curriculum>(doc) : undefined;
  }

  async createCurriculum(curriculum: InsertCurriculum): Promise<Curriculum> {
    const doc = await CurriculumModel.create(curriculum);
    return toDTO<Curriculum>(doc);
  }

  async updateCurriculum(id: string, updates: Partial<Curriculum>): Promise<Curriculum | undefined> {
    const doc = await CurriculumModel.findByIdAndUpdate(id, updates, { new: true });
    return doc ? toDTO<Curriculum>(doc) : undefined;
  }

  async deleteCurriculum(id: string): Promise<boolean> {
    const result = await CurriculumModel.findByIdAndDelete(id);
    return !!result;
  }

  async getExams(): Promise<Exam[]> {
    const docs = await ExamModel.find().sort({ startDate: -1 });
    return toDTOArray<Exam>(docs);
  }

  async getExam(id: string): Promise<Exam | undefined> {
    const doc = await ExamModel.findById(id);
    return doc ? toDTO<Exam>(doc) : undefined;
  }

  async createExam(exam: InsertExam): Promise<Exam> {
    const doc = await ExamModel.create(exam);
    return toDTO<Exam>(doc);
  }

  async updateExam(id: string, updates: Partial<Exam>): Promise<Exam | undefined> {
    const doc = await ExamModel.findByIdAndUpdate(id, updates, { new: true });
    return doc ? toDTO<Exam>(doc) : undefined;
  }

  async deleteExam(id: string): Promise<boolean> {
    const result = await ExamModel.findByIdAndDelete(id);
    return !!result;
  }

  async getResults(): Promise<Result[]> {
    const docs = await ExamResultModel.find().sort({ createdAt: -1 });
    return toDTOArray<Result>(docs);
  }

  async getResult(id: string): Promise<Result | undefined> {
    const doc = await ExamResultModel.findById(id);
    return doc ? toDTO<Result>(doc) : undefined;
  }

  async createResult(result: InsertResult): Promise<Result> {
    const count = await ExamResultModel.countDocuments();
    const resultId = `RES${String(count + 1).padStart(5, "0")}`;
    const doc = await ExamResultModel.create({ ...result, resultId });
    return toDTO<Result>(doc);
  }

  async updateResult(id: string, updates: Partial<Result>): Promise<Result | undefined> {
    const doc = await ExamResultModel.findByIdAndUpdate(id, updates, { new: true });
    return doc ? toDTO<Result>(doc) : undefined;
  }

  async deleteResult(id: string): Promise<boolean> {
    const result = await ExamResultModel.findByIdAndDelete(id);
    return !!result;
  }

  async getPosItems(): Promise<PosItem[]> {
    const docs = await POSItemModel.find().sort({ name: 1 });
    return toDTOArray<PosItem>(docs);
  }

  async getPosItem(id: string): Promise<PosItem | undefined> {
    const doc = await POSItemModel.findById(id);
    return doc ? toDTO<PosItem>(doc) : undefined;
  }

  async createPosItem(item: InsertPosItem): Promise<PosItem> {
    const doc = await POSItemModel.create(item);
    return toDTO<PosItem>(doc);
  }

  async updatePosItem(id: string, updates: Partial<PosItem>): Promise<PosItem | undefined> {
    const doc = await POSItemModel.findByIdAndUpdate(id, updates, { new: true });
    return doc ? toDTO<PosItem>(doc) : undefined;
  }

  async deletePosItem(id: string): Promise<boolean> {
    const result = await POSItemModel.findByIdAndDelete(id);
    return !!result;
  }

  async getSales(): Promise<Sale[]> {
    const docs = await SaleModel.find().sort({ createdAt: -1 });
    return toDTOArray<Sale>(docs);
  }

  async getSale(id: string): Promise<Sale | undefined> {
    const doc = await SaleModel.findById(id);
    return doc ? toDTO<Sale>(doc) : undefined;
  }

  async createSale(sale: InsertSale): Promise<Sale> {
    const doc = await SaleModel.create(sale);
    return toDTO<Sale>(doc);
  }

  async updateSale(id: string, updates: Partial<Sale>): Promise<Sale | undefined> {
    const doc = await SaleModel.findByIdAndUpdate(id, updates, { new: true });
    return doc ? toDTO<Sale>(doc) : undefined;
  }

  async deleteSale(id: string): Promise<boolean> {
    const result = await SaleModel.findByIdAndDelete(id);
    return !!result;
  }

  async getBooks(): Promise<Book[]> {
    const docs = await BookModel.find().sort({ title: 1 });
    const books = toDTOArray<Book>(docs);
    // Ensure defaults for existing records
    return books.map(b => ({
      ...b,
      totalCopies: b.totalCopies ?? 1,
      availableCopies: b.availableCopies ?? 1
    }));
  }

  async getBook(id: string): Promise<Book | undefined> {
    const doc = await BookModel.findById(id);
    return doc ? toDTO<Book>(doc) : undefined;
  }

  async createBook(book: InsertBook): Promise<Book> {
    const doc = await BookModel.create(book);
    return toDTO<Book>(doc);
  }

  async updateBook(id: string, updates: Partial<Book>): Promise<Book | undefined> {
    const doc = await BookModel.findByIdAndUpdate(id, updates, { new: true });
    return doc ? toDTO<Book>(doc) : undefined;
  }

  async deleteBook(id: string): Promise<boolean> {
    const result = await BookModel.findByIdAndDelete(id);
    return !!result;
  }

  // Book Category Methods
  async getBookCategories(): Promise<BookCategory[]> {
    const docs = await BookCategoryModel.find().sort({ name: 1 });
    return toDTOArray<BookCategory>(docs);
  }

  async getBookCategory(id: string): Promise<BookCategory | undefined> {
    const doc = await BookCategoryModel.findById(id);
    return doc ? toDTO<BookCategory>(doc) : undefined;
  }

  async createBookCategory(category: InsertBookCategory): Promise<BookCategory> {
    const doc = await BookCategoryModel.create(category);
    return toDTO<BookCategory>(doc);
  }

  async updateBookCategory(id: string, updates: Partial<BookCategory>): Promise<BookCategory | undefined> {
    const doc = await BookCategoryModel.findByIdAndUpdate(id, updates, { new: true });
    return doc ? toDTO<BookCategory>(doc) : undefined;
  }

  async deleteBookCategory(id: string): Promise<boolean> {
    const result = await BookCategoryModel.findByIdAndDelete(id);
    return !!result;
  }

  async getLibraryMembers(): Promise<LibraryMember[]> {
    const docs = await LibraryMemberModel.find().sort({ name: 1 });
    return toDTOArray<LibraryMember>(docs);
  }

  async getLibraryMember(id: string): Promise<LibraryMember | undefined> {
    const doc = await LibraryMemberModel.findById(id);
    return doc ? toDTO<LibraryMember>(doc) : undefined;
  }

  async createLibraryMember(member: InsertLibraryMember): Promise<LibraryMember> {
    const count = await LibraryMemberModel.countDocuments();
    const memberId = `LM${String(count + 1).padStart(4, "0")}`;
    const doc = await LibraryMemberModel.create({ ...member, memberId });
    return toDTO<LibraryMember>(doc);
  }

  async updateLibraryMember(id: string, updates: Partial<LibraryMember>): Promise<LibraryMember | undefined> {
    const doc = await LibraryMemberModel.findByIdAndUpdate(id, updates, { new: true });
    return doc ? toDTO<LibraryMember>(doc) : undefined;
  }

  async deleteLibraryMember(id: string): Promise<boolean> {
    const result = await LibraryMemberModel.findByIdAndDelete(id);
    return !!result;
  }

  async getBookIssues(): Promise<BookIssue[]> {
    const docs = await BookIssueModel.find().sort({ issueDate: -1 });
    return toDTOArray<BookIssue>(docs);
  }

  async getBookIssue(id: string): Promise<BookIssue | undefined> {
    const doc = await BookIssueModel.findById(id);
    return doc ? toDTO<BookIssue>(doc) : undefined;
  }

  async createBookIssue(issue: InsertBookIssue): Promise<BookIssue> {
    const doc = await BookIssueModel.create(issue);
    return toDTO<BookIssue>(doc);
  }

  async updateBookIssue(id: string, updates: Partial<BookIssue>): Promise<BookIssue | undefined> {
    const doc = await BookIssueModel.findByIdAndUpdate(id, updates, { new: true });
    return doc ? toDTO<BookIssue>(doc) : undefined;
  }

  async deleteBookIssue(id: string): Promise<boolean> {
    const result = await BookIssueModel.findByIdAndDelete(id);
    return !!result;
  }

  async getRoutes(): Promise<Route[]> {
    const docs = await RouteModel.find().sort({ name: 1 });
    return toDTOArray<Route>(docs);
  }

  async getRoute(id: string): Promise<Route | undefined> {
    const doc = await RouteModel.findById(id);
    return doc ? toDTO<Route>(doc) : undefined;
  }

  async createRoute(route: InsertRoute): Promise<Route> {
    const count = await RouteModel.countDocuments();
    const routeId = `RT${String(count + 1).padStart(3, "0")}`;
    const doc = await RouteModel.create({ ...route, routeId });
    return toDTO<Route>(doc);
  }

  async updateRoute(id: string, updates: Partial<Route>): Promise<Route | undefined> {
    const doc = await RouteModel.findByIdAndUpdate(id, updates, { new: true });
    return doc ? toDTO<Route>(doc) : undefined;
  }

  async deleteRoute(id: string): Promise<boolean> {
    const result = await RouteModel.findByIdAndDelete(id);
    return !!result;
  }

  async getVehicles(): Promise<Vehicle[]> {
    const docs = await VehicleModel.find().sort({ registrationNumber: 1 });
    return toDTOArray<Vehicle>(docs);
  }

  async getVehicle(id: string): Promise<Vehicle | undefined> {
    const doc = await VehicleModel.findById(id);
    return doc ? toDTO<Vehicle>(doc) : undefined;
  }

  async createVehicle(vehicle: InsertVehicle): Promise<Vehicle> {
    const count = await VehicleModel.countDocuments();
    const vehicleId = `VH${String(count + 1).padStart(3, "0")}`;
    const doc = await VehicleModel.create({ ...vehicle, vehicleId });
    return toDTO<Vehicle>(doc);
  }

  async updateVehicle(id: string, updates: Partial<Vehicle>): Promise<Vehicle | undefined> {
    const doc = await VehicleModel.findByIdAndUpdate(id, updates, { new: true });
    return doc ? toDTO<Vehicle>(doc) : undefined;
  }

  async deleteVehicle(id: string): Promise<boolean> {
    const result = await VehicleModel.findByIdAndDelete(id);
    return !!result;
  }

  async getDrivers(): Promise<Driver[]> {
    const docs = await DriverModel.find().sort({ name: 1 });
    return toDTOArray<Driver>(docs);
  }

  async getDriver(id: string): Promise<Driver | undefined> {
    const doc = await DriverModel.findById(id);
    return doc ? toDTO<Driver>(doc) : undefined;
  }

  async createDriver(driver: InsertDriver): Promise<Driver> {
    const count = await DriverModel.countDocuments();
    const driverId = `DR${String(count + 1).padStart(3, "0")}`;
    const doc = await DriverModel.create({ ...driver, driverId });
    return toDTO<Driver>(doc);
  }

  async updateDriver(id: string, updates: Partial<Driver>): Promise<Driver | undefined> {
    const doc = await DriverModel.findByIdAndUpdate(id, updates, { new: true });
    return doc ? toDTO<Driver>(doc) : undefined;
  }

  async deleteDriver(id: string): Promise<boolean> {
    const result = await DriverModel.findByIdAndDelete(id);
    return !!result;
  }

  async getStudentTransports(): Promise<StudentTransport[]> {
    const docs = await TransportAllocationModel.find().sort({ createdAt: -1 });
    return toDTOArray<StudentTransport>(docs);
  }

  async getStudentTransport(id: string): Promise<StudentTransport | undefined> {
    const doc = await TransportAllocationModel.findById(id);
    return doc ? toDTO<StudentTransport>(doc) : undefined;
  }

  async createStudentTransport(transport: InsertStudentTransport): Promise<StudentTransport> {
    const count = await TransportAllocationModel.countDocuments();
    const allocationId = `TA${String(count + 1).padStart(4, "0")}`;
    const doc = await TransportAllocationModel.create({ ...transport, allocationId });
    return toDTO<StudentTransport>(doc);
  }

  async updateStudentTransport(id: string, updates: Partial<StudentTransport>): Promise<StudentTransport | undefined> {
    const doc = await TransportAllocationModel.findByIdAndUpdate(id, updates, { new: true });
    return doc ? toDTO<StudentTransport>(doc) : undefined;
  }

  async deleteStudentTransport(id: string): Promise<boolean> {
    const result = await TransportAllocationModel.findByIdAndDelete(id);
    return !!result;
  }

  async getHostelRooms(): Promise<HostelRoom[]> {
    const docs = await RoomModel.find().sort({ roomNumber: 1 });
    return toDTOArray<HostelRoom>(docs);
  }

  async getHostelRoom(id: string): Promise<HostelRoom | undefined> {
    const doc = await RoomModel.findById(id);
    return doc ? toDTO<HostelRoom>(doc) : undefined;
  }

  async createHostelRoom(room: InsertHostelRoom): Promise<HostelRoom> {
    const doc = await RoomModel.create(room);
    return toDTO<HostelRoom>(doc);
  }

  async updateHostelRoom(id: string, updates: Partial<HostelRoom>): Promise<HostelRoom | undefined> {
    const doc = await RoomModel.findByIdAndUpdate(id, updates, { new: true });
    return doc ? toDTO<HostelRoom>(doc) : undefined;
  }

  async deleteHostelRoom(id: string): Promise<boolean> {
    const result = await RoomModel.findByIdAndDelete(id);
    return !!result;
  }

  async getHostelResidents(): Promise<HostelResident[]> {
    const docs = await ResidentModel.find().sort({ createdAt: -1 });
    return toDTOArray<HostelResident>(docs);
  }

  async getHostelResident(id: string): Promise<HostelResident | undefined> {
    const doc = await ResidentModel.findById(id);
    return doc ? toDTO<HostelResident>(doc) : undefined;
  }

  async createHostelResident(resident: InsertHostelResident): Promise<HostelResident> {
    const count = await ResidentModel.countDocuments();
    const residentId = `RD${String(count + 1).padStart(4, "0")}`;
    const doc = await ResidentModel.create({ ...resident, residentId });
    return toDTO<HostelResident>(doc);
  }

  async updateHostelResident(id: string, updates: Partial<HostelResident>): Promise<HostelResident | undefined> {
    const doc = await ResidentModel.findByIdAndUpdate(id, updates, { new: true });
    return doc ? toDTO<HostelResident>(doc) : undefined;
  }

  async deleteHostelResident(id: string): Promise<boolean> {
    const result = await ResidentModel.findByIdAndDelete(id);
    return !!result;
  }

  async getHostelFees(): Promise<HostelFee[]> {
    const docs = await HostelFeeModel.find().sort({ createdAt: -1 });
    return toDTOArray<HostelFee>(docs);
  }

  async getHostelFee(id: string): Promise<HostelFee | undefined> {
    const doc = await HostelFeeModel.findById(id);
    return doc ? toDTO<HostelFee>(doc) : undefined;
  }

  async createHostelFee(fee: InsertHostelFee): Promise<HostelFee> {
    const count = await HostelFeeModel.countDocuments();
    const feeId = `HF${String(count + 1).padStart(5, "0")}`;
    const doc = await HostelFeeModel.create({ ...fee, feeId });
    return toDTO<HostelFee>(doc);
  }

  async updateHostelFee(id: string, updates: Partial<HostelFee>): Promise<HostelFee | undefined> {
    const doc = await HostelFeeModel.findByIdAndUpdate(id, updates, { new: true });
    return doc ? toDTO<HostelFee>(doc) : undefined;
  }

  async deleteHostelFee(id: string): Promise<boolean> {
    const result = await HostelFeeModel.findByIdAndDelete(id);
    return !!result;
  }

  private notifications: Map<string, Notification> = new Map();
  private notificationIdCounter = 0;

  async getNotifications(module?: string): Promise<Notification[]> {
    const all = Array.from(this.notifications.values());
    if (module) {
      return all.filter(n => n.module === module || !n.module).sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
    return all.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getNotification(id: string): Promise<Notification | undefined> {
    return this.notifications.get(id);
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const id = `NOTIF${String(++this.notificationIdCounter).padStart(5, "0")}`;
    const newNotification: Notification = {
      ...notification,
      id,
      read: false,
      createdAt: new Date().toISOString(),
    };
    this.notifications.set(id, newNotification);
    return newNotification;
  }

  async markNotificationRead(id: string): Promise<Notification | undefined> {
    const notification = this.notifications.get(id);
    if (notification) {
      notification.read = true;
      this.notifications.set(id, notification);
    }
    return notification;
  }

  async markAllNotificationsRead(module?: string): Promise<void> {
    this.notifications.forEach((notification, id) => {
      if (!module || notification.module === module || !notification.module) {
        notification.read = true;
        this.notifications.set(id, notification);
      }
    });
  }

  async deleteNotification(id: string): Promise<boolean> {
    return this.notifications.delete(id);
  }

  async getUnreadNotificationCount(module?: string): Promise<number> {
    const notifications = await this.getNotifications(module);
    return notifications.filter(n => !n.read).length;
  }

  async getActivityLogs(module?: string): Promise<ActivityLog[]> {
    const query = module ? { module } : {};
    const docs = await ActivityLogModel.find(query).sort({ createdAt: -1 }).limit(100);
    return toDTOArray<ActivityLog>(docs);
  }

  async createActivityLog(log: InsertActivityLog): Promise<ActivityLog> {
    const doc = await ActivityLogModel.create(log);
    return toDTO<ActivityLog>(doc);
  }

  async getFeeStructures(): Promise<FeeStructure[]> {
    const docs = await FeeStructureModel.find().sort({ createdAt: -1 });
    return toDTOArray<FeeStructure>(docs);
  }

  async getFeeStructure(id: string): Promise<FeeStructure | undefined> {
    const doc = await FeeStructureModel.findById(id);
    return doc ? toDTO<FeeStructure>(doc) : undefined;
  }

  async createFeeStructure(structure: InsertFeeStructure): Promise<FeeStructure> {
    const count = await FeeStructureModel.countDocuments();
    const structureId = `FS${String(count + 1).padStart(4, "0")}`;
    const doc = await FeeStructureModel.create({ ...structure, structureId, createdAt: new Date() });
    return toDTO<FeeStructure>(doc);
  }

  async updateFeeStructure(id: string, updates: Partial<FeeStructure>): Promise<FeeStructure | undefined> {
    const doc = await FeeStructureModel.findByIdAndUpdate(id, updates, { new: true });
    return doc ? toDTO<FeeStructure>(doc) : undefined;
  }

  async deleteFeeStructure(id: string): Promise<boolean> {
    const result = await FeeStructureModel.findByIdAndDelete(id);
    return !!result;
  }

  async getDiscountRules(): Promise<DiscountRule[]> {
    const docs = await DiscountRuleModel.find().sort({ name: 1 });
    return toDTOArray<DiscountRule>(docs);
  }

  async getDiscountRule(id: string): Promise<DiscountRule | undefined> {
    const doc = await DiscountRuleModel.findById(id);
    return doc ? toDTO<DiscountRule>(doc) : undefined;
  }

  async createDiscountRule(rule: InsertDiscountRule): Promise<DiscountRule> {
    const doc = await DiscountRuleModel.create(rule);
    return toDTO<DiscountRule>(doc);
  }

  async updateDiscountRule(id: string, updates: Partial<DiscountRule>): Promise<DiscountRule | undefined> {
    const doc = await DiscountRuleModel.findByIdAndUpdate(id, updates, { new: true });
    return doc ? toDTO<DiscountRule>(doc) : undefined;
  }

  async deleteDiscountRule(id: string): Promise<boolean> {
    const result = await DiscountRuleModel.findByIdAndDelete(id);
    return !!result;
  }

  async getLateFeeRules(): Promise<LateFeeRule[]> {
    const docs = await LateFeeRuleModel.find().sort({ name: 1 });
    return toDTOArray<LateFeeRule>(docs);
  }

  async getLateFeeRule(id: string): Promise<LateFeeRule | undefined> {
    const doc = await LateFeeRuleModel.findById(id);
    return doc ? toDTO<LateFeeRule>(doc) : undefined;
  }

  async createLateFeeRule(rule: InsertLateFeeRule): Promise<LateFeeRule> {
    const doc = await LateFeeRuleModel.create(rule);
    return toDTO<LateFeeRule>(doc);
  }

  async updateLateFeeRule(id: string, updates: Partial<LateFeeRule>): Promise<LateFeeRule | undefined> {
    const doc = await LateFeeRuleModel.findByIdAndUpdate(id, updates, { new: true });
    return doc ? toDTO<LateFeeRule>(doc) : undefined;
  }

  async deleteLateFeeRule(id: string): Promise<boolean> {
    const result = await LateFeeRuleModel.findByIdAndDelete(id);
    return !!result;
  }

  async getInstallmentPlans(): Promise<InstallmentPlan[]> {
    const docs = await InstallmentPlanModel.find().sort({ name: 1 });
    return toDTOArray<InstallmentPlan>(docs);
  }

  async getInstallmentPlan(id: string): Promise<InstallmentPlan | undefined> {
    const doc = await InstallmentPlanModel.findById(id);
    return doc ? toDTO<InstallmentPlan>(doc) : undefined;
  }

  async createInstallmentPlan(plan: InsertInstallmentPlan): Promise<InstallmentPlan> {
    const doc = await InstallmentPlanModel.create(plan);
    return toDTO<InstallmentPlan>(doc);
  }

  async updateInstallmentPlan(id: string, updates: Partial<InstallmentPlan>): Promise<InstallmentPlan | undefined> {
    const doc = await InstallmentPlanModel.findByIdAndUpdate(id, updates, { new: true });
    return doc ? toDTO<InstallmentPlan>(doc) : undefined;
  }

  async deleteInstallmentPlan(id: string): Promise<boolean> {
    const result = await InstallmentPlanModel.findByIdAndDelete(id);
    return !!result;
  }

  async getChallans(): Promise<Challan[]> {
    const docs = await ChallanModel.find().sort({ createdAt: -1 });
    return toDTOArray<Challan>(docs);
  }

  async getChallan(id: string): Promise<Challan | undefined> {
    const doc = await ChallanModel.findById(id);
    return doc ? toDTO<Challan>(doc) : undefined;
  }

  async getChallansByStudent(studentId: string): Promise<Challan[]> {
    const docs = await ChallanModel.find({ studentId }).sort({ createdAt: -1 });
    return toDTOArray<Challan>(docs);
  }

  async createChallan(challan: InsertChallan): Promise<Challan> {
    const count = await ChallanModel.countDocuments();
    const challanNo = `CHN${String(count + 1).padStart(6, "0")}`;
    const doc = await ChallanModel.create({ ...challan, challanNo, createdAt: new Date() });
    return toDTO<Challan>(doc);
  }

  async updateChallan(id: string, updates: Partial<Challan>): Promise<Challan | undefined> {
    const doc = await ChallanModel.findByIdAndUpdate(id, updates, { new: true });
    return doc ? toDTO<Challan>(doc) : undefined;
  }

  async deleteChallan(id: string): Promise<boolean> {
    const result = await ChallanModel.findByIdAndDelete(id);
    return !!result;
  }

  async getPayments(): Promise<Payment[]> {
    const docs = await PaymentModel.find().sort({ createdAt: -1 });
    return toDTOArray<Payment>(docs);
  }

  async getPayment(id: string): Promise<Payment | undefined> {
    const doc = await PaymentModel.findById(id);
    return doc ? toDTO<Payment>(doc) : undefined;
  }

  async getPaymentsByChallan(challanId: string): Promise<Payment[]> {
    const docs = await PaymentModel.find({ challanId }).sort({ createdAt: -1 });
    return toDTOArray<Payment>(docs);
  }

  async createPayment(payment: InsertPayment): Promise<Payment> {
    const count = await PaymentModel.countDocuments();
    const receiptNo = `RCP${String(count + 1).padStart(6, "0")}`;
    const doc = await PaymentModel.create({ ...payment, receiptNo, createdAt: new Date() });
    return toDTO<Payment>(doc);
  }

  async updatePayment(id: string, updates: Partial<Payment>): Promise<Payment | undefined> {
    const doc = await PaymentModel.findByIdAndUpdate(id, updates, { new: true });
    return doc ? toDTO<Payment>(doc) : undefined;
  }

  async deletePayment(id: string): Promise<boolean> {
    const result = await PaymentModel.findByIdAndDelete(id);
    return !!result;
  }

  async getVendors(): Promise<Vendor[]> {
    const docs = await VendorModel.find().sort({ name: 1 });
    return toDTOArray<Vendor>(docs);
  }

  async getVendor(id: string): Promise<Vendor | undefined> {
    const doc = await VendorModel.findById(id);
    return doc ? toDTO<Vendor>(doc) : undefined;
  }

  async createVendor(vendor: InsertVendor): Promise<Vendor> {
    const count = await VendorModel.countDocuments();
    const vendorId = `VND${String(count + 1).padStart(4, "0")}`;
    const doc = await VendorModel.create({ ...vendor, vendorId, createdAt: new Date() });
    return toDTO<Vendor>(doc);
  }

  async updateVendor(id: string, updates: Partial<Vendor>): Promise<Vendor | undefined> {
    const doc = await VendorModel.findByIdAndUpdate(id, updates, { new: true });
    return doc ? toDTO<Vendor>(doc) : undefined;
  }

  async deleteVendor(id: string): Promise<boolean> {
    const result = await VendorModel.findByIdAndDelete(id);
    return !!result;
  }

  async getExpenses(): Promise<Expense[]> {
    const docs = await ExpenseModel.find().sort({ createdAt: -1 });
    return toDTOArray<Expense>(docs);
  }

  async getExpense(id: string): Promise<Expense | undefined> {
    const doc = await ExpenseModel.findById(id);
    return doc ? toDTO<Expense>(doc) : undefined;
  }

  async createExpense(expense: InsertExpense): Promise<Expense> {
    const count = await ExpenseModel.countDocuments();
    const expenseId = `EXP${String(count + 1).padStart(6, "0")}`;
    const doc = await ExpenseModel.create({ ...expense, expenseId, createdAt: new Date() });
    return toDTO<Expense>(doc);
  }

  async updateExpense(id: string, updates: Partial<Expense>): Promise<Expense | undefined> {
    const doc = await ExpenseModel.findByIdAndUpdate(id, updates, { new: true });
    return doc ? toDTO<Expense>(doc) : undefined;
  }

  async deleteExpense(id: string): Promise<boolean> {
    const result = await ExpenseModel.findByIdAndDelete(id);
    return !!result;
  }

  async getChartOfAccounts(): Promise<ChartOfAccounts[]> {
    const docs = await ChartOfAccountsModel.find().sort({ accountCode: 1 });
    return toDTOArray<ChartOfAccounts>(docs);
  }

  async getChartOfAccount(id: string): Promise<ChartOfAccounts | undefined> {
    const doc = await ChartOfAccountsModel.findById(id);
    return doc ? toDTO<ChartOfAccounts>(doc) : undefined;
  }

  async createChartOfAccount(account: InsertChartOfAccounts): Promise<ChartOfAccounts> {
    const doc = await ChartOfAccountsModel.create({ ...account, createdAt: new Date() });
    return toDTO<ChartOfAccounts>(doc);
  }

  async updateChartOfAccount(id: string, updates: Partial<ChartOfAccounts>): Promise<ChartOfAccounts | undefined> {
    const doc = await ChartOfAccountsModel.findByIdAndUpdate(id, updates, { new: true });
    return doc ? toDTO<ChartOfAccounts>(doc) : undefined;
  }

  async deleteChartOfAccount(id: string): Promise<boolean> {
    const result = await ChartOfAccountsModel.findByIdAndDelete(id);
    return !!result;
  }

  async getLedgerEntries(): Promise<LedgerEntry[]> {
    const docs = await LedgerEntryModel.find().sort({ date: -1, createdAt: -1 });
    return toDTOArray<LedgerEntry>(docs);
  }

  async getLedgerEntry(id: string): Promise<LedgerEntry | undefined> {
    const doc = await LedgerEntryModel.findById(id);
    return doc ? toDTO<LedgerEntry>(doc) : undefined;
  }

  async getLedgerEntriesByAccount(accountId: string): Promise<LedgerEntry[]> {
    const docs = await LedgerEntryModel.find({ accountId }).sort({ date: -1, createdAt: -1 });
    return toDTOArray<LedgerEntry>(docs);
  }

  async createLedgerEntry(entry: InsertLedgerEntry): Promise<LedgerEntry> {
    const count = await LedgerEntryModel.countDocuments();
    const entryNo = `LE${String(count + 1).padStart(8, "0")}`;
    const doc = await LedgerEntryModel.create({ ...entry, entryNo, createdAt: new Date() });
    return toDTO<LedgerEntry>(doc);
  }

  async updateLedgerEntry(id: string, updates: Partial<LedgerEntry>): Promise<LedgerEntry | undefined> {
    const doc = await LedgerEntryModel.findByIdAndUpdate(id, updates, { new: true });
    return doc ? toDTO<LedgerEntry>(doc) : undefined;
  }

  async deleteLedgerEntry(id: string): Promise<boolean> {
    const result = await LedgerEntryModel.findByIdAndDelete(id);
    return !!result;
  }

  async getJournalEntries(): Promise<JournalEntry[]> {
    const docs = await JournalEntryModel.find().sort({ date: -1, createdAt: -1 });
    return toDTOArray<JournalEntry>(docs);
  }

  async getJournalEntry(id: string): Promise<JournalEntry | undefined> {
    const doc = await JournalEntryModel.findById(id);
    return doc ? toDTO<JournalEntry>(doc) : undefined;
  }

  async createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry> {
    const count = await JournalEntryModel.countDocuments();
    const journalNo = `JE${String(count + 1).padStart(6, "0")}`;
    const doc = await JournalEntryModel.create({ ...entry, journalNo, createdAt: new Date() });
    return toDTO<JournalEntry>(doc);
  }

  async updateJournalEntry(id: string, updates: Partial<JournalEntry>): Promise<JournalEntry | undefined> {
    const doc = await JournalEntryModel.findByIdAndUpdate(id, updates, { new: true });
    return doc ? toDTO<JournalEntry>(doc) : undefined;
  }

  async deleteJournalEntry(id: string): Promise<boolean> {
    const result = await JournalEntryModel.findByIdAndDelete(id);
    return !!result;
  }

  // POS Methods
  async getPosItems(): Promise<PosItem[]> {
    const docs = await POSItemModel.find().sort({ name: 1 });
    return toDTOArray<PosItem>(docs);
  }

  async getPosItem(id: string): Promise<PosItem | undefined> {
    const doc = await POSItemModel.findById(id);
    return doc ? toDTO<PosItem>(doc) : undefined;
  }

  async createPosItem(item: InsertPosItem): Promise<PosItem> {
    let counter = await CounterModel.findByIdAndUpdate(
      "pos_items",
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    let seq = counter.seq;
    let itemCode = `ITEM${String(seq).padStart(3, '0')}`;

    // Ensure uniqueness against legacy data
    while (await POSItemModel.exists({ itemCode })) {
      counter = await CounterModel.findByIdAndUpdate(
        "pos_items",
        { $inc: { seq: 1 } },
        { new: true }
      );
      seq = counter.seq;
      itemCode = `ITEM${String(seq).padStart(3, '0')}`;
    }

    const doc = await POSItemModel.create({ ...item, itemCode });
    return toDTO<PosItem>(doc);
  }

  async updatePosItem(id: string, updates: Partial<PosItem>): Promise<PosItem | undefined> {
    const doc = await POSItemModel.findByIdAndUpdate(id, updates, { new: true });
    return doc ? toDTO<PosItem>(doc) : undefined;
  }

  async deletePosItem(id: string): Promise<boolean> {
    const result = await POSItemModel.findByIdAndDelete(id);
    return !!result;
  }

  async getSales(): Promise<Sale[]> {
    const docs = await SaleModel.find().sort({ createdAt: -1 });
    return toDTOArray<Sale>(docs);
  }

  async getSale(id: string): Promise<Sale | undefined> {
    const doc = await SaleModel.findById(id);
    return doc ? toDTO<Sale>(doc) : undefined;
  }

  async createSale(sale: InsertSale): Promise<Sale> {
    const doc = await SaleModel.create(sale);
    return toDTO<Sale>(doc);
  }

  async updateSale(id: string, updates: Partial<Sale>): Promise<Sale | undefined> {
    const doc = await SaleModel.findByIdAndUpdate(id, updates, { new: true });
    return doc ? toDTO<Sale>(doc) : undefined;
  }

  async deleteSale(id: string): Promise<boolean> {
    const result = await SaleModel.findByIdAndDelete(id);
    return !!result;
  }

  async getAttendanceRecords(filters?: { date?: string; targetType?: string; className?: string; section?: string }): Promise<AttendanceRecord[]> {
    const query: any = {};
    if (filters?.date) query.date = filters.date;
    if (filters?.targetType) query.targetType = filters.targetType;
    if (filters?.className) query.className = filters.className;
    if (filters?.section) query.section = filters.section;
    const docs = await AttendanceRecordModel.find(query).sort({ markedAt: -1 });
    return toDTOArray<AttendanceRecord>(docs);
  }

  async getAttendanceRecord(id: string): Promise<AttendanceRecord | undefined> {
    const doc = await AttendanceRecordModel.findById(id);
    return doc ? toDTO<AttendanceRecord>(doc) : undefined;
  }

  async upsertAttendanceRecord(record: InsertAttendanceRecord): Promise<AttendanceRecord> {
    const filter: any = { date: record.date };
    const updateData: any = { ...record, markedAt: new Date() };
    if (record.targetType === "STUDENT") {
      filter.studentId = record.studentId;
      delete updateData.staffId;
    } else {
      filter.staffId = record.staffId;
      delete updateData.studentId;
    }
    const doc = await AttendanceRecordModel.findOneAndUpdate(
      filter,
      { $set: updateData },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    return toDTO<AttendanceRecord>(doc);
  }

  async updateAttendanceRecord(id: string, updates: Partial<AttendanceRecord>): Promise<AttendanceRecord | undefined> {
    const doc = await AttendanceRecordModel.findByIdAndUpdate(id, updates, { new: true });
    return doc ? toDTO<AttendanceRecord>(doc) : undefined;
  }

  async deleteAttendanceRecord(id: string): Promise<boolean> {
    const result = await AttendanceRecordModel.findByIdAndDelete(id);
    return !!result;
  }

  async getAttendanceSummary(date: string, targetType?: string): Promise<AttendanceSummary> {
    const query: any = { date };
    if (targetType) query.targetType = targetType;
    const records = await AttendanceRecordModel.find(query);
    return {
      date,
      total: records.length,
      present: records.filter(r => r.status === "PRESENT").length,
      absent: records.filter(r => r.status === "ABSENT").length,
      leave: records.filter(r => r.status === "LEAVE").length,
    };
  }

  async getAttendanceReport(filters: { targetType: string; startDate: string; endDate: string; className?: string; section?: string }): Promise<AttendanceRecord[]> {
    const query: any = {
      targetType: filters.targetType,
      date: { $gte: filters.startDate, $lte: filters.endDate },
    };
    if (filters.className) query.className = filters.className;
    if (filters.section) query.section = filters.section;
    const docs = await AttendanceRecordModel.find(query).sort({ date: -1 });
    return toDTOArray<AttendanceRecord>(docs);
  }
}
