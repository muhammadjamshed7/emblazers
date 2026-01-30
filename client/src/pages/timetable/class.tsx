import { useState } from "react";
import { ModuleLayout } from "@/components/layout/module-layout";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { timetableNavItems, useTimetableData, classes, sections, days, periods } from "./timetable-data";

export default function ClassTimetables() {
  const { timetables } = useTimetableData();
  const [selectedClass, setSelectedClass] = useState("Class 5");
  const [selectedSection, setSelectedSection] = useState("A");

  const timetable = timetables.find((t) => t.class === selectedClass && t.section === selectedSection);

  const getSlot = (day: string, period: number) => {
    if (!timetable) return null;
    return timetable.slots.find((s) => s.day === day && s.period === period);
  };

  return (
    <ModuleLayout module="timetable" navItems={timetableNavItems}>
      <div className="space-y-6">
        <PageHeader
          title="Class Timetables"
          description="View timetables by class and section"
        />

        <div className="flex flex-wrap gap-4">
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

          <Select value={selectedSection} onValueChange={setSelectedSection}>
            <SelectTrigger className="w-[180px]" data-testid="select-section">
              <SelectValue placeholder="Select Section" />
            </SelectTrigger>
            <SelectContent>
              {sections.map((sec) => (
                <SelectItem key={sec} value={sec}>{sec}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{selectedClass} - Section {selectedSection}</CardTitle>
          </CardHeader>
          <CardContent>
            {timetable ? (
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
                                  <div className="font-medium">{slot.subject}</div>
                                  <div className="text-xs text-muted-foreground">{slot.teacherName}</div>
                                </div>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No timetable found for {selectedClass} - Section {selectedSection}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ModuleLayout>
  );
}
