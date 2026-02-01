import { ModuleLayout } from "@/components/layout/module-layout";
import { PageHeader } from "@/components/shared/page-header";
import { attendanceNavItems, useAttendanceData, classes, sections, attendanceStatuses } from "./attendance-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { useStudentData } from "../student/student-data";
import { Loader2, Users, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StudentAttendanceHistory } from "@/components/shared/student-attendance-history";
import type { Student } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function MarkAttendance() {
  const { markBatchAttendance } = useAttendanceData();
  const { students, isLoading } = useStudentData();
  const { toast } = useToast();

  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [attendance, setAttendance] = useState<Record<string, typeof attendanceStatuses[number]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewStudent, setViewStudent] = useState<Student | null>(null);

  const filteredStudents = students.filter(
    (s) => s.class === selectedClass && s.section === selectedSection && s.status === "Active"
  );

  const today = new Date().toISOString().split("T")[0];
  const { data: existingAttendance, refetch: refetchExisting } = useQuery({
    queryKey: ['/api/attendance-records', { date: today, class: selectedClass, section: selectedSection }],
    queryFn: async () => {
      if (!selectedClass || !selectedSection) return [];
      const res = await apiRequest("GET", `/api/attendance-records?date=${today}&class=${selectedClass}&section=${selectedSection}`);
      return res.json();
    },
    enabled: !!selectedClass && !!selectedSection,
  });

  const isAlreadyMarked = existingAttendance && existingAttendance.length > 0;

  useEffect(() => {
    if (selectedClass && selectedSection) {
      const newAttendance: Record<string, typeof attendanceStatuses[number]> = {};
      
      filteredStudents.forEach(student => {
        const record = existingAttendance?.find((r: any) => r.studentId === student.studentId);
        if (record) {
          newAttendance[student.id] = record.status;
        } else {
          // Default to Absent as per requirement "default unmarked/absent until set"
          newAttendance[student.id] = "Absent";
        }
      });
      setAttendance(newAttendance);
    }
  }, [existingAttendance, filteredStudents, selectedClass, selectedSection]);

  const markStatus = (studentId: string, status: typeof attendanceStatuses[number]) => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSubmit = async () => {
    if (!selectedClass || !selectedSection) {
      toast({ title: "Error", description: "Please select class and section", variant: "destructive" });
      return;
    }

    if (filteredStudents.length === 0) {
      toast({ title: "Error", description: "No students found for selected class and section", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const batchRecords = filteredStudents.map((student) => ({
        studentId: student.studentId,
        studentName: student.name,
        status: attendance[student.id] || "Absent",
      }));

      await markBatchAttendance({
        date: today,
        class: selectedClass,
        section: selectedSection,
        records: batchRecords,
      });

      toast({ title: "Success", description: `Attendance ${isAlreadyMarked ? 'updated' : 'marked'} successfully` });
      refetchExisting();
    } catch (error) {
      toast({ title: "Error", description: "Failed to save attendance", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModuleLayout module="attendance" navItems={attendanceNavItems}>
      <div className="space-y-6">
        <PageHeader
          title="Mark Attendance"
          description="Mark daily attendance for students"
        />

        <Card>
          <CardHeader>
            <CardTitle>Select Class</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Class</Label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger data-testid="select-class">
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Section</Label>
                <Select value={selectedSection} onValueChange={setSelectedSection}>
                  <SelectTrigger data-testid="select-section">
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent>
                    {sections.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <div className="h-9 px-3 flex items-center border rounded-md bg-muted/50">
                  {new Date().toLocaleDateString()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {selectedClass && selectedSection && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <CardTitle>Students - {selectedClass} {selectedSection}</CardTitle>
                {isAlreadyMarked && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 border-green-200">
                    Already Marked
                  </Badge>
                )}
              </div>
              {filteredStudents.length > 0 && (
                <Button 
                  onClick={handleSubmit} 
                  disabled={isSubmitting}
                  data-testid="button-save-attendance"
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {isAlreadyMarked ? "Update Attendance" : "Save Attendance"}
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No Students Found</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    No active students are enrolled in {selectedClass} {selectedSection}.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredStudents.map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50 transition-colors" data-testid={`row-student-${student.studentId}`}>
                      <div className="flex items-center gap-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setViewStudent(student)}
                          title="View Attendance History"
                          className="h-8 w-8"
                        >
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        <div>
                          <div className="font-medium">{student.name}</div>
                          <div className="text-sm text-muted-foreground">{student.studentId}</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {attendanceStatuses.map((status) => (
                          <Badge
                            key={status}
                            variant={attendance[student.id] === status ? "default" : "outline"}
                            className={`cursor-pointer ${attendance[student.id] === status ? "" : "hover-elevate"}`}
                            onClick={() => markStatus(student.id, status)}
                            data-testid={`button-${status.toLowerCase()}-${student.studentId}`}
                          >
                            {status}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Dialog open={!!viewStudent} onOpenChange={(open) => !open && setViewStudent(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Attendance History - {viewStudent?.name}</DialogTitle>
            </DialogHeader>
            {viewStudent && <StudentAttendanceHistory student={viewStudent} />}
          </DialogContent>
        </Dialog>
      </div>
    </ModuleLayout>
  );
}
