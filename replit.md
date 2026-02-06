# Emblazers - School Management System

## Overview

Emblazers is a comprehensive school management system designed to handle 12 administrative modules across student management, HR, finance, academics, and facilities. The application follows a modular architecture where each department (Students, HR, Fees, Payroll, Finance, Timetable, DateSheet, Curriculum, POS, Library, Transport, Hostel) operates as an independent module with its own authentication, dashboard, and feature set.

The system is built as a full-stack TypeScript application using React for the frontend and Express for the backend, with a focus on creating a professional, information-dense admin interface suitable for school administrators.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (February 2026)

### Attendance Module Removal
- Attendance module has been completely removed from the codebase (frontend pages, backend routes, storage methods, models, schemas, middleware, seed data)
- System now operates with 12 modules: Student, HR, Fee, Payroll, Finance, Timetable, DateSheet, Curriculum, POS, Library, Transport, Hostel
- Student and Staff profile pages updated to remove attendance tabs
- Validation references cleaned up in checkStudentReferences

## Previous Changes (January 2026)

### Module CRUD Fixes
The following modules have been updated with working dialog-based CRUD operations:

**POS Module:**
- `pos/items.tsx` - Full add/edit items with dialog forms
- `pos/new.tsx` - Complete cart management and sale completion
- `POSItem.ts` model aligned to use `itemCode` field (not `itemId`)

**Hostel Module:**
- `hostel/rooms.tsx` - Full add/edit rooms with dialog forms
- `hostel/residents.tsx` - Full add/edit residents with proper schema fields
- `Room.ts` model aligned with schema (hostelName, roomNumber, bedCount, occupiedBeds, status)

**Curriculum Module:**
- `curriculum/exams.tsx` - Full add/edit exams with dialog forms
- Added `updateExam` function and `terms` export to curriculum-data.ts

**DateSheet Module:**
- `datesheet/create.tsx` - Complete form with dynamic subject entries using correct schema fields (examName, entries)

### Schema Alignment Notes
- All MongoDB models have been aligned with Zod schemas in `shared/schema.ts`
- CRUD operations use async/await with try-catch error handling
- Dialog forms close and show success toast on successful save

## System Architecture

### Frontend Architecture

**Framework & Build System:**
- React 18 with TypeScript for type safety
- Vite as the build tool and development server with Hot Module Replacement (HMR)
- Wouter for lightweight client-side routing
- React Query (TanStack Query) for server state management with disabled automatic refetching

**UI Component System:**
- Radix UI primitives for accessible, unstyled components
- shadcn/ui component library (New York style variant) for consistent design
- Tailwind CSS for utility-first styling with custom design tokens
- Class Variance Authority (CVA) for component variant management

**Design System:**
- Professional admin dashboard aesthetic inspired by Linear, Notion, and Vercel
- Consistent spacing scale using Tailwind units (2, 4, 6, 8, 12, 16)
- Typography using Inter (UI text) and JetBrains Mono (codes/numbers)
- Custom color system with HSL values for light/dark theme support
- Fixed sidebar width (240px/16rem) with collapsible mobile variant

**State Management:**
- Local authentication context using React Context API
- Session data stored in localStorage
- Theme preferences managed via ThemeProvider context
- No global state library - relies on React Query for server state

**Module Structure:**
- Each module is self-contained under its own route namespace (e.g., `/student`, `/hr`, `/fee`)
- Shared layout components: `ModuleLayout` (authenticated pages) and `ModuleLogin` (login pages)
- Reusable components: `DataTable`, `StatsCard`, `RecentTable`, `PageHeader`
- Module-specific navigation configured via `module-config.ts`

### Backend Architecture

**Server Framework:**
- Express.js running on Node.js
- TypeScript for type safety across the stack
- HTTP server (no WebSocket implementation currently)
- Static file serving for the built React application

**API Design:**
- RESTful API endpoints under `/api` prefix
- JWT-based authentication via POST `/api/auth/login` with 2-hour token expiry
- Module-specific credentials: {module}@emblazers.com / 12345678
- Module-based routing with CRUD operations for each entity type
- JSON request/response format
- Request logging middleware tracking method, path, status, and duration

**Security Middleware:**
- `moduleAuthMiddleware` - Global middleware that:
  - Validates JWT tokens on all /api routes (except /api/health, /api/auth/login)
  - Enforces module isolation via route-to-module mapping
  - Fails closed (denies unmapped routes by default)
  - Returns 401 for missing/invalid tokens, 403 for unauthorized module access

