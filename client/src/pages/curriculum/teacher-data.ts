import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  LayoutDashboard,
  FileText,
  ClipboardList,
} from "lucide-react";

export const teacherNavItems = [
  { label: "Dashboard", path: "/curriculum/teacher-dashboard", icon: LayoutDashboard },
  { label: "My Content", path: "/curriculum/teacher-content", icon: FileText },
  { label: "My Quizzes", path: "/curriculum/teacher-quizzes", icon: ClipboardList },
];

export function useTeacherAssignments(staffId?: string) {
  return useQuery<any[]>({
    queryKey: ['/api/teacher-assignments', staffId],
    queryFn: async () => {
      const url = staffId ? `/api/teacher-assignments?staffId=${staffId}` : '/api/teacher-assignments';
      const res = await fetch(url, { headers: { Authorization: `Bearer ${localStorage.getItem("emblazers_token")}` } });
      if (!res.ok) throw new Error("Failed to fetch assignments");
      return res.json();
    },
    enabled: !!staffId,
  });
}

export function useTeacherContent(staffId?: string) {
  const { data = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/teacher-content', staffId],
    queryFn: async () => {
      const url = staffId ? `/api/teacher-content?staffId=${staffId}` : '/api/teacher-content';
      const res = await fetch(url, { headers: { Authorization: `Bearer ${localStorage.getItem("emblazers_token")}` } });
      if (!res.ok) throw new Error("Failed to fetch content");
      return res.json();
    },
    enabled: !!staffId,
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest('POST', '/api/teacher-content', data);
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/teacher-content', staffId] }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const res = await apiRequest('PATCH', `/api/teacher-content/${id}`, updates);
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/teacher-content', staffId] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/teacher-content/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/teacher-content', staffId] }),
  });

  return {
    content: data,
    isLoading,
    createContent: (d: any) => createMutation.mutateAsync(d),
    updateContent: (id: string, updates: any) => updateMutation.mutateAsync({ id, updates }),
    deleteContent: (id: string) => deleteMutation.mutateAsync(id),
    isPending: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
  };
}

export function useTeacherQuizzes(staffId?: string) {
  const { data = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/teacher-quizzes', staffId],
    queryFn: async () => {
      const url = staffId ? `/api/teacher-quizzes?staffId=${staffId}` : '/api/teacher-quizzes';
      const res = await fetch(url, { headers: { Authorization: `Bearer ${localStorage.getItem("emblazers_token")}` } });
      if (!res.ok) throw new Error("Failed to fetch quizzes");
      return res.json();
    },
    enabled: !!staffId,
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest('POST', '/api/teacher-quizzes', data);
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/teacher-quizzes', staffId] }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const res = await apiRequest('PATCH', `/api/teacher-quizzes/${id}`, updates);
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/teacher-quizzes', staffId] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/teacher-quizzes/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/teacher-quizzes', staffId] }),
  });

  const { data: attempts = [] } = useQuery<any[]>({
    queryKey: ['/api/student-quiz-attempts'],
    queryFn: async () => {
      const res = await fetch('/api/student-quiz-attempts', { headers: { Authorization: `Bearer ${localStorage.getItem("emblazers_token")}` } });
      if (!res.ok) throw new Error("Failed to fetch attempts");
      return res.json();
    },
  });

  return {
    quizzes: data,
    attempts,
    isLoading,
    createQuiz: (d: any) => createMutation.mutateAsync(d),
    updateQuiz: (id: string, updates: any) => updateMutation.mutateAsync({ id, updates }),
    deleteQuiz: (id: string) => deleteMutation.mutateAsync(id),
    isPending: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
  };
}
