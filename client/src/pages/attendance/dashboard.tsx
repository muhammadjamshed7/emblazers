import { ModuleLayout } from "@/components/layout/module-layout";
import { StatsCard, StatsGrid } from "@/components/shared/stats-card";
import { RecentTable } from "@/components/shared/recent-table";
import { StatusBadge } from "@/components/shared/data-table";
import { attendanceNavItems, useAttendanceData } from "./attendance-data";
import { CheckCircle, XCircle, Clock, Calendar } from "lucide-react";

export default function AttendanceDashboard() {
  const { records } = useAttendanceData();

  const today = new Date().toISOString().split("T")[0];
  const todayRecords = records.filter((r) => r.date === today);

  const present = todayRecords.filter((r) => r.status === "Present").length;
  const absent = todayRecords.filter((r) => r.status === "Absent").length;
  const late = todayRecords.filter((r) => r.status === "Late").length;
  const onLeave = todayRecords.filter((r) => r.status === "Leave").length;
  const total = todayRecords.length;
  const attendanceRate = total > 0 ? Math.round((present / total) * 100) : 0;

  return (
    <ModuleLayout module="attendance" navItems={attendanceNavItems}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-semibold" data-testid="text-page-title">Attendance Dashboard</h1>
          <p className="text-muted-foreground mt-1">Today's attendance overview</p>
        </div>

        <StatsGrid>
          <StatsCard
            title="Present Today"
            value={present}
            icon={CheckCircle}
            iconColor="text-green-500"
            subtitle={`${attendanceRate}% attendance rate`}
          />
          <StatsCard
            title="Absent Today"
            value={absent}
            icon={XCircle}
            iconColor="text-red-500"
          />
          <StatsCard
            title="Late Today"
            value={late}
            icon={Clock}
            iconColor="text-orange-500"
          />
          <StatsCard
            title="On Leave"
            value={onLeave}
            icon={Calendar}
            iconColor="text-blue-500"
          />
        </StatsGrid>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentTable
            title="Today's Attendance"
            data={todayRecords.slice(0, 6)}
            columns={[
              { key: "studentId", label: "ID" },
              { key: "studentName", label: "Name" },
              { key: "class", label: "Class" },
              {
                key: "status",
                label: "Status",
                render: (item) => <StatusBadge status={item.status} />,
              },
            ]}
            getRowKey={(item) => item.id}
          />

          <RecentTable
            title="Attendance by Class"
            data={["Class 1", "Class 2", "Class 3", "Class 4", "Class 5"].map((cls) => ({
              class: cls,
              total: todayRecords.filter((r) => r.class === cls).length,
              present: todayRecords.filter((r) => r.class === cls && r.status === "Present").length,
            }))}
            columns={[
              { key: "class", label: "Class" },
              { key: "total", label: "Total" },
              { key: "present", label: "Present" },
            ]}
            getRowKey={(item) => item.class}
          />
        </div>
      </div>
    </ModuleLayout>
  );
}
