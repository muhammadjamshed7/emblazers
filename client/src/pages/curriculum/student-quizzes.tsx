import { useState, useEffect, useRef } from "react";
import { ModuleLayout } from "@/components/layout/module-layout";
import { studentNavItems, useStudentQuizzes, useSubmitQuiz } from "./student-data";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ClipboardList, Clock, Award, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function StudentQuizzesPage() {
  const { session } = useAuth();
  const { toast } = useToast();

  const { data: quizzes = [], isLoading } = useStudentQuizzes();
  const submitQuizMutation = useSubmitQuiz();

  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);
  const [activeQuizData, setActiveQuizData] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const timerRef = useRef<any>(null);

  const activeQuizzes = quizzes.filter((q: any) => q.status === "active" && !q.attempted);
  const upcomingQuizzes = quizzes.filter((q: any) => q.status === "upcoming");
  const completedQuizzes = quizzes.filter((q: any) => q.attempted);
  const expiredQuizzes = quizzes.filter((q: any) => q.status === "expired" && !q.attempted);

  useEffect(() => {
    if (activeQuizData && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            clearInterval(timerRef.current);
            handleSubmitQuiz();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [activeQuizData]);

  const startQuiz = async (quizId: string, timeLimitMinutes: number) => {
    setLoadingQuiz(true);
    try {
      const res = await fetch(`/api/student-portal/quizzes/${quizId}/start`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("emblazers_token")}` },
      });
      if (!res.ok) {
        const data = await res.json();
        toast({ title: "Cannot start quiz", description: data.error, variant: "destructive" });
        setLoadingQuiz(false);
        return;
      }
      const data = await res.json();
      setActiveQuizId(quizId);
      setActiveQuizData(data);
      setAnswers({});
      setTimeLeft(timeLimitMinutes * 60);
    } catch {
      toast({ title: "Connection error", variant: "destructive" });
    }
    setLoadingQuiz(false);
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuizId || !activeQuizData) return;
    clearInterval(timerRef.current);

    const answerArray = (activeQuizData.questions || []).map((_: any, idx: number) => ({
      questionIndex: idx,
      givenAnswer: answers[idx] || "",
    }));

    const timeTaken = activeQuizData.timeLimitMinutes - Math.floor(timeLeft / 60);

    try {
      const result = await submitQuizMutation.mutateAsync({
        quizId: activeQuizId,
        answers: answerArray,
        timeTakenMinutes: Math.max(1, timeTaken),
      });
      toast({ title: `Quiz submitted! Score: ${result.percentage}% (${result.grade})` });
      setActiveQuizId(null);
      setActiveQuizData(null);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <ModuleLayout module="curriculum" navItems={studentNavItems}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Quizzes</h1>
          <p className="text-muted-foreground">Take quizzes and test your knowledge</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1,2,3].map(i => <div key={i} className="h-32 rounded-lg bg-muted animate-pulse" />)}
          </div>
        ) : (
          <>
            {activeQuizzes.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2"><ClipboardList className="w-5 h-5 text-blue-600" /> Available Now ({activeQuizzes.length})</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeQuizzes.map((q: any) => (
                    <Card key={q.id} data-testid={`card-quiz-${q.id}`}>
                      <CardContent className="pt-6">
                        <h3 className="font-semibold text-lg mb-1">{q.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{q.subject} - by {q.teacherName}</p>
                        <div className="flex gap-3 text-sm text-muted-foreground mb-3">
                          <span>{q.questionsCount} questions</span>
                          <span>{q.totalMarks} marks</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {q.timeLimitMinutes} min</span>
                        </div>
                        {q.instructions && <p className="text-sm mb-3 text-muted-foreground">{q.instructions}</p>}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                          <span>Ends: {new Date(q.endDateTime).toLocaleString()}</span>
                        </div>
                        <Button onClick={() => startQuiz(q.id, q.timeLimitMinutes)} disabled={loadingQuiz} data-testid={`button-start-quiz-${q.id}`}>
                          {loadingQuiz ? "Loading..." : "Start Quiz"}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {completedQuizzes.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2"><CheckCircle className="w-5 h-5 text-emerald-600" /> Completed ({completedQuizzes.length})</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {completedQuizzes.map((q: any) => (
                    <Card key={q.id} className="border-emerald-200">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{q.title}</h3>
                          <Badge variant={q.myResult?.isPassed ? "default" : "destructive"}>{q.myResult?.grade}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{q.subject}</p>
                        <div className="flex items-center gap-3 mt-2 text-sm">
                          <span>{q.myResult?.totalMarksObtained}/{q.totalMarks}</span>
                          <span>{q.myResult?.percentage}%</span>
                          <Badge variant={q.myResult?.isPassed ? "default" : "destructive"} className="text-xs">{q.myResult?.isPassed ? "Passed" : "Failed"}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {upcomingQuizzes.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2"><Clock className="w-5 h-5 text-amber-600" /> Upcoming ({upcomingQuizzes.length})</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {upcomingQuizzes.map((q: any) => (
                    <Card key={q.id} className="opacity-75">
                      <CardContent className="pt-6">
                        <h3 className="font-semibold">{q.title}</h3>
                        <p className="text-sm text-muted-foreground">{q.subject} | Starts: {new Date(q.startDateTime).toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">{q.questionsCount} questions | {q.totalMarks} marks | {q.timeLimitMinutes} min</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {expiredQuizzes.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2"><XCircle className="w-5 h-5 text-red-500" /> Expired ({expiredQuizzes.length})</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {expiredQuizzes.map((q: any) => (
                    <Card key={q.id} className="opacity-50">
                      <CardContent className="pt-6">
                        <h3 className="font-semibold">{q.title}</h3>
                        <p className="text-sm text-muted-foreground">{q.subject} | Ended: {new Date(q.endDateTime).toLocaleString()}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {activeQuizzes.length === 0 && upcomingQuizzes.length === 0 && completedQuizzes.length === 0 && (
              <Card><CardContent className="py-12 text-center text-muted-foreground">No quizzes available at the moment.</CardContent></Card>
            )}
          </>
        )}

        <Dialog open={!!activeQuizData} onOpenChange={(open) => { if (!open && confirm("Are you sure? Your progress will be lost.")) { clearInterval(timerRef.current); setActiveQuizId(null); setActiveQuizData(null); } }}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            {activeQuizData && (
              <>
                <DialogHeader>
                  <div className="flex items-center justify-between">
                    <DialogTitle>{activeQuizData.title}</DialogTitle>
                    <div className={`flex items-center gap-1 text-sm font-mono px-3 py-1 rounded-full ${timeLeft < 60 ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                      <Clock className="w-4 h-4" /> {formatTime(timeLeft)}
                    </div>
                  </div>
                </DialogHeader>
                <div className="space-y-6">
                  {(activeQuizData.questions || []).map((q: any, idx: number) => (
                    <Card key={idx}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-3">
                          <Label className="font-medium text-base">Q{idx + 1}. {q.questionText}</Label>
                          <Badge variant="outline">{q.marks} marks</Badge>
                        </div>

                        {q.questionType === "mcq" && (
                          <RadioGroup value={answers[q.questionIndex] || ""} onValueChange={v => setAnswers(a => ({ ...a, [q.questionIndex]: v }))}>
                            {(q.options || []).map((opt: string, oi: number) => (
                              <div key={oi} className="flex items-center space-x-2 py-1">
                                <RadioGroupItem value={opt} id={`q${idx}-o${oi}`} data-testid={`radio-q${idx}-o${oi}`} />
                                <Label htmlFor={`q${idx}-o${oi}`} className="cursor-pointer">{opt}</Label>
                              </div>
                            ))}
                          </RadioGroup>
                        )}

                        {q.questionType === "truefalse" && (
                          <RadioGroup value={answers[q.questionIndex] || ""} onValueChange={v => setAnswers(a => ({ ...a, [q.questionIndex]: v }))}>
                            {["True", "False"].map(opt => (
                              <div key={opt} className="flex items-center space-x-2 py-1">
                                <RadioGroupItem value={opt} id={`q${idx}-${opt}`} data-testid={`radio-q${idx}-${opt.toLowerCase()}`} />
                                <Label htmlFor={`q${idx}-${opt}`} className="cursor-pointer">{opt}</Label>
                              </div>
                            ))}
                          </RadioGroup>
                        )}

                        {q.questionType === "short" && (
                          <Input value={answers[q.questionIndex] || ""} onChange={e => setAnswers(a => ({ ...a, [q.questionIndex]: e.target.value }))} placeholder="Type your answer" data-testid={`input-answer-${idx}`} />
                        )}
                      </CardContent>
                    </Card>
                  ))}

                  <div className="flex items-center justify-between pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      {Object.keys(answers).length}/{activeQuizData.questions?.length || 0} answered
                    </p>
                    <Button onClick={handleSubmitQuiz} disabled={submitQuizMutation.isPending} data-testid="button-submit-quiz">
                      {submitQuizMutation.isPending ? "Submitting..." : "Submit Quiz"}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </ModuleLayout>
  );
}