**Data Layer:**
- MongoDB Atlas as primary database (connected via MONGO_URI secret)
- Mongoose ODM for data modeling and validation
- MongoStorage class implements IStorage interface
- Schema definitions using Zod for API validation
- All entity types defined in `shared/schema.ts` with insert/select type separation

**Development vs Production:**
- Development: Vite middleware integrated into Express for HMR
- Production: Pre-built static files served from `dist/public`
- Environment-specific behavior controlled via `NODE_ENV`

### Data Model

**Core Entities:**
- **Students:** ID, personal info, family contacts, class/section, admission status
- **Staff:** ID, personal info, designation, department, employment details
- **Fee Vouchers:** Student-linked, monthly/period-based, itemized fee heads
- **Payroll:** Staff-linked, monthly salary records with allowances/deductions
- **Finance:** Chart of accounts, vouchers (receipts/payments), ledgers
- **Attendance:** Records for both students and staff, date-based tracking
- **Timetable:** Class schedules, period allocations, teacher assignments
- **Library:** Books, members, issue/return tracking
- **Transport:** Routes, vehicles, drivers, student assignments
- **Hostel:** Rooms, residents, hostel-specific fees

**Cross-Module References:**
- Student IDs referenced by Fees, Attendance, Exams, Library, Transport, Hostel
- Staff IDs referenced by Payroll, Attendance, HR, Exams (invigilators)
- Class/Section used across Students, Fees, Attendance, Timetable, Exams

### Authentication & Authorization

**JWT-Based Authentication System:**
- Module-specific credentials: {module}@emblazers.com / 12345678 for all 13 modules
- JWT tokens with 2-hour expiry containing userId, email, role, and module
- Token stored client-side in localStorage as `emblazers_token`
- Session stored client-side in localStorage as `emblazers_session`
- Token validated server-side on every protected API request

**Module Isolation:**
- Each module has strict route-to-module mapping in `moduleAuthMiddleware`
- Users can only access API routes assigned to their logged-in module
- Cross-module access returns 403 Forbidden
- Unmapped routes are denied by default (fail-closed security)

**Password Management:**
- Module users can change passwords via sidebar "Change Password" button
- Passwords are hashed using bcrypt (10 salt rounds) before storage
- ModuleUser collection stores custom passwords in MongoDB
- Login checks database password first, falls back to default if not set
- POST /api/auth/change-password endpoint validates current password before updating

**Access Control:**
- Module-level access via `AuthProvider` context
- `isAuthenticated(module)` checks current session against required module
- Automatic logout on 401 responses via `forceLogout` function
- Logout clears localStorage session and token

### Build & Deployment

**Build Process:**
- Custom build script (`script/build.ts`) using esbuild for server and Vite for client
- Server bundled with selected dependencies (allowlist approach) to reduce cold start time
- Client assets output to `dist/public`
- Server bundled to `dist/index.cjs`

**Development Workflow:**
- `npm run dev`: Runs Express server with Vite middleware
- `npm run build`: Builds both client and server for production
- `npm start`: Runs production server from bundled files
- `npm run check`: TypeScript type checking
- `npm run db:push`: Drizzle schema push (currently not used)

## External Dependencies

### UI & Styling
- **Radix UI:** Comprehensive primitive component library (@radix-ui/react-*)
- **Tailwind CSS:** Utility-first CSS framework with PostCSS
- **shadcn/ui:** Pre-built component patterns
- **Lucide React:** Icon library
- **class-variance-authority:** Component variant management
- **clsx + tailwind-merge:** Class name utilities

### Data & Validation
- **Zod:** Runtime type validation and schema definition
- **Drizzle ORM:** SQL query builder and schema management (PostgreSQL dialect)
- **drizzle-zod:** Zod schema generation from Drizzle schemas
- **date-fns:** Date manipulation and formatting

### State & Async
- **TanStack React Query:** Server state management and caching
- **React Hook Form:** Form state management
- **@hookform/resolvers:** Validation resolver for Zod integration

### Server
- **Express:** Web application framework
- **connect-pg-simple:** PostgreSQL session store (configured but unused)
- **nanoid:** Unique ID generation

### Development Tools
- **Vite:** Frontend build tool and dev server
- **tsx:** TypeScript execution for Node.js
- **esbuild:** Fast JavaScript bundler for production server
- **Replit plugins:** Development enhancements for Replit environment

### Database
- **MongoDB Atlas:** Primary database for all entity storage (via MONGO_URI secret)
- **Mongoose:** ODM for MongoDB with schema validation
- **PostgreSQL:** Available but not currently used (DATABASE_URL configured)