# Emblazers - School Management System

## Complete System Documentation

**Version:** 1.0
**Live URL:** https://emblazers.replit.app
**Last Updated:** February 2026

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Login Credentials](#2-login-credentials)
3. [Architecture](#3-architecture)
4. [Authentication & Authorization](#4-authentication--authorization)
5. [Modules Overview](#5-modules-overview)
6. [Complete API Reference](#6-complete-api-reference)
7. [Database Models](#7-database-models)
8. [Frontend Pages & Routes](#8-frontend-pages--routes)
9. [Cross-Module Data Flow](#9-cross-module-data-flow)
10. [Curriculum Multi-Role System](#10-curriculum-multi-role-system)

---

## 1. System Overview

Emblazers is a comprehensive school management system with **13 administrative modules** covering student management, HR, finance, academics, and facilities. Each module operates independently with its own login, dashboard, and feature set.

### Modules at a Glance

| # | Module | Purpose | Login Email |
|---|--------|---------|-------------|
| 1 | **Student** | Student records, enrollment, alumni | student@emblazers.com |
| 2 | **HR** | Staff management, vacancies, recruitment | hr@emblazers.com |
| 3 | **Fee** | Fee structures, challans, payments | fee@emblazers.com |
| 4 | **Payroll** | Salary generation, payslips | payroll@emblazers.com |
| 5 | **Finance** | Chart of accounts, ledger, journals | finance@emblazers.com |
| 6 | **Attendance** | Student & staff attendance tracking | attendance@emblazers.com |
| 7 | **Timetable** | Class and teacher scheduling | timetable@emblazers.com |
| 8 | **DateSheet** | Exam date sheet management | datesheet@emblazers.com |
| 9 | **Curriculum** | Syllabus, exams, LMS (3 roles) | admin@emblazers.com |
| 10 | **POS** | Point of sale for canteen/stationery | pos@emblazers.com |
| 11 | **Library** | Books, members, issue/return | library@emblazers.com |
| 12 | **Transport** | Routes, vehicles, drivers, allocation | transport@emblazers.com |
| 13 | **Hostel** | Rooms, residents, hostel fees | hostel@emblazers.com |

---

## 2. Login Credentials

### Module Admin Logins
All module admins share the same default password: **12345678**

| Role | Email | Password | Login URL |
|------|-------|----------|-----------|
| Student Admin | student@emblazers.com | 12345678 | /student/login |
| HR Admin | hr@emblazers.com | 12345678 | /hr/login |
| Fee Admin | fee@emblazers.com | 12345678 | /fee/login |
| Payroll Admin | payroll@emblazers.com | 12345678 | /payroll/login |
| Finance Admin | finance@emblazers.com | 12345678 | /finance/login |
| Attendance Admin | attendance@emblazers.com | 12345678 | /attendance/login |
| Timetable Admin | timetable@emblazers.com | 12345678 | /timetable/login |
| DateSheet Admin | datesheet@emblazers.com | 12345678 | /datesheet/login |
| Curriculum Admin | admin@emblazers.com | 12345678 | /curriculum/login |
| POS Admin | pos@emblazers.com | 12345678 | /pos/login |
| Library Admin | library@emblazers.com | 12345678 | /library/login |
| Transport Admin | transport@emblazers.com | 12345678 | /transport/login |
| Hostel Admin | hostel@emblazers.com | 12345678 | /hostel/login |

### Curriculum Module - Multi-Role Logins

| Role | Login Method | Default Password | Login URL |
|------|-------------|-----------------|-----------|
| **Admin** | admin@emblazers.com | 12345678 | /curriculum/login (Admin tab) |
| **Teacher** | Staff email (e.g. john@school.com) | Staff ID (e.g. STF-2024-001) | /curriculum/login (Teacher tab) |
| **Student** | Student ID (e.g. C5-A-2024-0001) | 12345678 | /curriculum/login (Student tab) |

---

## 3. Architecture

### Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript, Vite |
| **UI Library** | Radix UI, shadcn/ui, Tailwind CSS |
| **State Management** | TanStack React Query v5 |
| **Routing** | Wouter |
| **Backend** | Express.js, Node.js, TypeScript |
| **Database** | MongoDB Atlas via Mongoose ODM |
| **Authentication** | JWT (jsonwebtoken), bcryptjs |
| **Validation** | Zod |
| **Build** | esbuild (server), Vite (client) |

### Project Structure

```
emblazers/
├── client/
│   └── src/
│       ├── components/
│       │   ├── layout/         # ModuleLayout, sidebar
│       │   └── ui/             # shadcn/ui components
│       ├── hooks/              # useToast, etc.
│       ├── lib/
│       │   ├── auth.tsx        # AuthContext, useAuth
│       │   ├── queryClient.ts  # React Query setup
│       │   └── grade-utils.ts  # Grade colors/calculations
│       └── pages/
│           ├── home.tsx        # Landing page
│           ├── module-login.tsx # Generic module login
│           ├── student/        # Student module pages
│           ├── hr/             # HR module pages
│           ├── fee/            # Fee module pages
│           ├── payroll/        # Payroll module pages
│           ├── finance/        # Finance module pages
│           ├── attendance/     # Attendance module pages
│           ├── timetable/      # Timetable module pages
│           ├── datesheet/      # DateSheet module pages
│           ├── curriculum/     # Curriculum module pages (admin + teacher + student)
│           ├── pos/            # POS module pages
│           ├── library/        # Library module pages
│           ├── transport/      # Transport module pages
│           ├── hostel/         # Hostel module pages
│           └── careers/        # Public careers pages
├── server/
│   ├── index.ts               # Entry point, MongoDB connect, migrations
│   ├── routes.ts              # All API route handlers
│   ├── storage.ts             # Storage interface (CRUD operations)
│   ├── seed-module-users.ts   # Seeds default module admin users
│   ├── middleware/
│   │   └── module-auth.ts     # JWT auth + module isolation middleware
│   ├── models/                # Mongoose models (52 models)
│   └── utils/
│       └── grade.ts           # Server-side grade calculation
├── shared/
│   └── schema.ts              # Shared types, Zod schemas, credentials
└── dist/                      # Production build output
    ├── index.cjs              # Server bundle
    └── public/                # Client bundle
```

### How Frontend & Backend Connect

1. **Development**: Vite dev server runs with Express middleware integration. Both frontend and backend run on port 5000. Vite handles HMR for the frontend.
2. **Production**: Express serves pre-built static files from `dist/public/`. API routes are handled by Express under `/api/`.
3. **API Communication**: Frontend uses `fetch()` with `Authorization: Bearer <token>` headers. React Query manages caching, refetching, and invalidation.

---

## 4. Authentication & Authorization

### Authentication Flow

```
User submits credentials
         │
         ▼
POST /api/auth/login (module admin)
POST /api/teacher/login (teacher)
POST /api/student-portal/login (student)
         │
         ▼
Server validates credentials (bcrypt.compare)
         │
         ▼
JWT token issued (3-day expiry)
Contains: userId, email, role, module, staffId/studentId
         │
         ▼
Token stored in localStorage:
  Admin:   emblazers_token / emblazers_session
  Teacher: teacher_token / teacher_session
  Student: student_token / student_session
         │
         ▼
All API requests include: Authorization: Bearer <token>
```

### Module Isolation (moduleAuthMiddleware)

Every API request passes through `moduleAuthMiddleware` which:

1. **Skips** public routes (login, health, public vacancies)
2. **Extracts** JWT from Authorization header
3. **Verifies** token signature and expiry
4. **Maps** the API path to allowed modules using `routeToModulesMap`
5. **Blocks** access if the user's module isn't in the allowed list (403 Forbidden)
6. **Denies** unmapped routes by default (fail-closed security)

### Public Routes (No Auth Required)

| Route | Purpose |
|-------|---------|
| GET /api/health | Server health check |
| POST /api/auth/login | Module admin login |
| POST /api/teacher/login | Teacher login |
| POST /api/student-portal/login | Student login |
| GET /api/public/vacancies | Public job listings |
| GET /api/public/vacancies/:id | Public vacancy details |
| POST /api/public/applications | Submit job application |

### Route-to-Module Access Map

| API Route | Allowed Modules |
|-----------|----------------|
| /api/students | student, fee, attendance, hostel, transport, library, curriculum |
| /api/staff | hr, payroll, attendance, timetable, library, curriculum |
| /api/fee-vouchers, /api/fee-structures | fee |
| /api/challans, /api/payments | fee |
| /api/payrolls | payroll |
| /api/accounts, /api/ledger-entries, /api/journal-entries | finance |
| /api/chart-of-accounts, /api/finance-vouchers | finance |
| /api/expenses, /api/vendors | finance |
| /api/attendance-records, /api/attendance/* | attendance |
| /api/timetables | timetable |
| /api/datesheets | datesheet |
| /api/curriculums, /api/questions, /api/quizzes | curriculum |
| /api/curriculum/* | curriculum |
| /api/teacher/* | curriculum |
| /api/student-portal/* | curriculum |
| /api/pos-items, /api/sales | pos |
| /api/books, /api/book-issues, /api/book-categories | library |
| /api/library-members, /api/library/* | library |
| /api/routes, /api/vehicles, /api/drivers | transport |
| /api/student-transports | transport |
| /api/hostel-rooms, /api/hostel-residents | hostel |
| /api/hostel-fees | hostel |
| /api/vacancies, /api/applicants | hr |
| /api/notifications, /api/activity-logs | all modules |

### Role-Specific Middleware

| Middleware | Checks | Used For |
|-----------|--------|----------|
| requireCurriculumAdmin | module=curriculum, role=admin | Admin-only curriculum routes |
| requireTeacher | role=teacher, staffId present | Teacher content/quiz routes |
| requireStudent | role=student, studentId present | Student portal routes |

### Teacher Ownership Enforcement

All teacher content/quiz modification routes enforce ownership:
- Before update/delete, the system checks `doc.staffId === req.user.staffId`
- Returns 403 if a teacher tries to modify another teacher's content

---

## 5. Modules Overview

### 5.1 Student Module
Manages student enrollment, profiles, and records.

**Pages:** Dashboard, Student List, Add Student, Edit Student, Student Profile, Alumni, Reports

**Key Features:**
- Student CRUD with auto-generated IDs (format: C{class}-{section}-{year}-{seq})
- Photo upload, B-Form/CNIC storage
- Status tracking (Active, Inactive, Alumni, Left)
- Bulk import via CSV
- Student profile with attendance summary, fee history
- Alumni tracking

**Data shared with:** Fee (studentId), Attendance (studentId), Hostel (studentId), Transport (studentId), Library (studentId), Curriculum (studentId)

---

### 5.2 HR Module
Manages staff records and recruitment.

**Pages:** Dashboard, Staff List, Add Staff, Staff Profile, Vacancies, Applicants, Reports

**Key Features:**
- Staff CRUD with auto-generated IDs (format: STF-{year}-{seq})
- Employment tracking (Full-time, Part-time, Contract)
- Status management (Active, Probation, On Leave, Terminated)
- Job vacancy posting with public careers page
- Application tracking with status pipeline (New > Shortlisted > Interviewed > Selected > Rejected)
- Bulk staff import

**Data shared with:** Payroll (staffId), Attendance (staffId), Timetable (teacherId), Curriculum (staffId for teacher assignments)

---

### 5.3 Fee Module
Manages fee structures, challans, vouchers, and payments.

**Pages:** Dashboard, Fee Structures, Challans, Payments, Vouchers, Generate Fees, Reports

**Key Features:**
- Fee structure definition by class with multiple fee heads
- Challan generation (individual or bulk)
- Payment recording with multiple modes (Cash, Bank, Cheque, Online)
- Discount rules (Sibling, Merit, Staff Child, Scholarship)
- Late fee rules (Fixed, Percentage, Daily)
- Installment plans
- Auto-posting to Finance ledger on payment
- Fee voucher generation with bulk support

**Data shared with:** Finance (auto-posts on payment), Student Portal (student sees their fee records)

---

### 5.4 Payroll Module
Manages salary generation and payment tracking.

**Pages:** Dashboard, Payroll List, Generate Payroll, Reports

**Key Features:**
- Monthly payroll generation per staff member
- Allowances and deductions configuration
- Gross/Net salary calculation
- Payment status tracking (Paid/Unpaid)
- Auto-posts Finance Voucher when payroll marked as Paid
- Payroll reports by department, month

**Data shared with:** Finance (auto-posts payment voucher), HR (reads staff data)

---

### 5.5 Finance Module
Full double-entry accounting system.

**Pages:** Dashboard, Chart of Accounts, Ledger, Expenses, Vendors, Finance Vouchers, Reports

**Key Features:**
- Chart of Accounts (Asset, Liability, Equity, Income, Expense)
- Ledger entries with debit/credit tracking
- Journal entries for manual adjustments
- Finance vouchers (Receipt, Payment, Journal, Contra)
- Expense management with vendor linking
- Vendor management with bank details
- Auto-receives entries from Fee payments and Payroll

**Data received from:** Fee module (payment receipts), Payroll module (salary payments)

---

### 5.6 Attendance Module
Tracks daily attendance for students and staff.

**Pages:** Dashboard, Mark Students, Mark Staff, Records, Reports

**Key Features:**
- Mark attendance by class/section for students
- Mark attendance for staff
- Status options: PRESENT, ABSENT, LEAVE
- Upsert logic (update if same student+date exists)
- Daily summary and reports
- Attendance percentage calculations

**Data shared with:** Student Portal (student sees their attendance), Dashboard (this month %)

---

### 5.7 Timetable Module
Manages class and teacher schedules.

**Pages:** Dashboard, Class Timetable, Teacher Timetable, Create Timetable

**Key Features:**
- Create timetable grid (day x period)
- Assign subjects and teachers to slots
- View by class or by teacher
- Conflict detection

**Data depends on:** HR (teacher list), Student (class list)

---

### 5.8 DateSheet Module
Manages examination schedules.

**Pages:** Dashboard, DateSheet List, Create DateSheet, Edit DateSheet, View DateSheet

**Key Features:**
- Create exam date sheets (Monthly, Term, Annual)
- Map subjects to dates, times, rooms, invigilators
- View/print formatted date sheets
- Edit and update existing date sheets

---

### 5.9 Curriculum Module (3 Roles)
Learning Management System with Admin, Teacher, and Student portals.

See [Section 10: Curriculum Multi-Role System](#10-curriculum-multi-role-system) for full details.

---

### 5.10 POS Module
Point of sale for school canteen/stationery.

**Pages:** Dashboard, Sales, New Sale, Items, Reports

**Key Features:**
- Item inventory management
- Create sales with multiple items
- Auto stock deduction on sale
- Sales reports and analytics

---

### 5.11 Library Module
Manages books, members, and lending.

**Pages:** Dashboard, Books, Issue/Return, Reports

**Key Features:**
- Book catalog with categories
- Member registration (Student/Staff)
- Book issue and return tracking
- Overdue detection and fine calculation
- Available/Issued/Total statistics

**Data depends on:** Student (member reference), HR (staff member reference)

---

### 5.12 Transport Module
Manages school transportation.

**Pages:** Dashboard, Routes, Vehicles, Drivers, Allocation, Reports

**Key Features:**
- Route management with stops
- Vehicle fleet tracking with maintenance status
- Driver management with license tracking
- Student-to-route allocation
- Monthly transport fee tracking

**Data depends on:** Student (allocation), HR (drivers may be staff)

---

### 5.13 Hostel Module
Manages school hostel operations.

**Pages:** Dashboard, Rooms, Residents, Hostel Fees, Reports

**Key Features:**
- Room management with bed capacity tracking
- Student resident registration
- Check-in/check-out tracking
- Monthly hostel fee management
- Room availability/occupancy status

**Data depends on:** Student (resident is a student)

---

## 6. Complete API Reference

### Authentication APIs

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/auth/login | Module admin login | Public |
| GET | /api/auth/me | Get current user profile | Required |
| POST | /api/auth/change-password | Change admin password | Required |
| POST | /api/teacher/login | Teacher login | Public |
| POST | /api/teacher/change-password | Change teacher password | Teacher |
| POST | /api/student-portal/login | Student login | Public |
| POST | /api/student-portal/change-password | Change student password | Student |

### Health & Public APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/health | Server health + DB status |
| GET | /api/public/vacancies | List open job vacancies |
| GET | /api/public/vacancies/:id | Get vacancy details |
| POST | /api/public/applications | Submit job application |

### Student APIs (Module: student)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/students | List all students (supports ?query= search) |
| GET | /api/students/:id | Get student by ID |
| POST | /api/students | Create student |
| PATCH | /api/students/:id | Update student |
| DELETE | /api/students/:id | Delete student (checks references) |
| POST | /api/students/bulk | Bulk import students |

### HR / Staff APIs (Module: hr)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/staff | List all staff (supports ?query= search) |
| GET | /api/staff/:id | Get staff by ID |
| POST | /api/staff | Create staff member |
| PATCH | /api/staff/:id | Update staff member |
| DELETE | /api/staff/:id | Delete staff (checks references) |
| POST | /api/staff/bulk | Bulk import staff |
| GET | /api/vacancies | List all vacancies |
| GET | /api/vacancies/:id | Get vacancy details |
| POST | /api/vacancies | Create vacancy |
| PATCH | /api/vacancies/:id | Update vacancy |
| DELETE | /api/vacancies/:id | Delete vacancy |
| GET | /api/applicants | List all applicants |
| GET | /api/applicants/:id | Get applicant details |
| POST | /api/applicants | Create applicant |
| PATCH | /api/applicants/:id | Update applicant status |
| DELETE | /api/applicants/:id | Delete applicant |

### Fee APIs (Module: fee)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/fee-structures | List fee structures |
| GET | /api/fee-structures/:id | Get fee structure |
| POST | /api/fee-structures | Create fee structure |
| PATCH | /api/fee-structures/:id | Update fee structure |
| DELETE | /api/fee-structures/:id | Delete fee structure |
| GET | /api/fee-vouchers | List fee vouchers |
| GET | /api/fee-vouchers/:id | Get fee voucher |
| POST | /api/fee-vouchers | Create fee voucher |
| PATCH | /api/fee-vouchers/:id | Update fee voucher |
| DELETE | /api/fee-vouchers/:id | Delete fee voucher |
| POST | /api/bulk/fee-vouchers | Bulk create fee vouchers |
| GET | /api/challans | List challans |
| GET | /api/challans/:id | Get challan |
| POST | /api/challans | Create challan |
| PATCH | /api/challans/:id | Update challan |
| DELETE | /api/challans/:id | Delete challan |
| GET | /api/payments | List payments |
| GET | /api/payments/:id | Get payment |
| GET | /api/payments/challan/:challanId | Get payments for a challan |
| POST | /api/payments | Record payment (updates challan + finance) |
| PATCH | /api/payments/:id | Update payment |
| DELETE | /api/payments/:id | Delete payment |
| GET | /api/discount-rules | List discount rules |
| POST | /api/discount-rules | Create discount rule |
| GET | /api/late-fee-rules | List late fee rules |
| POST | /api/late-fee-rules | Create late fee rule |
| GET | /api/installment-plans | List installment plans |
| POST | /api/installment-plans | Create installment plan |

### Payroll APIs (Module: payroll)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/payrolls | List payroll records |
| GET | /api/payrolls/:id | Get payroll record |
| POST | /api/payrolls | Generate payroll |
| PATCH | /api/payrolls/:id | Update payroll (auto-posts to finance if Paid) |
| DELETE | /api/payrolls/:id | Delete payroll record |

### Finance APIs (Module: finance)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/chart-of-accounts | List chart of accounts |
| POST | /api/chart-of-accounts | Create account |
| GET | /api/accounts | List accounts (legacy) |
| POST | /api/accounts | Create account (legacy) |
| GET | /api/ledger-entries | List ledger entries (filterable) |
| POST | /api/ledger-entries | Create ledger entry |
| GET | /api/journal-entries | List journal entries |
| POST | /api/journal-entries | Create journal entry |
| GET | /api/finance-vouchers | List finance vouchers |
| POST | /api/finance-vouchers | Create finance voucher |
| GET | /api/expenses | List expenses |
| POST | /api/expenses | Record expense |
| GET | /api/vendors | List vendors |
| POST | /api/vendors | Create vendor |

### Attendance APIs (Module: attendance)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/attendance-records | List records (filterable by date/class/type) |
| POST | /api/attendance-records | Mark attendance (single or array, upsert) |
| PATCH | /api/attendance-records/:id | Update attendance record |
| DELETE | /api/attendance-records/:id | Delete attendance record |
| GET | /api/attendance/summary | Daily attendance summary |
| GET | /api/attendance/report | Attendance report (date range) |

### Timetable APIs (Module: timetable)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/timetables | List timetables |
| POST | /api/timetables | Create/save timetable |
| PATCH | /api/timetables/:id | Update timetable |
| DELETE | /api/timetables/:id | Delete timetable |

### DateSheet APIs (Module: datesheet)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/datesheets | List datesheets |
| GET | /api/datesheets/:id | Get datesheet |
| POST | /api/datesheets | Create datesheet |
| PATCH | /api/datesheets/:id | Update datesheet |
| DELETE | /api/datesheets/:id | Delete datesheet |

### Curriculum Admin APIs (Module: curriculum)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/curriculums | List curriculum/syllabus items |
| POST | /api/curriculums | Create curriculum item |
| PATCH | /api/curriculums/:id | Update curriculum item |
| DELETE | /api/curriculums/:id | Delete curriculum item |
| GET | /api/questions | List question bank |
| POST | /api/questions | Create question |
| GET | /api/quizzes | List quizzes |
| POST | /api/quizzes | Create quiz |
| GET | /api/curriculum/staff-teachers | List staff with teacher designation |
| GET | /api/curriculum/teacher-assignments | List teacher-class-subject assignments |
| POST | /api/curriculum/teacher-assignments | Create teacher assignment |
| DELETE | /api/curriculum/teacher-assignments/:id | Remove assignment |
| GET | /api/curriculum/student-accounts | List student portal accounts |
| POST | /api/curriculum/student-accounts/create | Bulk create student accounts |
| POST | /api/curriculum/student-accounts/reset-password/:studentId | Reset student password |
| PATCH | /api/curriculum/student-accounts/:id | Update student account |
| GET | /api/curriculum/quiz-overview | Quiz statistics overview |
| GET | /api/curriculum/published-quizzes | List published quizzes |
| GET | /api/exams | List exams |
| POST | /api/exams | Create exam |
| GET | /api/exam-results | List exam results |
| POST | /api/exam-results | Create exam result |

### Teacher APIs (Role: teacher)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/teacher/login | Teacher login |
| GET | /api/teacher/my-assignments | Get teacher's class/subject assignments |
| GET | /api/teacher/content | List teacher's uploaded content |
| POST | /api/teacher/content | Upload study material |
| PATCH | /api/teacher/content/:id | Update content |
| DELETE | /api/teacher/content/:id | Delete content (ownership enforced) |
| PATCH | /api/teacher/content/:id/toggle-publish | Toggle content visibility |
| GET | /api/teacher/quizzes | List teacher's quizzes |
| POST | /api/teacher/quizzes | Create quiz |
| PUT | /api/teacher/quizzes/:id | Update quiz (ownership enforced) |
| DELETE | /api/teacher/quizzes/:id | Delete quiz (ownership enforced) |
| PATCH | /api/teacher/quizzes/:id/toggle-publish | Toggle quiz publish status |
| GET | /api/teacher/quizzes/:id/attempts | List student attempts (ownership enforced) |
| PATCH | /api/teacher/quizzes/:id/attempts/:attemptId/grade-short | Grade short-answer question |
| POST | /api/teacher/change-password | Change teacher password |

### Student Portal APIs (Role: student)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/student-portal/login | Student login |
| GET | /api/student-portal/dashboard | Dashboard data (profile, quiz counts, fees, attendance) |
| GET | /api/student-portal/content | Study material (grouped by subject) |
| GET | /api/student-portal/quizzes | Available quizzes (status: active/upcoming/expired) |
| GET | /api/student-portal/quizzes/:id/start | Start a quiz (returns questions without answers) |
| POST | /api/student-portal/quizzes/:id/submit | Submit quiz answers |
| GET | /api/student-portal/results | Quiz results with per-question breakdown |
| GET | /api/student-portal/fees | Fee voucher records |
| GET | /api/student-portal/attendance | Monthly attendance records |
| POST | /api/student-portal/change-password | Change student password |

### POS APIs (Module: pos)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/pos-items | List POS items |
| POST | /api/pos-items | Add POS item |
| PATCH | /api/pos-items/:id | Update POS item |
| DELETE | /api/pos-items/:id | Delete POS item |
| GET | /api/sales | List sales |
| GET | /api/sales/:id | Get sale details |
| POST | /api/sales | Create sale (deducts stock) |

### Library APIs (Module: library)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/books | List books |
| POST | /api/books | Add book |
| PATCH | /api/books/:id | Update book |
| DELETE | /api/books/:id | Delete book |
| GET | /api/book-categories | List categories |
| POST | /api/book-categories | Create category |
| GET | /api/library-members | List members |
| POST | /api/library-members | Register member |
| GET | /api/book-issues | List book issues |
| POST | /api/book-issues | Issue book |
| PATCH | /api/book-issues/:id | Return book / update issue |
| GET | /api/library/statistics | Library statistics |

### Transport APIs (Module: transport)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/routes | List routes |
| POST | /api/routes | Create route |
| PATCH | /api/routes/:id | Update route |
| DELETE | /api/routes/:id | Delete route |
| GET | /api/vehicles | List vehicles |
| POST | /api/vehicles | Add vehicle |
| PATCH | /api/vehicles/:id | Update vehicle |
| DELETE | /api/vehicles/:id | Delete vehicle |
| GET | /api/drivers | List drivers |
| POST | /api/drivers | Add driver |
| PATCH | /api/drivers/:id | Update driver |
| DELETE | /api/drivers/:id | Delete driver |
| GET | /api/student-transports | List allocations |
| POST | /api/student-transports | Allocate student to route |
| PATCH | /api/student-transports/:id | Update allocation |
| DELETE | /api/student-transports/:id | Remove allocation |

### Hostel APIs (Module: hostel)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/hostel-rooms | List rooms |
| POST | /api/hostel-rooms | Create room |
| PATCH | /api/hostel-rooms/:id | Update room |
| DELETE | /api/hostel-rooms/:id | Delete room |
| GET | /api/hostel-residents | List residents |
| POST | /api/hostel-residents | Register resident |
| PATCH | /api/hostel-residents/:id | Update resident |
| DELETE | /api/hostel-residents/:id | Remove resident |
| GET | /api/hostel-fees | List hostel fees |
| POST | /api/hostel-fees | Create hostel fee |
| PATCH | /api/hostel-fees/:id | Update hostel fee |

### Shared APIs (All modules)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/notifications | Get notifications for current module |
| PATCH | /api/notifications/:id/read | Mark notification as read |
| GET | /api/activity-logs | Get system activity logs |

---

## 7. Database Models

The system uses **52 Mongoose models** stored in MongoDB Atlas.

### Core Entities

| Model | Collection | Key Fields | Unique Index |
|-------|-----------|------------|--------------|
| Student | students | studentId, name, class, section, status | studentId |
| Staff | staffs | staffId, name, department, designation, status | staffId |
| ModuleUser | moduleusers | module, email, passwordHash, role | module |

### Fee & Finance Models

| Model | Key Fields | Unique Index |
|-------|------------|--------------|
| FeeStructure | structureId, class, feeHeads[], totalAmount | structureId |
| FeeVoucher | voucherId, studentId, month, totalAmount, netAmount, status (Paid/Unpaid/Partial), fine, discount, paymentHistory[] | voucherId |
| Challan | challanNo, studentId, netAmount, balanceAmount, status, dueDate | challanNo |
| Payment | receiptNo, challanId, amount, paymentMode, paymentDate | receiptNo |
| DiscountRule | name, type (Percentage/Fixed), value, category | - |
| LateFeeRule | name, type (Fixed/Percentage/Daily), value, gracePeriodDays | - |
| InstallmentPlan | name, numberOfInstallments, installments[] | - |
| ChartOfAccounts | accountCode, accountName, accountType, currentBalance | accountCode |
| LedgerEntry | entryNo, accountId, debit, credit, referenceType | entryNo |
| JournalEntry | journalNo, entries[], totalDebit, totalCredit, status | journalNo |
| FinanceVoucher | voucherId, type (Receipt/Payment/Journal/Contra), entries[], status | voucherId |
| Expense | expenseId, category, amount, vendorId, status | expenseId |
| Vendor | vendorId, name, category, status | vendorId |

### Payroll Model

| Model | Key Fields | Unique Index |
|-------|------------|--------------|
| Payroll | payrollId, staffId, month, basicSalary, allowances[], deductions[], grossSalary, netSalary, status (Paid/Unpaid) | payrollId, {staffId+month} |

### Attendance Model

| Model | Key Fields | Unique Index |
|-------|------------|--------------|
| AttendanceRecord | date (String), targetType (STUDENT/STAFF), studentId, staffId, status (PRESENT/ABSENT/LEAVE), markedBy | {studentId+date}, {staffId+date} |

### Academic Models

| Model | Key Fields | Unique Index |
|-------|------------|--------------|
| Curriculum | class, subject, topics[], assignedTeachers[] | - |
| Timetable | class, section, slots[{day, period, subject, teacherId}] | - |
| Datesheet | examName, examType, class, entries[{subject, date, startTime, endTime}] | - |
| Exam | name, term, classRange, startDate, endDate | - |
| ExamResult | resultId, examId, studentId, subject, marksObtained, grade | resultId, {examId+studentId+subject} |
| Question | subject, class, type (MCQ/TrueFalse/ShortAnswer), prompt, correctAnswer | - |

### Curriculum LMS Models

| Model | Key Fields | Unique Index |
|-------|------------|--------------|
| TeacherAssignment | staffId, staffName, staffEmail, className, section, subject, isActive | {staffId+className+section+subject} |
| TeacherAuthPassword | staffId, passwordHash | staffId |
| TeacherContent | staffId, teacherName, className, section, subject, title, contentType (pdf/image/note/link), fileData, isPublished | - |
| TeacherQuiz | staffId, teacherName, className, section, subject, title, timeLimitMinutes, startDateTime, endDateTime, passingMarks, totalMarks, isPublished, questions[{questionText, questionType, options, correctAnswer, marks}] | - |
| StudentPortalAccount | studentId, studentName, className, section, passwordHash, isFirstLogin, isActive, lastLogin | studentId |
| StudentQuizAttempt | quizId, studentId, studentName, className, section, answers[{questionIndex, givenAnswer, isCorrect (true/false/null), marksAwarded}], totalMarksObtained, totalMarks, percentage, grade, isPassed, timeTakenMinutes, submittedAt | {quizId+studentId} |

### Facility Models

| Model | Key Fields | Unique Index |
|-------|------------|--------------|
| Room | hostelName, roomNumber, bedCount, occupiedBeds, status | - |
| Resident | residentId, studentId, roomId, checkInDate, monthlyRent, status | residentId |
| HostelFee | feeId, residentId, studentId, month, totalAmount, status | feeId |
| Route | routeId, routeCode, routeName, stops[] | routeId |
| Vehicle | vehicleId, registrationNumber, type, capacity, status | vehicleId |
| Driver | driverId, name, licenseNumber, vehicleId, salary, status | driverId |
| TransportAllocation | allocationId, studentId, routeId, stopName, monthlyFee, status | allocationId |
| Book | accessionNo, title, author, category, totalCopies, availableCopies | - |
| BookCategory | name | - |
| BookIssue | bookId, memberId, issueDate, dueDate, returnDate, fine, status | - |
| LibraryMember | memberId, name, type (Student/Staff), referenceId | - |
| POSItem | itemCode, name, category, price, stock | - |
| Sale | invoiceNo, date, customer, items[], grandTotal | invoiceNo |

### System Models

| Model | Key Fields |
|-------|------------|
| Notification | type, title, message, module, priority, read |
| ActivityLog | module, action, entityType, description, userId |
| Vacancy | title, department, designation, positions, status |
| Applicant | vacancyId, name, email, status |
| Counter | _id (sequence name), seq |

---

## 8. Frontend Pages & Routes

### Home & Public Pages

| Path | Page | Description |
|------|------|-------------|
| / | Home | Landing page with module grid |
| /careers | Careers | Public job vacancies listing |
| /careers/:id | Apply | Job application form |
| /:module/login | Module Login | Generic login for all modules |
| /curriculum/login | Curriculum Login | Multi-role login (Admin/Teacher/Student) |

### Student Module (7 pages)

| Path | Page |
|------|------|
| /student/dashboard | Dashboard with enrollment stats |
| /student/list | Student listing with search & filters |
| /student/add | Add new student form |
| /student/edit/:id | Edit student form |
| /student/profile/:id | Student profile with full history |
| /student/alumni | Alumni listing |
| /student/reports | Student reports & analytics |

### HR Module (7 pages)

| Path | Page |
|------|------|
| /hr/dashboard | HR dashboard with staff stats |
| /hr/list | Staff listing with search |
| /hr/add | Add new staff form |
| /hr/profile/:id | Staff profile |
| /hr/vacancies | Vacancy management |
| /hr/applicants | Application tracking pipeline |
| /hr/reports | HR reports |

### Fee Module (7 pages)

| Path | Page |
|------|------|
| /fee/dashboard | Fee dashboard with collection stats |
| /fee/structures | Fee structure management |
| /fee/challans | Challan management |
| /fee/payments | Payment records |
| /fee/vouchers | Fee voucher listing |
| /fee/generate | Bulk fee generation |
| /fee/reports | Fee collection reports |

### Payroll Module (4 pages)

| Path | Page |
|------|------|
| /payroll/dashboard | Payroll dashboard |
| /payroll/list | Payroll records |
| /payroll/generate | Generate monthly payroll |
| /payroll/reports | Payroll reports |

### Finance Module (7 pages)

| Path | Page |
|------|------|
| /finance/dashboard | Finance dashboard |
| /finance/accounts | Chart of accounts |
| /finance/ledger | General ledger |
| /finance/expenses | Expense management |
| /finance/vendors | Vendor management |
| /finance/vouchers | Finance vouchers |
| /finance/reports | Financial reports |

### Attendance Module (5 pages)

| Path | Page |
|------|------|
| /attendance/dashboard | Daily attendance overview |
| /attendance/mark-students | Mark student attendance by class |
| /attendance/mark-staff | Mark staff attendance |
| /attendance/records | Attendance records viewer |
| /attendance/reports | Attendance reports |

### Timetable Module (4 pages)

| Path | Page |
|------|------|
| /timetable/dashboard | Timetable dashboard |
| /timetable/class | View class timetable |
| /timetable/teacher | View teacher timetable |
| /timetable/create | Create timetable |

### DateSheet Module (5 pages)

| Path | Page |
|------|------|
| /datesheet/dashboard | DateSheet dashboard |
| /datesheet/list | DateSheet listing |
| /datesheet/create | Create exam datesheet |
| /datesheet/edit/:id | Edit datesheet |
| /datesheet/view/:id | View formatted datesheet |

### Curriculum Module - Admin (10 pages)

| Path | Page |
|------|------|
| /curriculum/dashboard | Admin dashboard |
| /curriculum/syllabus | Syllabus management |
| /curriculum/exams | Exam management |
| /curriculum/entry | Result entry |
| /curriculum/reports | Curriculum reports |
| /curriculum/quizzes | Quiz bank management |
| /curriculum/quiz-results | Quiz results overview |
| /curriculum/teacher-assignments | Assign teachers to classes |
| /curriculum/teacher-assignments-view | View all assignments |
| /curriculum/student-accounts | Manage student portal accounts |

### Curriculum Module - Teacher (4 pages)

| Path | Page |
|------|------|
| /curriculum/teacher-dashboard | Teacher dashboard with stats |
| /curriculum/teacher-content | Upload/manage study material |
| /curriculum/teacher-quizzes | Create/manage quizzes |
| /curriculum/teacher-quiz-results | View & grade student attempts |

### Curriculum Module - Student (6 pages)

| Path | Page |
|------|------|
| /curriculum/student-dashboard | Dashboard with summary cards |
| /curriculum/student-content | Browse study material by subject |
| /curriculum/student-quizzes | Take quizzes (full-screen mode) |
| /curriculum/student-results | View quiz results with breakdown |
| /curriculum/student-fees | View fee records (read-only) |
| /curriculum/student-attendance | View attendance with circular progress |

### POS Module (5 pages)

| Path | Page |
|------|------|
| /pos/dashboard | POS dashboard |
| /pos/sales | Sales history |
| /pos/new | Create new sale |
| /pos/items | Item inventory management |
| /pos/reports | Sales reports |

### Library Module (4 pages)

| Path | Page |
|------|------|
| /library/dashboard | Library dashboard with stats |
| /library/books | Book catalog management |
| /library/issue | Issue/return books |
| /library/reports | Library reports |

### Transport Module (6 pages)

| Path | Page |
|------|------|
| /transport/dashboard | Transport dashboard |
| /transport/routes | Route management |
| /transport/vehicles | Vehicle fleet management |
| /transport/drivers | Driver management |
| /transport/allocation | Student-to-route allocation |
| /transport/reports | Transport reports |

### Hostel Module (5 pages)

| Path | Page |
|------|------|
| /hostel/dashboard | Hostel dashboard |
| /hostel/rooms | Room management |
| /hostel/residents | Resident management |
| /hostel/fees | Hostel fee management |
| /hostel/reports | Hostel reports |

**Total: ~90 frontend pages across 13 modules + public pages**

---

## 9. Cross-Module Data Flow

### How Data Flows Between Modules

```
                    ┌─────────────┐
                    │   Student   │
                    │   Module    │
                    └──────┬──────┘
                           │ studentId
        ┌──────────────────┼──────────────────┬─────────────────┐
        ▼                  ▼                  ▼                 ▼
┌───────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  Fee Module   │  │  Attendance  │  │   Library    │  │  Transport   │
│               │  │   Module     │  │   Module     │  │   Module     │
│ Fee Vouchers  │  │  Records     │  │ Book Issues  │  │ Allocation   │
│ Challans      │  │              │  │              │  │              │
│ Payments ─────┼──┤              │  │              │  │              │
└───────┬───────┘  └──────┬───────┘  └──────────────┘  └──────────────┘
        │                 │
        │ Auto-post       │ studentId query
        ▼                 ▼
┌───────────────┐  ┌──────────────┐         ┌──────────────┐
│   Finance     │  │  Curriculum  │         │   Hostel     │
│   Module      │  │ Student      │         │   Module     │
│ Ledger        │  │ Portal       │         │ Residents    │
│ Vouchers      │  │ (reads fees  │         │ Hostel Fees  │
│               │  │ & attendance)│         │              │
└───────┬───────┘  └──────────────┘         └──────────────┘
        │
        │ Auto-post
        ▼
┌───────────────┐         ┌──────────────┐
│   Payroll     │────────▶│  HR Module   │
│   Module      │  reads  │  (staffId)   │
└───────────────┘  staff  └──────┬───────┘
                                 │ staffId
                          ┌──────┴───────┐
                          ▼              ▼
                   ┌──────────┐  ┌──────────────┐
                   │Timetable │  │  Curriculum   │
                   │  Module  │  │ Teacher Portal│
                   └──────────┘  └──────────────┘
```

### Key Data Connections

| Source Module | Target Module | Shared Key | What Flows |
|-------------|--------------|-----------|-----------|
| Student | Fee | studentId | Fee vouchers reference students |
| Student | Attendance | studentId | Attendance records for students |
| Student | Library | studentId | Book issues to student members |
| Student | Transport | studentId | Route allocations for students |
| Student | Hostel | studentId | Hostel resident records |
| Student | Curriculum | studentId | Student portal accounts, quiz attempts |
| HR/Staff | Payroll | staffId | Salary generation for staff |
| HR/Staff | Attendance | staffId | Attendance records for staff |
| HR/Staff | Timetable | staffId | Teacher schedule assignments |
| HR/Staff | Curriculum | staffId | Teacher assignments, content, quizzes |
| Fee | Finance | Auto-post | Payment creates ledger entry + finance voucher |
| Payroll | Finance | Auto-post | Paid payroll creates finance voucher |
| Attendance | Student Portal | studentId | Student sees their attendance in curriculum |
| Fee | Student Portal | studentId | Student sees their fee records in curriculum |

### Auto-Posting Flow: Fee Payment to Finance

```
1. Fee Admin records a Payment (POST /api/payments)
2. Server updates Challan status (Paid/Partial)
3. Server auto-creates:
   - LedgerEntry (debit: Cash/Bank, credit: Fee Income)
   - FinanceVoucher (type: Receipt)
4. Finance module sees these entries automatically
```

### Auto-Posting Flow: Payroll to Finance

```
1. Payroll Admin marks payroll as "Paid" (PATCH /api/payrolls/:id)
2. Server auto-creates:
   - FinanceVoucher (type: Payment, narration: Salary)
3. Finance module sees this voucher automatically
```

---

## 10. Curriculum Multi-Role System

The Curriculum module is the most complex module, supporting 3 distinct user roles with separate login flows, dashboards, and feature sets.

### Role Architecture

```
                    ┌──────────────────────────┐
                    │    /curriculum/login      │
                    │  (Role Selection Screen)  │
                    └─────────┬────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
        ┌──────────┐   ┌──────────┐   ┌──────────┐
        │  Admin   │   │ Teacher  │   │ Student  │
        │  Login   │   │  Login   │   │  Login   │
        └────┬─────┘   └────┬─────┘   └────┬─────┘
             │              │              │
             ▼              ▼              ▼
     POST /api/auth/   POST /api/     POST /api/
       login           teacher/login  student-portal/
                                        login
             │              │              │
             ▼              ▼              ▼
     emblazers_token   teacher_token  student_token
     emblazers_session teacher_session student_session
             │              │              │
             ▼              ▼              ▼
     /curriculum/      /curriculum/   /curriculum/
       dashboard       teacher-       student-
                       dashboard      dashboard
```

### Admin Role

**Login:** admin@emblazers.com / 12345678
**Token storage:** emblazers_token / emblazers_session

**Capabilities:**
- Manage syllabus, exams, question bank, quizzes
- Assign teachers to classes/sections/subjects (TeacherAssignment)
- Create/manage student portal accounts
- View quiz overview and results
- View all exam results and reports

### Teacher Role

**Login:** Staff email + password (default = staffId, e.g., STF-2024-001)
**Token storage:** teacher_token / teacher_session
**Prerequisite:** Must have active TeacherAssignment records

**Login Flow:**
1. Find staff by email in Staff collection
2. Check TeacherAuthPassword collection for password hash
3. If no auth record exists, auto-create one with staffId as default password
4. Verify at least one active TeacherAssignment exists
5. Issue JWT with role=teacher, staffId, staffName

**Capabilities:**
- View assigned classes/sections/subjects
- Upload study material (PDF, Image, Note, Link) with publish/unpublish toggle
- Create quizzes with MCQ, True/False, Short Answer questions
- Set quiz time windows (startDateTime to endDateTime)
- View student quiz attempts and grade short-answer questions manually
- Change password

**Ownership Enforcement:**
All content/quiz modification routes verify `doc.staffId === req.user.staffId`. A teacher cannot modify another teacher's resources (403 Forbidden).

### Student Role

**Login:** Student ID (e.g., C5-A-2024-0001) + password (default: 12345678)
**Token storage:** student_token / student_session
**Prerequisite:** Admin must create StudentPortalAccount for the student

**Login Flow:**
1. Find StudentPortalAccount by studentId (must be isActive: true)
2. Verify password with bcrypt
3. Issue JWT with role=student, studentId, studentName, className, section
4. Track isFirstLogin flag for forced password change

**Capabilities:**
- Dashboard: active quiz count, completed quiz count, pending fees total, this month attendance %
- Browse published study material by subject (PDF viewer, image lightbox, note reader)
- Take quizzes in full-screen mode with countdown timer
- View quiz results with per-question breakdown
- View fee records from the Fee module (read-only)
- View attendance records from the Attendance module
- Change password (forced on first login)

### Quiz Taking Flow

```
Student opens Quizzes page
         │
         ▼
Sees tabs: Active | Upcoming | Completed
         │
         ▼ (clicks Start Quiz on active quiz)
         │
GET /api/student-portal/quizzes/:id/start
  → Validates: quiz published, within time window, not already attempted
  → Returns quiz data WITHOUT correct answers
         │
         ▼
Full-Screen Quiz Interface:
  → Top bar: quiz title, question X of Y, countdown timer
  → Timer turns red when < 5 minutes remaining
  → One question at a time with Previous/Next buttons
  → MCQ: radio buttons with A/B/C/D labels
  → True/False: radio buttons
  → Short Answer: text input
  → Question palette at bottom: green=answered, white=unanswered, blue=current
  → Click any palette number to jump to that question
         │
         ▼ (clicks Submit or timer reaches 0:00)
         │
Submit confirmation modal: "You have answered X of Y questions"
         │
         ▼
POST /api/student-portal/quizzes/:id/submit
  → Validates time window (distinct "not started" vs "ended" errors)
  → Auto-grades MCQ and True/False (isCorrect: true/false)
  → Short answers: isCorrect set to null (pending teacher review)
  → Calculates totalMarksObtained, percentage, grade, isPassed
  → Returns full result with per-question breakdown
         │
         ▼
Quiz Result Screen:
  → "Quiz Complete!" with score, percentage bar, grade badge, pass/fail badge
  → "View Detailed Results" button shows per-question review:
     - Green background + checkmark for correct answers
     - Red background + X for wrong answers + shows correct answer
     - "Pending teacher review" badge for short answers
  → "Go Home" button returns to quizzes list
```

### Grading System

| Percentage | Grade | Badge Color |
|-----------|-------|-------------|
| >= 90% | A+ | Purple |
| >= 80% | A | Green |
| >= 70% | B | Blue |
| >= 60% | C | Yellow |
| >= 50% | D | Orange |
| < 50% | F | Red |

Passing threshold is set per-quiz by the teacher via the `passingMarks` field.

### Content Types

| Type | Upload Format | Student View |
|------|-------------|-------------|
| PDF | Base64-encoded file data | Embedded PDF viewer (iframe) |
| Image | Base64-encoded image data | Lightbox modal |
| Note | Plain text | Formatted text container |
| Link | URL string | Opens in new browser tab |

---

## End of Documentation

This document covers the entire Emblazers school management system:
- **13 modules** with independent authentication
- **~90 frontend pages** across all modules
- **150+ API endpoints** organized by module
- **52 database models** with full field definitions
- **3-role curriculum LMS** with full quiz workflow
- **Cross-module data flow** showing how modules share data
- **Complete credential reference** for all login types
