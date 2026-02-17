import { z } from "zod";

// ============== MODULE CREDENTIALS ==============
export const moduleCredentials = {
  student: { email: "student@emblazers.com", password: "12345678" },
  hr: { email: "hr@emblazers.com", password: "12345678" },
  fee: { email: "fee@emblazers.com", password: "12345678" },
  payroll: { email: "payroll@emblazers.com", password: "12345678" },
  finance: { email: "finance@emblazers.com", password: "12345678" },
  attendance: { email: "attendance@emblazers.com", password: "12345678" },
  timetable: { email: "timetable@emblazers.com", password: "12345678" },
  datesheet: { email: "datesheet@emblazers.com", password: "12345678" },
  curriculum: { email: "curriculum@emblazers.com", password: "12345678" },
  pos: { email: "pos@emblazers.com", password: "12345678" },
  library: { email: "library@emblazers.com", password: "12345678" },
  transport: { email: "transport@emblazers.com", password: "12345678" },
  hostel: { email: "hostel@emblazers.com", password: "12345678" },
} as const;

export type ModuleType = keyof typeof moduleCredentials;

// ============== STUDENT MODULE ==============
export const studentSchema = z.object({
  id: z.string(),
  studentId: z.string(),
  name: z.string(),
  gender: z.enum(["Male", "Female", "Other"]),
  dob: z.string(),
  parentName: z.string(),
  parentContact: z.string(),
  parentEmail: z.string().optional(),
  fatherCnic: z.string().optional(),
  motherCnic: z.string().optional(),
  address: z.string(),
  class: z.string(),
  section: z.string(),
  previousSchool: z.string().optional(),
  previousClass: z.string().optional(),
  admissionDate: z.string(),
  status: z.enum(["Active", "Inactive", "Alumni", "Left"]),
  photo: z.string().optional(),
  notes: z.string().optional(),
  bform: z.string(),
});

export const insertStudentSchema = studentSchema
  .omit({ id: true, studentId: true })
  .refine((data) => data.fatherCnic || data.motherCnic, {
    message: "At least one parent's CNIC (Father's or Mother's) is required",
    path: ["fatherCnic"],
  });

export type Student = z.infer<typeof studentSchema>;
export type InsertStudent = z.infer<typeof insertStudentSchema>;

// ============== STAFF / HR MODULE ==============
export const staffSchema = z.object({
  id: z.string(),
  staffId: z.string(),
  name: z.string(),
  gender: z.enum(["Male", "Female", "Other"]),
  dob: z.string(),
  email: z.string(),
  phone: z.string(),
  address: z.string(),
  designation: z.string(),
  department: z.string(),
  campus: z.string(),
  employmentType: z.enum(["Full-time", "Part-time", "Contract"]),
  status: z.enum(["Active", "Probation", "On Leave", "Terminated"]),
  joiningDate: z.string(),
  basicSalary: z.number(),
  paymentMode: z.enum(["Bank Transfer", "Cash", "Cheque"]),
  photo: z.string().optional(),
});

export const insertStaffSchema = staffSchema.omit({ id: true, staffId: true });
export type Staff = z.infer<typeof staffSchema>;
export type InsertStaff = z.infer<typeof insertStaffSchema>;

export const vacancySchema = z.object({
  id: z.string(),
  title: z.string(),
  department: z.string(),
  designation: z.string(),
  positions: z.number(),
  employmentType: z.enum(["Permanent", "Contract", "Visiting"]),
  salaryRange: z.string().optional(),
  qualifications: z.string(),
  experience: z.string(),
  description: z.string(),
  lastDate: z.string(),
  status: z.enum(["Open", "Closed", "On Hold"]),
});

export const insertVacancySchema = vacancySchema.omit({ id: true });
export type Vacancy = z.infer<typeof vacancySchema>;
export type InsertVacancy = z.infer<typeof insertVacancySchema>;

export const applicantSchema = z.object({
  id: z.string(),
  vacancyId: z.string(),
  vacancyTitle: z.string(),
  name: z.string(),
  email: z.string(),
  phone: z.string(),
  cnic: z.string(),
  address: z.string().optional(),
  qualification: z.string(),
  experience: z.string(),
  expectedSalary: z.number().optional(),
  appliedDate: z.string(),
  status: z.enum(["New", "Shortlisted", "Interviewed", "Offered", "Hired", "Rejected"]),
});

export const insertApplicantSchema = applicantSchema.omit({ id: true });
export type Applicant = z.infer<typeof applicantSchema>;
export type InsertApplicant = z.infer<typeof insertApplicantSchema>;

