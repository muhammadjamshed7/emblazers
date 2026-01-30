import { useState } from "react";
import { ModuleLayout } from "@/components/layout/module-layout";
import { DataTable, StatusBadge } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { BulkUpload, type BulkUploadResult } from "@/components/shared/bulk-upload";
import { attendanceCSVColumns } from "@/lib/csv-utils";
import { attendanceNavItems, useAttendanceData } from "./attendance-data";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function AttendanceRecords() {
  const { records, refreshRecords } = useAttendanceData();
  const { canCreate } = useAuth();
  const [bulkOpen, setBulkOpen] = useState(false);

  const handleBulkUpload = async (data: Record<string, unknown>[]): Promise<BulkUploadResult> => {
    try {
      const response = await apiRequest("POST", "/api/bulk/attendance", { records: data });
      const result = await response.json();
      if (result.success > 0) {
        refreshRecords();
        queryClient.invalidateQueries({ queryKey: ["/api/attendance-records"] });
      }
      return result;
    } catch (error) {
      return {
        success: 0,
        failed: data.length,
        errors: [{ row: 0, message: String(error) }],
      };
    }
  };

  const columns = [
    { key: "date" as const, label: "Date", sortable: true },
    { key: "studentId" as const, label: "Student ID" },
    { key: "studentName" as const, label: "Name", sortable: true },
    { key: "class" as const, label: "Class" },
    { key: "section" as const, label: "Section" },
    {
      key: "status" as const,
      label: "Status",
      render: (item: typeof records[0]) => <StatusBadge status={item.status} />,
    },
    { key: "remarks" as const, label: "Remarks", render: (item: typeof records[0]) => item.remarks || "-" },
  ];

  return (
    <ModuleLayout module="attendance" navItems={attendanceNavItems}>
      <div className="space-y-6">
        <PageHeader
          title="Attendance Records"
          description="View all attendance records"
          actions={
            canCreate() && (
              <Button
                variant="outline"
                onClick={() => setBulkOpen(true)}
                data-testid="button-bulk-import"
              >
                <Upload className="h-4 w-4 mr-2" />
                Bulk Import
              </Button>
            )
          }
          action={{ label: "Mark Attendance", href: "/attendance/mark" }}
        />

        <DataTable
          data={records}
          columns={columns}
          searchKey="studentName"
          searchPlaceholder="Search by student name..."
          filterKey="status"
          filterOptions={["Present", "Absent", "Late", "Leave"]}
          getRowKey={(item) => item.id}
          exportOptions={{
            enabled: true,
            title: "Attendance Records",
            filename: "attendance-records",
          }}
        />

        <BulkUpload
          isOpen={bulkOpen}
          onClose={() => setBulkOpen(false)}
          title="Bulk Attendance Import"
          description="Upload a CSV file to import attendance records for multiple students at once."
          columns={attendanceCSVColumns}
          templateFilename="attendance-template"
          onUpload={handleBulkUpload}
        />
      </div>
    </ModuleLayout>
  );
}
