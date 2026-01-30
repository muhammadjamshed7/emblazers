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
  const { addRecord } = useAttendanceData();
  const { students, isLoading } = useStudentData();
  const { toast } = useToast();

  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [attendance, setAttendance] = useState<Record<string, typeof attendanceStatuses[number]>>({});
  const [viewStudent, setViewStudent] = useState<Student | null>(null);

  const filteredStudents = students.filter(
    (s) => s.class === selectedClass && s.section === selectedSection && s.status === "Active"
  );

  // Fetch existing attendance for the selected class/section/date
  const today = new Date().toISOString().split("T")[0];
  const { data: existingAttendance } = useQuery({
    queryKey: ['/api/attendance-records', { date: today, class: selectedClass, section: selectedSection }],
    queryFn: async () => {
      if (!selectedClass || !selectedSection) return [];
      const res = await apiRequest("GET", `/api/attendance-records?date=${today}&class=${selectedClass}&section=${selectedSection}`);
      return res.json();
    },
    enabled: !!selectedClass && !!selectedSection,
  });

  // Update local state when existing records are fetched
  useEffect(() => {
    if (existingAttendance && filteredStudents.length > 0) {
      const newAttendance: typeof attendance = {};
      // Default all to Present first if needed, or better, just leave undefined to show as not marked? 
      // Requirement says "previously marked attendance should appear by default".
      // Current logic defaults to "Present" only on submit if not in state.
      // But UI shows "default" variant if in state.

      // Let's populate state with existing records.
      filteredStudents.forEach(student => {
        const record = existingAttendance.find((r: any) => r.studentId === student.studentId);
        if (record) {
          newAttendance[student.id] = record.status;
        } else {
          // If no record exists, we can leave it empty (user hasn't marked it yet)
          // Or default to Present?
          // The prompt says "if opened again, previously marked... should appear". 
          // If it wasn't marked, it won't be in database.
        }
      });
      setAttendance(newAttendance);
    } else {
      // If query returns empty or class changes, we might want to reset.
      // But useEffect dependencies need care.
    }
  }, [existingAttendance, filteredStudents, selectedClass, selectedSection]); // filteredStudents changes when class/section changes

  // Reset attendance when class/section changes (handled by filteredStudents changing above effectively, but explicit reset is safer)
  useEffect(() => {
    setAttendance({});
  }, [selectedClass, selectedSection]);

  const markStatus = (studentId: string, status: typeof attendanceStatuses[number]) => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSubmit = () => {
    if (!selectedClass || !selectedSection) {
      toast({ title: "Error", description: "Please select class and section", variant: "destructive" });
      return;
    }

    if (filteredStudents.length === 0) {
      toast({ title: "Error", description: "No students found for selected class and section", variant: "destructive" });
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    let count = 0;

    filteredStudents.forEach((student) => {
      const status = attendance[student.id] || "Present";
      addRecord({
        date: today,
        studentId: student.studentId,
        studentName: student.name,
        class: selectedClass,
        section: selectedSection,
        status,
      });
      count++;
    });

    toast({ title: "Success", description: `Attendance marked for ${count} students` });
    setAttendance({});
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
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <CardTitle>Students - {selectedClass} {selectedSection}</CardTitle>
              {filteredStudents.length > 0 && (
                <Button onClick={handleSubmit} data-testid="button-save-attendance">
                  Save Attendance
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