// ============== FEE MODULE ==============
export const feeHeadSchema = z.object({
  name: z.string(),
  amount: z.number(),
});

export const feeVoucherSchema = z.object({
  id: z.string(),
  voucherId: z.string(),
  studentId: z.string(),
  studentName: z.string(),
  class: z.string(),
  section: z.string(),
  month: z.string(),
  feeHeads: z.array(feeHeadSchema),
  totalAmount: z.number(),
  discount: z.number(),
  fine: z.number(),
  netAmount: z.number(),
  paidAmount: z.number(),
  dueDate: z.string(),
  status: z.enum(["Paid", "Unpaid", "Partial"]),
  paymentHistory: z.array(z.object({
    date: z.string(),
    amount: z.number(),
    method: z.string(),
  })),
});

export const insertFeeVoucherSchema = feeVoucherSchema.omit({ id: true, voucherId: true });
export type FeeVoucher = z.infer<typeof feeVoucherSchema>;
export type InsertFeeVoucher = z.infer<typeof insertFeeVoucherSchema>;

// ============== PAYROLL MODULE ==============
export const payrollSchema = z.object({
  id: z.string(),
  staffId: z.string(),
  staffName: z.string(),
  designation: z.string(),
  department: z.string(),
  month: z.string(),
  basicSalary: z.number(),
  allowances: z.array(z.object({ name: z.string(), amount: z.number() })),
  deductions: z.array(z.object({ name: z.string(), amount: z.number() })),
  grossSalary: z.number(),
  netSalary: z.number(),
  status: z.enum(["Paid", "Unpaid"]),
  paidDate: z.string().optional(),
});

export const insertPayrollSchema = payrollSchema.omit({ id: true });
export type Payroll = z.infer<typeof payrollSchema>;
export type InsertPayroll = z.infer<typeof insertPayrollSchema>;

// ============== FINANCE MODULE ==============
export const accountSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  type: z.enum(["Assets", "Liabilities", "Income", "Expense"]),
  balance: z.number(),
});

export const insertAccountSchema = accountSchema.omit({ id: true });
export type Account = z.infer<typeof accountSchema>;
export type InsertAccount = z.infer<typeof insertAccountSchema>;

export const voucherEntrySchema = z.object({
  accountId: z.string(),
  accountName: z.string(),
  debit: z.number(),
  credit: z.number(),
  description: z.string().optional(),
});

export const financeVoucherSchema = z.object({
  id: z.string(),
  voucherId: z.string(),
  voucherNumber: z.string(),
  type: z.enum(["Receipt", "Payment", "Journal", "Contra"]),
  date: z.string(),
  entries: z.array(voucherEntrySchema),
  totalDebit: z.number(),
  totalCredit: z.number(),
  narration: z.string(),
  reference: z.string().optional(),
  status: z.enum(["Draft", "Posted", "Cancelled"]),
  createdBy: z.string(),
  postedBy: z.string().optional(),
  postedAt: z.string().optional(),
  cancelledBy: z.string().optional(),
  cancelledAt: z.string().optional(),
  createdAt: z.string(),
});

export const insertFinanceVoucherSchema = financeVoucherSchema.omit({ id: true, voucherId: true, voucherNumber: true, createdAt: true });
export type FinanceVoucher = z.infer<typeof financeVoucherSchema>;
export type InsertFinanceVoucher = z.infer<typeof insertFinanceVoucherSchema>;

// ============== FEE STRUCTURE & CHALLAN SYSTEM ==============
export const feeStructureSchema = z.object({
  id: z.string(),
  structureId: z.string(),
  name: z.string(),
  academicSession: z.string(),
  class: z.string(),
  description: z.string().optional(),
  feeHeads: z.array(z.object({
    name: z.string(),
    amount: z.number(),
    frequency: z.enum(["Monthly", "Quarterly", "Half-Yearly", "Yearly", "One-Time"]),
    optional: z.boolean().optional(),
  })),
  totalAmount: z.number(),
  isActive: z.boolean(),
  createdAt: z.string(),
});

export const insertFeeStructureSchema = feeStructureSchema.omit({ id: true, structureId: true, createdAt: true });
export type FeeStructure = z.infer<typeof feeStructureSchema>;
export type InsertFeeStructure = z.infer<typeof insertFeeStructureSchema>;

export const discountRuleSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(["Percentage", "Fixed"]),
  value: z.number(),
  category: z.enum(["Sibling", "Merit", "Staff Child", "Scholarship", "Early Bird", "Other"]),
  applicableClasses: z.array(z.string()).optional(),
  applicableFeeHeads: z.array(z.string()).optional(),
  validFrom: z.string(),
  validTo: z.string().optional(),
  isActive: z.boolean(),
});

