import { useQuery, useMutation } from "@tanstack/react-query";
import { type Curriculum, type Exam, type Result, type InsertCurriculum, type InsertExam, type InsertResult, type Staff, type Question, type InsertQuestion, type Quiz, type InsertQuiz, type QuizAttempt, type InsertQuizAttempt } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  FileEdit,
  FileText,
  ClipboardList,
  BarChart3,
} from "lucide-react";

export const curriculumNavItems = [
  { label: "Dashboard", path: "/curriculum/dashboard", icon: LayoutDashboard },
  { label: "Curriculum", path: "/curriculum/syllabus", icon: BookOpen },
  { label: "Exams", path: "/curriculum/exams", icon: GraduationCap },
  { label: "Result Entry", path: "/curriculum/entry", icon: FileEdit },
  { label: "Result Reports", path: "/curriculum/reports", icon: FileText },
  { label: "Quizzes", path: "/curriculum/quizzes", icon: ClipboardList },
  { label: "Quiz Results", path: "/curriculum/quiz-results", icon: BarChart3 },
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

export function useQuizData() {
  const { data: questions = [], isLoading: questionsLoading } = useQuery<Question[]>({
    queryKey: ['/api/questions']
  });

  const { data: quizzes = [], isLoading: quizzesLoading } = useQuery<Quiz[]>({
    queryKey: ['/api/quizzes']
  });

  const { data: attempts = [], isLoading: attemptsLoading } = useQuery<QuizAttempt[]>({
    queryKey: ['/api/quiz-attempts']
  });

  const createQuestionMutation = useMutation({
    mutationFn: async (data: InsertQuestion) => {
      const res = await apiRequest('POST', '/api/questions', data);
      return res.json() as Promise<Question>;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/questions'] })
  });

  const updateQuestionMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Question> }) => {
      const res = await apiRequest('PATCH', `/api/questions/${id}`, updates);
      return res.json() as Promise<Question>;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/questions'] })
  });

  const deleteQuestionMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/questions/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/questions'] })
  });

  const createQuizMutation = useMutation({
    mutationFn: async (data: InsertQuiz) => {
      const res = await apiRequest('POST', '/api/quizzes', data);
      return res.json() as Promise<Quiz>;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/quizzes'] })
  });

  const updateQuizMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Quiz> }) => {
      const res = await apiRequest('PATCH', `/api/quizzes/${id}`, updates);
      return res.json() as Promise<Quiz>;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/quizzes'] })
  });

  const deleteQuizMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/quizzes/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/quizzes'] })
  });

  const submitAttemptMutation = useMutation({
    mutationFn: async (data: InsertQuizAttempt) => {
      const res = await apiRequest('POST', '/api/quiz-attempts', data);
      return res.json() as Promise<QuizAttempt>;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/quiz-attempts'] })
  });

  const updateAttemptMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<QuizAttempt> }) => {
      const res = await apiRequest('PATCH', `/api/quiz-attempts/${id}`, updates);
      return res.json() as Promise<QuizAttempt>;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/quiz-attempts'] })
  });

  return {
    questions,
    quizzes,
    attempts,
    isLoading: questionsLoading || quizzesLoading || attemptsLoading,
    addQuestion: (q: InsertQuestion) => createQuestionMutation.mutateAsync(q),
    updateQuestion: (id: string, updates: Partial<Question>) => updateQuestionMutation.mutateAsync({ id, updates }),
    deleteQuestion: (id: string) => deleteQuestionMutation.mutateAsync(id),
    addQuiz: (q: InsertQuiz) => createQuizMutation.mutateAsync(q),
    updateQuiz: (id: string, updates: Partial<Quiz>) => updateQuizMutation.mutateAsync({ id, updates }),
    deleteQuiz: (id: string) => deleteQuizMutation.mutateAsync(id),
    submitAttempt: (a: InsertQuizAttempt) => submitAttemptMutation.mutateAsync(a),
    updateAttempt: (id: string, updates: Partial<QuizAttempt>) => updateAttemptMutation.mutateAsync({ id, updates }),
    isPending: createQuestionMutation.isPending || createQuizMutation.isPending || submitAttemptMutation.isPending || updateQuizMutation.isPending || updateQuestionMutation.isPending || updateAttemptMutation.isPending,
  };
}

export const classes = ["Class 1", "Class 2", "Class 3", "Class 4", "Class 5", "Class 6"];
export const subjects = ["Math", "English", "Science", "Urdu", "Islamiat", "Computer", "Art", "PT"];
export const topicStatuses = ["Not Started", "In Progress", "Completed"] as const;
export const grades = ["A+", "A", "B+", "B", "C+", "C", "D", "F"];
export const terms = ["Term 1", "Term 2", "Term 3", "Final"] as const;
export const questionTypes = ["MCQ", "TrueFalse", "ShortAnswer"] as const;
export const difficultyLevels = ["Easy", "Medium", "Hard"] as const;
