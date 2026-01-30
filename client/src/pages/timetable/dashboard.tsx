import { ModuleLayout } from "@/components/layout/module-layout";
import { StatsCard, StatsGrid } from "@/components/shared/stats-card";
import { RecentTable } from "@/components/shared/recent-table";
import { timetableNavItems, useTimetableData, classes } from "./timetable-data";
import { Calendar, GraduationCap, Users, Clock } from "lucide-react";

export default function TimetableDashboard() {
  const { timetables } = useTimetableData();

  const totalTimetables = timetables.length;
  const classesWithTimetables = new Set(timetables.map((t) => t.class)).size;

  const recentTimetables = timetables
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  return (
    <ModuleLayout module="timetable" navItems={timetableNavItems}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-semibold" data-testid="text-page-title">Timetable Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage class and teacher timetables</p>
        </div>

        <StatsGrid>
          <StatsCard
            title="Total Timetables"
            value={totalTimetables}
            icon={Calendar}
            iconColor="text-pink-500"
          />
          <StatsCard
            title="Classes Covered"
            value={classesWithTimetables}
            icon={GraduationCap}
            iconColor="text-blue-500"
            subtitle={`of ${classes.length} classes`}
          />
          <StatsCard
            title="Sections Covered"
            value={new Set(timetables.map((t) => `${t.class}-${t.section}`)).size}
            icon={Users}
            iconColor="text-green-500"
          />
          <StatsCard
            title="Days Scheduled"
            value={new Set(timetables.flatMap((t) => t.slots.map((s) => s.day))).size}
            icon={Clock}
            iconColor="text-orange-500"
          />
        </StatsGrid>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentTable
            title="Recent Timetables"
            data={recentTimetables}
            columns={[
              { key: "class", label: "Class" },
              { key: "section", label: "Section" },
              { key: "updatedAt", label: "Last Updated" },
            ]}
            getRowKey={(item) => item.id}
          />

          <RecentTable
            title="Timetables by Class"
            data={classes.slice(0, 5).map((cls) => ({
              class: cls,
              sections: timetables.filter((t) => t.class === cls).length,
            }))}
            columns={[
              { key: "class", label: "Class" },
              { key: "sections", label: "Sections with Timetable" },
            ]}
            getRowKey={(item) => item.class}
          />
        </div>
      </div>
    </ModuleLayout>
  );
}