export const insertDiscountRuleSchema = discountRuleSchema.omit({ id: true });
export type DiscountRule = z.infer<typeof discountRuleSchema>;
export type InsertDiscountRule = z.infer<typeof insertDiscountRuleSchema>;

export const lateFeeRuleSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(["Fixed", "Percentage", "Daily"]),
  value: z.number(),
  gracePeriodDays: z.number(),
  maxLateFee: z.number().optional(),
  applicableClasses: z.array(z.string()).optional(),
  isActive: z.boolean(),
});

export const insertLateFeeRuleSchema = lateFeeRuleSchema.omit({ id: true });
export type LateFeeRule = z.infer<typeof lateFeeRuleSchema>;
export type InsertLateFeeRule = z.infer<typeof insertLateFeeRuleSchema>;

export const installmentPlanSchema = z.object({
  id: z.string(),
  name: z.string(),
  numberOfInstallments: z.number(),
  installments: z.array(z.object({
    installmentNumber: z.number(),
    percentage: z.number(),
    dueDate: z.string(),
  })),
  applicableClasses: z.array(z.string()).optional(),
  isActive: z.boolean(),
});

export const insertInstallmentPlanSchema = installmentPlanSchema.omit({ id: true });
export type InstallmentPlan = z.infer<typeof installmentPlanSchema>;
export type InsertInstallmentPlan = z.infer<typeof insertInstallmentPlanSchema>;

export const challanSchema = z.object({
  id: z.string(),
  challanNo: z.string(),
  studentId: z.string(),
  studentName: z.string(),
  class: z.string(),
  section: z.string(),
  academicSession: z.string(),
  period: z.string(),
  feeStructureId: z.string().optional(),
  feeHeads: z.array(z.object({
    name: z.string(),
    amount: z.number(),
  })),
  totalAmount: z.number(),
  discountId: z.string().optional(),
  discountName: z.string().optional(),
  discountAmount: z.number(),
  lateFee: z.number(),
  adjustments: z.number(),
  netAmount: z.number(),
  paidAmount: z.number(),
  balanceAmount: z.number(),
  dueDate: z.string(),
  issueDate: z.string(),
  status: z.enum(["Pending", "Partial", "Paid", "Overdue", "Cancelled"]),
  installmentPlanId: z.string().optional(),
  installmentNumber: z.number().optional(),
  createdAt: z.string(),
});

export const insertChallanSchema = challanSchema.omit({ id: true, challanNo: true, createdAt: true });
export type Challan = z.infer<typeof challanSchema>;
export type InsertChallan = z.infer<typeof insertChallanSchema>;

export const paymentSchema = z.object({
  id: z.string(),
  receiptNo: z.string(),
  challanId: z.string(),
  challanNo: z.string(),
  studentId: z.string(),
  studentName: z.string(),
  amount: z.number(),
  paymentMode: z.enum(["Cash", "Bank Transfer", "Cheque", "Online", "Card"]),
  transactionRef: z.string().optional(),
  bankName: z.string().optional(),
  chequeNo: z.string().optional(),
  chequeDate: z.string().optional(),
  paymentDate: z.string(),
  receivedBy: z.string(),
  notes: z.string().optional(),
  type: z.enum(["Payment", "Refund", "Adjustment"]),
  status: z.enum(["Completed", "Pending", "Cancelled", "Bounced"]),
  createdAt: z.string(),
});

export const insertPaymentSchema = paymentSchema.omit({ id: true, receiptNo: true, createdAt: true });
export type Payment = z.infer<typeof paymentSchema>;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;

// ============== EXPENSES & VENDOR MANAGEMENT ==============
export const vendorSchema = z.object({
  id: z.string(),
  vendorId: z.string(),
  name: z.string(),
  contactPerson: z.string().optional(),
  phone: z.string(),
  email: z.string().optional(),
  address: z.string(),
  category: z.enum(["Supplier", "Contractor", "Service Provider", "Utility", "Other"]),
  bankName: z.string().optional(),
  accountNo: z.string().optional(),
  taxId: z.string().optional(),
  status: z.enum(["Active", "Inactive"]),
  createdAt: z.string(),
});

export const insertVendorSchema = vendorSchema.omit({ id: true, vendorId: true, createdAt: true });
export type Vendor = z.infer<typeof vendorSchema>;
export type InsertVendor = z.infer<typeof insertVendorSchema>;

