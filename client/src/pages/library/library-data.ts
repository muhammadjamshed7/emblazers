import { useQuery, useMutation } from "@tanstack/react-query";
import { type Book, type BookIssue, type InsertBook, type InsertBookIssue, type Student, type Staff, type BookCategory, type InsertBookCategory } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  LayoutDashboard,
  BookOpen,
  BookMarked,
  FileText,
} from "lucide-react";

export const libraryNavItems = [
  { label: "Dashboard", path: "/library/dashboard", icon: LayoutDashboard },
  { label: "Books", path: "/library/books", icon: BookOpen },
  { label: "Issue / Return", path: "/library/issue", icon: BookMarked },
  { label: "Reports", path: "/library/reports", icon: FileText },
];

export function useLibraryData() {
  const { data: books = [], isLoading: booksLoading, error: booksError } = useQuery<Book[]>({
    queryKey: ['/api/books']
  });

  const { data: categories = [], isLoading: categoriesLoading } = useQuery<BookCategory[]>({
    queryKey: ['/api/book-categories']
  });

  const { data: issues = [], isLoading: issuesLoading, error: issuesError } = useQuery<BookIssue[]>({
    queryKey: ['/api/book-issues']
  });

  const { data: statistics } = useQuery<{
    totalBooks: number;
    issuedBooks: number;
    availableBooks: number;
    overdueBooks: number;
    totalFines: number;
    pendingFines: number;
    categoryCounts: { category: string; count: number }[];
  }>({
    queryKey: ['/api/library/statistics']
  });

  const createBookMutation = useMutation({
    mutationFn: async (data: InsertBook) => {
      const res = await apiRequest('POST', '/api/books', data);
      return res.json() as Promise<Book>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/books'] });
      queryClient.invalidateQueries({ queryKey: ['/api/library/statistics'] });
    }
  });

  const updateBookMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Book> }) => {
      const res = await apiRequest('PATCH', `/api/books/${id}`, updates);
      return res.json() as Promise<Book>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/books'] });
      queryClient.invalidateQueries({ queryKey: ['/api/library/statistics'] });
    }
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (data: InsertBookCategory) => {
      const res = await apiRequest('POST', '/api/book-categories', data);
      return res.json() as Promise<BookCategory>;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/book-categories'] })
  });

  const createIssueMutation = useMutation({
    mutationFn: async (data: InsertBookIssue) => {
      const res = await apiRequest('POST', '/api/book-issues', data);
      return res.json() as Promise<BookIssue>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/book-issues'] });
      queryClient.invalidateQueries({ queryKey: ['/api/books'] });
      queryClient.invalidateQueries({ queryKey: ['/api/library/statistics'] });
    }
  });

  const updateIssueMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<BookIssue> }) => {
      const res = await apiRequest('PATCH', `/api/book-issues/${id}`, updates);
      return res.json() as Promise<BookIssue>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/book-issues'] });
      queryClient.invalidateQueries({ queryKey: ['/api/books'] });
      queryClient.invalidateQueries({ queryKey: ['/api/library/statistics'] });
    }
  });

  const addBook = async (book: InsertBook): Promise<Book> => {
    return await createBookMutation.mutateAsync(book);
  };

  const updateBook = async (id: string, updates: Partial<Book>) => {
    await updateBookMutation.mutateAsync({ id, updates });
  };

  const addCategory = async (category: InsertBookCategory): Promise<BookCategory> => {
    return await createCategoryMutation.mutateAsync(category);
  };

  const issueBook = async (issue: InsertBookIssue): Promise<BookIssue> => {
    return await createIssueMutation.mutateAsync(issue);
  };

  const returnBook = async (issueId: string, returnDate: string) => {
    await updateIssueMutation.mutateAsync({
      id: issueId,
      updates: { returnDate }
    });
  };

  const getBook = (id: string) => books.find((b) => b.id === id);

  return {
    books,
    categories,
    issues,
    statistics,
    addBook,
    updateBook,
    addCategory,
    issueBook,
    returnBook,
    getBook,
    isLoading: booksLoading || issuesLoading || categoriesLoading,
    error: booksError ?? issuesError,
    isPending: createBookMutation.isPending || updateBookMutation.isPending || createIssueMutation.isPending || updateIssueMutation.isPending || createCategoryMutation.isPending
  };
}

// Search functions for students and staff
export async function searchStudents(query: string): Promise<Student[]> {
  const token = localStorage.getItem("token");
  const res = await fetch(`/api/library/search-students?query=${encodeURIComponent(query)}`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  if (!res.ok) return [];
  return res.json();
}

export async function searchStaff(query: string): Promise<Staff[]> {
  const token = localStorage.getItem("token");
  const res = await fetch(`/api/library/search-staff?query=${encodeURIComponent(query)}`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  if (!res.ok) return [];
  return res.json();
}

export const memberTypes = ["Student", "Staff"] as const;
export const issueStatuses = ["Issued", "Returned", "Overdue"] as const;
