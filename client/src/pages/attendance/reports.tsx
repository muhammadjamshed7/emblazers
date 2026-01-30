import { ModuleLayout } from "@/components/layout/module-layout";
import { PageHeader } from "@/components/shared/page-header";
import { attendanceNavItems, useAttendanceData } from "./attendance-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileDown, FileSpreadsheet } from "lucide-react";
import { exportToPDF, exportToExcel } from "@/lib/export-utils";
import type { Column } from "@/components/shared/data-table";

export default function AttendanceReports() {
  const { records } = useAttendanceData();

  const total = records.length;
  const present = records.filter((r) => r.status === "Present").length;
  const absent = records.filter((r) => r.status === "Absent").length;
  const late = records.filter((r) => r.status === "Late").length;

  const byClass = ["Class 1", "Class 2", "Class 3", "Class 4", "Class 5", "Class 6"].map((cls) => {
    const classRecords = records.filter((r) => r.class === cls);
    const classPresent = classRecords.filter((r) => r.status === "Present").length;
    return {
      class: cls,
      total: classRecords.length,
      present: classPresent,
      rate: classRecords.length > 0 ? Math.round((classPresent / classRecords.length) * 100) : 0,
    };
  });

  const classColumns: Column<typeof byClass[0]>[] = [
    { key: "class", label: "Class" },
    { key: "total", label: "Total" },
    { key: "present", label: "Present" },
    { key: "rate", label: "Rate %" },
  ];

  const handleExportPDF = () => {
    exportToPDF({
      title: "Attendance Reports - By Class",
      filename: "attendance-reports",
      data: byClass,
      columns: classColumns,
    });
  };

  const handleExportExcel = () => {
    exportToExcel({
      title: "Attendance Reports",
      filename: "attendance-reports",
      data: byClass,
      columns: classColumns,
    });
  };

  return (
    <ModuleLayout module="attendance" navItems={attendanceNavItems}>
      <div className="space-y-6">
        <PageHeader
          title="Attendance Reports"
          description="Attendance analytics and summary"
          actions={
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleExportPDF} data-testid="button-export-pdf">
                <FileDown className="w-4 h-4 mr-2" />
                PDF
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportExcel} data-testid="button-export-excel">
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Excel
              </Button>
            </div>
          }
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Records</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-records">{total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Present</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400" data-testid="text-present">{present}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Absent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400" data-testid="text-absent">{absent}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Late</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400" data-testid="text-late">{late}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Attendance Rate by Class</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Class</th>
                    <th className="text-left py-3 px-4 font-medium">Total</th>
                    <th className="text-left py-3 px-4 font-medium">Present</th>
                    <th className="text-left py-3 px-4 font-medium">Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {byClass.map((row) => (
                    <tr key={row.class} className="border-b last:border-0" data-testid={`row-class-${row.class}`}>
                      <td className="py-3 px-4">{row.class}</td>
                      <td className="py-3 px-4">{row.total}</td>
                      <td className="py-3 px-4">{row.present}</td>
                      <td className="py-3 px-4">
                        <Badge variant={row.rate >= 80 ? "default" : row.rate >= 60 ? "secondary" : "destructive"}>
                          {row.rate}%
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </ModuleLayout>
  );
}
