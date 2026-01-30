import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { type ModuleType } from "@shared/schema";

export interface AuthPayload {
  userId: string;
  email: string;
  role: string;
  module: ModuleType;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export function authenticateToken(req: Request, res: Response, next: NextFunction) {
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
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function requireModule(...allowedModules: ModuleType[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (!allowedModules.includes(req.user.module)) {
      return res.status(403).json({ 
        error: "Access denied: You do not have permission to access this module",
        currentModule: req.user.module,
        requiredModules: allowedModules
      });
    }

    next();
  };
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    next();
  };
}