export const expenseSchema = z.object({
  id: z.string(),
  expenseId: z.string(),
  date: z.string(),
  category: z.enum(["Utilities", "Supplies", "Maintenance", "Salary", "Transport", "Events", "Marketing", "IT", "Other"]),
  subcategory: z.string().optional(),
  description: z.string(),
  vendorId: z.string().optional(),
  vendorName: z.string().optional(),
  amount: z.number(),
  paymentMode: z.enum(["Cash", "Bank Transfer", "Cheque", "Online"]),
  transactionRef: z.string().optional(),
  invoiceNo: z.string().optional(),
  invoiceDate: z.string().optional(),
  accountId: z.string().optional(),
  accountName: z.string().optional(),
  status: z.enum(["Pending", "Approved", "Paid", "Cancelled"]),
  approvedBy: z.string().optional(),
  paidBy: z.string().optional(),
  notes: z.string().optional(),
  attachments: z.array(z.string()).optional(),
  createdAt: z.string(),
});

export const insertExpenseSchema = expenseSchema.omit({ id: true, expenseId: true, createdAt: true });
export type Expense = z.infer<typeof expenseSchema>;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;

// ============== CHART OF ACCOUNTS & LEDGER ==============
export const chartOfAccountsSchema = z.object({
  id: z.string(),
  accountCode: z.string(),
  accountName: z.string(),
  accountType: z.enum(["Asset", "Liability", "Equity", "Income", "Expense"]),
  parentAccountId: z.string().optional(),
  level: z.number(),
  description: z.string().optional(),
  openingBalance: z.number(),
  currentBalance: z.number(),
  isSystemAccount: z.boolean(),
  isActive: z.boolean(),
  createdAt: z.string(),
});

export const insertChartOfAccountsSchema = chartOfAccountsSchema.omit({ id: true, createdAt: true });
export type ChartOfAccounts = z.infer<typeof chartOfAccountsSchema>;
export type InsertChartOfAccounts = z.infer<typeof insertChartOfAccountsSchema>;

export const ledgerEntrySchema = z.object({
  id: z.string(),
  entryNo: z.string(),
  date: z.string(),
  accountId: z.string(),
  accountCode: z.string(),
  accountName: z.string(),
  description: z.string(),
  referenceType: z.enum(["Challan", "Payment", "Expense", "Payroll", "Journal", "Opening", "Voucher", "FeeCollection", "SalaryPayment"]),
  referenceId: z.string().optional(),
  referenceNo: z.string().optional(),
  debit: z.number(),
  credit: z.number(),
  balance: z.number(),
  createdBy: z.string().optional(),
  createdAt: z.string(),
});

export const insertLedgerEntrySchema = ledgerEntrySchema.omit({ id: true, entryNo: true, createdAt: true });
export type LedgerEntry = z.infer<typeof ledgerEntrySchema>;
export type InsertLedgerEntry = z.infer<typeof insertLedgerEntrySchema>;

export const journalEntrySchema = z.object({
  id: z.string(),
  journalNo: z.string(),
  date: z.string(),
  description: z.string(),
  entries: z.array(z.object({
    accountId: z.string(),
    accountCode: z.string(),
    accountName: z.string(),
    debit: z.number(),
    credit: z.number(),
  })),
  totalDebit: z.number(),
  totalCredit: z.number(),
  status: z.enum(["Draft", "Posted", "Reversed"]),
  createdBy: z.string().optional(),
  approvedBy: z.string().optional(),
  createdAt: z.string(),
});

export const insertJournalEntrySchema = journalEntrySchema.omit({ id: true, journalNo: true, createdAt: true });
export type JournalEntry = z.infer<typeof journalEntrySchema>;
export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;

// ============== ATTENDANCE MODULE ==============
export const attendanceTargetType = z.enum(["STUDENT", "STAFF"]);
export type AttendanceTargetType = z.infer<typeof attendanceTargetType>;

export const attendanceStatus = z.enum(["PRESENT", "ABSENT", "LEAVE"]);
export type AttendanceStatus = z.infer<typeof attendanceStatus>;

