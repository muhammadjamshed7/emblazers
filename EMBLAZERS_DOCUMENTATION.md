# Emblazers - Complete Application Flow & Description

## What is Emblazers?

Emblazers is a web-based school management system that handles everything a school administration needs - from student enrollment to staff payroll, from fee collection to library management. Instead of using separate software for each department, Emblazers brings all 13 departments under one roof, each operating as an independent module with its own login, dashboard, and features.

**Live URL:** https://emblazers.replit.app

---

## How the Application is Structured

### The Home Page

When you open Emblazers, you see the **Home Page** - a landing page that shows all 13 available modules as clickable cards. Each card has a unique color and icon to represent the department. Think of this page as the "lobby" of the school - from here, each department head goes to their own office (module).

The 13 modules displayed are:
1. **Students** (Blue) - Student admissions and profiles
2. **HR** (Purple) - Staff management and recruitment
3. **Fees** (Green) - Fee collection and vouchers
4. **Payroll** (Teal) - Staff salary management
5. **Finance** (Indigo) - Accounting and financial reports
6. **Attendance** (Teal) - Student and staff attendance
7. **Timetable** (Pink) - Class and teacher schedules
8. **Date Sheet** (Red) - Exam date sheets
9. **Curriculum** (Violet) - Syllabus, exams, quizzes, and results
10. **POS** (Emerald) - Point of sale for school supplies
11. **Library** (Orange) - Book management and issue tracking
12. **Transport** (Amber) - Routes, vehicles, and student allocation
13. **Hostel** (Rose) - Room management and resident tracking

---

## Authentication Flow (How Login Works)

### Step-by-Step Login Process

1. **User clicks a module card** on the home page (e.g., "Students")
2. They are taken to that module's **login page** (e.g., `/student/login`)
3. They enter their **email** and **password**
4. The system checks credentials in this order:
   - First, checks the **database** for a custom password (if the admin changed the default)
   - If no custom password found, checks against the **default credentials**
