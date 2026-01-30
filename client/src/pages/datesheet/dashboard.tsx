import { ModuleLayout } from "@/components/layout/module-layout";
import { StatsCard, StatsGrid } from "@/components/shared/stats-card";
import { RecentTable } from "@/components/shared/recent-table";
import { StatusBadge } from "@/components/shared/data-table";
import { datesheetNavItems, useDateSheetData } from "./datesheet-data";
import { Calendar, CalendarDays, GraduationCap, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function DateSheetDashboard() {
  const { dateSheets } = useDateSheetData();

  const totalDateSheets = dateSheets.length;
  const upcomingExams = dateSheets.filter((d) => new Date(d.startDate) > new Date()).length;
  const ongoingExams = dateSheets.filter((d) => {
    const now = new Date();
    return new Date(d.startDate) <= now && new Date(d.endDate) >= now;
  }).length;

  const recentDateSheets = dateSheets
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
    .slice(0, 5);

  return (
    <ModuleLayout module="datesheet" navItems={datesheetNavItems}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-semibold" data-testid="text-page-title">Date Sheet Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage exam schedules and date sheets</p>
        </div>

        <StatsGrid>
          <StatsCard
            title="Total Date Sheets"
            value={totalDateSheets}
            icon={Calendar}
            iconColor="text-red-500"
          />
          <StatsCard
            title="Upcoming Exams"
            value={upcomingExams}
            icon={CalendarDays}
            iconColor="text-blue-500"
          />
          <StatsCard
            title="Ongoing Exams"
            value={ongoingExams}
            icon={GraduationCap}
            iconColor="text-green-500"
          />
          <StatsCard
            title="Total Subjects"
            value={6}
            icon={FileText}
            iconColor="text-purple-500"
          />
        </StatsGrid>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentTable
            title="Recent Date Sheets"
            data={recentDateSheets}
            columns={[
              { key: "examName", label: "Exam Name" },
              { key: "class", label: "Class" },
              { key: "examType", label: "Type", render: (item) => <Badge variant="outline" size="sm">{item.examType}</Badge> },
              { key: "startDate", label: "Start Date" },
            ]}
            getRowKey={(item) => item.id}
          />

          <RecentTable
            title="Exams by Type"
            data={[
              { type: "Term", count: dateSheets.filter((d) => d.examType === "Term").length },
              { type: "Monthly", count: dateSheets.filter((d) => d.examType === "Monthly").length },
              { type: "Annual", count: dateSheets.filter((d) => d.examType === "Annual").length },
            ]}
            columns={[
              { key: "type", label: "Exam Type" },
              { key: "count", label: "Count" },
            ]}
            getRowKey={(item) => item.type}
          />
        </div>
      </div>
    </ModuleLayout>
  );
}
