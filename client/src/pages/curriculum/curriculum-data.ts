import { useQuery, useMutation } from "@tanstack/react-query";
import { type Curriculum, type Exam, type Result, type InsertCurriculum, type InsertExam, type InsertResult, type Staff } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  FileEdit,
  FileText,
} from "lucide-react";

export const curriculumNavItems = [
  { label: "Dashboard", path: "/curriculum/dashboard", icon: LayoutDashboard },
  { label: "Curriculum", path: "/curriculum/syllabus", icon: BookOpen },
  { label: "Exams", path: "/curriculum/exams", icon: GraduationCap },
  { label: "Result Entry", path: "/curriculum/entry", icon: FileEdit },
  { label: "Result Reports", path: "/curriculum/reports", icon: FileText },
];

export function useCurriculumData() {
  const { data: curriculum = [], isLoading: curriculumLoading, error: curriculumError } = useQuery<Curriculum[]>({
    queryKey: ['/api/curriculums']
  });

  const { data: exams = [], isLoading: examsLoading, error: examsError } = useQuery<Exam[]>({
    queryKey: ['/api/exams']
  });

  const { data: results = [], isLoading: resultsLoading, error: resultsError } = useQuery<Result[]>({
    queryKey: ['/api/results']
  });

  // Fetch teachers from HR module
  const { data: staff = [], isLoading: staffLoading } = useQuery<Staff[]>({
    queryKey: ['/api/staff']
  });

  const createCurriculumMutation = useMutation({
    mutationFn: async (data: InsertCurriculum) => {
      const res = await apiRequest('POST', '/api/curriculums', data);
      return res.json() as Promise<Curriculum>;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/curriculums'] })
  });

  const updateCurriculumMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Curriculum> }) => {
      const res = await apiRequest('PATCH', `/api/curriculums/${id}`, updates);
      return res.json() as Promise<Curriculum>;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/curriculums'] })
  });

  const createExamMutation = useMutation({
    mutationFn: async (data: InsertExam) => {
      const res = await apiRequest('POST', '/api/exams', data);
      return res.json() as Promise<Exam>;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/exams'] })
  });

  const updateExamMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Exam> }) => {
      const res = await apiRequest('PATCH', `/api/exams/${id}`, updates);
      return res.json() as Promise<Exam>;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/exams'] })
  });

  const createResultMutation = useMutation({
    mutationFn: async (data: InsertResult) => {
      const res = await apiRequest('POST', '/api/results', data);
      return res.json() as Promise<Result>;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/results'] })
  });

  const updateResultMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Result> }) => {
      const res = await apiRequest('PATCH', `/api/results/${id}`, updates);
      return res.json() as Promise<Result>;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/results'] })
  });

  const addCurriculum = async (item: InsertCurriculum): Promise<Curriculum> => {
    return await createCurriculumMutation.mutateAsync(item);
  };

  const updateCurriculum = async (id: string, updates: Partial<Curriculum>) => {
    await updateCurriculumMutation.mutateAsync({ id, updates });
  };

  const addExam = async (exam: InsertExam): Promise<Exam> => {
    return await createExamMutation.mutateAsync(exam);
  };

  const updateExam = async (id: string, updates: Partial<Exam>) => {
    await updateExamMutation.mutateAsync({ id, updates });
  };

  const addResult = async (result: InsertResult): Promise<Result> => {
    return await createResultMutation.mutateAsync(result);
  };

  const updateResult = async (id: string, updates: Partial<Result>) => {
    await updateResultMutation.mutateAsync({ id, updates });
  };

  const refreshResults = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/results'] });
  };

  return {
    curriculum,
    exams,
    results,
    staff,
    teachers: staff.filter(s => s.designation?.toLowerCase().includes('teacher') || s.designation?.toLowerCase().includes('professor') || s.designation?.toLowerCase().includes('instructor')),
    addCurriculum,
    updateCurriculum,
    addExam,
    updateExam,
    addResult,
    updateResult,
    refreshResults,
    isLoading: curriculumLoading || examsLoading || resultsLoading || staffLoading,
    error: curriculumError ?? examsError ?? resultsError,
    isPending: createCurriculumMutation.isPending || updateCurriculumMutation.isPending || createExamMutation.isPending || updateExamMutation.isPending || createResultMutation.isPending || updateResultMutation.isPending
  };
}

export const classes = ["Class 1", "Class 2", "Class 3", "Class 4", "Class 5", "Class 6"];
export const subjects = ["Math", "English", "Science", "Urdu", "Islamiat", "Computer", "Art", "PT"];
export const topicStatuses = ["Not Started", "In Progress", "Completed"] as const;
export const grades = ["A+", "A", "B+", "B", "C+", "C", "D", "F"];
export const terms = ["Term 1", "Term 2", "Term 3", "Final"] as const;
