import { useState } from "react";
import { ModuleLayout } from "@/components/layout/module-layout";
import { studentNavItems, useStudentContent, useStudentQuizzes, useStudentQuizAttempts } from "./student-data";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileText, ClipboardList, BarChart3, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function StudentDashboard() {
  const { session } = useAuth();
  const { toast } = useToast();
  const className = session?.className || "";
  const section = session?.section || "";
  const studentId = session?.studentId || "";

  const { data: content = [] } = useStudentContent(className, section);
  const { data: quizzes = [] } = useStudentQuizzes(className, section);
  const { attempts } = useStudentQuizAttempts(studentId);

  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  const now = new Date();
  const activeQuizzes = quizzes.filter((q: any) => new Date(q.endDateTime) > now);
  const attemptedQuizIds = new Set(attempts.map((a: any) => a.quizId));
  const pendingQuizzes = activeQuizzes.filter((q: any) => !attemptedQuizIds.has(q.id));

  const avgPercentage = attempts.length > 0 ? Math.round(attempts.reduce((sum: number, a: any) => sum + (a.percentage || 0), 0) / attempts.length) : 0;

  const stats = [
    { label: "Study Materials", value: content.length, icon: FileText, color: "text-emerald-600" },
    { label: "Pending Quizzes", value: pendingQuizzes.length, icon: ClipboardList, color: "text-blue-600" },
    { label: "Completed Quizzes", value: attempts.length, icon: BarChart3, color: "text-violet-600" },
    { label: "Avg. Score", value: `${avgPercentage}%`, icon: BookOpen, color: "text-amber-600" },
  ];

  const handleChangePassword = async () => {
    setChangingPassword(true);
    try {
      const res = await fetch("/api/curriculum/student-change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("emblazers_token")}` },
        body: JSON.stringify({ studentId, currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        toast({ title: "Password changed successfully" });
        setShowPasswordDialog(false);
        setCurrentPassword("");
        setNewPassword("");
      } else {
        toast({ title: "Error", description: data.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "Connection error", variant: "destructive" });
    }
    setChangingPassword(false);
  };

  return (
    <ModuleLayout module="curriculum" navItems={studentNavItems}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-page-title">Student Dashboard</h1>
            <p className="text-muted-foreground">Welcome, {session?.name} ({className} - {section})</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowPasswordDialog(true)} data-testid="button-change-password">
            Change Password
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <Card key={s.label}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{s.label}</p>
                    <p className="text-3xl font-bold" data-testid={`stat-${s.label.toLowerCase().replace(/\s/g, '-')}`}>{s.value}</p>
                  </div>
                  <s.icon className={`w-8 h-8 ${s.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pending Quizzes</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingQuizzes.length === 0 ? (
                <p className="text-muted-foreground text-sm">No pending quizzes. All caught up!</p>
              ) : (
                <div className="space-y-3">
                  {pendingQuizzes.slice(0, 5).map((q: any) => (
                    <div key={q.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="font-medium">{q.title}</p>
                        <p className="text-sm text-muted-foreground">{q.subject} | {q.totalMarks} marks | {q.timeLimitMinutes} min</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Results</CardTitle>
            </CardHeader>
            <CardContent>
              {attempts.length === 0 ? (
                <p className="text-muted-foreground text-sm">No quiz results yet.</p>
              ) : (
                <div className="space-y-3">
                  {attempts.slice(0, 5).map((a: any) => (
                    <div key={a.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="font-medium">Quiz Result</p>
                        <p className="text-sm text-muted-foreground">{a.totalMarksObtained}/{a.totalMarks} ({a.percentage}%)</p>
                      </div>
                      <span className={`text-sm font-semibold ${a.isPassed ? 'text-emerald-600' : 'text-red-600'}`}>{a.grade}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
          <DialogContent>
            <DialogHeader><DialogTitle>Change Password</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Current Password</Label>
                <Input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} data-testid="input-current-password" />
              </div>
              <div className="space-y-2">
                <Label>New Password</Label>
                <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="At least 6 characters" data-testid="input-new-password" />
              </div>
              <Button onClick={handleChangePassword} disabled={changingPassword} className="w-full" data-testid="button-submit-password">
                {changingPassword ? "Changing..." : "Change Password"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </ModuleLayout>
  );
}
