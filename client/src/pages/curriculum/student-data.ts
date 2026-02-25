import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  LayoutDashboard,
  FileText,
  ClipboardList,
  BarChart3,
} from "lucide-react";

export const studentNavItems = [
  { label: "Dashboard", path: "/curriculum/student-dashboard", icon: LayoutDashboard },
  { label: "Study Material", path: "/curriculum/student-content", icon: FileText },
  { label: "Quizzes", path: "/curriculum/student-quizzes", icon: ClipboardList },
  { label: "My Results", path: "/curriculum/student-results", icon: BarChart3 },
];

export function useStudentContent(className?: string, section?: string) {
  return useQuery<any[]>({
    queryKey: ['/api/teacher-content', 'student', className, section],
    queryFn: async () => {
      const params = new URLSearchParams({ isPublished: "true" });
      if (className) params.set("className", className);
      if (section) params.set("section", section);
      const res = await fetch(`/api/teacher-content?${params}`, { headers: { Authorization: `Bearer ${localStorage.getItem("emblazers_token")}` } });
      if (!res.ok) throw new Error("Failed to fetch content");
      return res.json();
    },
    enabled: !!className,
  });
}

export function useStudentQuizzes(className?: string, section?: string) {
  return useQuery<any[]>({
    queryKey: ['/api/teacher-quizzes', 'student', className, section],
    queryFn: async () => {
      const params = new URLSearchParams({ isPublished: "true" });
      if (className) params.set("className", className);
      if (section) params.set("section", section);
      const res = await fetch(`/api/teacher-quizzes?${params}`, { headers: { Authorization: `Bearer ${localStorage.getItem("emblazers_token")}` } });
      if (!res.ok) throw new Error("Failed to fetch quizzes");
      return res.json();
    },
    enabled: !!className,
  });
}

export function useStudentQuizAttempts(studentId?: string) {
  const { data = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/student-quiz-attempts', studentId],
    queryFn: async () => {
      const res = await fetch(`/api/student-quiz-attempts?studentId=${studentId}`, { headers: { Authorization: `Bearer ${localStorage.getItem("emblazers_token")}` } });
      if (!res.ok) throw new Error("Failed to fetch attempts");
      return res.json();
    },
    enabled: !!studentId,
  });

  const submitMutation = useMutation({
    mutationFn: async (attemptData: any) => {
      const res = await apiRequest('POST', '/api/student-quiz-attempts', attemptData);
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/student-quiz-attempts', studentId] }),
  });

  return {
    attempts: data,
    isLoading,
    submitAttempt: (d: any) => submitMutation.mutateAsync(d),
    isPending: submitMutation.isPending,
  };
}
