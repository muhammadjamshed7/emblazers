import { useQuery, useMutation } from "@tanstack/react-query";
import { type Timetable, type InsertTimetable } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  Plus,
} from "lucide-react";

export const timetableNavItems = [
  { label: "Dashboard", path: "/timetable/dashboard", icon: LayoutDashboard },
  { label: "Class Timetables", path: "/timetable/class", icon: GraduationCap },
  { label: "Teacher Timetables", path: "/timetable/teacher", icon: Users },
  { label: "Create Timetable", path: "/timetable/create", icon: Plus },
];

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const periods = [1, 2, 3, 4, 5, 6, 7, 8];

export function useTimetableData() {
  const { data: timetables = [], isLoading, error } = useQuery<Timetable[]>({
    queryKey: ['/api/timetables']
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertTimetable) => {
      const res = await apiRequest('POST', '/api/timetables', data);
      return res.json() as Promise<Timetable>;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/timetables'] })
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Timetable> }) => {
      const res = await apiRequest('PATCH', `/api/timetables/${id}`, updates);
      return res.json() as Promise<Timetable>;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/timetables'] })
  });

  const addTimetable = async (timetable: InsertTimetable): Promise<Timetable> => {
    return await createMutation.mutateAsync(timetable);
  };

  const updateTimetable = async (id: string, updates: Partial<Timetable>) => {
    await updateMutation.mutateAsync({ id, updates });
  };

  const getTimetable = (id: string) => timetables.find((t) => t.id === id);

  return { 
    timetables, 
    addTimetable, 
    updateTimetable, 
    getTimetable,
    isLoading,
    error,
    isPending: createMutation.isPending || updateMutation.isPending
  };
}

export const teachers = [
  { id: "T001", name: "Mr. Ali Hassan", subject: "Math" },
  { id: "T002", name: "Ms. Fatima Zahra", subject: "English" },
  { id: "T003", name: "Mr. Ahmed Raza", subject: "Science" },
  { id: "T004", name: "Ms. Sara Khan", subject: "Urdu" },
  { id: "T005", name: "Mr. Usman Shah", subject: "Islamiat" },
  { id: "T006", name: "Ms. Hina Malik", subject: "Computer" },
];

export const subjects = ["Math", "English", "Science", "Urdu", "Islamiat", "Computer", "Art", "PT"];
export const classes = ["Class 1", "Class 2", "Class 3", "Class 4", "Class 5", "Class 6", "Class 7", "Class 8", "Class 9", "Class 10"];
export const sections = ["A", "B", "C"];
export { days, periods };
