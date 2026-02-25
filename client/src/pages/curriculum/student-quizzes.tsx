import { useState, useEffect, useRef } from "react";
import { ModuleLayout } from "@/components/layout/module-layout";
import { studentNavItems, useStudentQuizzes, useStudentQuizAttempts } from "./student-data";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ClipboardList, Clock, Award, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function StudentQuizzesPage() {
  const { session } = useAuth();
  const { toast } = useToast();
  const className = session?.className || "";
  const section = session?.section || "";
  const studentId = session?.studentId || "";
  const studentName = session?.name || "";

  const { data: quizzes = [] } = useStudentQuizzes(className, section);
  const { attempts, submitAttempt, isPending } = useStudentQuizAttempts(studentId);
  const attemptedQuizIds = new Set(attempts.map((a: any) => a.quizId));

  const [activeQuiz, setActiveQuiz] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef<any>(null);

  const now = new Date();
  const availableQuizzes = quizzes.filter((q: any) => {
    const start = new Date(q.startDateTime);
    const end = new Date(q.endDateTime);
    return now >= start && now <= end && !attemptedQuizIds.has(q.id);
  });

  const upcomingQuizzes = quizzes.filter((q: any) => new Date(q.startDateTime) > now);
  const expiredQuizzes = quizzes.filter((q: any) => new Date(q.endDateTime) < now || attemptedQuizIds.has(q.id));

  useEffect(() => {
    if (activeQuiz && timeLeft > 0) {
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
  }, [activeQuiz]);

  const startQuiz = (quiz: any) => {
    setActiveQuiz(quiz);
    setAnswers({});
    setTimeLeft(quiz.timeLimitMinutes * 60);
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuiz) return;
    clearInterval(timerRef.current);

    const answerArray = (activeQuiz.questions || []).map((_: any, idx: number) => ({
      questionIndex: idx,
      givenAnswer: answers[idx] || "",
    }));

    const timeTaken = activeQuiz.timeLimitMinutes - Math.floor(timeLeft / 60);

    try {
      await submitAttempt({
        quizId: activeQuiz.id,
        studentId,
        studentName,
        className,
        section,
        answers: answerArray,
        totalMarks: activeQuiz.totalMarks,
        timeTakenMinutes: Math.max(1, timeTaken),
      });
      toast({ title: "Quiz submitted successfully!" });
      setActiveQuiz(null);
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

        {availableQuizzes.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2"><ClipboardList className="w-5 h-5 text-blue-600" /> Available Now</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableQuizzes.map((q: any) => (
                <Card key={q.id} data-testid={`card-quiz-${q.id}`}>
                  <CardContent className="pt-6">
                    <h3 className="font-semibold text-lg mb-1">{q.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{q.subject}</p>
                    <div className="flex gap-3 text-sm text-muted-foreground mb-3">
                      <span>{q.questions?.length || 0} questions</span>
                      <span>{q.totalMarks} marks</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {q.timeLimitMinutes} min</span>
                    </div>
                    {q.instructions && <p className="text-sm mb-3 text-muted-foreground">{q.instructions}</p>}
                    <Button onClick={() => startQuiz(q)} data-testid={`button-start-quiz-${q.id}`}>Start Quiz</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {upcomingQuizzes.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2"><Clock className="w-5 h-5 text-amber-600" /> Upcoming</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcomingQuizzes.map((q: any) => (
                <Card key={q.id} className="opacity-75">
                  <CardContent className="pt-6">
                    <h3 className="font-semibold">{q.title}</h3>
                    <p className="text-sm text-muted-foreground">{q.subject} | Starts: {new Date(q.startDateTime).toLocaleString()}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {availableQuizzes.length === 0 && upcomingQuizzes.length === 0 && (
          <Card><CardContent className="py-12 text-center text-muted-foreground">No quizzes available at the moment.</CardContent></Card>
        )}

        <Dialog open={!!activeQuiz} onOpenChange={(open) => { if (!open && confirm("Are you sure? Your progress will be lost.")) setActiveQuiz(null); }}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            {activeQuiz && (
              <>
                <DialogHeader>
                  <div className="flex items-center justify-between">
                    <DialogTitle>{activeQuiz.title}</DialogTitle>
                    <div className={`flex items-center gap-1 text-sm font-mono px-3 py-1 rounded-full ${timeLeft < 60 ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                      <Clock className="w-4 h-4" /> {formatTime(timeLeft)}
                    </div>
                  </div>
                </DialogHeader>
                <div className="space-y-6">
                  {(activeQuiz.questions || []).map((q: any, idx: number) => (
                    <Card key={idx}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-3">
                          <Label className="font-medium text-base">Q{idx + 1}. {q.questionText}</Label>
                          <Badge variant="outline">{q.marks} marks</Badge>
                        </div>

                        {q.questionType === "mcq" && (
                          <RadioGroup value={answers[idx] || ""} onValueChange={v => setAnswers(a => ({ ...a, [idx]: v }))}>
                            {(q.options || []).map((opt: string, oi: number) => (
                              <div key={oi} className="flex items-center space-x-2 py-1">
                                <RadioGroupItem value={opt} id={`q${idx}-o${oi}`} data-testid={`radio-q${idx}-o${oi}`} />
                                <Label htmlFor={`q${idx}-o${oi}`} className="cursor-pointer">{opt}</Label>
                              </div>
                            ))}
                          </RadioGroup>
                        )}

                        {q.questionType === "truefalse" && (
                          <RadioGroup value={answers[idx] || ""} onValueChange={v => setAnswers(a => ({ ...a, [idx]: v }))}>
                            {["True", "False"].map(opt => (
                              <div key={opt} className="flex items-center space-x-2 py-1">
                                <RadioGroupItem value={opt} id={`q${idx}-${opt}`} data-testid={`radio-q${idx}-${opt.toLowerCase()}`} />
                                <Label htmlFor={`q${idx}-${opt}`} className="cursor-pointer">{opt}</Label>
                              </div>
                            ))}
                          </RadioGroup>
                        )}

                        {q.questionType === "short" && (
                          <Input value={answers[idx] || ""} onChange={e => setAnswers(a => ({ ...a, [idx]: e.target.value }))} placeholder="Type your answer" data-testid={`input-answer-${idx}`} />
                        )}
                      </CardContent>
                    </Card>
                  ))}

                  <div className="flex items-center justify-between pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      {Object.keys(answers).length}/{activeQuiz.questions?.length || 0} answered
                    </p>
                    <Button onClick={handleSubmitQuiz} disabled={isPending} data-testid="button-submit-quiz">
                      {isPending ? "Submitting..." : "Submit Quiz"}
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
