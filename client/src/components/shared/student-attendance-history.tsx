import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, Clock as ClockIcon, Calendar, FileText, Download } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { AttendanceRecord, Student } from "@shared/schema";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { StatusBadge } from "@/components/shared/data-table";

interface StudentProfile {
    studentId: string;
    name: string;
    class: string;
    section: string;
    id?: string;
}

interface StudentAttendanceHistoryProps {
    student?: Student;
    studentProfile?: StudentProfile;
}

export function StudentAttendanceHistory({ student, studentProfile }: StudentAttendanceHistoryProps) {
    const profile = student || studentProfile;

    // Fetch student specific attendance records
    // If we have a full student object with UUID, use the student specific endpoint
    // Otherwise use the general records endpoint filtered by studentId (Roll No)
    const apiPath = student?.id
        ? `/api/students/${student.id}/attendance`
        : `/api/attendance-records?studentId=${profile?.studentId}`;

    const { data: attendanceRecords = [] } = useQuery<AttendanceRecord[]>({
        queryKey: [apiPath],
        enabled: !!profile?.studentId,
    });

    if (!profile) return null;

    // Calculate attendance statistics
    const totalRecords = attendanceRecords.length;
    const presentCount = attendanceRecords.filter(r => r.status === "Present").length;
    const absentCount = attendanceRecords.filter(r => r.status === "Absent").length;
    const lateCount = attendanceRecords.filter(r => r.status === "Late").length;
    const leaveCount = attendanceRecords.filter(r => r.status === "Leave").length;
    const attendanceRate = totalRecords > 0 ? Math.round((presentCount / totalRecords) * 100) : 0;

    const downloadAttendanceReport = () => {
        if (!profile) return;

        const doc = new jsPDF();

        // Header
        doc.setFontSize(20);
        doc.text("Attendance Report", 14, 22);

        doc.setFontSize(12);
        doc.text(`Student: ${profile.name} (${profile.studentId})`, 14, 32);
        doc.text(`Class: ${profile.class} - Section ${profile.section}`, 14, 40);
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 48);

        // Summary
        doc.setFillColor(240, 240, 240);
        doc.rect(14, 55, 182, 25, "F");

        doc.setFontSize(10);
        doc.text(`Total Days: ${totalRecords}`, 20, 65);
        doc.text(`Present: ${presentCount}`, 20, 72);

        doc.text(`Absent: ${absentCount}`, 80, 65);
        doc.text(`Late: ${lateCount}`, 80, 72);

        doc.text(`Leave: ${leaveCount}`, 140, 65);
        doc.text(`Attendance Rate: ${attendanceRate}%`, 140, 72);

        // Table
        autoTable(doc, {
            startY: 85,
            head: [['Date', 'Status', 'Class', 'Remarks']],
            body: attendanceRecords.map(record => [
                record.date,
                record.status,
                `${record.class} ${record.section}`,
                record.remarks || '-'
            ]),
            styles: { fontSize: 9 },
            headStyles: { fillColor: [41, 128, 185], textColor: 255 },
            alternateRowStyles: { fillColor: [245, 245, 245] }
        });

        doc.save(`Attendance_Report_${profile.name.replace(/\s+/g, '_')}.pdf`);
    };

    return (
        <div className="space-y-6">
            {totalRecords > 0 ? (
                <>
                    {/* Attendance Summary */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="flex flex-col items-center p-3 bg-muted/50 rounded-lg border">
                            <CheckCircle className="w-5 h-5 text-green-500 mb-1" />
                            <span className="text-2xl font-bold">{presentCount}</span>
                            <span className="text-xs text-muted-foreground">Present</span>
                        </div>
                        <div className="flex flex-col items-center p-3 bg-muted/50 rounded-lg border">
                            <XCircle className="w-5 h-5 text-red-500 mb-1" />
                            <span className="text-2xl font-bold">{absentCount}</span>
                            <span className="text-xs text-muted-foreground">Absent</span>
                        </div>
                        <div className="flex flex-col items-center p-3 bg-muted/50 rounded-lg border">
                            <ClockIcon className="w-5 h-5 text-orange-500 mb-1" />
                            <span className="text-2xl font-bold">{lateCount}</span>
                            <span className="text-xs text-muted-foreground">Late</span>
                        </div>
                        <div className="flex flex-col items-center p-3 bg-muted/50 rounded-lg border">
                            <Calendar className="w-5 h-5 text-blue-500 mb-1" />
                            <span className="text-2xl font-bold">{leaveCount}</span>
                            <span className="text-xs text-muted-foreground">Leave</span>
                        </div>
                        <div className="flex flex-col items-center p-3 bg-muted/50 rounded-lg border">
                            <Clock className="w-5 h-5 text-purple-500 mb-1" />
                            <span className="text-2xl font-bold">{attendanceRate}%</span>
                            <span className="text-xs text-muted-foreground">Rate</span>
                        </div>
                    </div>

                    {/* Recent Attendance Records */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-medium">Attendance History ({totalRecords} records)</h4>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={downloadAttendanceReport}
                                className="h-8 gap-1"
                            >
                                <Download className="w-3 h-3" />
                                Download PDF
                            </Button>
                        </div>
                        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                            {attendanceRecords.map((record, idx) => (
                                <div key={idx} className="flex items-center justify-between py-2 px-3 border rounded-lg hover:bg-muted/40 transition-colors">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium">{record.date}</span>
                                        <span className="text-xs text-muted-foreground">{record.class} - Section {record.section}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {record.remarks && (
                                            <span className="text-xs text-muted-foreground italic max-w-[150px] truncate hidden sm:block">
                                                {record.remarks}
                                            </span>
                                        )}
                                        <StatusBadge status={record.status} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center bg-muted/20 rounded-lg border border-dashed">
                    <Calendar className="w-10 h-10 text-muted-foreground mb-3" />
                    <p className="text-muted-foreground font-medium">No attendance records found</p>
                    <p className="text-xs text-muted-foreground mt-1">This student has not been marked in any attendance register yet.</p>
                </div>
            )}
        </div>
    );
}
