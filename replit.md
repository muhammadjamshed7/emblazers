# Emblazers - School Management System

## Overview

Emblazers is a comprehensive school management system designed to manage 13 administrative modules across student management, HR, finance, academics, and facilities. Each department (Students, HR, Fees, Payroll, Finance, Attendance, Timetable, DateSheet, Curriculum, POS, Library, Transport, Hostel) operates as an independent module with its own authentication, dashboard, and feature set. The system aims to provide a professional, information-dense admin interface for school administrators.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The frontend is built with React 18 and TypeScript, utilizing Vite for development and bundling. Wouter handles client-side routing, and React Query manages server state. UI components are built using Radix UI primitives and shadcn/ui (New York style) with Tailwind CSS for styling. The design system emphasizes a professional admin dashboard aesthetic with consistent spacing, typography (Inter, JetBrains Mono), and a custom HSL-based color system supporting light/dark themes. Each module is self-contained with its own route namespace, using shared layout and reusable components. Authentication is managed via React Context API, with session data and theme preferences stored locally.

### Backend Architecture
The backend is an Express.js application built with Node.js and TypeScript, exposing RESTful API endpoints under the `/api` prefix. JWT-based authentication secures the API, with module-specific credentials and a 2-hour token expiry. A global `moduleAuthMiddleware` enforces module isolation, validating JWT tokens and restricting access based on the user's module, operating in a fail-closed manner. MongoDB Atlas is the primary database, accessed via Mongoose ODM, with Zod used for API validation and schema definitions. The system distinguishes between development (Vite middleware integration) and production (serving pre-built static files) environments.

### Data Model
Core entities include Students, Staff, Fee Vouchers, Payroll, Finance, Attendance, Timetable, Library, Transport, and Hostel. Cross-module references are established, such as Student IDs being referenced by Fees, Attendance, and other modules, and Staff IDs by Payroll and HR.

### Authentication & Authorization
The system uses JWT-based authentication with module-specific credentials ({module}@emblazers.com / 12345678). JWT tokens, containing user and module information, expire in 2 hours and are stored client-side. The `moduleAuthMiddleware` enforces strict module isolation, ensuring users only access API routes assigned to their logged-in module, with unmapped routes denied by default. Passwords are hashed using bcrypt and stored in the ModuleUser collection, allowing users to change their passwords.

### Curriculum Multi-Role System
The Curriculum module supports 3 user roles with separate login flows:
- **Admin**: Standard module login (curriculum@emblazers.com / 12345678), full access to curriculum management plus Teacher Assignments and Student Accounts pages. Admin routes: `/api/curriculum/staff-teachers`, `/api/curriculum/teacher-assignments`, `/api/curriculum/student-accounts/*`, `/api/curriculum/quiz-overview`.
- **Teacher**: Logs in via staff email + default password = staffId (e.g. "STF-2024-001") at `POST /api/teacher/login`. Must have active TeacherAssignment records. Gets dedicated dashboard, content upload, and quiz creation pages. Teacher routes: `/api/teacher/my-assignments`, `/api/teacher/content`, `/api/teacher/quizzes`, `/api/teacher/quizzes/:id/toggle-publish`, `/api/teacher/quizzes/:id/attempts`, `/api/teacher/quizzes/:id/attempts/:attemptId/grade-short`, `/api/teacher/change-password`.
- **Student**: Logs in via Student ID + password at `POST /api/curriculum/student-login`. Default password is DOB in DDMMYYYY format (bcrypt hashed). Portal accounts created by admin. Gets dashboard, study material (via `/api/curriculum/published-content`), quizzes (via `/api/curriculum/published-quizzes`), and results pages.

New Mongoose models: TeacherAssignment, TeacherContent, TeacherQuiz, StudentQuizAttempt, StudentPortalAccount. Frontend pages under `/curriculum/teacher-*` and `/curriculum/student-*` with role-specific nav items and ModuleLayout.

### Build & Deployment
A custom build script uses esbuild for the server and Vite for the client, bundling the server with selected dependencies to optimize cold start times. Client assets are output to `dist/public`, and the server to `dist/index.cjs`.

## External Dependencies

### UI & Styling
- **Radix UI:** Primitive component library.
- **Tailwind CSS:** Utility-first CSS framework.
- **shadcn/ui:** Pre-built component patterns.
- **Lucide React:** Icon library.
- **class-variance-authority:** Component variant management.
- **clsx + tailwind-merge:** Class name utilities.

### Data & Validation
- **Zod:** Runtime type validation and schema definition.
- **date-fns:** Date manipulation and formatting.

### State & Async
- **TanStack React Query:** Server state management and caching.
- **React Hook Form:** Form state management.
- **@hookform/resolvers:** Validation resolver for Zod integration.

### Server
- **Express:** Web application framework.
- **nanoid:** Unique ID generation.

### Development Tools
- **Vite:** Frontend build tool and dev server.
- **tsx:** TypeScript execution for Node.js.
- **esbuild:** Fast JavaScript bundler.

### Database
- **MongoDB Atlas:** Primary database.
- **Mongoose:** ODM for MongoDB.