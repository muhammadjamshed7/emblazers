import { ModuleLayout } from "@/components/layout/module-layout";
import { StatsCard, StatsGrid } from "@/components/shared/stats-card";
import { RecentTable } from "@/components/shared/recent-table";
import { StatusBadge } from "@/components/shared/data-table";
import { hrNavItems, useHRData } from "./hr-data";
import { Users, UserPlus, Clock, AlertTriangle } from "lucide-react";

export default function HRDashboard() {
  const { staff, vacancies } = useHRData();

  const totalStaff = staff.filter((s) => s.status === "Active" || s.status === "Probation").length;
  const newJoinees = staff.filter((s) => {
    const joinDate = new Date(s.joiningDate);
    const now = new Date();
    const threeMonthsAgo = new Date(now.setMonth(now.getMonth() - 3));
    return joinDate >= threeMonthsAgo;
  }).length;
  const onProbation = staff.filter((s) => s.status === "Probation").length;
  const openVacancies = vacancies.filter((v) => v.status === "Open").length;

  const recentJoinees = staff
    .sort((a, b) => new Date(b.joiningDate).getTime() - new Date(a.joiningDate).getTime())
    .slice(0, 5);

  return (
    <ModuleLayout module="hr" navItems={hrNavItems}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-semibold">HR Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of staff and HR operations</p>
        </div>

        <StatsGrid>
          <StatsCard
            title="Total Staff"
            value={totalStaff}
            icon={Users}
            iconColor="text-purple-500"
          />
          <StatsCard
            title="New Joinees"
            value={newJoinees}
            icon={UserPlus}
            iconColor="text-green-500"
            subtitle="Last 3 months"
          />
          <StatsCard
            title="On Probation"
            value={onProbation}
            icon={Clock}
            iconColor="text-orange-500"
          />
          <StatsCard
            title="Open Vacancies"
            value={openVacancies}
            icon={AlertTriangle}
            iconColor="text-blue-500"
          />
        </StatsGrid>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentTable
            title="Recent Joinees"
            data={recentJoinees}
            columns={[
              { key: "staffId", label: "ID" },
              { key: "name", label: "Name" },
              { key: "designation", label: "Designation" },
              { key: "joiningDate", label: "Joining Date" },
              {
                key: "status",
                label: "Status",
                render: (item) => <StatusBadge status={item.status} />,
              },
            ]}
            getRowKey={(item) => item.id}
          />

          <RecentTable
            title="Staff by Department"
            data={[
              { dept: "Mathematics", count: staff.filter((s) => s.department === "Mathematics").length },
              { dept: "English", count: staff.filter((s) => s.department === "English").length },
              { dept: "Science", count: staff.filter((s) => s.department === "Science").length },
              { dept: "Administration", count: staff.filter((s) => s.department === "Administration").length },
              { dept: "Finance", count: staff.filter((s) => s.department === "Finance").length },
            ]}
            columns={[
              { key: "dept", label: "Department" },
              { key: "count", label: "Staff Count" },
            ]}
            getRowKey={(item) => item.dept}
          />
        </div>
      </div>
    </ModuleLayout>
  );
}
