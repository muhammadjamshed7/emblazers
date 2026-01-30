import { useState } from "react";
import { ModuleLayout } from "@/components/layout/module-layout";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { timetableNavItems, useTimetableData, teachers, days, periods } from "./timetable-data";

export default function TeacherTimetables() {
  const { timetables } = useTimetableData();
  const [selectedTeacher, setSelectedTeacher] = useState(teachers[0].id);

  const teacher = teachers.find((t) => t.id === selectedTeacher);

  const getTeacherSlots = () => {
    const slots: { day: string; period: number; class: string; section: string; subject: string }[] = [];
    timetables.forEach((tt) => {
      tt.slots.forEach((slot) => {
        if (slot.teacherId === selectedTeacher) {
          slots.push({
            day: slot.day,
            period: slot.period,
            class: tt.class,
            section: tt.section,
            subject: slot.subject,
          });
        }
      });
    });
    return slots;
  };

  const teacherSlots = getTeacherSlots();

  const getSlot = (day: string, period: number) => {
    return teacherSlots.find((s) => s.day === day && s.period === period);
  };

  return (
    <ModuleLayout module="timetable" navItems={timetableNavItems}>
      <div className="space-y-6">
        <PageHeader
          title="Teacher Timetables"
          description="View individual teacher schedules"
        />

        <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
          <SelectTrigger className="w-[280px]" data-testid="select-teacher">
            <SelectValue placeholder="Select Teacher" />
          </SelectTrigger>
          <SelectContent>
            {teachers.map((t) => (
              <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Card>
          <CardHeader>
            <CardTitle>{teacher?.name} - {teacher?.subject}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr>
                    <th className="border p-2 bg-muted">Day / Period</th>
                    {periods.slice(0, 6).map((p) => (
                      <th key={p} className="border p-2 bg-muted">Period {p}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {days.map((day) => (
                    <tr key={day}>
                      <td className="border p-2 font-medium bg-muted/50">{day}</td>
                      {periods.slice(0, 6).map((period) => {
                        const slot = getSlot(day, period);
                        return (
                          <td key={period} className="border p-2 text-center">
                            {slot ? (
                              <div>
                                <div className="font-medium">{slot.class} {slot.section}</div>
                                <div className="text-xs text-muted-foreground">{slot.subject}</div>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">Free</span>
                            )}
                          </td>
                        );
                      })}
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
