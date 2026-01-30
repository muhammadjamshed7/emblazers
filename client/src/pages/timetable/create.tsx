import { useState } from "react";
import { useLocation } from "wouter";
import { ModuleLayout } from "@/components/layout/module-layout";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { timetableNavItems, useTimetableData, classes, sections, days, periods, subjects, teachers } from "./timetable-data";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2 } from "lucide-react";

interface TimetableSlot {
  day: string;
  period: number;
  subject: string;
  teacherId: string;
  teacherName: string;
}

export default function CreateTimetable() {
  const { addTimetable, isPending } = useTimetableData();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [slots, setSlots] = useState<TimetableSlot[]>([]);

  const addSlot = () => {
    setSlots([...slots, { day: "Monday", period: 1, subject: "", teacherId: "", teacherName: "" }]);
  };

  const removeSlot = (index: number) => {
    setSlots(slots.filter((_, i) => i !== index));
  };

  const updateSlot = (index: number, field: keyof TimetableSlot, value: string | number) => {
    const updated = [...slots];
    if (field === "teacherId") {
      const teacher = teachers.find(t => t.id === value);
      updated[index].teacherId = value as string;
      updated[index].teacherName = teacher?.name || "";
    } else {
      (updated[index] as any)[field] = value;
    }
    setSlots(updated);
  };

  const handleSubmit = async () => {
    if (!selectedClass || !selectedSection) {
      toast({ title: "Error", description: "Please select class and section", variant: "destructive" });
      return;
    }

    if (slots.length === 0) {
      toast({ title: "Error", description: "Please add at least one period", variant: "destructive" });
      return;
    }

    const incompleteSlots = slots.some(s => !s.subject || !s.teacherId);
    if (incompleteSlots) {
      toast({ title: "Error", description: "Please complete all slot details", variant: "destructive" });
      return;
    }

    try {
      await addTimetable({
        class: selectedClass,
        section: selectedSection,
        slots: slots.map(s => ({
          day: s.day,
          period: s.period,
          subject: s.subject,
          teacherId: s.teacherId,
          teacherName: s.teacherName
        })),
        updatedAt: new Date().toISOString()
      });

      toast({ title: "Success", description: "Timetable created successfully" });
      setLocation("/timetable/class");
    } catch (error) {
      console.error("Failed to create timetable:", error);
      toast({ title: "Error", description: "Failed to create timetable. Please try again.", variant: "destructive" });
    }
  };

  return (
    <ModuleLayout module="timetable" navItems={timetableNavItems}>
      <div className="space-y-6">
        <PageHeader
          title="Create Timetable"
          description="Create a new class timetable"
        />

        <Card>
          <CardHeader>
            <CardTitle>Timetable Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Class *</Label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger data-testid="select-class">
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Section *</Label>
                <Select value={selectedSection} onValueChange={setSelectedSection}>
                  <SelectTrigger data-testid="select-section">
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent>
                    {sections.map((sec) => (
                      <SelectItem key={sec} value={sec}>{sec}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium">Timetable Slots</h4>
                <Button type="button" variant="outline" onClick={addSlot} data-testid="button-add-slot">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Period
                </Button>
              </div>
              
              {slots.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border rounded-md">
                  No periods added yet. Click "Add Period" to start.
                </div>
              ) : (
                <div className="space-y-3">
                  {slots.map((slot, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-3 p-3 border rounded-md items-end">
                      <div className="space-y-1">
                        <Label className="text-xs">Day</Label>
                        <Select value={slot.day} onValueChange={(v) => updateSlot(index, "day", v)}>
                          <SelectTrigger data-testid={`select-day-${index}`}>
                            <SelectValue placeholder="Day" />
                          </SelectTrigger>
                          <SelectContent>
                            {days.map((d) => (
                              <SelectItem key={d} value={d}>{d}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Period</Label>
                        <Select value={String(slot.period)} onValueChange={(v) => updateSlot(index, "period", Number(v))}>
                          <SelectTrigger data-testid={`select-period-${index}`}>
                            <SelectValue placeholder="Period" />
                          </SelectTrigger>
                          <SelectContent>
                            {periods.map((p) => (
                              <SelectItem key={p} value={String(p)}>Period {p}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Subject</Label>
                        <Select value={slot.subject} onValueChange={(v) => updateSlot(index, "subject", v)}>
                          <SelectTrigger data-testid={`select-subject-${index}`}>
                            <SelectValue placeholder="Subject" />
                          </SelectTrigger>
                          <SelectContent>
                            {subjects.map((s) => (
                              <SelectItem key={s} value={s}>{s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Teacher</Label>
                        <Select value={slot.teacherId} onValueChange={(v) => updateSlot(index, "teacherId", v)}>
                          <SelectTrigger data-testid={`select-teacher-${index}`}>
                            <SelectValue placeholder="Teacher" />
                          </SelectTrigger>
                          <SelectContent>
                            {teachers.map((t) => (
                              <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-end">
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeSlot(index)} data-testid={`button-remove-slot-${index}`}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button variant="outline" onClick={() => setLocation("/timetable/class")} data-testid="button-cancel">Cancel</Button>
              <Button onClick={handleSubmit} disabled={isPending} data-testid="button-save">
                {isPending ? "Saving..." : "Save Timetable"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </ModuleLayout>
  );
}
