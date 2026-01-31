import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import {
  type ModuleType,
  type AuthSession,
  type UserRole,
  type PermissionAction,
  rolePermissions
} from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

const TOKEN_KEY = "emblazers_token";
const SESSION_KEY = "emblazers_session";

interface AuthContextType {
  session: AuthSession | null;
  token: string | null;
  login: (module: ModuleType, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: (module: ModuleType) => boolean;
  hasPermission: (action: PermissionAction) => boolean;
  canCreate: () => boolean;
  canEdit: () => boolean;
  canDelete: () => boolean;
  userRole: UserRole | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem(TOKEN_KEY);
  });

  const [session, setSession] = useState<AuthSession | null>(() => {
    const stored = localStorage.getItem(SESSION_KEY);
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }, [token]);

  useEffect(() => {
    if (session) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  }, [session]);

  const login = async (module: ModuleType, email: string, password: string): Promise<boolean> => {
    try {
      const response = await apiRequest("POST", "/api/auth/login", { module, email, password });
      const data = await response.json();

      if (data.success && data.token) {
        const userRole = (data.user?.role || "admin") as UserRole;

        const newSession: AuthSession = {
          module,
          email: data.user?.email || email,
          name: data.user?.name || `${module} Admin`,
          role: userRole,
          loggedIn: true,
          loginTime: new Date().toISOString(),
        };

        // Store session permanently - no expiry, only manual logout
        localStorage.setItem(TOKEN_KEY, data.token);
        localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));

        setToken(data.token);
        setSession(newSession);

        return true;
      }

      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const logout = () => {
    setToken(null);
    setSession(null);
  };

  // Session is valid if it exists and has correct structure
  // NO automatic expiry - sessions last until manual logout
  const isAuthenticated = (module: ModuleType): boolean => {
    if (!session || !token) return false;
    return session.module === module && session.loggedIn === true;
  };

  const hasPermission = (action: PermissionAction): boolean => {
    if (!session?.role) return false;
    const permissions = rolePermissions[session.role];
    return permissions?.includes(action) ?? false;
  };

  const canCreate = (): boolean => hasPermission("create");
  const canEdit = (): boolean => hasPermission("edit");
  const canDelete = (): boolean => hasPermission("delete");

  const userRole = session?.role ?? null;

  return (
    <AuthContext.Provider value={{
      session,
      token,
      login,
      logout,
      isAuthenticated,
      hasPermission,
      canCreate,
      canEdit,
      canDelete,
      userRole
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function forceLogout(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(SESSION_KEY);
  window.location.href = "/";
}

export function PermissionGate({
  action,
  children,
  fallback = null
}: {
  action: PermissionAction;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { hasPermission } = useAuth();
  return hasPermission(action) ? <>{children}</> : <>{fallback}</>;
}

export function CanCreate({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return <PermissionGate action="create" fallback={fallback}>{children}</PermissionGate>;
}

export function CanEdit({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return <PermissionGate action="edit" fallback={fallback}>{children}</PermissionGate>;
}

export function CanDelete({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return <PermissionGate action="delete" fallback={fallback}>{children}</PermissionGate>;
}