export const attendanceRecordSchema = z.object({
  id: z.string(),
  date: z.string(),
  targetType: attendanceTargetType,
  studentId: z.string().nullable().optional(),
  staffId: z.string().nullable().optional(),
  entityName: z.string(),
  className: z.string().nullable().optional(),
  section: z.string().nullable().optional(),
  status: attendanceStatus,
  markedBy: z.string().optional(),
  remarks: z.string().optional(),
  markedAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const insertAttendanceRecordSchema = attendanceRecordSchema.omit({ id: true, markedAt: true, updatedAt: true });
export type AttendanceRecord = z.infer<typeof attendanceRecordSchema>;
export type InsertAttendanceRecord = z.infer<typeof insertAttendanceRecordSchema>;

export const attendanceSummarySchema = z.object({
  date: z.string(),
  total: z.number(),
  present: z.number(),
  absent: z.number(),
  leave: z.number(),
});
export type AttendanceSummary = z.infer<typeof attendanceSummarySchema>;

// ============== TIMETABLE MODULE ==============
export const timetableSlotSchema = z.object({
  day: z.string(),
  period: z.number(),
  subject: z.string(),
  teacherId: z.string(),
  teacherName: z.string(),
  startTime: z.string(),
  endTime: z.string(),
});

export const timetableSchema = z.object({
  id: z.string(),
  class: z.string(),
  section: z.string(),
  slots: z.array(timetableSlotSchema),
  updatedAt: z.string(),
});

export const insertTimetableSchema = timetableSchema.omit({ id: true });
export type Timetable = z.infer<typeof timetableSchema>;
export type InsertTimetable = z.infer<typeof insertTimetableSchema>;
export type TimetableSlot = z.infer<typeof timetableSlotSchema>;

// ============== DATE SHEET MODULE ==============
export const examEntrySchema = z.object({
  subject: z.string(),
  date: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  room: z.string(),
  invigilatorId: z.string(),
  invigilatorName: z.string(),
});

export const dateSheetSchema = z.object({
  id: z.string(),
  examName: z.string(),
  examType: z.enum(["Monthly", "Term", "Annual"]),
  class: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  entries: z.array(examEntrySchema),
});

export const insertDateSheetSchema = dateSheetSchema.omit({ id: true });
export type DateSheet = z.infer<typeof dateSheetSchema>;
export type InsertDateSheet = z.infer<typeof insertDateSheetSchema>;
export type ExamEntry = z.infer<typeof examEntrySchema>;

// ============== CURRICULUM & EXAM MODULE ==============
export const syllabusTopicSchema = z.object({
  topic: z.string(),
  status: z.enum(["Not Started", "In Progress", "Completed"]),
});

export const curriculumSchema = z.object({
  id: z.string(),
  class: z.string(),
  subject: z.string(),
  topics: z.array(syllabusTopicSchema),
  assignedTeachers: z.array(z.object({
    teacherId: z.string(),
    teacherName: z.string(),
    assignedAt: z.string().optional(),
  })).optional().default([]),
});

export const insertCurriculumSchema = curriculumSchema.omit({ id: true });
export type Curriculum = z.infer<typeof curriculumSchema>;
export type InsertCurriculum = z.infer<typeof insertCurriculumSchema>;

export const examSchema = z.object({
  id: z.string(),
  name: z.string(),
  term: z.string(),
  classRange: z.string(),
  startDate: z.string(),
  endDate: z.string(),
});

export const insertExamSchema = examSchema.omit({ id: true });
export type Exam = z.infer<typeof examSchema>;
export type InsertExam = z.infer<typeof insertExamSchema>;

export const resultSchema = z.object({
  id: z.string(),
  examId: z.string(),
  studentId: z.string(),
  studentName: z.string(),
  class: z.string(),
  subject: z.string(),
  marksObtained: z.number(),
  maxMarks: z.number(),
  grade: z.string(),
});

export const insertResultSchema = resultSchema.omit({ id: true });
export type Result = z.infer<typeof resultSchema>;
export type InsertResult = z.infer<typeof insertResultSchema>;

// ============== QUIZ MODULE (within Curriculum) ==============
export const questionSchema = z.object({
  id: z.string(),
  subject: z.string(),
  class: z.string(),
  type: z.enum(["MCQ", "TrueFalse", "ShortAnswer"]),
  prompt: z.string(),
  options: z.array(z.string()).optional(),
  correctAnswer: z.string(),
  marks: z.number().default(1),
  difficulty: z.enum(["Easy", "Medium", "Hard"]).optional(),
});

export const insertQuestionSchema = questionSchema.omit({ id: true });
export type Question = z.infer<typeof questionSchema>;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;

export const quizQuestionRefSchema = z.object({
  questionId: z.string(),
  marks: z.number(),
});

export const quizSchema = z.object({
  id: z.string(),
  title: z.string(),
  class: z.string(),
  section: z.string().optional(),
  subject: z.string(),
  term: z.string().optional(),
  totalMarks: z.number(),
  timeLimit: z.number().optional(),
  questions: z.array(quizQuestionRefSchema),
  assignedBy: z.string().optional(),
  status: z.enum(["Draft", "Published", "Closed"]),
  createdAt: z.string().optional(),
});

export const insertQuizSchema = quizSchema.omit({ id: true });
export type Quiz = z.infer<typeof quizSchema>;
export type InsertQuiz = z.infer<typeof insertQuizSchema>;

export const quizAnswerSchema = z.object({
  questionId: z.string(),
  answer: z.string(),
});

export const quizAttemptSchema = z.object({
  id: z.string(),
  quizId: z.string(),
  quizTitle: z.string(),
  studentId: z.string(),
  studentName: z.string(),
  class: z.string(),
  section: z.string().optional(),
  answers: z.array(quizAnswerSchema),
  score: z.number(),
  maxScore: z.number(),
  autoGraded: z.boolean().default(true),
  status: z.enum(["Submitted", "Graded"]),
  submittedAt: z.string().optional(),
});

export const insertQuizAttemptSchema = quizAttemptSchema.omit({ id: true });
export type QuizAttempt = z.infer<typeof quizAttemptSchema>;
export type InsertQuizAttempt = z.infer<typeof insertQuizAttemptSchema>;

// ============== POS MODULE ==============
export const posItemSchema = z.object({
  id: z.string(),
  itemCode: z.string(),
  name: z.string(),
  category: z.enum(["Uniforms", "Books", "Stationery", "Other"]),
  price: z.number(),
  stock: z.number(),
});

export const insertPosItemSchema = posItemSchema.omit({ id: true });
export type PosItem = z.infer<typeof posItemSchema>;
export type InsertPosItem = z.infer<typeof insertPosItemSchema>;

export const saleItemSchema = z.object({
  itemId: z.string(),
  itemName: z.string(),
  quantity: z.number(),
  price: z.number(),
  total: z.number(),
});

export const saleSchema = z.object({
  id: z.string(),
  invoiceNo: z.string(),
  date: z.string(),
  customer: z.string(),
  items: z.array(saleItemSchema),
  grandTotal: z.number(),
});

export const insertSaleSchema = saleSchema.omit({ id: true });
export type Sale = z.infer<typeof saleSchema>;
export type InsertSale = z.infer<typeof insertSaleSchema>;
export type SaleItem = z.infer<typeof saleItemSchema>;

// ============== LIBRARY MODULE ==============
export const bookCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  isDefault: z.boolean().default(false),
  createdAt: z.string().optional(),
});

