import { useQuery, useMutation } from "@tanstack/react-query";
import { type AttendanceRecord, type InsertAttendanceRecord } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  LayoutDashboard,
  CheckSquare,
  List,
  FileText,
} from "lucide-react";

export const attendanceNavItems = [
  { label: "Dashboard", path: "/attendance/dashboard", icon: LayoutDashboard },
  { label: "Mark Attendance", path: "/attendance/mark", icon: CheckSquare },
  { label: "Records", path: "/attendance/records", icon: List },
  { label: "Reports", path: "/attendance/reports", icon: FileText },
];

export function useAttendanceData() {
  const { data: records = [], isLoading, error } = useQuery<AttendanceRecord[]>({
    queryKey: ['/api/attendance-records']
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertAttendanceRecord) => {
      const res = await apiRequest('POST', '/api/attendance-records', data);
      return res.json() as Promise<AttendanceRecord>;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/attendance-records'] })
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<AttendanceRecord> }) => {
      const res = await apiRequest('PATCH', `/api/attendance-records/${id}`, updates);
      return res.json() as Promise<AttendanceRecord>;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/attendance-records'] })
  });

  const addRecord = async (record: InsertAttendanceRecord): Promise<AttendanceRecord> => {
    return await createMutation.mutateAsync(record);
  };

  const updateRecord = async (id: string, updates: Partial<AttendanceRecord>) => {
    await updateMutation.mutateAsync({ id, updates });
  };

  const refreshRecords = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/attendance-records'] });
  };

  const batchMutation = useMutation({
    mutationFn: async (data: { date: string, class: string, section: string, records: any[] }) => {
      const res = await apiRequest('POST', '/api/attendance-records/batch', data);
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/attendance-records'] })
  });

  const markBatchAttendance = async (data: { date: string, class: string, section: string, records: any[] }) => {
    return await batchMutation.mutateAsync(data);
  };

  return { 
    records, 
    addRecord, 
    updateRecord,
    markBatchAttendance,
    refreshRecords,
    isLoading,
    error,
    isPending: createMutation.isPending || updateMutation.isPending || batchMutation.isPending
  };
}

export const attendanceStatuses = ["Present", "Absent", "Late", "Leave"] as const;
export const classes = ["Class 1", "Class 2", "Class 3", "Class 4", "Class 5", "Class 6"];
export const sections = ["A", "B", "C"];
