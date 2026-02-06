import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ModuleLayout } from "@/components/layout/module-layout";
import {
  attendanceNavItems,
  useStudentsForAttendance,
  useAttendanceData,
  useMarkAttendance,
  classes,
  sections,
} from "./attendance-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

type StatusMap = Record<string, "PRESENT" | "ABSENT" | "LEAVE">;

export default function MarkStudents() {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [statusMap, setStatusMap] = useState<StatusMap>({});
  const { toast } = useToast();

  const { data: allStudents = [], isLoading: studentsLoading } = useStudentsForAttendance();
  const { records: existingRecords } = useAttendanceData({
    date: selectedDate,
    targetType: "STUDENT",
    className: selectedClass || undefined,
    section: selectedSection || undefined,
  });
  const markMutation = useMarkAttendance();

  const filteredStudents = allStudents.filter((s) => {
    if (s.status !== "Active") return false;
    if (selectedClass && s.class !== selectedClass) return false;
    if (selectedSection && s.section !== selectedSection) return false;
    return true;
  });

  useEffect(() => {
    const newStatusMap: StatusMap = {};
    filteredStudents.forEach((student) => {
      const existing = existingRecords.find(
        (r) => r.studentId === student.studentId && r.date === selectedDate
      );
      newStatusMap[student.studentId] = existing ? existing.status : "PRESENT";
    });
    setStatusMap(newStatusMap);
  }, [filteredStudents.length, existingRecords.length, selectedDate, selectedClass, selectedSection]);

  const handleStatusChange = (studentId: string, status: "PRESENT" | "ABSENT" | "LEAVE") => {
    setStatusMap((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleMarkAll = (status: "PRESENT" | "ABSENT") => {
    const newMap: StatusMap = {};
    filteredStudents.forEach((s) => {
      newMap[s.studentId] = status;
    });
    setStatusMap(newMap);
  };

  const handleSubmit = async () => {
    if (!selectedClass || !selectedSection) {
      toast({ title: "Select class and section", description: "Please select both class and section before submitting.", variant: "destructive" });
      return;
    }
    if (filteredStudents.length === 0) {
      toast({ title: "No students", description: "No students found for the selected filters.", variant: "destructive" });
      return;
    }

    const records = filteredStudents.map((student) => ({
      date: selectedDate,
      targetType: "STUDENT" as const,
      studentId: student.studentId,
      staffId: null,
      entityName: student.name,
      className: student.class,
      section: student.section,
      status: statusMap[student.studentId] || "PRESENT",
    }));

    try {
      await markMutation.mutateAsync(records);
      toast({ title: "Attendance marked", description: `Attendance marked for ${records.length} students.` });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to mark attendance";
      toast({ title: "Error", description: message, variant: "destructive" });
    }
  };

  return (
    <ModuleLayout module="attendance" navItems={attendanceNavItems}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-semibold" data-testid="text-page-title">
            Mark Student Attendance
          </h1>
          <p className="text-muted-foreground mt-1">Mark daily attendance for students</p>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-end gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">Date</label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  data-testid="input-date"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">Class</label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger className="w-[160px]" data-testid="select-class">
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
                <label className="text-sm font-medium text-muted-foreground">Section</label>
                <Select value={selectedSection} onValueChange={setSelectedSection}>
                  <SelectTrigger className="w-[120px]" data-testid="select-section">
                    <SelectValue placeholder="Section" />
                  </SelectTrigger>
                  <SelectContent>
                    {sections.map((sec) => (
                      <SelectItem key={sec} value={sec}>{sec}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {selectedClass && selectedSection && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <CardTitle className="text-lg">
                  Students ({filteredStudents.length})
                </CardTitle>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleMarkAll("PRESENT")}
                    data-testid="button-mark-all-present"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Mark All Present
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleMarkAll("ABSENT")}
                    data-testid="button-mark-all-absent"
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Mark All Absent
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {studentsLoading ? (
                <div className="flex items-center justify-center gap-2 py-8">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-muted-foreground">Loading students...</span>
                </div>
              ) : filteredStudents.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No active students found for {selectedClass} - {selectedSection}
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs uppercase tracking-wide">Student ID</TableHead>
                        <TableHead className="text-xs uppercase tracking-wide">Name</TableHead>
                        <TableHead className="text-xs uppercase tracking-wide">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStudents.map((student) => (
                        <TableRow key={student.studentId}>
                          <TableCell className="text-sm" data-testid={`text-student-id-${student.studentId}`}>
                            {student.studentId}
                          </TableCell>
                          <TableCell className="text-sm" data-testid={`text-student-name-${student.studentId}`}>
                            {student.name}
                          </TableCell>
                          <TableCell>
                            <Select
                              value={statusMap[student.studentId] || "PRESENT"}
                              onValueChange={(val) => handleStatusChange(student.studentId, val as "PRESENT" | "ABSENT" | "LEAVE")}
                            >
                              <SelectTrigger className="w-[130px]" data-testid={`select-status-${student.studentId}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="PRESENT">PRESENT</SelectItem>
                                <SelectItem value="ABSENT">ABSENT</SelectItem>
                                <SelectItem value="LEAVE">LEAVE</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {filteredStudents.length > 0 && (
                <div className="flex justify-end mt-4">
                  <Button
                    onClick={handleSubmit}
                    disabled={markMutation.isPending}
                    data-testid="button-submit-attendance"
                  >
                    {markMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Submit Attendance
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </ModuleLayout>
  );
}
