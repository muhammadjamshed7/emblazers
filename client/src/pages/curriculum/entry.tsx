import { useState } from "react";
import { ModuleLayout } from "@/components/layout/module-layout";
import { PageHeader } from "@/components/shared/page-header";
import { BulkUpload, type BulkUploadResult } from "@/components/shared/bulk-upload";
import { resultCSVColumns } from "@/lib/csv-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { curriculumNavItems, useCurriculumData, classes, subjects } from "./curriculum-data";
import { Save, Upload } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";

const students = [
  { id: "STU001", name: "Ahmad Khan" },
  { id: "STU002", name: "Fatima Ali" },
  { id: "STU003", name: "Zain Ahmed" },
  { id: "STU004", name: "Ayesha Malik" },
  { id: "STU005", name: "Hassan Raza" },
];

export default function ResultEntry() {
  const { exams, refreshResults } = useCurriculumData();
  const { canCreate } = useAuth();
  const [selectedExam, setSelectedExam] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [bulkOpen, setBulkOpen] = useState(false);

  const handleBulkUpload = async (data: Record<string, unknown>[]): Promise<BulkUploadResult> => {
    if (!selectedExam) {
      return {
        success: 0,
        failed: data.length,
        errors: [{ row: 0, message: "Please select an exam before uploading results" }],
      };
    }
    try {
      const response = await apiRequest("POST", "/api/bulk/results", { results: data, examId: selectedExam });
      const result = await response.json();
      if (result.success > 0) {
        refreshResults();
        queryClient.invalidateQueries({ queryKey: ["/api/results"] });
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

  return (
    <ModuleLayout module="curriculum" navItems={curriculumNavItems}>
      <div className="space-y-6">
        <PageHeader
          title="Result Entry"
          description="Enter student exam results"
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
        />

        <div className="flex flex-wrap gap-4">
          <Select value={selectedExam} onValueChange={setSelectedExam}>
            <SelectTrigger className="w-[220px]" data-testid="select-exam">
              <SelectValue placeholder="Select Exam" />
            </SelectTrigger>
            <SelectContent>
              {exams.map((exam) => (
                <SelectItem key={exam.id} value={exam.id}>{exam.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-[180px]" data-testid="select-class">
              <SelectValue placeholder="Select Class" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((cls) => (
                <SelectItem key={cls} value={cls}>{cls}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="w-[180px]" data-testid="select-subject">
              <SelectValue placeholder="Select Subject" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((sub) => (
                <SelectItem key={sub} value={sub}>{sub}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedExam && selectedClass && selectedSubject ? (
          <Card>
            <CardHeader>
              <CardTitle>Enter Marks - {selectedSubject}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Student ID</th>
                      <th className="text-left p-2">Name</th>
                      <th className="text-left p-2 w-32">Marks (100)</th>
                      <th className="text-left p-2 w-24">Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => (
                      <tr key={student.id} className="border-b">
                        <td className="p-2">{student.id}</td>
                        <td className="p-2">{student.name}</td>
                        <td className="p-2">
                          <Input 
                            type="number" 
                            min={0} 
                            max={100} 
                            placeholder="0" 
                            className="w-24"
                            data-testid={`input-marks-${student.id}`}
                          />
                        </td>
                        <td className="p-2 text-muted-foreground">-</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end pt-4">
                <Button data-testid="button-save-results">
                  <Save className="w-4 h-4 mr-2" />
                  Save Results
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Select exam, class, and subject to enter results
            </CardContent>
          </Card>
        )}

        <BulkUpload
          isOpen={bulkOpen}
          onClose={() => setBulkOpen(false)}
          title="Bulk Result Entry"
          description="Upload a CSV file to enter exam results for multiple students at once."
          columns={resultCSVColumns}
          templateFilename="result-entry-template"
          onUpload={handleBulkUpload}
        />
      </div>
    </ModuleLayout>
  );
}
