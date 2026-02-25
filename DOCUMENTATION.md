# Emblazers - School Management System

## Complete Documentation

---

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Environment Setup](#environment-setup)
4. [System Architecture](#system-architecture)
5. [Modules Overview](#modules-overview)
6. [Authentication & Authorization](#authentication--authorization)
7. [Curriculum Module — Multi-Role System](#curriculum-module--multi-role-system)
8. [API Reference](#api-reference)
9. [Database Schema](#database-schema)
10. [Frontend Pages & Routes](#frontend-pages--routes)
11. [User Flows](#user-flows)
12. [Build & Deployment](#build--deployment)
13. [File Storage](#file-storage)
14. [Grade Calculation](#grade-calculation)
15. [Troubleshooting](#troubleshooting)

---

## Overview

Emblazers is a comprehensive school management system designed for managing 14 administrative modules across student management, HR, finance, academics, and facilities. Each department operates as an independent module with its own authentication, dashboard, and feature set. The system provides a professional, information-dense admin interface for school administrators.

The Curriculum module is the most advanced, supporting three distinct user roles (Admin, Teacher, Student) with separate login flows, dashboards, and full learning management features including quiz creation, content upload, and automated grading.

The system also includes a fallback in-memory storage (`MemStorage`) for development/testing when MongoDB is not available, though production use requires MongoDB Atlas.

**Live URL:** https://emblazers.replit.app

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript |
| Routing | Wouter |
| Server State | TanStack React Query v5 |
| UI Components | shadcn/ui + Radix UI |
| Styling | Tailwind CSS |
| Backend | Express.js + Node.js + TypeScript |
| Database | MongoDB Atlas with Mongoose ODM |
| Authentication | JWT (JSON Web Tokens) |
| Validation | Zod |
| Build | Vite (frontend) + esbuild (server) |
| Runtime | tsx (TypeScript execution) |

---

## Environment Setup

### Required Environment Variables

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `MONGO_URI` | Yes | MongoDB Atlas connection string | None |
| `JWT_SECRET` | Yes | Secret key for JWT signing/verification | None |
| `PORT` | No | Server listening port | `5000` |
| `NODE_ENV` | No | Environment mode (`development` / `production`) | `development` |
| `CLIENT_URL` | No | CORS allowed origin | `true` (all origins) |

### Running the Project

```bash
npm run dev
```

This starts the Express server on port 5000 with Vite middleware for hot-reloading in development.

---

## System Architecture

### Frontend Architecture

- Built with React 18 and TypeScript using Vite for bundling
- Wouter handles client-side routing
- React Query manages server state and caching
- UI components built with Radix UI primitives and shadcn/ui (New York style)
- Tailwind CSS for styling with HSL-based color system supporting light/dark themes
- Each module is self-contained with its own route namespace
- Authentication managed via React Context API

### Backend Architecture

- Express.js application exposing RESTful API endpoints under `/api`
- JWT-based authentication with module-specific credentials
- Global `moduleAuthMiddleware` enforces module isolation
- MongoDB Atlas accessed via Mongoose ODM
- Zod used for API request validation
- Development mode: Vite middleware integration
- Production mode: serves pre-built static files from `dist/public`

### Project Structure

```
client/
  src/
    components/
      layout/          # ModuleLayout, AppSidebar
      ui/              # shadcn/ui components
    hooks/             # Custom React hooks
    lib/
      auth.tsx         # Authentication context & hooks
      grade-utils.ts   # Shared grade color utilities
      module-config.ts # Module definitions
      queryClient.ts   # React Query client setup
    pages/
      home.tsx         # Landing page with module cards
      curriculum/      # All curriculum module pages
        curriculum-data.ts   # Admin nav items & hooks
        teacher-data.ts      # Teacher nav items & hooks
        student-data.ts      # Student nav items & hooks
        login.tsx            # 3-role login page
        ...                  # Module pages
server/
  index.ts             # Server entry point
  routes.ts            # All API route handlers
  db.ts                # MongoDB connection setup
  storage.ts           # Storage interface (MemStorage / MongoStorage)
  mongo-storage.ts     # MongoDB storage implementation
  middleware/
    module-auth.ts     # Module authentication middleware
    auth.ts            # JWT verification middleware
  models/              # Mongoose model definitions
  utils/
    grade.ts           # Grade calculation utility
shared/
  schema.ts            # Shared Zod schemas & types
```

---

## Modules Overview

The system includes 14 independent modules, each accessible from the home page:

| Module | Route | Description |
|--------|-------|-------------|
| Students | `/student` | Manage student admissions, profiles, and academics |
| HR | `/hr` | Manage staff, vacancies, and HR operations |
| Fees | `/fee` | Manage fee vouchers, payments, and collections |
| Payroll | `/payroll` | Manage staff salaries, allowances, and deductions |
| Finance | `/finance` | Manage accounts, vouchers, and financial reports |
| Attendance | `/attendance` | Track and manage student and staff attendance |
| Timetable | `/timetable` | Create and manage class and teacher timetables |
| Date Sheet | `/datesheet` | Create and manage exam date sheets |
| Curriculum | `/curriculum` | Manage syllabus, exams, results + Teacher & Student portals |
| POS | `/pos` | Point of sale for uniforms, books, and stationery |
| Library | `/library` | Manage books, members, and book issues |
| Transport | `/transport` | Manage routes, vehicles, and student allocation |
| Hostel | `/hostel` | Manage hostel rooms, residents, and fees |
| Reports & History | `/reports` | Centralized reports and analytics |

Each module follows the same pattern:
1. Login page at `/{module}/login`
2. Dashboard at `/{module}/dashboard`
3. Module-specific pages within the same namespace
4. Dedicated sidebar navigation

### Default Login Credentials

All standard modules use the pattern:
- **Email:** `{module}@emblazers.com`
- **Password:** `12345678`

Example: `student@emblazers.com / 12345678`, `hr@emblazers.com / 12345678`

---

## Authentication & Authorization

### JWT-Based Authentication

- Tokens are generated on login with a **3-day** expiry (`expiresIn: "3d"`) for all roles
- Tokens contain: `userId`, `email`, `role`, `module`, and role-specific fields
- Stored client-side in localStorage

### Module Auth Middleware

The `moduleAuthMiddleware` in `server/middleware/module-auth.ts`:
1. Extracts JWT from the `Authorization: Bearer <token>` header
2. Verifies the token signature using `JWT_SECRET`
3. Maps the requested API route to the appropriate module
4. Validates the user's module matches the route's module
5. Operates in fail-closed mode — unmapped routes are denied

### Role-Specific Middleware

Three additional middleware functions for the Curriculum module:

| Middleware | Checks | Used By |
|-----------|--------|---------|
| `requireCurriculumAdmin` | Module = curriculum, Role = admin | Admin-only routes |
| `requireTeacher` | Role = teacher, has staffId | Teacher portal routes |
| `requireStudent` | Role = student, has studentId | Student portal routes |

### Session Separation

Three separate localStorage key pairs to prevent session conflicts:

| Role | Token Key | Session Key |
|------|-----------|-------------|
| Admin | `emblazers_token` | `emblazers_session` |
| Teacher | `teacher_token` | `teacher_session` |
| Student | `student_token` | `student_session` |

### Password Storage

- Admin passwords: bcrypt hashed in the `ModuleUser` collection
- Teacher passwords: bcrypt hashed in the `teacherAuthPasswords` collection
- Student passwords: bcrypt hashed in the `studentPortalAccounts` collection

---

## Curriculum Module — Multi-Role System

The Curriculum module supports 3 user roles with separate login flows, dashboards, and feature sets.

### Login Page (`/curriculum/login`)

Displays a role selector with three options:
- **Admin Login** — Full curriculum management
- **Teacher Login** — Manage classes and content
- **Student Login** — Access learning portal

### Role 1: Curriculum Admin

**Credentials:** `curriculum@emblazers.com / 12345678`

**Sidebar Navigation:**
- Dashboard
- Curriculum (Syllabus)
- Exams
- Result Entry
- Result Reports
- Quizzes
- Quiz Results
- Teacher Assignments
- Student Accounts

**Key Features:**
- View and manage the syllabus, exams, and results
- Assign teachers to classes with subject mappings
- Bulk create student portal accounts
- Reset student passwords
- Overview of all quizzes across all teachers

### Role 2: Teacher

**Credentials:** Staff email + Staff ID as default password (e.g., `ali@school.com / STF0001`)

**Password Behavior:**
- On first login, if no password record exists in `teacherAuthPasswords`, one is auto-created with the Staff ID as the default password (bcrypt hashed)
- Teachers can change their password at any time
- Old password is rejected after change

**Login Requirements:**
- Must have active `TeacherAssignment` records
- If no assignments exist, login is rejected with: "You have not been assigned any class yet. Contact admin."

**Sidebar Navigation:**
- Dashboard
- My Assignments
- Upload Content
- My Quizzes
- Quiz Results

**Key Features:**
- View assigned classes and subjects
- Upload study materials (PDF, images, notes, links) — files converted to base64
- Create quizzes with MCQ, True/False, and Short Answer questions
- Publish/unpublish content and quizzes
- View student quiz attempts with statistics
- Manually grade short-answer questions with mark allocation

### Role 3: Student

**Credentials:** Student ID + Date of Birth in DDMMYYYY format (e.g., `C5-A-2024-0001 / 09022006`)

**Password Behavior:**
- Default password = DOB in DDMMYYYY format (e.g., February 9, 2006 = `09022006`)
- Portal accounts created by admin via bulk creation or individual creation
- On first login, `isFirstLogin = true` triggers a forced password change screen
- After changing password, `isFirstLogin` is set to `false`

**Sidebar Navigation:**
- Dashboard
- Study Material
- My Quizzes
- My Results
- My Fees
- Attendance

**Key Features:**
- Dashboard with summary cards (active quizzes, completed quizzes, pending fees, attendance %)
- Browse study materials grouped by subject with inline viewers (PDF iframe, image lightbox, text modal)
- Take quizzes in full-screen mode with countdown timer and question palette
- View quiz results with per-question breakdown and grade badges
- View fee records (read-only) with payment status
- View month-by-month attendance with circular progress indicator

---

## API Reference

### Public Routes (No Authentication Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/public/vacancies` | List all active job vacancies |
| GET | `/api/public/vacancies/:id` | Get a specific vacancy |
| POST | `/api/public/applications` | Submit a job application |

### Standard Module Routes

All standard modules (Students, HR, Fees, etc.) follow this pattern:

```
POST   /api/auth/login          # Login with module credentials
GET    /api/auth/me              # Get current user info
POST   /api/auth/change-password # Change password
GET    /api/{resource}           # List resources
POST   /api/{resource}           # Create resource
PUT    /api/{resource}/:id       # Update resource
DELETE /api/{resource}/:id       # Delete resource
```

### Curriculum Admin Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/curriculum/staff-teachers` | List all staff with teacher designation |
| GET | `/api/curriculum/teacher-assignments` | List all teacher assignments |
| POST | `/api/curriculum/teacher-assignments` | Create a new teacher assignment |
| DELETE | `/api/curriculum/teacher-assignments/:id` | Delete an assignment |
| GET | `/api/curriculum/student-accounts` | List all student portal accounts |
| POST | `/api/curriculum/student-accounts/create` | Create student accounts (single or bulk by class) |
| POST | `/api/curriculum/student-accounts/reset-password/:studentId` | Reset student password to DOB default |
| PATCH | `/api/curriculum/student-accounts/:id` | Toggle student account active status |
| GET | `/api/curriculum/quiz-overview` | All quizzes with attempt counts |

**Create Student Accounts - Request Body:**
```json
// Single student
{ "studentId": "C5-A-2024-0001" }

// Bulk by class
{ "className": "Class 5", "section": "A" }
```

### Teacher Auth Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/teacher/login` | Teacher login with staff email and password |
| POST | `/api/teacher/change-password` | Change teacher password |

**Teacher Login - Request Body:**
```json
{
  "staffEmail": "ali@school.com",
  "password": "STF0001"
}
```

**Teacher Login - Response:**
```json
{
  "success": true,
  "token": "eyJhbG...",
  "module": "curriculum",
  "user": {
    "email": "ali@school.com",
    "role": "teacher",
    "name": "Mr. Ali",
    "staffId": "64a...",
    "staffEmail": "ali@school.com"
  },
  "assignments": [
    {
      "id": "64b...",
      "className": "Class 5",
      "section": "A",
      "subject": "Mathematics"
    }
  ]
}
```

### Teacher Portal Routes

All require Teacher JWT in `Authorization: Bearer <token>` header.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/teacher/my-assignments` | Get teacher's class assignments |
| GET | `/api/teacher/content` | List teacher's uploaded content |
| POST | `/api/teacher/content` | Upload new content (base64 file data) |
| PATCH | `/api/teacher/content/:id/toggle-publish` | Toggle content publish status |
| DELETE | `/api/teacher/content/:id` | Delete content |
| GET | `/api/teacher/quizzes` | List teacher's quizzes |
| POST | `/api/teacher/quizzes` | Create a new quiz with questions |
| PUT | `/api/teacher/quizzes/:id` | Update quiz (blocked if attempts exist) |
| DELETE | `/api/teacher/quizzes/:id` | Delete quiz (blocked if attempts exist) |
| PATCH | `/api/teacher/quizzes/:id/toggle-publish` | Toggle quiz publish status |
| GET | `/api/teacher/quizzes/:id/attempts` | Get all student attempts for a quiz |
| PATCH | `/api/teacher/quizzes/:id/attempts/:attemptId/grade-short` | Grade a short-answer question |

**Create Quiz - Request Body:**
```json
{
  "title": "Chapter 3 Test",
  "instructions": "Answer all questions",
  "className": "Class 5",
  "section": "A",
  "subject": "Mathematics",
  "timeLimitMinutes": 30,
  "startDateTime": "2026-02-25T10:00:00.000Z",
  "endDateTime": "2026-02-25T11:00:00.000Z",
  "passingMarks": 18,
  "questions": [
    {
      "questionText": "What is 1/2 + 1/4?",
      "questionType": "mcq",
      "options": ["1/4", "3/4", "1/2", "1"],
      "correctAnswer": "3/4",
      "marks": 5
    },
    {
      "questionText": "A fraction has numerator and denominator.",
      "questionType": "truefalse",
      "options": ["True", "False"],
      "correctAnswer": "True",
      "marks": 5
    },
    {
      "questionText": "Explain what a fraction is.",
      "questionType": "short",
      "options": [],
      "correctAnswer": "",
      "marks": 5
    }
  ]
}
```

**Grade Short Answer - Request Body:**
```json
{
  "questionIndex": 5,
  "marksAwarded": 4
}
```

### Student Portal Routes

All require Student JWT in `Authorization: Bearer <token>` header.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/student-portal/login` | Student login with student ID and password |
| POST | `/api/student-portal/change-password` | Change password (sets isFirstLogin=false) |
| GET | `/api/student-portal/dashboard` | Get dashboard data (profile, stats) |
| GET | `/api/student-portal/content` | Get study materials grouped by subject |
| GET | `/api/student-portal/quizzes` | Get quizzes with status and attempt info |
| GET | `/api/student-portal/quizzes/:id/start` | Start a quiz (returns questions without answers) |
| POST | `/api/student-portal/quizzes/:id/submit` | Submit quiz answers |
| GET | `/api/student-portal/results` | Get all quiz results |
| GET | `/api/student-portal/fees` | Get fee voucher records |
| GET | `/api/student-portal/attendance` | Get attendance records by month |

**Student Login - Request Body:**
```json
{
  "studentId": "C5-A-2024-0001",
  "password": "09022006"
}
```

**Student Login - Response:**
```json
{
  "success": true,
  "token": "eyJhbG...",
  "module": "curriculum",
  "user": {
    "email": "C5-A-2024-0001",
    "role": "student",
    "name": "ali",
    "studentId": "C5-A-2024-0001",
    "className": "Class 5",
    "section": "A",
    "isFirstLogin": true
  }
}
```

**Dashboard Response:**
```json
{
  "profile": {
    "name": "ali",
    "studentId": "C5-A-2024-0001",
    "className": "Class 5",
    "section": "A"
  },
  "activeQuizzesCount": 1,
  "completedQuizzesCount": 0,
  "pendingFeesTotal": 200,
  "thisMonthAttendance": 0
}
```

**Submit Quiz - Request Body:**
```json
{
  "answers": [
    { "questionIndex": 0, "givenAnswer": "3/4" },
    { "questionIndex": 1, "givenAnswer": "True" },
    { "questionIndex": 2, "givenAnswer": "A fraction represents a part of a whole" }
  ],
  "timeTakenMinutes": 15
}
```

**Submit Quiz - Response:**
```json
{
  "id": "64c...",
  "totalMarksObtained": 25,
  "totalMarks": 35,
  "percentage": 71,
  "grade": "B",
  "isPassed": true,
  "timeTakenMinutes": 15
}
```

**Quiz Validation Rules:**
- Quiz must be published (`isPublished = true`)
- Current time must be within `startDateTime` and `endDateTime`
- Student must not have already submitted (double submission blocked)
- MCQ and True/False questions are auto-graded
- Short answer questions get `marksAwarded: 0` (pending teacher grading)

---

## Database Schema

### Core Collections (All Modules)

| Collection | Description |
|-----------|-------------|
| `moduleusers` | Admin login credentials for all modules |
| `students` | Student records (admissions, profiles, academics) |
| `staff` | Staff/teacher records |
| `feevouchers` | Fee payment records |
| `payrolls` | Staff payroll records |
| `accounts` | Financial accounts |
| `financevouchers` | Finance journal entries |
| `ledgerentries` | Financial ledger entries |
| `attendancerecords` | Student attendance records |
| `timetables` | Class timetables |
| `datesheets` | Exam date sheets |
| `syllabi` | Curriculum/syllabus records |
| `exams` | Exam configurations |
| `examresults` | Student exam results |
| `posproducts` | POS inventory items |
| `postransactions` | POS sales transactions |
| `books` | Library book records |
| `librarymembers` | Library members |
| `bookissues` | Library book issues |
| `transportroutes` | Transport routes |
| `transportvehicles` | Transport vehicles |
| `studenttransport` | Student transport allocations |
| `hostelrooms` | Hostel rooms |
| `hostelresidents` | Hostel residents |

### Curriculum Module Collections

#### `teacherassignments`
```
{
  staffId: String              // Reference to staff collection
  staffName: String
  staffEmail: String
  className: String            // e.g. "Class 5"
  section: String              // e.g. "A"
  subject: String              // e.g. "Mathematics"
  assignedBy: String           // Admin email who created the assignment
  isActive: Boolean            // default: true
  createdAt: Date
}
```

#### `teachercontents`
```
{
  staffId: String
  teacherName: String
  className: String
  section: String
  subject: String
  title: String
  description: String
  contentType: String          // "pdf" | "image" | "note" | "link"
  fileData: String             // Base64 encoded file OR URL string
  fileName: String
  isPublished: Boolean         // default: false
  createdAt: Date
}
```

#### `teacherquizzes`
```
{
  staffId: String
  teacherName: String
  className: String
  section: String
  subject: String
  title: String
  instructions: String
  timeLimitMinutes: Number
  startDateTime: Date
  endDateTime: Date
  passingMarks: Number
  totalMarks: Number
  isPublished: Boolean         // default: false
  questions: [{
    questionText: String
    questionType: String       // "mcq" | "truefalse" | "short"
    options: [String]          // 4 options for MCQ, 2 for T/F
    correctAnswer: String      // Optional for short answer
    marks: Number
  }]
  createdAt: Date
}
```

#### `studentquizattempts`
```
{
  quizId: String               // Reference to teacherquizzes
  studentId: String            // e.g. "C5-A-2024-0001"
  studentName: String
  className: String
  section: String
  answers: [{
    questionIndex: Number
    givenAnswer: String
    isCorrect: Boolean
    marksAwarded: Number
  }]
  totalMarksObtained: Number
  totalMarks: Number
  percentage: Number
  grade: String                // A+, A, B, C, D, F
  isPassed: Boolean
  timeTakenMinutes: Number
  submittedAt: Date
}
```

#### `studentportalaccounts`
```
{
  studentId: String            // Unique — used as login username
  studentName: String
  className: String
  section: String
  passwordHash: String         // bcrypt hashed
  isFirstLogin: Boolean        // default: true
  isActive: Boolean            // default: true
  lastLogin: Date
  createdAt: Date
}
```

#### `teacherauthpasswords`
```
{
  staffId: String              // Unique — references staff._id
  passwordHash: String         // bcrypt hashed
  updatedAt: Date
}
```

---

## Frontend Pages & Routes

### Home Page

| Route | Page | Description |
|-------|------|-------------|
| `/` | Home | Landing page with 14 module cards |

### Curriculum Module Routes

#### Login
| Route | Page |
|-------|------|
| `/curriculum/login` | 3-role login selector (Admin / Teacher / Student) |

#### Admin Pages
| Route | Page | Description |
|-------|------|-------------|
| `/curriculum/dashboard` | Dashboard | Module overview |
| `/curriculum/syllabus` | Syllabus | Curriculum management |
| `/curriculum/exams` | Exams | Exam configuration |
| `/curriculum/entry` | Result Entry | Enter exam results |
| `/curriculum/reports` | Result Reports | View result reports |
| `/curriculum/quizzes` | Quizzes | Admin quiz overview |
| `/curriculum/quiz-results` | Quiz Results | Admin quiz results view |
| `/curriculum/teacher-assignments` | Teacher Assignments | Assign teachers to classes |
| `/curriculum/teacher-assignments-view` | Assignments View | Alternative view |
| `/curriculum/student-accounts` | Student Accounts | Manage student portal accounts |

#### Teacher Pages
| Route | Page | Description |
|-------|------|-------------|
| `/curriculum/teacher-dashboard` | Teacher Dashboard | Overview with stats and assigned classes |
| `/curriculum/teacher-content` | Upload Content | Upload and manage study materials |
| `/curriculum/teacher-quizzes` | My Quizzes | Create and manage quizzes |
| `/curriculum/teacher-quiz-results` | Quiz Results | View attempts and grade short answers |

#### Student Pages
| Route | Page | Description |
|-------|------|-------------|
| `/curriculum/student-dashboard` | Student Dashboard | Welcome bar, summary cards, recent activity |
| `/curriculum/student-content` | Study Material | Browse content by subject with viewers |
| `/curriculum/student-quizzes` | My Quizzes | Active/Upcoming/Completed tabs, full-screen quiz taking |
| `/curriculum/student-results` | My Results | Quiz results table with grade badges and detail modal |
| `/curriculum/student-fees` | My Fees | Fee vouchers (read-only) |
| `/curriculum/student-attendance` | Attendance | Month-by-month attendance with circular progress |

---

## User Flows

### Admin Flow

1. Go to `/curriculum/login` and click **Admin Login**
2. Enter credentials: `curriculum@emblazers.com / 12345678`
3. Navigate to **Teacher Assignments** in sidebar
4. Assign a teacher (e.g., Mr. Ali) to Class 5, Section A, Mathematics
5. Navigate to **Student Accounts** in sidebar
6. Select Class 5, Section A and click **Bulk Create Accounts**
7. Accounts are created with default password = each student's DOB in DDMMYYYY format

### Teacher Flow

1. Go to `/curriculum/login` and click **Teacher Login**
2. Enter staff email and default password (Staff ID value)
3. View assigned classes on the dashboard
4. Go to **Upload Content** and upload a PDF/image/note/link
5. Publish the content using the toggle
6. Go to **My Quizzes** and click **Create New Quiz**
7. Configure quiz settings (title, class, section, subject, time slot, passing marks)
8. Add questions (MCQ + True/False + Short Answer)
9. Review and publish the quiz
10. After students take the quiz, go to **Quiz Results**
11. View statistics and grade short-answer questions manually

### Student Flow

1. Go to `/curriculum/login` and click **Student Login**
2. Enter Student ID and DOB-based password
3. On first login, the system forces a password change (minimum 8 characters)
4. View dashboard with summary cards (active quizzes, fees, attendance)
5. Go to **Study Material** to browse teacher-uploaded content by subject
6. Go to **My Quizzes** and click **Start Quiz** on an active quiz
7. Answer questions in full-screen mode with countdown timer
8. Submit quiz and see immediate results (score, percentage, grade, pass/fail)
9. Go to **My Results** to review past quiz attempts with per-question breakdown
10. Go to **My Fees** to check fee payment status
11. Go to **Attendance** to view month-by-month attendance percentage

---

## Build & Deployment

### Development Mode

```bash
npm run dev
```

- Starts Express server with Vite middleware on port 5000
- Hot module replacement (HMR) enabled for frontend changes
- Server automatically restarts on backend changes via `tsx`

### Production Build

```bash
npm run build
```

- **Frontend:** Vite builds React app to `dist/public/`
- **Backend:** esbuild bundles server with dependencies to `dist/index.cjs`
- Selected dependencies are bundled to optimize cold start times

### Deployment

The app is deployed to Replit and accessible at `https://emblazers.replit.app`. In production mode, the Express server serves the pre-built static files from `dist/public/`.

---

## File Storage

The system uses **base64 encoding** for file storage — no external file storage services are used.

### Upload Flow
1. Frontend converts files to base64 using `FileReader` API
2. Base64 string sent to backend in the `fileData` field
3. Stored directly in MongoDB as a string

### Display Flow
- **PDF:** `<iframe src="data:application/pdf;base64,{fileData}">`
- **Image:** `<img src="data:image/{type};base64,{fileData}">`
- **Note:** Rendered as formatted text in a modal
- **Link:** Opens in a new browser tab

### Supported Content Types
| Type | File Input | Display |
|------|-----------|---------|
| `pdf` | `.pdf` files | Embedded iframe viewer |
| `image` | `.jpg, .jpeg, .png` files | Lightbox modal |
| `note` | Text input | Formatted text modal |
| `link` | URL input | New tab redirect |

---

## Grade Calculation

### Backend Utility (`server/utils/grade.ts`)

```
A+ = percentage >= 90
A  = percentage >= 80
B  = percentage >= 70
C  = percentage >= 60
D  = percentage >= 50
F  = percentage < 50
```

### Frontend Utility (`client/src/lib/grade-utils.ts`)

Provides consistent grade badge colors across all pages:

| Grade | Color |
|-------|-------|
| A+ | Purple |
| A | Green |
| B | Blue |
| C | Yellow |
| D | Orange |
| F | Red |

Two exported functions:
- `getGradeColor(grade)` — Returns Tailwind CSS classes for a grade badge
- `getGradeFromPercentage(percentage)` — Returns grade string and color from a percentage

---

## Troubleshooting

### Common Issues

**MongoDB connection fails:**
- Verify `MONGO_URI` environment variable is set correctly
- Check MongoDB Atlas network access rules (whitelist your IP or allow all `0.0.0.0/0`)
- Check the server logs for "MongoDB connected successfully"

**Teacher can't login:**
- Ensure the teacher has active assignments (admin must assign them first)
- Default password is the Staff ID value (check the `staff` collection for the `_id` or custom `staffId`)
- If password was changed, use the new password

**Student can't login:**
- Ensure admin has created a portal account for the student
- Default password is DOB in DDMMYYYY format (e.g., February 9, 2006 = `09022006`)
- Check if the account `isActive` is true

**Quiz won't start for student:**
- Quiz must be published (`isPublished = true`)
- Current time must be between `startDateTime` and `endDateTime`
- Student must not have already submitted the quiz

**"null" attempt ID error on grade-short:**
- The backend validates attempt IDs before processing
- Ensure the attempt ID is a valid 24-character hex string
- This was previously a known issue, now fixed with input validation

**JWT token expired:**
- All tokens (admin, teacher, student) expire after 3 days
- Re-login to get a new token

### Data Flow Diagram

```
Admin creates → Teacher Assignment → Teacher can login
Admin creates → Student Portal Account → Student can login

Teacher uploads → Content → Published → Student sees in Study Material
Teacher creates → Quiz → Published + Active Time → Student can attempt

Student submits → Quiz Attempt → Auto-graded (MCQ/TF)
                                → Pending (Short Answer) → Teacher grades manually
```
