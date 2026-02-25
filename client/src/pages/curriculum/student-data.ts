import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  LayoutDashboard,
  FileText,
  ClipboardList,
  BarChart3,
  CreditCard,
  CalendarCheck,
} from "lucide-react";

export const studentNavItems = [
  { label: "Dashboard", path: "/curriculum/student-dashboard", icon: LayoutDashboard },
  { label: "Study Material", path: "/curriculum/student-content", icon: FileText },
  { label: "Quizzes", path: "/curriculum/student-quizzes", icon: ClipboardList },
  { label: "My Results", path: "/curriculum/student-results", icon: BarChart3 },
  { label: "Fees", path: "/curriculum/student-fees", icon: CreditCard },
  { label: "Attendance", path: "/curriculum/student-attendance", icon: CalendarCheck },
];

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("emblazers_token")}` });

export function useStudentDashboard() {
  return useQuery<any>({
    queryKey: ['/api/student-portal/dashboard'],
    queryFn: async () => {
      const res = await fetch('/api/student-portal/dashboard', { headers: authHeaders() });
      if (!res.ok) throw new Error("Failed to fetch dashboard");
      return res.json();
    },
  });
}

export function useStudentContent() {
  return useQuery<any>({
    queryKey: ['/api/student-portal/content'],
    queryFn: async () => {
      const res = await fetch('/api/student-portal/content', { headers: authHeaders() });
      if (!res.ok) throw new Error("Failed to fetch content");
      return res.json();
    },
  });
}

export function useStudentQuizzes() {
  return useQuery<any[]>({
    queryKey: ['/api/student-portal/quizzes'],
    queryFn: async () => {
      const res = await fetch('/api/student-portal/quizzes', { headers: authHeaders() });
      if (!res.ok) throw new Error("Failed to fetch quizzes");
      return res.json();
    },
  });
}

export function useStartQuiz(quizId: string) {
  return useQuery<any>({
    queryKey: ['/api/student-portal/quizzes', quizId, 'start'],
    queryFn: async () => {
      const res = await fetch(`/api/student-portal/quizzes/${quizId}/start`, { headers: authHeaders() });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Cannot start quiz");
      }
      return res.json();
    },
    enabled: !!quizId,
  });
}

export function useSubmitQuiz() {
  return useMutation({
    mutationFn: async ({ quizId, answers, timeTakenMinutes }: { quizId: string; answers: any[]; timeTakenMinutes: number }) => {
      const res = await apiRequest('POST', `/api/student-portal/quizzes/${quizId}/submit`, { answers, timeTakenMinutes });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/student-portal/quizzes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/student-portal/results'] });
      queryClient.invalidateQueries({ queryKey: ['/api/student-portal/dashboard'] });
    },
  });
}

export function useStudentResults() {
  return useQuery<any[]>({
    queryKey: ['/api/student-portal/results'],
    queryFn: async () => {
      const res = await fetch('/api/student-portal/results', { headers: authHeaders() });
      if (!res.ok) throw new Error("Failed to fetch results");
      return res.json();
    },
  });
}

export function useStudentFees() {
  return useQuery<any[]>({
    queryKey: ['/api/student-portal/fees'],
    queryFn: async () => {
      const res = await fetch('/api/student-portal/fees', { headers: authHeaders() });
      if (!res.ok) throw new Error("Failed to fetch fees");
      return res.json();
    },
  });
}

export function useStudentAttendance() {
  return useQuery<any[]>({
    queryKey: ['/api/student-portal/attendance'],
    queryFn: async () => {
      const res = await fetch('/api/student-portal/attendance', { headers: authHeaders() });
      if (!res.ok) throw new Error("Failed to fetch attendance");
      return res.json();
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) => {
      const res = await apiRequest('POST', '/api/student-portal/change-password', { currentPassword, newPassword });
      return res.json();
    },
  });
}
