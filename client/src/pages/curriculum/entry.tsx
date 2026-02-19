import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ModuleLayout } from "@/components/layout/module-layout";
import { PageHeader } from "@/components/shared/page-header";
import { BulkUpload, type BulkUploadResult } from "@/components/shared/bulk-upload";
import { resultCSVColumns } from "@/lib/csv-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { curriculumNavItems, useCurriculumData, classes, subjects, grades } from "./curriculum-data";
import { Save, Upload, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Student, Result } from "@shared/schema";

function calculateGrade(marks: number, maxMarks: number): string {
  if (maxMarks <= 0) return "F";
  const pct = (marks / maxMarks) * 100;
  if (pct >= 90) return "A+";
  if (pct >= 80) return "A";
  if (pct >= 70) return "B+";
  if (pct >= 60) return "B";
  if (pct >= 50) return "C+";
  if (pct >= 40) return "C";
  if (pct >= 33) return "D";
  return "F";
}

export default function ResultEntry() {
  const { exams, results, addResult, updateResult, refreshResults } = useCurriculumData();
  const { canCreate } = useAuth();
  const { toast } = useToast();
  const [selectedExam, setSelectedExam] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [maxMarks, setMaxMarks] = useState(100);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [marksMap, setMarksMap] = useState<Record<string, number | "">>({});
  const [saving, setSaving] = useState(false);

  const { data: students = [], isLoading: studentsLoading } = useQuery<Student[]>({
    queryKey: ['/api/students'],
  });

  const filteredStudents = students.filter(s => {
    if (selectedClass && s.class !== selectedClass) return false;
    return s.status === "Active";
  });

  const existingResults = results.filter(r =>
    r.examId === selectedExam && r.class === selectedClass && r.subject === selectedSubject
  );

  useEffect(() => {
    const newMap: Record<string, number | ""> = {};
    filteredStudents.forEach(student => {
      const existing = existingResults.find(r => r.studentId === student.studentId);
      newMap[student.studentId] = existing ? existing.marksObtained : "";
    });
    setMarksMap(newMap);
  }, [selectedExam, selectedClass, selectedSubject, filteredStudents.length, existingResults.length]);

  const updateMarks = (studentId: string, value: string) => {
    const numVal = value === "" ? "" : Math.min(Math.max(0, Number(value)), maxMarks);
    setMarksMap(prev => ({ ...prev, [studentId]: numVal }));
  };

  const getGradeForStudent = (studentId: string): string => {
    const marks = marksMap[studentId];
    if (marks === "" || marks === undefined) return "-";
    return calculateGrade(marks, maxMarks);
  };

  const handleSave = async () => {
    if (!selectedExam || !selectedClass || !selectedSubject) {
      toast({ title: "Error", description: "Please select exam, class, and subject", variant: "destructive" });
      return;
    }

    const entriesToSave = filteredStudents
      .filter(s => marksMap[s.studentId] !== "" && marksMap[s.studentId] !== undefined)
      .map(s => ({
        student: s,
        marks: Number(marksMap[s.studentId]),
        grade: calculateGrade(Number(marksMap[s.studentId]), maxMarks),
      }));

    if (entriesToSave.length === 0) {
      toast({ title: "Error", description: "Please enter marks for at least one student", variant: "destructive" });
      return;
    }

    setSaving(true);
    let savedCount = 0;
    let updatedCount = 0;

    try {
      for (const entry of entriesToSave) {
        const existing = existingResults.find(r => r.studentId === entry.student.studentId);

        if (existing) {
          await updateResult(existing.id, {
            marksObtained: entry.marks,
            maxMarks,
            grade: entry.grade,
          });
          updatedCount++;
        } else {
          await addResult({
            examId: selectedExam,
            studentId: entry.student.studentId,
            studentName: entry.student.name,
            class: selectedClass,
            subject: selectedSubject,
            marksObtained: entry.marks,
            maxMarks,
            grade: entry.grade,
          });
          savedCount++;
        }
      }

      refreshResults();
      const messages = [];
      if (savedCount > 0) messages.push(`${savedCount} new result${savedCount > 1 ? "s" : ""} saved`);
      if (updatedCount > 0) messages.push(`${updatedCount} result${updatedCount > 1 ? "s" : ""} updated`);
      toast({ title: "Success", description: messages.join(", ") });
    } catch (error) {
      toast({ title: "Error", description: "Failed to save some results. Please try again.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

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

  const selectedExamObj = exams.find(e => e.id === selectedExam);

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

        <div className="flex flex-wrap gap-4 items-end">
          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">Exam</label>
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
          </div>

          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">Class</label>
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
          </div>

          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">Subject</label>
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

          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">Max Marks</label>
            <Input
              type="number"
              value={maxMarks}
              onChange={(e) => setMaxMarks(Number(e.target.value) || 100)}
              min={1}
              className="w-[100px]"
              data-testid="input-max-marks"
            />
          </div>
        </div>

        {selectedExam && selectedClass && selectedSubject ? (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <CardTitle>
                Enter Marks - {selectedSubject}
                {selectedExamObj && <span className="text-sm font-normal text-muted-foreground ml-2">({selectedExamObj.name})</span>}
              </CardTitle>
              {existingResults.length > 0 && (
                <span className="text-sm text-muted-foreground">{existingResults.length} existing result{existingResults.length > 1 ? "s" : ""} loaded</span>
              )}
            </CardHeader>
            <CardContent>
              {studentsLoading ? (
                <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading students...
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  No active students found for {selectedClass}
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">#</th>
                          <th className="text-left p-2">Student ID</th>
                          <th className="text-left p-2">Name</th>
                          <th className="text-left p-2 w-32">Marks ({maxMarks})</th>
                          <th className="text-left p-2 w-24">Grade</th>
                          <th className="text-left p-2 w-20">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredStudents.map((student, idx) => {
                          const existing = existingResults.find(r => r.studentId === student.studentId);
                          const grade = getGradeForStudent(student.studentId);
                          const gradeColor = grade === "A+" || grade === "A" ? "text-green-600" :
                            grade === "B+" || grade === "B" ? "text-blue-600" :
                            grade === "C+" || grade === "C" ? "text-amber-600" :
                            grade === "F" ? "text-red-600" : "text-muted-foreground";
                          return (
                            <tr key={student.studentId} className="border-b">
                              <td className="p-2 text-muted-foreground">{idx + 1}</td>
                              <td className="p-2 font-mono text-xs">{student.studentId}</td>
                              <td className="p-2">{student.name}</td>
                              <td className="p-2">
                                <Input
                                  type="number"
                                  min={0}
                                  max={maxMarks}
                                  value={marksMap[student.studentId] ?? ""}
                                  onChange={(e) => updateMarks(student.studentId, e.target.value)}
                                  placeholder="0"
                                  className="w-24"
                                  data-testid={`input-marks-${student.studentId}`}
                                />
                              </td>
                              <td className={`p-2 font-medium ${gradeColor}`}>{grade}</td>
                              <td className="p-2">
                                {existing ? (
                                  <span className="text-xs text-muted-foreground">Saved</span>
                                ) : (
                                  <span className="text-xs text-muted-foreground">New</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button onClick={handleSave} disabled={saving} data-testid="button-save-results">
                      {saving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Results
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}
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
