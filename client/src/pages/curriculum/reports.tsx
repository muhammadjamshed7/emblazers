import { ModuleLayout } from "@/components/layout/module-layout";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type Column } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { curriculumNavItems, useCurriculumData } from "./curriculum-data";

export default function ResultReports() {
  const { results } = useCurriculumData();

  const columns: Column<typeof results[0]>[] = [
    { key: "studentId", label: "Student ID" },
    { key: "studentName", label: "Student Name", sortable: true },
    { key: "class", label: "Class" },
    { key: "subject", label: "Subject", sortable: true },
    { 
      key: "marksObtained", 
      label: "Marks", 
      render: (item: typeof results[0]) => `${item.marksObtained}/${item.maxMarks}` 
    },
    { 
      key: "grade", 
      label: "Grade", 
      render: (item: typeof results[0]) => (
        <Badge 
          variant={item.grade.startsWith("A") ? "default" : "outline"}
        >
          {item.grade}
        </Badge>
      ) 
    },
  ];

  return (
    <ModuleLayout module="curriculum" navItems={curriculumNavItems}>
      <div className="space-y-6">
        <PageHeader
          title="Result Reports"
          description="View and analyze student results"
        />

        <DataTable
          data={results}
          columns={columns}
          searchKey="studentName"
          searchPlaceholder="Search by student name..."
          getRowKey={(item) => item.id}
          exportOptions={{
            enabled: true,
            title: "Result Reports",
            filename: "curriculum-reports",
          }}
        />
      </div>
    </ModuleLayout>
  );
}