export const insertBookCategorySchema = bookCategorySchema.omit({ id: true });
export type BookCategory = z.infer<typeof bookCategorySchema>;
export type InsertBookCategory = z.infer<typeof insertBookCategorySchema>;

export const bookSchema = z.object({
  id: z.string(),
  accessionNo: z.string(),
  title: z.string(),
  author: z.string(),
  category: z.string(),
  isbn: z.string(),
  edition: z.string().optional(),
  publisher: z.string().optional(),
  totalCopies: z.number().default(1),
  availableCopies: z.number().default(1),
  status: z.enum(["Available", "Issued", "Out of Stock"]),
});

export const insertBookSchema = bookSchema.omit({ id: true });
export type Book = z.infer<typeof bookSchema>;
export type InsertBook = z.infer<typeof insertBookSchema>;

export const libraryMemberSchema = z.object({
  id: z.string(),
  memberId: z.string(),
  name: z.string(),
  type: z.enum(["Student", "Staff"]),
  contact: z.string(),
  referenceId: z.string(),
});

export const insertLibraryMemberSchema = libraryMemberSchema.omit({ id: true, memberId: true });
export type LibraryMember = z.infer<typeof libraryMemberSchema>;
export type InsertLibraryMember = z.infer<typeof insertLibraryMemberSchema>;

export const bookIssueSchema = z.object({
  id: z.string(),
  bookId: z.string(),
  bookTitle: z.string(),
  accessionNo: z.string(),
  memberId: z.string(),
  memberName: z.string(),
  memberType: z.enum(["Student", "Staff"]),
  class: z.string().optional(),
  section: z.string().optional(),
  issueDate: z.string(),
  dueDate: z.string(),
  returnDate: z.string().optional(),
  fine: z.number().default(0),
  finePaid: z.boolean().default(false),
  status: z.enum(["Issued", "Returned", "Overdue"]),
});

export const insertBookIssueSchema = bookIssueSchema.omit({ id: true });
export type BookIssue = z.infer<typeof bookIssueSchema>;
export type InsertBookIssue = z.infer<typeof insertBookIssueSchema>;

// ============== TRANSPORT MODULE ==============
export const routeSchema = z.object({
  id: z.string(),
  routeId: z.string().optional(),
  routeCode: z.string(),
  routeName: z.string(),
  stops: z.array(z.string()),
});

export const insertRouteSchema = routeSchema.omit({ id: true, routeId: true });
export type Route = z.infer<typeof routeSchema>;
export type InsertRoute = z.infer<typeof insertRouteSchema>;

