import { useState } from "react";
import { ModuleLayout } from "@/components/layout/module-layout";
import { studentNavItems, useStudentDashboard, useChangePassword } from "./student-data";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileText, ClipboardList, BarChart3, CreditCard, CalendarCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function StudentDashboard() {
  const { session } = useAuth();
  const { toast } = useToast();
  const className = session?.className || "";
  const section = session?.section || "";

  const { data: dashboard, isLoading } = useStudentDashboard();
  const changePasswordMutation = useChangePassword();

  const [showPasswordDialog, setShowPasswordDialog] = useState(session?.isFirstLogin || false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const stats = [
    { label: "Active Quizzes", value: dashboard?.activeQuizzesCount ?? 0, icon: ClipboardList, color: "text-blue-600" },
    { label: "Completed Quizzes", value: dashboard?.completedQuizzesCount ?? 0, icon: BarChart3, color: "text-violet-600" },
    { label: "Pending Fees", value: dashboard?.pendingFeesTotal ? `Rs. ${dashboard.pendingFeesTotal.toLocaleString()}` : "Rs. 0", icon: CreditCard, color: "text-amber-600" },
    { label: "Attendance", value: `${dashboard?.thisMonthAttendance ?? 0}%`, icon: CalendarCheck, color: "text-emerald-600" },
  ];

  const handleChangePassword = async () => {
    try {
      await changePasswordMutation.mutateAsync({ currentPassword, newPassword });
      toast({ title: "Password changed successfully" });
      setShowPasswordDialog(false);
      setCurrentPassword("");
      setNewPassword("");
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
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

        {dashboard?.profile && (
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div><span className="text-muted-foreground">Name:</span> <span className="font-medium">{dashboard.profile.name}</span></div>
                <div><span className="text-muted-foreground">Student ID:</span> <span className="font-medium font-mono">{dashboard.profile.studentId}</span></div>
                <div><span className="text-muted-foreground">Class:</span> <span className="font-medium">{dashboard.profile.class} - {dashboard.profile.section}</span></div>
                <div><span className="text-muted-foreground">Parent:</span> <span className="font-medium">{dashboard.profile.parentName}</span></div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <Card key={s.label}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{s.label}</p>
                    <p className="text-3xl font-bold" data-testid={`stat-${s.label.toLowerCase().replace(/\s/g, '-')}`}>{isLoading ? "..." : s.value}</p>
                  </div>
                  <s.icon className={`w-8 h-8 ${s.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
          <DialogContent>
            <DialogHeader><DialogTitle>{session?.isFirstLogin ? "Set Your Password" : "Change Password"}</DialogTitle></DialogHeader>
            {session?.isFirstLogin && (
              <p className="text-sm text-muted-foreground">This is your first login. Please set a new password to continue.</p>
            )}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Current Password</Label>
                <Input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} data-testid="input-current-password" />
              </div>
              <div className="space-y-2">
                <Label>New Password</Label>
                <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="At least 6 characters" data-testid="input-new-password" />
              </div>
              <Button onClick={handleChangePassword} disabled={changePasswordMutation.isPending || !currentPassword || newPassword.length < 6} className="w-full" data-testid="button-submit-password">
                {changePasswordMutation.isPending ? "Changing..." : "Change Password"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </ModuleLayout>
  );
}
