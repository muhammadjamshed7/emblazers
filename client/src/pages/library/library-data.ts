import { useQuery, useMutation } from "@tanstack/react-query";
import { type Book, type LibraryMember, type BookIssue, type InsertBook, type InsertLibraryMember, type InsertBookIssue } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  BookMarked,
} from "lucide-react";

export const libraryNavItems = [
  { label: "Dashboard", path: "/library/dashboard", icon: LayoutDashboard },
  { label: "Books", path: "/library/books", icon: BookOpen },
  { label: "Members", path: "/library/members", icon: Users },
  { label: "Issue / Return", path: "/library/issue", icon: BookMarked },
];

export function useLibraryData() {
  const { data: books = [], isLoading: booksLoading, error: booksError } = useQuery<Book[]>({
    queryKey: ['/api/books']
  });
  
  const { data: members = [], isLoading: membersLoading, error: membersError } = useQuery<LibraryMember[]>({
    queryKey: ['/api/library-members']
  });
  
  const { data: issues = [], isLoading: issuesLoading, error: issuesError } = useQuery<BookIssue[]>({
    queryKey: ['/api/book-issues']
  });

  const createBookMutation = useMutation({
    mutationFn: async (data: InsertBook) => {
      const res = await apiRequest('POST', '/api/books', data);
      return res.json() as Promise<Book>;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/books'] })
  });

  const updateBookMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Book> }) => {
      const res = await apiRequest('PATCH', `/api/books/${id}`, updates);
      return res.json() as Promise<Book>;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/books'] })
  });

  const createMemberMutation = useMutation({
    mutationFn: async (data: InsertLibraryMember) => {
      const res = await apiRequest('POST', '/api/library-members', data);
      return res.json() as Promise<LibraryMember>;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/library-members'] })
  });

  const createIssueMutation = useMutation({
    mutationFn: async (data: InsertBookIssue) => {
      const res = await apiRequest('POST', '/api/book-issues', data);
      return res.json() as Promise<BookIssue>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/book-issues'] });
      queryClient.invalidateQueries({ queryKey: ['/api/books'] });
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
    }
  });

  const addBook = async (book: InsertBook): Promise<Book> => {
    return await createBookMutation.mutateAsync(book);
  };

  const updateBook = async (id: string, updates: Partial<Book>) => {
    await updateBookMutation.mutateAsync({ id, updates });
  };

  const addMember = async (member: InsertLibraryMember): Promise<LibraryMember> => {
    return await createMemberMutation.mutateAsync(member);
  };

  const issueBook = async (issue: InsertBookIssue): Promise<BookIssue> => {
    return await createIssueMutation.mutateAsync(issue);
  };

  const returnBook = async (issueId: string) => {
    const issue = issues.find((i) => i.id === issueId);
    if (issue) {
      const returnDate = new Date().toISOString().split("T")[0];
      await updateIssueMutation.mutateAsync({ 
        id: issueId, 
        updates: { returnDate, status: "Returned" } 
      });
    }
  };

  const getBook = (id: string) => books.find((b) => b.id === id);
  const getMember = (id: string) => members.find((m) => m.id === id);

  return { 
    books, 
    members, 
    issues, 
    addBook, 
    updateBook, 
    addMember, 
    issueBook, 
    returnBook, 
    getBook, 
    getMember,
    isLoading: booksLoading || membersLoading || issuesLoading,
    error: booksError ?? membersError ?? issuesError,
    isPending: createBookMutation.isPending || updateBookMutation.isPending || createMemberMutation.isPending || createIssueMutation.isPending || updateIssueMutation.isPending
  };
}

export const categories = ["Mathematics", "English", "Science", "Social Studies", "Islamic", "Computer", "Urdu", "History", "General"];
export const memberTypes = ["Student", "Staff"] as const;
export const issueStatuses = ["Issued", "Returned", "Overdue"] as const;