export const vehicleSchema = z.object({
  id: z.string(),
  vehicleId: z.string().optional(),
  registrationNumber: z.string(),
  type: z.enum(["Bus", "Van", "Coaster", "Car"]),
  capacity: z.number(),
  model: z.string(),
  make: z.string(),
  year: z.number(),
  driverId: z.string().optional(),
  driverName: z.string().optional(),
  routeId: z.string().optional(),
  routeName: z.string().optional(),
  status: z.enum(["Active", "Under Maintenance", "Inactive"]).default("Active"),
  insuranceExpiry: z.string(),
  fitnessExpiry: z.string(),
});

export const insertVehicleSchema = vehicleSchema.omit({ id: true, vehicleId: true });
export type Vehicle = z.infer<typeof vehicleSchema>;
export type InsertVehicle = z.infer<typeof insertVehicleSchema>;

export const driverSchema = z.object({
  id: z.string(),
  driverId: z.string().optional(),
  name: z.string(),
  cnic: z.string(),
  contact: z.string(),
  address: z.string().optional(),
  licenseNumber: z.string(),
  licenseExpiry: z.string(),
  experience: z.number(),
  vehicleId: z.string().optional(),
  routeId: z.string().optional(),
  salary: z.number(),
  status: z.enum(["Active", "On Leave", "Inactive"]).default("Active"),
});

export const insertDriverSchema = driverSchema.omit({ id: true, driverId: true });
export type Driver = z.infer<typeof driverSchema>;
export type InsertDriver = z.infer<typeof insertDriverSchema>;

export const studentTransportSchema = z.object({
  id: z.string(),
  allocationId: z.string().optional(),
  studentId: z.string(),
  studentName: z.string(),
  class: z.string(),
  section: z.string(),
  routeId: z.string(),
  routeName: z.string(),
  stopName: z.string(),
  pickupTime: z.string(),
  dropTime: z.string(),
  monthlyFee: z.number(),
  startDate: z.string(),
  endDate: z.string().optional(),
  vehicleId: z.string().optional(),
  status: z.enum(["Active", "Inactive"]).default("Active"),
});

export const insertStudentTransportSchema = studentTransportSchema.omit({ id: true, allocationId: true });
export type StudentTransport = z.infer<typeof studentTransportSchema>;
export type InsertStudentTransport = z.infer<typeof insertStudentTransportSchema>;

// ============== HOSTEL MODULE ==============
export const hostelRoomSchema = z.object({
  id: z.string(),
  hostelName: z.string(),
  roomNumber: z.string(),
  bedCount: z.number(),
  occupiedBeds: z.number(),
  status: z.enum(["Available", "Full", "Maintenance"]),
});

export const insertHostelRoomSchema = hostelRoomSchema.omit({ id: true });
export type HostelRoom = z.infer<typeof hostelRoomSchema>;
export type InsertHostelRoom = z.infer<typeof insertHostelRoomSchema>;

export const hostelResidentSchema = z.object({
  id: z.string(),
  studentId: z.string(),
  studentName: z.string(),
  class: z.string(),
  roomId: z.string(),
  roomNumber: z.string(),
  bedNumber: z.number(),
  joinDate: z.string(),
  status: z.enum(["Active", "Left"]),
});

export const insertHostelResidentSchema = hostelResidentSchema.omit({ id: true });
export type HostelResident = z.infer<typeof hostelResidentSchema>;
export type InsertHostelResident = z.infer<typeof insertHostelResidentSchema>;

export const hostelFeeSchema = z.object({
  id: z.string(),
  residentId: z.string(),
  studentName: z.string(),
  month: z.string(),
  amount: z.number(),
  status: z.enum(["Paid", "Unpaid"]),
  paidDate: z.string().optional(),
});

export const insertHostelFeeSchema = hostelFeeSchema.omit({ id: true });
export type HostelFee = z.infer<typeof hostelFeeSchema>;
export type InsertHostelFee = z.infer<typeof insertHostelFeeSchema>;

// ============== ROLE-BASED PERMISSIONS ==============
export const userRoleSchema = z.enum(["admin", "manager", "viewer"]);
export type UserRole = z.infer<typeof userRoleSchema>;

// Permission actions
export const permissionActionSchema = z.enum(["view", "create", "edit", "delete"]);
export type PermissionAction = z.infer<typeof permissionActionSchema>;

// Define what each role can do
export const rolePermissions: Record<UserRole, PermissionAction[]> = {
  admin: ["view", "create", "edit", "delete"],
  manager: ["view", "create", "edit"],
  viewer: ["view"],
} as const;