5. If credentials are valid, the server creates a **JWT token** (a secure digital pass) that:
   - Contains the user's email, role, and which module they belong to
   - Expires after 3 days (they'll need to log in again after that)
6. The token and session info are saved in the browser's local storage
7. The user is redirected to their module's **dashboard**

### Default Credentials for All Modules

Every module has the same default login pattern:
- **Email:** `{module}@emblazers.com` (e.g., `student@emblazers.com`, `hr@emblazers.com`)
- **Password:** `12345678`

Admins can change their password using the "Change Password" button in the sidebar.

### Module Isolation (Security)

Each module is strictly isolated. This means:
- A user logged into the **Student module** cannot access **HR data** or **Finance data**
- The server checks every single request to verify the user's token matches the module they're trying to access
- If someone tries to access data from another module, they get a "403 Forbidden" error
- Some data is intentionally shared across modules (e.g., the Fee module needs student names, so it has read-only access to student data)

### Cross-Module Data Access Map

| Data | Which modules can access it |
|------|---------------------------|
| Students | Student, Fee, Attendance, Hostel, Transport, Library, Curriculum |
| Staff | HR, Payroll, Attendance, Timetable, Library, Curriculum |
| Payrolls | Payroll, Finance |
| Exams | DateSheet, Curriculum |
| Results | DateSheet, Curriculum |

---

## Module-by-Module Detailed Flow

---

### 1. STUDENT MODULE

**Purpose:** Manage the complete lifecycle of a student from admission to alumni status.

**Login:** `student@emblazers.com` / `12345678`

**Pages and Flow:**

**Dashboard** (`/student/dashboard`)
- Shows key statistics: total students, new admissions this month, active students, alumni count
- Displays recent student activity
- Quick overview of student distribution by class

**Student List** (`/student/list`)
- Shows all students in a searchable, sortable table
- Columns: Student ID, Name, Class, Section, Gender, Contact, Status
- Each row has actions: View Profile, Edit, Delete
- Can filter students by class and section

**Add Student** (`/student/add`)
- Form to register a new student
- Fields: Name, Gender, Date of Birth, Parent Name, Parent Contact, Parent Email, Address, Class, Section, Admission Date
- When saved, the system generates a **structured Student ID** automatically
  - Format: `C{ClassCode}-{Section}-{Year}-{Serial}`
  - Example: `C1-A-2026-0007` means Class 1, Section A, Year 2026, 7th student
  - This ID is **permanent** - it never changes even if the student moves to a different class

**Edit Student** (`/student/edit/:id`)
- Pre-filled form with existing student data
- Can update all fields except the Student ID (it's immutable)
- Can change student status: Active, Inactive, Graduated, Transferred, Expelled

**Student Profile** (`/student/profile/:id`)
- Detailed view of a single student
- Shows all personal information, family contacts, academic details
- Timeline of changes and activity

**Alumni** (`/student/alumni`)
- List of graduated/transferred students
- Separate view from active students

**Reports** (`/student/reports`)
- Statistical reports about student population
- Class-wise distribution, gender ratio, admission trends

---

### 2. HR / STAFF MODULE

**Purpose:** Manage staff hiring, profiles, vacancies, and recruitment.

**Login:** `hr@emblazers.com` / `12345678`

**Pages and Flow:**

**Dashboard** (`/hr/dashboard`)
- Total staff count, active staff, departments, recent hires
- Staff distribution overview

**Staff List** (`/hr/list`)
- All staff members in a table
- Columns: Staff ID, Name, Email, Phone, Designation, Department, Employment Type, Status
- Actions: View Profile, Edit, Delete

**Add Staff** (`/hr/add`)
- Registration form for new staff members
- Fields: Name, Email, Phone, CNIC, Designation, Department, Employment Type (Permanent/Contractual/Visiting), Join Date, Salary, Qualification
- System auto-generates a Staff ID

**Staff Profile** (`/hr/profile/:id`)
- Complete staff profile with all details

**Vacancies** (`/hr/vacancies`)
- Create and manage job openings
- Fields: Title, Department, Designation, Number of Positions, Employment Type, Qualifications, Experience Required, Last Date to Apply
- Status: Open, Closed, On Hold
- Published vacancies appear on the public **Careers Page** (`/careers`)

**Applicants** (`/hr/applicants`)
- View job applications received through the careers page
- Track application status: Applied, Shortlisted, Interviewed, Hired, Rejected
- Each applicant record shows: Name, Email, Phone, CNIC, Qualification, Experience, Applied Date

**Reports** (`/hr/reports`)
- Staff statistics and analytics

**Public Career Page Flow:**
1. HR creates a vacancy with status "Open"
2. The vacancy appears on `/careers` (a public page - no login needed)
3. Job seekers can click "Apply" and fill out an application form (`/careers/:id`)
4. Applications appear in the HR module's Applicants page
5. HR can review and update application status

---

### 3. FEE MODULE

**Purpose:** Manage fee structures, generate challans (fee slips), collect payments, and track outstanding dues.

**Login:** `fee@emblazers.com` / `12345678`

**Pages and Flow:**

**Dashboard** (`/fee/dashboard`)
- Total fees collected this month, outstanding dues, payment trends
- Recent payment activity

**Fee Structures** (`/fee/structures`)
- Define fee templates for each class
- Each structure has: Name, Academic Session, Class, Fee Heads (Tuition, Lab, Library, Transport, etc.), Total Amount
- Can create multiple structures for different classes
- Active/Inactive toggle

**Fee Vouchers** (`/fee/vouchers`)
- Individual fee records for each student per month
- Fields: Student ID, Student Name, Class, Section, Month, Fee Heads breakdown, Total, Net Amount, Paid Amount, Due Date, Status
- Status: Pending, Partial, Paid, Overdue

**Generate Fees** (`/fee/generate`)
- Bulk generate fee vouchers for a class/section for a specific month
- Uses the fee structure as a template
- Creates one voucher per student

**Challans** (`/fee/challans`)
- Printable fee slips/challans
- Links to fee structures with student details
- Fields: Challan Number, Student details, Academic Session, Period, Amounts, Due Date

**Payments** (`/fee/payments`)
- Record fee payments received
- Fields: Receipt Number, Challan ID, Student, Amount, Payment Mode (Cash/Bank Transfer/Cheque/Online), Date, Received By
- Payment updates the voucher status automatically

**Reports** (`/fee/reports`)
- Collection reports, defaulter lists, class-wise collection summaries

**Fee Collection Flow:**
1. Admin creates a **Fee Structure** (e.g., "Class 1 - 2026 Session" with tuition Rs. 5000, lab Rs. 1000)
2. Admin **Generates** vouchers for all students in a class for a month
3. Each student gets a **Fee Voucher** showing what they owe
4. A **Challan** (printable slip) can be generated for the student/parent
5. When payment is received, a **Payment** record is created
6. The voucher status updates: Pending -> Partial -> Paid

**Additional Fee Features:**
- **Discount Rules:** Percentage or fixed discounts for categories (Sibling, Merit, Staff Child, Scholarship, Early Bird)
- **Late Fee Rules:** Automatic late fee calculation (Fixed, Percentage, or Daily) with grace period
- **Installment Plans:** Split fees into installments with custom due dates

---

### 4. PAYROLL MODULE

**Purpose:** Process staff salaries with allowances and deductions.

**Login:** `payroll@emblazers.com` / `12345678`

**Pages and Flow:**

**Dashboard** (`/payroll/dashboard`)
- Total salary disbursed this month, pending payrolls, staff count
- Monthly salary trend

**Payroll List** (`/payroll/list`)
- All generated payroll records
- Columns: Payroll ID, Staff Name, Department, Month, Basic Salary, Gross, Net Salary, Status
- Status: Draft, Processed, Paid

**Generate Payroll** (`/payroll/generate`)
- Create payroll for a staff member for a specific month
- Fields: Staff selection, Month, Basic Salary (pre-filled from HR record)
- Allowances: House Rent, Medical, Transport, etc. (customizable)
- Deductions: Tax, Insurance, Loan, etc.
- Auto-calculates: Gross Salary = Basic + Allowances, Net Salary = Gross - Deductions

**Reports** (`/payroll/reports`)
- Monthly/yearly salary reports, department-wise breakdowns

**Payroll Processing Flow:**
1. Select a staff member from the dropdown (data pulled from HR module)
2. Choose the month and verify basic salary
3. Add any allowances (HRA, medical, etc.)
4. Add any deductions (tax, loans, etc.)
5. System calculates gross and net salary
6. Save as Draft -> Process -> Mark as Paid

---

### 5. FINANCE MODULE

**Purpose:** Double-entry accounting system with chart of accounts, vouchers, ledgers, and financial reports.

**Login:** `finance@emblazers.com` / `12345678`

**Pages and Flow:**

**Dashboard** (`/finance/dashboard`)
- Total Assets, Total Liabilities, Total Income, Total Expenses
- All figures are calculated from actual ledger entries (real-time)
- Recent financial activity

**Chart of Accounts** (`/finance/accounts`)
- Pre-seeded with 17 default accounts on first startup:
  - Assets (1001-1002): Cash in Hand, Bank Account
  - Liabilities (2001): Accounts Payable
  - Equity (3001): Owner's Equity
  - Income (4001-4004): Tuition Fees, Admission Fees, Transport Fees, Other Income
  - Expenses (5001-5009): Salaries, Utilities, Office Supplies, Maintenance, Insurance, Marketing, IT, Events, Miscellaneous
- Can add custom accounts with code, name, type, and opening balance

**Vouchers** (`/finance/vouchers`)
- The core of double-entry accounting
- Each voucher has multiple entries, each with: Account, Debit amount, Credit amount, Description
- **Rule:** Total Debits must equal Total Credits (balanced entry)
- Voucher Types: Receipt, Payment, Journal
- Voucher Status Flow:
  1. **Draft** - Can be edited or deleted
  2. **Posted** - Locked, creates permanent Ledger Entries (cannot be edited)
  3. **Cancelled** - Creates an automatic reversal voucher to undo the original

**Ledger** (`/finance/ledger`)
- Shows all ledger entries for each account
- Each entry records: Date, Account, Description, Reference, Debit, Credit, Running Balance
- Entries are only created when a voucher is "Posted"

**Expenses** (`/finance/expenses`)
- Track school expenses
- Fields: Date, Category (Utilities, Supplies, Maintenance, etc.), Description, Amount, Payment Mode, Vendor
- When an expense is marked "Paid," the system can auto-create a Payment Voucher in the accounting system
- This maps the expense to the correct chart of accounts

**Vendors** (`/finance/vendors`)
- Supplier/contractor database
- Fields: Name, Contact Person, Phone, Email, Address, Category, Bank Details, Tax ID

**Reports** (`/finance/reports`)
- **Trial Balance:** Shows all accounts with their debit/credit totals (must balance)
- **Income Statement:** Revenue minus Expenses = Net Profit/Loss
- **Balance Sheet:** Assets = Liabilities + Equity

**Double-Entry Accounting Flow:**
1. When school receives tuition fees:
   - Debit: Cash in Hand (1001) Rs. 5000
   - Credit: Tuition Fees Income (4001) Rs. 5000
2. When school pays electricity bill:
   - Debit: Utilities Expense (5002) Rs. 10000
   - Credit: Bank Account (1002) Rs. 10000
3. Every transaction always has equal debits and credits
4. The system refuses to post any voucher that doesn't balance

---

### 6. ATTENDANCE MODULE

**Purpose:** Track daily attendance for both students and staff.

**Login:** `attendance@emblazers.com` / `12345678`

**Pages and Flow:**

**Dashboard** (`/attendance/dashboard`)
- Today's attendance summary: Total Present, Absent, On Leave
- Separate counts for students and staff
- Attendance percentage

**Mark Students** (`/attendance/mark-students`)
- Select a class and section to load student list
- For each student, mark: Present, Absent, or Leave
- Supports **bulk marking** - mark all present then adjust individual absences
- Uses UPSERT behavior: marking attendance for the same student on the same date updates the existing record (no duplicates)

**Mark Staff** (`/attendance/mark-staff`)
- Similar to student attendance but for staff members
- Shows all staff with their designations
- Mark each: Present, Absent, or Leave

**Records** (`/attendance/records`)
- View all attendance records with inline editing
- Filter by date, type (Student/Staff), and status
- Can modify individual records after marking

**Reports** (`/attendance/reports`)
- Date range attendance reports
- Student-wise and staff-wise attendance percentages
- Class-wise attendance summaries

**Attendance Marking Flow:**
1. Admin selects today's date (or any date)
2. Chooses "Student" or "Staff" attendance
3. For students: selects class and section
4. System loads the list of all students/staff from the respective module
5. Admin marks each person's status (Present/Absent/Leave)
6. Saves all records in bulk
7. If attendance is re-marked for the same date, it updates (doesn't create duplicates)

---

### 7. TIMETABLE MODULE

**Purpose:** Create and manage weekly class schedules and teacher assignments.

**Login:** `timetable@emblazers.com` / `12345678`

**Pages and Flow:**

**Dashboard** (`/timetable/dashboard`)
- Overview of created timetables
- Quick stats on periods covered

**Class Timetable** (`/timetable/class`)
- View timetable organized by class
- Shows weekly schedule grid with periods, subjects, and assigned teachers

**Teacher Timetable** (`/timetable/teacher`)
- View timetable organized by teacher
- Shows which classes and periods each teacher is assigned to
- Helps identify free periods and scheduling conflicts

**Create/Edit Timetable** (`/timetable/create`)
- Create a new timetable for a class/section
- Define time slots (periods) for each day of the week
- Assign subjects and teachers to each slot
- Staff data is pulled from the HR module

---

### 8. DATE SHEET MODULE

**Purpose:** Create and manage exam date sheets (exam schedules).

**Login:** `datesheet@emblazers.com` / `12345678`

**Pages and Flow:**

**Dashboard** (`/datesheet/dashboard`)
- Overview of upcoming exams
- Active date sheets count

**Date Sheet List** (`/datesheet/list`)
- All created date sheets
- Shows: Exam Name, Type, Class, Start/End Dates

**Create Date Sheet** (`/datesheet/create`)
- Create a new exam schedule
- Fields: Exam Name, Exam Type, Class, Start Date, End Date
- Dynamic subject entries: For each exam day, specify Subject, Date, Start Time, End Time, Room

**Edit Date Sheet** (`/datesheet/edit/:id`)
- Modify an existing date sheet

**View Date Sheet** (`/datesheet/view/:id`)
- Read-only detailed view of a date sheet
- Printable format showing exam schedule

---

### 9. CURRICULUM & EXAM MODULE

**Purpose:** Manage syllabus tracking, exams, results, quizzes, and question banks.

**Login:** `curriculum@emblazers.com` / `12345678`

**Pages and Flow:**

**Dashboard** (`/curriculum/dashboard`)
- Syllabus completion progress, exam stats, quiz statistics
- Published quizzes count, average quiz score, recent quiz attempts

**Syllabus** (`/curriculum/syllabus`)
- Track syllabus completion for each class and subject
- Each subject has a list of topics
- Each topic has a status: Not Started, In Progress, Completed
- Progress bars show completion percentage

**Exams** (`/curriculum/exams`)
- Create and manage exams
- Fields: Name, Term (First/Mid/Final), Class Range, Start/End Dates

**Result Entry** (`/curriculum/entry`)
- Enter student exam results
- Fields: Exam, Student, Subject, Marks Obtained, Max Marks, Grade
- Links students from the Student module

**Quizzes** (`/curriculum/quizzes`)
- Two tabs: **Question Bank** and **Quiz Manager**

- **Question Bank Tab:**
  - Create questions of types: MCQ, True/False, Short Answer
  - Each question has: Subject, Class, Prompt, Correct Answer, Marks, Difficulty (Easy/Medium/Hard)
  - MCQ questions have multiple options with one correct answer

- **Quiz Manager Tab:**
  - Build quizzes by selecting questions from the Question Bank
  - Set: Title, Class, Subject, Time Limit, Total Marks
  - Quiz Status: Draft -> Published -> Closed
  - Custom marks per question (can override the question's default marks)

**Quiz Results** (`/curriculum/quiz-results`)
- View all quiz attempts with scores
- Auto-grading: MCQ and True/False questions are graded automatically
- Short Answer questions are flagged for manual teacher review
- Analytics: Average score, pass rate, score distribution
- Detailed attempt view showing each question and the student's answer

**Reports** (`/curriculum/reports`)
- Exam results analysis, class-wise performance, subject-wise trends

---

### 10. POS (POINT OF SALE) MODULE

**Purpose:** Sell school supplies - uniforms, books, stationery - through an in-school store.

**Login:** `pos@emblazers.com` / `12345678`

**Pages and Flow:**

**Dashboard** (`/pos/dashboard`)
- Today's sales total, items sold, transaction count
- Top selling items

**Items** (`/pos/items`)
- Inventory management for the school store
- Fields: Item Code, Name, Category, Price, Stock Quantity
- Add/Edit/Delete items with dialog forms

**New Sale** (`/pos/new`)
- Point of sale interface
- Add items to cart, adjust quantities
- Shows running total
- Complete sale to generate an invoice
- Stock is automatically reduced after sale

**Sales History** (`/pos/sales`)
- List of all completed sales
- Fields: Invoice Number, Date, Customer, Items, Grand Total

**Reports** (`/pos/reports`)
- Sales reports by date range, category-wise sales, stock status

**POS Sale Flow:**
1. Operator opens "New Sale"
2. Searches/selects items to add to cart
3. Adjusts quantities as needed
4. System shows running total
5. Completes the sale
6. Invoice is generated with a unique invoice number
7. Stock quantities are automatically reduced

---

### 11. LIBRARY MODULE

**Purpose:** Manage the school library - book catalog, member registration, and book issue/return tracking.

**Login:** `library@emblazers.com` / `12345678`

**Pages and Flow:**

**Dashboard** (`/library/dashboard`)
- Total books, available copies, members, active issues
- Library statistics

**Books** (`/library/books`)
- Complete book catalog
- Fields: Accession Number, Title, Author, ISBN, Category, Publisher, Edition, Total Copies, Available Copies, Shelf Location, Status
- Book categories are customizable (Fiction, Non-Fiction, Science, etc.)
- Track total vs. available copies

**Issue/Return** (`/library/issue`)
- Issue books to library members
- Fields: Book (by accession number or title), Member, Issue Date, Due Date
- Return: Record the return date, system calculates if overdue
- Issue Status: Issued, Returned, Overdue, Lost

**Library Members**
- Register students and staff as library members
- Member Types: Student or Staff
- Links to actual Student ID or Staff ID from respective modules
- Members can be updated or removed

**Reports** (`/library/reports`)
- Most borrowed books, overdue books list, member activity

**Book Issue Flow:**
1. Student/staff registers as a library member (or already registered)
2. Librarian selects a book (must have available copies)
3. Selects the member
4. Sets issue date and due date
5. Book is issued - available copies decrease by 1
6. When returned, available copies increase by 1
7. If returned after due date, marked as overdue

---

### 12. TRANSPORT MODULE

**Purpose:** Manage school bus routes, vehicles, drivers, and student transport allocation.

**Login:** `transport@emblazers.com` / `12345678`

**Pages and Flow:**

**Dashboard** (`/transport/dashboard`)
- Active routes, vehicles, drivers, allocated students
- Route utilization overview

**Routes** (`/transport/routes`)
- Define bus routes
- Fields: Route Code, Route Name, Stops (each with stop name, pickup time, drop time, distance)
- Multiple stops per route with timing details

**Vehicles** (`/transport/vehicles`)
- School vehicle fleet management
- Fields: Registration Number, Type (Bus/Van/Car), Capacity, Model, Make, Year, Insurance Expiry, Fitness Expiry, Status (Active/Maintenance/Retired)

**Drivers** (`/transport/drivers`)
- Driver database
- Fields: Name, CNIC, Contact, License Number, License Expiry, Experience, Salary, Status
- Track license validity

**Allocation** (`/transport/allocation`)
- Assign students to transport routes
- Fields: Student (from Student module), Route, Stop Name, Pickup Time, Drop Time, Monthly Fee, Start Date
- Status: Active, Inactive, Suspended

**Reports** (`/transport/reports`)
- Route-wise student count, vehicle utilization, driver assignments

**Transport Allocation Flow:**
1. Admin creates routes with stops and timings
2. Adds vehicles and assigns route capacity
3. Registers drivers with license details
4. Allocates individual students to a route and stop
5. Monthly transport fee is recorded per allocation

---

### 13. HOSTEL MODULE

**Purpose:** Manage school hostel rooms, residents, and hostel-specific fees.

**Login:** `hostel@emblazers.com` / `12345678`

**Pages and Flow:**

**Dashboard** (`/hostel/dashboard`)
- Total rooms, occupied rooms, available beds, total residents
- Occupancy rate

**Rooms** (`/hostel/rooms`)
- Room inventory management
- Fields: Hostel Name, Room Number, Bed Count, Occupied Beds, Status (Available/Full/Maintenance)
- Occupied beds update automatically when residents are added/removed

**Residents** (`/hostel/residents`)
- Assign students to hostel rooms
- Fields: Student (from Student module), Room, Building, Check-in Date, Guardian Name, Monthly Rent, Status
- Auto-generates Resident ID

**Fees** (`/hostel/fees`)
- Hostel-specific fee management (separate from the main Fee module)
- Fields: Resident, Room, Month, Year, Rent Amount, Mess Amount, Utilities, Other Charges, Total, Paid, Due Date
- Status: Pending, Paid, Partial, Overdue

**Reports** (`/hostel/reports`)
- Occupancy reports, fee collection status, room availability

---

## Technical Architecture (For Developers)

### Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript |
| UI Components | shadcn/ui + Radix UI + Tailwind CSS |
| Routing | Wouter (lightweight client-side routing) |
| State Management | TanStack React Query (server state) + React Context (auth) |
| Backend | Express.js + Node.js |
| Database | MongoDB Atlas (cloud-hosted) |
| ODM | Mongoose (Object Document Mapper) |
| Authentication | JWT (JSON Web Tokens) |
| Build Tool | Vite (frontend) + esbuild (backend) |

### How Data Flows Through the Application

```
User Browser
    |
    |  (1) User interacts with React UI
    v
React Frontend (Vite-served)
    |
    |  (2) API call via fetch() with JWT token in header
    v
Express.js Backend
    |
    |  (3) Module Auth Middleware checks:
    |      - Is the JWT valid?
    |      - Does the user's module have access to this route?
    v
Route Handler
    |
    |  (4) Business logic + Mongoose queries
    v
MongoDB Atlas (Cloud Database)
    |
    |  (5) Data returned
    v
JSON Response back to Frontend
    |
    |  (6) React Query caches the response
    v
UI updates with new data
```

### Database Structure (MongoDB Collections)

The application uses the following MongoDB collections:

| Collection | Used By | Purpose |
|-----------|---------|---------|
| students | Student, Fee, Attendance, Library, Transport, Hostel, Curriculum | Student records |
| staff | HR, Payroll, Attendance, Timetable, Library, Curriculum | Staff records |
| moduleusers | Authentication | Module login credentials |
| feevouchers | Fee | Monthly fee records |
| feestructures | Fee | Fee templates |
| challans | Fee | Printable fee slips |
| payments | Fee | Payment receipts |
| discountrules | Fee | Discount configurations |
| latefeerules | Fee | Late fee configurations |
| installmentplans | Fee | Installment configurations |
| payrolls | Payroll, Finance | Salary records |
| chartofaccounts | Finance | Account tree |
| financevouchers | Finance | Accounting entries |
| ledgerentries | Finance | Account ledger |
| expenses | Finance | Expense tracking |
| vendors | Finance | Supplier database |
| attendancerecords | Attendance | Daily attendance |
| timetables | Timetable | Class schedules |
| datesheets | Date Sheet | Exam schedules |
| curriculums | Curriculum | Syllabus tracking |
| exams | Curriculum, Date Sheet | Exam definitions |
| examresults | Curriculum | Student results |
| questions | Curriculum | Question bank |
| quizzes | Curriculum | Quiz definitions |
| quizattempts | Curriculum | Quiz submissions |
| positems | POS | Store inventory |
| sales | POS | Sales records |
| books | Library | Book catalog |
| bookcategories | Library | Book categories |
| librarymembers | Library | Member registry |
| bookissues | Library | Issue/return tracking |
| routes | Transport | Bus routes |
| vehicles | Transport | Vehicle fleet |
| drivers | Transport | Driver records |
| transportallocations | Transport | Student-route assignments |
| rooms | Hostel | Room inventory |
| residents | Hostel | Hostel residents |
| hostelfees | Hostel | Hostel fee records |
| vacancies | HR | Job openings |
| applicants | HR | Job applications |
| notifications | All modules | In-app notifications |
| activitylogs | All modules | Audit trail |

### Student ID Format

Student IDs follow a structured format: `C{ClassCode}-{Section}-{Year}-{Serial}`

- **C1-A-2026-0007** = Class 1, Section A, Year 2026, 7th student
- The ID is assigned at admission and **never changes**, even if the student moves to a different class
- This ensures stable references across Fee Vouchers, Attendance Records, Library Members, Transport Allocations, and Hostel Residents

### Error Handling

- All 200+ API routes are wrapped with an error handler that catches unexpected errors
- If any route encounters a problem, it returns a proper error message instead of crashing the entire server
- The server logs all errors for debugging

### Deployment

- **Production URL:** https://emblazers.replit.app
- **Deployment Type:** Autoscale (scales up when traffic increases, scales down when idle)
- **Build Process:** Vite builds the frontend, esbuild bundles the backend
- **Production Command:** `node dist/index.cjs`

---

## Common User Workflows

### Enrolling a New Student (End-to-End)

1. Log into **Student Module** -> Add Student -> Fill form -> Save
2. Student gets auto-generated ID (e.g., C5-B-2026-0012)
3. Log into **Fee Module** -> Create Fee Structure for the student's class (if not exists)
4. Generate Fee Vouchers for the class -> Student gets monthly fee voucher
5. Log into **Attendance Module** -> Student appears in class attendance list
6. Log into **Library Module** -> Register student as library member
7. Log into **Transport Module** -> Allocate student to a bus route (if needed)
8. Log into **Hostel Module** -> Assign to a room (if boarding student)

### Processing Monthly Fees

1. **Fee Module:** Generate vouchers for all classes for the month
2. Parents receive challans (fee slips)
3. When payment received, record it in Payments
4. Voucher status updates: Pending -> Paid
5. **Finance Module:** Payment voucher auto-created in accounting system
6. Reports show collection vs outstanding

### Monthly Salary Processing

1. **Payroll Module:** Generate payroll for each staff member
2. Add allowances and deductions
3. Calculate net salary
4. Process and mark as Paid
5. **Finance Module:** Can create salary expense vouchers

### Conducting a Quiz

1. **Curriculum Module:** Add questions to Question Bank
2. Create a Quiz, select questions, set time limit
3. Publish the Quiz
4. Students take the quiz (answers recorded as Quiz Attempts)
5. MCQ and True/False questions are auto-graded instantly
6. Short Answer questions flagged for manual grading by teacher
7. View results with analytics and score distribution

---

## Summary

Emblazers is designed so that each department in a school can work independently in their own module, while still sharing essential data (like student names and staff info) where needed. The system maintains strict security boundaries between modules, uses a real accounting system with double-entry bookkeeping, and handles everything from the first student admission to the last salary payment - all from a single web application.
