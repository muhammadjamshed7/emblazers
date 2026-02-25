import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { type ModuleType } from "@shared/schema";

interface AuthPayload {
  userId: string;
  email: string;
  role: string;
  module: ModuleType;
  staffId?: string;
  studentId?: string;
  className?: string;
  section?: string;
}

const allModules: ModuleType[] = ["student", "hr", "fee", "payroll", "finance", "attendance", "timetable", "datesheet", "curriculum", "pos", "library", "transport", "hostel"];

const routeToModulesMap: Record<string, ModuleType[]> = {
  "/api/students": ["student", "fee", "attendance", "hostel", "transport", "library", "curriculum"],
  "/api/staff": ["hr", "payroll", "attendance", "timetable", "library", "curriculum"],
  "/api/vacancies": ["hr"],
  "/api/applicants": ["hr"],
  "/api/fee-vouchers": ["fee"],
  "/api/payrolls": ["payroll", "finance"],
  "/api/accounts": ["finance"],
  "/api/finance-vouchers": ["finance"],
  "/api/attendance-records": ["attendance"],
  "/api/attendance/summary": ["attendance"],
  "/api/attendance/report": ["attendance"],
  "/api/timetables": ["timetable"],
  "/api/date-sheets": ["datesheet"],
  "/api/curriculums": ["curriculum"],
  "/api/exams": ["datesheet", "curriculum"],
  "/api/results": ["datesheet", "curriculum"],
  "/api/pos-items": ["pos"],
  "/api/sales": ["pos"],
  "/api/books": ["library"],
  "/api/library-members": ["library"],
  "/api/book-issues": ["library"],
  "/api/book-categories": ["library"],
  "/api/library/statistics": ["library"],
  "/api/library/search-students": ["library"],
  "/api/library/search-staff": ["library"],
  "/api/routes": ["transport"],
  "/api/vehicles": ["transport"],
  "/api/drivers": ["transport"],
  "/api/student-transports": ["transport"],
  "/api/hostel-rooms": ["hostel"],
  "/api/hostel-residents": ["hostel"],
  "/api/hostel-fees": ["hostel"],
  "/api/questions": ["curriculum"],
  "/api/quizzes": ["curriculum"],
  "/api/quiz-attempts": ["curriculum"],
  "/api/notifications": allModules,
  "/api/activity-logs": allModules,
  "/api/bulk/students": ["student"],
  "/api/bulk/fee-vouchers": ["fee"],
  "/api/bulk/results": ["datesheet", "curriculum"],
  "/api/fee-structures": ["fee", "finance"],
  "/api/discount-rules": ["fee", "finance"],
  "/api/late-fee-rules": ["fee", "finance"],
  "/api/installment-plans": ["fee", "finance"],
  "/api/challans": ["fee", "finance"],
  "/api/payments": ["fee", "finance"],
  "/api/vendors": ["finance"],
  "/api/expenses": ["finance"],
  "/api/chart-of-accounts": ["finance"],
  "/api/ledger-entries": ["finance"],
  "/api/journal-entries": ["finance"],
  "/api/finance/dashboard": ["finance"],
  "/api/finance/reports": ["finance"],
  "/api/teacher-assignments": ["curriculum"],
  "/api/teacher-content": ["curriculum"],
  "/api/teacher-quizzes": ["curriculum"],
  "/api/student-quiz-attempts": ["curriculum"],
  "/api/student-portal-accounts": ["curriculum"],
  "/api/curriculum/student-accounts": ["curriculum"],
  "/api/curriculum/student-change-password": ["curriculum"],
};

const publicRoutes = [
  "/api/health",
  "/api/auth/login",
  "/api/public/vacancies",
  "/api/public/applications",
  "/api/curriculum/teacher-login",
  "/api/curriculum/student-login",
];

function getBaseRoute(path: string): string {
  const parts = path.split("/").filter(p => p);

  if (parts[1] === "bulk") {
    return "/" + parts.slice(0, 3).join("/");
  }

  if (parts[1] === "library" && parts.length > 2) {
    return "/" + parts.slice(0, 3).join("/");
  }

  if (parts[1] === "attendance" && parts.length > 2) {
    return "/" + parts.slice(0, 3).join("/");
  }

  if (parts[1] === "finance" && parts.length > 2) {
    return "/" + parts.slice(0, 3).join("/");
  }

  if (parts[1] === "curriculum" && parts.length > 2) {
    return "/" + parts.slice(0, 3).join("/");
  }

  return "/" + parts.slice(0, 2).join("/");
}

export function moduleAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  if (!req.path.startsWith("/api")) {
    return next();
  }

  if (publicRoutes.some(route => req.path === route || req.path.startsWith(route + "/"))) {
    return next();
  }

  if (req.path === "/api/auth/me" || req.path === "/api/auth/change-password") {
    return next();
  }

  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    return res.status(500).json({ error: "Server configuration error" });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as AuthPayload;
    req.user = decoded;

    const baseRoute = getBaseRoute(req.path);
    const allowedModules = routeToModulesMap[baseRoute];

    if (!allowedModules) {
      console.warn(`[Security] Unmapped route accessed: ${req.path} by module ${decoded.module}`);
      return res.status(403).json({
        error: "Access denied: This resource is not accessible"
      });
    }

    if (!allowedModules.includes(decoded.module)) {
      return res.status(403).json({
        error: "Access denied: You do not have permission to access this resource"
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
