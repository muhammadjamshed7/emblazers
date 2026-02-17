import { ModuleLayout } from "@/components/layout/module-layout";
import { StatsCard, StatsGrid } from "@/components/shared/stats-card";
import { RecentTable } from "@/components/shared/recent-table";
import { curriculumNavItems, useCurriculumData, useQuizData } from "./curriculum-data";
import { BookOpen, GraduationCap, FileText, TrendingUp, ClipboardList, BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function CurriculumDashboard() {
  const { curriculum, exams, results } = useCurriculumData();
  const { quizzes, attempts } = useQuizData();

  const totalTopics = curriculum.reduce((acc, c) => acc + c.topics.length, 0);
  const completedTopics = curriculum.reduce((acc, c) => acc + c.topics.filter((t) => t.status === "Completed").length, 0);
  const progressPercentage = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  const publishedQuizzes = quizzes.filter(q => q.status === "Published");
  const avgQuizScore = attempts.length > 0
    ? Math.round(attempts.reduce((sum, a) => sum + (a.maxScore > 0 ? (a.score / a.maxScore) * 100 : 0), 0) / attempts.length)
    : 0;

  const recentResults = results.slice(0, 5);
  const recentAttempts = attempts.slice(0, 5);

  return (
    <ModuleLayout module="curriculum" navItems={curriculumNavItems}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-semibold" data-testid="text-page-title">Curriculum Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage syllabus, exams, quizzes, and results</p>
        </div>

        <StatsGrid>
          <StatsCard
            title="Total Subjects"
            value={curriculum.length}
            icon={BookOpen}
            iconColor="text-violet-500"
          />
          <StatsCard
            title="Active Exams"
            value={exams.length}
            icon={GraduationCap}
            iconColor="text-blue-500"
          />
          <StatsCard
            title="Syllabus Progress"
            value={`${progressPercentage}%`}
            icon={TrendingUp}
            iconColor="text-orange-500"
            subtitle={`${completedTopics}/${totalTopics} topics`}
          />
          <StatsCard
            title="Published Quizzes"
            value={publishedQuizzes.length}
            icon={ClipboardList}
            iconColor="text-emerald-500"
            subtitle={`${attempts.length} attempts`}
          />
          <StatsCard
            title="Results Entered"
            value={results.length}
            icon={FileText}
            iconColor="text-green-500"
          />
          <StatsCard
            title="Avg Quiz Score"
            value={`${avgQuizScore}%`}
            icon={BarChart3}
            iconColor="text-cyan-500"
            subtitle={`${attempts.length} attempts graded`}
          />
        </StatsGrid>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentTable
            title="Syllabus Progress by Subject"
            data={curriculum.slice(0, 5)}
            columns={[
              { key: "class", label: "Class" },
              { key: "subject", label: "Subject" },
              {
                key: "progress",
                label: "Progress",
                render: (item) => {
                  const completed = item.topics.filter((t) => t.status === "Completed").length;
                  const total = item.topics.length;
                  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
                  return (
                    <div className="flex items-center gap-2 min-w-[120px]">
                      <Progress value={pct} className="h-2 flex-1" />
                      <span className="text-xs text-muted-foreground w-10">{pct}%</span>
                    </div>
                  );
                },
              },
            ]}
            getRowKey={(item) => item.id}
          />

          <RecentTable
            title="Recent Quiz Attempts"
            data={recentAttempts}
            columns={[
              { key: "studentName", label: "Student" },
              { key: "quizTitle", label: "Quiz" },
              { key: "score", label: "Score", render: (item) => `${item.score}/${item.maxScore}` },
              { key: "status", label: "Status", render: (item) => (
                <Badge variant={item.status === "Graded" ? "default" : "secondary"}>{item.status}</Badge>
              )},
            ]}
            getRowKey={(item) => item.id}
          />
        </div>
      </div>
    </ModuleLayout>
  );
}
