import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  type Account, 
  type FinanceVoucher, 
  type InsertFinanceVoucher,
  type Vendor,
  type InsertVendor,
  type Expense,
  type InsertExpense,
  type ChartOfAccounts,
  type InsertChartOfAccounts,
  type LedgerEntry,
  type InsertLedgerEntry,
  type JournalEntry,
  type InsertJournalEntry,
} from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  LayoutDashboard,
  BookOpen,
  Receipt,
  FileText,
  Users,
  CreditCard,
  TrendingDown,
  Wallet,
} from "lucide-react";

export const financeNavItems = [
  { label: "Dashboard", path: "/finance/dashboard", icon: LayoutDashboard },
  { label: "Chart of Accounts", path: "/finance/accounts", icon: BookOpen },
  { label: "Ledger", path: "/finance/ledger", icon: Wallet },
  { label: "Expenses", path: "/finance/expenses", icon: TrendingDown },
  { label: "Vendors", path: "/finance/vendors", icon: Users },
  { label: "Vouchers", path: "/finance/vouchers", icon: Receipt },
  { label: "Reports", path: "/finance/reports", icon: FileText },
];

export function useFinanceData() {
  const { data: accounts = [], isLoading: accountsLoading, error: accountsError } = useQuery<Account[]>({
    queryKey: ['/api/accounts']
  });
  
  const { data: vouchers = [], isLoading: vouchersLoading, error: vouchersError } = useQuery<FinanceVoucher[]>({
    queryKey: ['/api/finance-vouchers']
  });

  const createVoucherMutation = useMutation({
    mutationFn: async (data: InsertFinanceVoucher) => {
      const res = await apiRequest('POST', '/api/finance-vouchers', data);
      return res.json() as Promise<FinanceVoucher>;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/finance-vouchers'] })
  });

  const addVoucher = async (voucher: InsertFinanceVoucher): Promise<FinanceVoucher> => {
    return await createVoucherMutation.mutateAsync(voucher);
  };

  return { 
    accounts, 
    vouchers, 
    addVoucher,
    isLoading: accountsLoading || vouchersLoading,
    error: accountsError ?? vouchersError,
    isPending: createVoucherMutation.isPending
  };
}

export function useVendors() {
  const { data: vendors = [], isLoading, error } = useQuery<Vendor[]>({
    queryKey: ['/api/vendors']
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertVendor) => {
      const res = await apiRequest('POST', '/api/vendors', data);
      return res.json() as Promise<Vendor>;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/vendors'] })
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Vendor> }) => {
      const res = await apiRequest('PATCH', `/api/vendors/${id}`, updates);
      return res.json() as Promise<Vendor>;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/vendors'] })
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/vendors/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/vendors'] })
  });

  return {
    vendors,
    isLoading,
    error,
    createVendor: createMutation.mutateAsync,
    updateVendor: (id: string, updates: Partial<Vendor>) => updateMutation.mutateAsync({ id, updates }),
    deleteVendor: deleteMutation.mutateAsync,
    isPending: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending
  };
}

export function useExpenses() {
  const { data: expenses = [], isLoading, error } = useQuery<Expense[]>({
    queryKey: ['/api/expenses']
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertExpense) => {
      const res = await apiRequest('POST', '/api/expenses', data);
      return res.json() as Promise<Expense>;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/expenses'] })
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Expense> }) => {
      const res = await apiRequest('PATCH', `/api/expenses/${id}`, updates);
      return res.json() as Promise<Expense>;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/expenses'] })
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/expenses/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/expenses'] })
  });

  return {
    expenses,
    isLoading,
    error,
    createExpense: createMutation.mutateAsync,
    updateExpense: (id: string, updates: Partial<Expense>) => updateMutation.mutateAsync({ id, updates }),
    deleteExpense: deleteMutation.mutateAsync,
    isPending: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending
  };
}

export function useChartOfAccounts() {
  const { data: accounts = [], isLoading, error } = useQuery<ChartOfAccounts[]>({
    queryKey: ['/api/chart-of-accounts']
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertChartOfAccounts) => {
      const res = await apiRequest('POST', '/api/chart-of-accounts', data);
      return res.json() as Promise<ChartOfAccounts>;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/chart-of-accounts'] })
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<ChartOfAccounts> }) => {
      const res = await apiRequest('PATCH', `/api/chart-of-accounts/${id}`, updates);
      return res.json() as Promise<ChartOfAccounts>;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/chart-of-accounts'] })
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/chart-of-accounts/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/chart-of-accounts'] })
  });

  return {
    accounts,
    isLoading,
    error,
    createAccount: createMutation.mutateAsync,
    updateAccount: (id: string, updates: Partial<ChartOfAccounts>) => updateMutation.mutateAsync({ id, updates }),
    deleteAccount: deleteMutation.mutateAsync,
    isPending: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending
  };
}

export function useLedgerEntries() {
  const { data: entries = [], isLoading, error } = useQuery<LedgerEntry[]>({
    queryKey: ['/api/ledger-entries']
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertLedgerEntry) => {
      const res = await apiRequest('POST', '/api/ledger-entries', data);
      return res.json() as Promise<LedgerEntry>;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/ledger-entries'] })
  });

  return {
    entries,
    isLoading,
    error,
    createEntry: createMutation.mutateAsync,
    isPending: createMutation.isPending
  };
}

export function useJournalEntries() {
  const { data: entries = [], isLoading, error } = useQuery<JournalEntry[]>({
    queryKey: ['/api/journal-entries']
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertJournalEntry) => {
      const res = await apiRequest('POST', '/api/journal-entries', data);
      return res.json() as Promise<JournalEntry>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/journal-entries'] });
      queryClient.invalidateQueries({ queryKey: ['/api/ledger-entries'] });
    }
  });

  return {
    entries,
    isLoading,
    error,
    createEntry: createMutation.mutateAsync,
    isPending: createMutation.isPending
  };
}

export const accountTypes = ["Asset", "Liability", "Equity", "Income", "Expense"] as const;
export const voucherTypes = ["Payment", "Receipt", "Journal"] as const;
export const vendorCategories = ["Supplier", "Contractor", "Service Provider", "Utility", "Other"] as const;
export const expenseCategories = ["Utilities", "Supplies", "Maintenance", "Salary", "Transport", "Events", "Marketing", "IT", "Other"] as const;
export const paymentStatuses = ["Pending", "Approved", "Paid", "Cancelled"] as const;
