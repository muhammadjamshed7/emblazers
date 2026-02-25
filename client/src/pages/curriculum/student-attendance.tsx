import { ModuleLayout } from "@/components/layout/module-layout";
import { studentNavItems, useStudentAttendance } from "./student-data";
import { useAuth } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarCheck } from "lucide-react";

export default function StudentAttendancePage() {
  const { session } = useAuth();
  const { data: attendance = [], isLoading } = useStudentAttendance();

  const totalPresent = attendance.reduce((sum: number, m: any) => sum + m.presentDays, 0);
  const totalAbsent = attendance.reduce((sum: number, m: any) => sum + m.absentDays, 0);
  const totalDays = totalPresent + totalAbsent;
  const overallPercentage = totalDays > 0 ? Math.round((totalPresent / totalDays) * 100) : 0;

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const formatMonth = (m: string) => {
    const [year, month] = m.split("-");
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  return (
    <ModuleLayout module="curriculum" navItems={studentNavItems}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">My Attendance</h1>
          <p className="text-muted-foreground">View your monthly attendance records</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Total Days</p>
              <p className="text-3xl font-bold">{totalDays}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Present</p>
              <p className="text-3xl font-bold text-emerald-600">{totalPresent}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Absent</p>
              <p className="text-3xl font-bold text-red-600">{totalAbsent}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Overall %</p>
              <p className={`text-3xl font-bold ${overallPercentage >= 75 ? 'text-emerald-600' : 'text-amber-600'}`}>{overallPercentage}%</p>
            </CardContent>
          </Card>
        </div>

        {isLoading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />)}</div>
        ) : attendance.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">
            <CalendarCheck className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
            No attendance records found.
          </CardContent></Card>
        ) : (
          <div className="rounded-lg border overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 text-sm font-medium">Month</th>
                  <th className="text-left p-3 text-sm font-medium">Present Days</th>
                  <th className="text-left p-3 text-sm font-medium">Absent Days</th>
                  <th className="text-left p-3 text-sm font-medium">Attendance %</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((m: any) => (
                  <tr key={m.month} className="border-t" data-testid={`row-attendance-${m.month}`}>
                    <td className="p-3 text-sm font-medium">{formatMonth(m.month)}</td>
                    <td className="p-3 text-sm text-emerald-600 font-medium">{m.presentDays}</td>
                    <td className="p-3 text-sm text-red-600 font-medium">{m.absentDays}</td>
                    <td className="p-3 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${m.percentage >= 75 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${m.percentage}%` }} />
                        </div>
                        <span className={m.percentage >= 75 ? 'text-emerald-600' : 'text-amber-600'}>{m.percentage}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </ModuleLayout>
  );
}