// User schema for role-based access
export const userSchema = z.object({
  id: z.string(),
  email: z.string(),
  password: z.string(),
  name: z.string(),
  role: userRoleSchema,
  modules: z.array(z.string()), // Modules the user has access to
  createdAt: z.string(),
});

export const insertUserSchema = userSchema.omit({ id: true, createdAt: true });
export type User = z.infer<typeof userSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;

// Update module credentials to include role and allow multiple users per module
export const moduleUserCredentials: Record<ModuleType, { email: string; password: string; role: UserRole; name: string }> = {
  student: { email: "student@emblazers.com", password: "12345678", role: "admin", name: "Student Admin" },
  hr: { email: "hr@emblazers.com", password: "12345678", role: "admin", name: "HR Admin" },
  fee: { email: "fee@emblazers.com", password: "12345678", role: "admin", name: "Fee Admin" },
  payroll: { email: "payroll@emblazers.com", password: "12345678", role: "admin", name: "Payroll Admin" },
  finance: { email: "finance@emblazers.com", password: "12345678", role: "admin", name: "Finance Admin" },
  attendance: { email: "attendance@emblazers.com", password: "12345678", role: "admin", name: "Attendance Admin" },
  timetable: { email: "timetable@emblazers.com", password: "12345678", role: "admin", name: "Timetable Admin" },
  datesheet: { email: "datesheet@emblazers.com", password: "12345678", role: "admin", name: "DateSheet Admin" },
  curriculum: { email: "curriculum@emblazers.com", password: "12345678", role: "admin", name: "Curriculum Admin" },
  pos: { email: "pos@emblazers.com", password: "12345678", role: "admin", name: "POS Admin" },
  library: { email: "library@emblazers.com", password: "12345678", role: "admin", name: "Library Admin" },
  transport: { email: "transport@emblazers.com", password: "12345678", role: "admin", name: "Transport Admin" },
  hostel: { email: "hostel@emblazers.com", password: "12345678", role: "admin", name: "Hostel Admin" },
};

// Demo users with different roles for testing permissions
export type DemoUser = { email: string; password: string; role: UserRole; name: string };
export const demoUsers: DemoUser[] = [
  // Admin users (full access)
  { email: "admin@emblazers.com", password: "admin123", role: "admin", name: "System Admin" },
  // Manager users (can view, create, edit but not delete)
  { email: "manager@emblazers.com", password: "manager123", role: "manager", name: "School Manager" },
  // Viewer users (read-only access)
  { email: "viewer@emblazers.com", password: "viewer123", role: "viewer", name: "Auditor" },
];

// ============== AUTH SESSION ==============
export const authSessionSchema = z.object({
  module: z.string(),
  email: z.string(),
  name: z.string(),
  role: userRoleSchema,
  loggedIn: z.boolean(),
  loginTime: z.string().optional(),
});

export type AuthSession = z.infer<typeof authSessionSchema>;

// ============== ACTIVITY LOGS ==============
export const activityActionSchema = z.enum([
  "create",
  "update",
  "delete",
  "generate",
  "payment",
  "status_change",
  "export",
  "import",
  "login",
  "other"
]);
export type ActivityAction = z.infer<typeof activityActionSchema>;

export const activityLogSchema = z.object({
  id: z.string(),
  module: z.string(),
  action: activityActionSchema,
  entityType: z.string(),
  entityId: z.string().optional(),
  entityName: z.string().optional(),
  description: z.string(),
  userId: z.string().optional(),
  userEmail: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  createdAt: z.string(),
});

export const insertActivityLogSchema = activityLogSchema.omit({ id: true, createdAt: true });
export type ActivityLog = z.infer<typeof activityLogSchema>;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;

// ============== NOTIFICATIONS ==============
export const notificationTypeSchema = z.enum([
  "fee_due",
  "fee_overdue",
  "payroll_pending",
  "payroll_processed",
  "low_stock",
  "library_overdue",
  "system",
  "action_log"
]);
export type NotificationType = z.infer<typeof notificationTypeSchema>;

export const notificationPrioritySchema = z.enum(["low", "medium", "high"]);
export type NotificationPriority = z.infer<typeof notificationPrioritySchema>;

export const notificationSchema = z.object({
  id: z.string(),
  type: notificationTypeSchema,
  title: z.string(),
  message: z.string(),
  module: z.string(),
  priority: notificationPrioritySchema,
  read: z.boolean(),
  link: z.string().optional(),
  createdAt: z.string(),
  metadata: z.record(z.string()).optional(),
});

export const insertNotificationSchema = notificationSchema.omit({ id: true, createdAt: true });
export type Notification = z.infer<typeof notificationSchema>;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
