import { ModuleLayout } from "@/components/layout/module-layout";
import { PageHeader } from "@/components/shared/page-header";
import { attendanceNavItems, useAttendanceData, classes, sections } from "./attendance-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useState, useMemo } from "react";
import { DataTable, StatusBadge } from "@/components/shared/data-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, startOfMonth, isWithinInterval, parseISO } from "date-fns";
import { Input } from "@/components/ui/input";

export default function AttendanceReports() {
  const { records } = useAttendanceData();
  const [selectedClass, setSelectedClass] = useState("All");
  const [selectedSection, setSelectedSection] = useState("All");
  const [dateRange, setDateRange] = useState({
    start: format(startOfMonth(new Date()), "yyyy-MM-dd"),
    end: format(new Date(), "yyyy-MM-dd")
  });

  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const classMatch = selectedClass === "All" || r.class === selectedClass;
      const sectionMatch = selectedSection === "All" || r.section === selectedSection;
      const dateMatch = isWithinInterval(parseISO(r.date), {
        start: parseISO(dateRange.start),
        end: parseISO(dateRange.end)
      });
      return classMatch && sectionMatch && dateMatch;
    });
  }, [records, selectedClass, selectedSection, dateRange]);

  const monthlySummary = useMemo(() => {
    const summary: Record<string, any> = {};
    filteredRecords.forEach(r => {
      const key = `${r.studentId}-${r.class}-${r.section}`;
      if (!summary[key]) {
        summary[key] = {
          studentId: r.studentId,
          name: r.studentName,
          class: r.class,
          section: r.section,
          Present: 0,
          Absent: 0,
          Leave: 0,
          Late: 0,
          total: 0
        };
      }
      if (r.status in summary[key]) {
        summary[key][r.status]++;
      }
      summary[key].total++;
    });
    return Object.values(summary);
  }, [filteredRecords]);

  return (
    <ModuleLayout module="attendance" navItems={attendanceNavItems}>
      <div className="space-y-6">
        <PageHeader
          title="Attendance Reports"
          description="View and analyze attendance statistics"
        />

        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Class</Label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Classes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Classes</SelectItem>
                    {classes.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Section</Label>
                <Select value={selectedSection} onValueChange={setSelectedSection}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Sections" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Sections</SelectItem>
                    {sections.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input 
                  type="date" 
                  value={dateRange.start} 
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input 
                  type="date" 
                  value={dateRange.end} 
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="daily" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="daily">Detailed List</TabsTrigger>
            <TabsTrigger value="summary">Monthly Summary</TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="mt-6">
            <Card>
              <CardContent className="pt-6">
                <DataTable
                  data={filteredRecords}
                  columns={[
                    { key: "date", label: "Date", sortable: true },
                    { key: "studentName", label: "Student", sortable: true },
                    { key: "class", label: "Class" },
                    { key: "section", label: "Section" },
                    { key: "status", label: "Status", render: (item) => <StatusBadge status={item.status} /> },
                  ]}
                  searchKey="studentName"
                  getRowKey={(item) => item.id}
                  exportOptions={{ enabled: true, title: "Detailed Attendance Report" }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="summary" className="mt-6">
            <Card>
              <CardContent className="pt-6">
                <DataTable
                  data={monthlySummary}
                  columns={[
                    { key: "name", label: "Student", sortable: true },
                    { key: "class", label: "Class" },
                    { key: "section", label: "Section" },
                    { key: "Present", label: "P", render: (item) => <span className="text-green-600 font-medium">{item.Present}</span> },
                    { key: "Absent", label: "A", render: (item) => <span className="text-red-600 font-medium">{item.Absent}</span> },
                    { key: "Leave", label: "L", render: (item) => <span className="text-blue-600 font-medium">{item.Leave}</span> },
                    { key: "Late", label: "T", render: (item) => <span className="text-yellow-600 font-medium">{item.Late}</span> },
                    { 
                      key: "percentage", 
                      label: "Attendance %", 
                      render: (item) => {
                        const perc = item.total > 0 ? ((item.Present / item.total) * 100).toFixed(1) : "0.0";
                        return <span className="font-bold">{perc}%</span>
                      }
                    }
                  ]}
                  searchKey="name"
                  getRowKey={(item) => item.studentId}
                  exportOptions={{ enabled: true, title: "Monthly Attendance Summary" }}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ModuleLayout>
  );
}
