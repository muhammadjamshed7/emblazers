import { ModuleLayout } from "@/components/layout/module-layout";
import { studentNavItems, useStudentResults } from "./student-data";
import { useAuth } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function StudentResultsPage() {
  const { session } = useAuth();
  const { data: results = [], isLoading } = useStudentResults();

  const totalAttempts = results.length;
  const totalPassed = results.filter((a: any) => a.isPassed).length;
  const avgPercentage = totalAttempts > 0 ? Math.round(results.reduce((sum: number, a: any) => sum + (a.percentage || 0), 0) / totalAttempts) : 0;
  const bestGrade = totalAttempts > 0 ? results.reduce((best: string, a: any) => {
    const order = ["A+", "A", "B", "C", "D", "F"];
    return order.indexOf(a.grade) < order.indexOf(best) ? a.grade : best;
  }, "F") : "-";

  return (
    <ModuleLayout module="curriculum" navItems={studentNavItems}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">My Results</h1>
          <p className="text-muted-foreground">View your quiz and exam results</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Total Quizzes</p>
              <p className="text-3xl font-bold">{totalAttempts}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Passed</p>
              <p className="text-3xl font-bold text-emerald-600">{totalPassed}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Avg. Score</p>
              <p className="text-3xl font-bold">{avgPercentage}%</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Best Grade</p>
              <p className="text-3xl font-bold text-violet-600">{bestGrade}</p>
            </CardContent>
          </Card>
        </div>

        {isLoading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 rounded-lg bg-muted animate-pulse" />)}</div>
        ) : results.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">No results yet. Take a quiz to see your results here.</CardContent></Card>
        ) : (
          <div className="rounded-lg border overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 text-sm font-medium">Quiz</th>
                  <th className="text-left p-3 text-sm font-medium">Subject</th>
                  <th className="text-left p-3 text-sm font-medium">Teacher</th>
                  <th className="text-left p-3 text-sm font-medium">Score</th>
                  <th className="text-left p-3 text-sm font-medium">Percentage</th>
                  <th className="text-left p-3 text-sm font-medium">Grade</th>
                  <th className="text-left p-3 text-sm font-medium">Status</th>
                  <th className="text-left p-3 text-sm font-medium">Time</th>
                  <th className="text-left p-3 text-sm font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {results.map((a: any) => (
                  <tr key={a.id} className="border-t" data-testid={`row-result-${a.id}`}>
                    <td className="p-3 text-sm font-medium">{a.quizTitle}</td>
                    <td className="p-3 text-sm">{a.subject}</td>
                    <td className="p-3 text-sm text-muted-foreground">{a.teacherName}</td>
                    <td className="p-3 text-sm">{a.totalMarksObtained}/{a.totalMarks}</td>
                    <td className="p-3 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-violet-500 rounded-full" style={{ width: `${a.percentage}%` }} />
                        </div>
                        <span>{a.percentage}%</span>
                      </div>
                    </td>
                    <td className="p-3"><Badge variant="outline">{a.grade}</Badge></td>
                    <td className="p-3"><Badge variant={a.isPassed ? "default" : "destructive"}>{a.isPassed ? "Pass" : "Fail"}</Badge></td>
                    <td className="p-3 text-sm text-muted-foreground">{a.timeTakenMinutes} min</td>
                    <td className="p-3 text-sm text-muted-foreground">{a.submittedAt ? new Date(a.submittedAt).toLocaleDateString() : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </ModuleLayout>
  );
}
