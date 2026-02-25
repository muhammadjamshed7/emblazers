import { ModuleLayout } from "@/components/layout/module-layout";
import { teacherNavItems, useTeacherAssignments, useTeacherContent, useTeacherQuizzes } from "./teacher-data";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, FileText, ClipboardList, Users } from "lucide-react";

export default function TeacherDashboard() {
  const { session } = useAuth();
  const staffId = session?.staffId || "";

  const { data: assignments = [], isLoading: assignmentsLoading } = useTeacherAssignments(staffId);
  const { content, isLoading: contentLoading } = useTeacherContent(staffId);
  const { quizzes, attempts, isLoading: quizzesLoading } = useTeacherQuizzes(staffId);

  const isLoading = assignmentsLoading || contentLoading || quizzesLoading;
  const publishedContent = content.filter((c: any) => c.isPublished);
  const publishedQuizzes = quizzes.filter((q: any) => q.isPublished);

  const stats = [
    { label: "Assigned Classes", value: assignments.length, icon: BookOpen, color: "text-violet-600" },
    { label: "Content Uploaded", value: content.length, icon: FileText, color: "text-emerald-600" },
    { label: "Quizzes Created", value: quizzes.length, icon: ClipboardList, color: "text-blue-600" },
    { label: "Student Attempts", value: attempts.length, icon: Users, color: "text-amber-600" },
  ];

  return (
    <ModuleLayout module="curriculum" navItems={teacherNavItems}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Teacher Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {session?.name}</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="h-28 rounded-lg bg-muted animate-pulse" />)}
          </div>
        ) : (
          <>
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
                  <CardTitle className="text-lg">My Assignments</CardTitle>
                </CardHeader>
                <CardContent>
                  {assignments.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No assignments yet. Contact admin.</p>
                  ) : (
                    <div className="space-y-3">
                      {assignments.map((a: any) => (
                        <div key={a.id} className="flex items-center justify-between p-3 rounded-lg border">
                          <div>
                            <p className="font-medium">{a.className} - {a.section}</p>
                            <p className="text-sm text-muted-foreground">{a.subject}</p>
                          </div>
                          <Badge variant={a.isActive ? "default" : "secondary"}>{a.isActive ? "Active" : "Inactive"}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <FileText className="w-4 h-4 text-emerald-500" />
                      <span>{publishedContent.length} published content items</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <ClipboardList className="w-4 h-4 text-blue-500" />
                      <span>{publishedQuizzes.length} published quizzes</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Users className="w-4 h-4 text-amber-500" />
                      <span>{attempts.length} quiz attempts received</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </ModuleLayout>
  );
}
