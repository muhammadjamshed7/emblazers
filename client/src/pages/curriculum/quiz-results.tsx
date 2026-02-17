import { useState } from "react";
import { ModuleLayout } from "@/components/layout/module-layout";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCard, StatsGrid } from "@/components/shared/stats-card";
import { curriculumNavItems, useQuizData, useCurriculumData } from "./curriculum-data";
import { useToast } from "@/hooks/use-toast";
import { BarChart3, ClipboardList, Users, Award, Eye, Plus } from "lucide-react";
import type { Quiz, QuizAttempt, Question, InsertQuizAttempt } from "@shared/schema";

export default function QuizResults() {
  const { quizzes, questions, attempts, submitAttempt, updateAttempt, isPending } = useQuizData();
  const { toast } = useToast();
  const [selectedQuizId, setSelectedQuizId] = useState<string>("");
  const [viewingAttempt, setViewingAttempt] = useState<QuizAttempt | null>(null);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);

  const selectedQuiz = selectedQuizId && selectedQuizId !== "all" ? quizzes.find((q: Quiz) => q.id === selectedQuizId) : null;
  const quizAttempts = selectedQuizId && selectedQuizId !== "all"
    ? attempts.filter((a: QuizAttempt) => a.quizId === selectedQuizId)
    : attempts;

  const publishedQuizzes = quizzes.filter((q: Quiz) => q.status === "Published" || q.status === "Closed");
  const totalAttempts = attempts.length;
  const avgScore = totalAttempts > 0
    ? Math.round(attempts.reduce((sum: number, a: QuizAttempt) => sum + (a.maxScore > 0 ? (a.score / a.maxScore) * 100 : 0), 0) / totalAttempts)
    : 0;
  const gradedCount = attempts.filter((a: QuizAttempt) => a.status === "Graded").length;

  return (
    <ModuleLayout module="curriculum" navItems={curriculumNavItems}>
      <div className="space-y-6">
        <PageHeader
          title="Quiz Results & Analytics"
          description="View quiz submissions, scores, and performance analytics"
          actions={
            <Button onClick={() => setShowSubmitDialog(true)} data-testid="button-record-attempt">
              <Plus className="w-4 h-4 mr-2" />
              Record Attempt
            </Button>
          }
        />

        <StatsGrid>
          <StatsCard title="Published Quizzes" value={publishedQuizzes.length} icon={ClipboardList} iconColor="text-violet-500" />
          <StatsCard title="Total Attempts" value={totalAttempts} icon={Users} iconColor="text-blue-500" />
          <StatsCard title="Average Score" value={`${avgScore}%`} icon={BarChart3} iconColor="text-green-500" />
          <StatsCard title="Graded" value={gradedCount} icon={Award} iconColor="text-orange-500" subtitle={`of ${totalAttempts} attempts`} />
        </StatsGrid>

        <div className="flex items-center gap-4 flex-wrap">
          <div className="space-y-1">
            <Label className="text-sm">Filter by Quiz</Label>
            <Select value={selectedQuizId} onValueChange={setSelectedQuizId}>
              <SelectTrigger className="w-[280px]" data-testid="select-quiz-filter">
                <SelectValue placeholder="All Quizzes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Quizzes</SelectItem>
                {quizzes.map((q: Quiz) => (
                  <SelectItem key={q.id} value={q.id}>{q.title} ({q.class})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {selectedQuiz && (
            <Card className="flex-1">
              <CardContent className="py-3 px-4">
                <div className="flex items-center gap-4 flex-wrap">
                  <div>
                    <span className="text-sm text-muted-foreground">Quiz: </span>
                    <span className="font-medium">{selectedQuiz.title}</span>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Class: </span>
                    <span>{selectedQuiz.class}</span>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Subject: </span>
                    <span>{selectedQuiz.subject}</span>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Total Marks: </span>
                    <span>{selectedQuiz.totalMarks}</span>
                  </div>
                  <Badge variant={selectedQuiz.status === "Published" ? "default" : "outline"}>{selectedQuiz.status}</Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DataTable
          data={quizAttempts}
          columns={[
            { key: "studentName" as const, label: "Student", sortable: true },
            { key: "quizTitle" as const, label: "Quiz" },
            { key: "class" as const, label: "Class" },
            { key: "score" as const, label: "Score", sortable: true, render: (item: QuizAttempt) => (
              <span className="font-medium">{item.score} / {item.maxScore}</span>
            )},
            { key: "status" as const, label: "Percentage", render: (item: QuizAttempt) => {
              const pct = item.maxScore > 0 ? Math.round((item.score / item.maxScore) * 100) : 0;
              const color = pct >= 80 ? "text-green-600" : pct >= 50 ? "text-amber-600" : "text-red-600";
              return <span className={`font-medium ${color}`}>{pct}%</span>;
            }},
            { key: "autoGraded" as const, label: "Status", render: (item: QuizAttempt) => (
              <Badge variant={item.status === "Graded" ? "default" : "secondary"}>{item.status}</Badge>
            )},
            { key: "submittedAt" as const, label: "Submitted", render: (item: QuizAttempt) =>
              item.submittedAt ? new Date(item.submittedAt).toLocaleDateString() : "N/A"
            },
          ]}
          searchKey="studentName"
          searchPlaceholder="Search students..."
          actions={(item: QuizAttempt) => (
            <Button variant="ghost" size="icon" onClick={() => setViewingAttempt(item)} data-testid={`button-view-attempt-${item.id}`}>
              <Eye className="w-4 h-4" />
            </Button>
          )}
          getRowKey={(item) => item.id}
        />

        {viewingAttempt && (
          <AttemptDetailDialog
            attempt={viewingAttempt}
            questions={questions}
            quiz={quizzes.find((q: Quiz) => q.id === viewingAttempt.quizId)}
            updateAttempt={updateAttempt}
            onClose={() => setViewingAttempt(null)}
            toast={toast}
          />
        )}

        {showSubmitDialog && (
          <RecordAttemptDialog
            quizzes={publishedQuizzes}
            questions={questions}
            submitAttempt={submitAttempt}
            onClose={() => setShowSubmitDialog(false)}
            isPending={isPending}
            toast={toast}
          />
        )}
      </div>
    </ModuleLayout>
  );
}

function AttemptDetailDialog({ attempt, questions, quiz, updateAttempt, onClose, toast }: {
  attempt: QuizAttempt;
  questions: Question[];
  quiz?: Quiz;
  updateAttempt: (id: string, updates: Partial<QuizAttempt>) => Promise<any>;
  onClose: () => void;
  toast: any;
}) {
  const [manualScore, setManualScore] = useState(attempt.score);

  const handleGrade = async () => {
    try {
      await updateAttempt(attempt.id, { score: manualScore, status: "Graded", autoGraded: false });
      toast({ title: "Success", description: "Score updated successfully" });
      onClose();
    } catch {
      toast({ title: "Error", description: "Failed to update score", variant: "destructive" });
    }
  };

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Attempt Details - {attempt.studentName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-muted-foreground">Quiz: </span>{attempt.quizTitle}</div>
            <div><span className="text-muted-foreground">Class: </span>{attempt.class}</div>
            <div><span className="text-muted-foreground">Score: </span><span className="font-medium">{attempt.score} / {attempt.maxScore}</span></div>
            <div><span className="text-muted-foreground">Status: </span><Badge variant={attempt.status === "Graded" ? "default" : "secondary"}>{attempt.status}</Badge></div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-sm">Answers</h4>
            {attempt.answers.map((ans, i) => {
              const question = questions.find(q => q.id === ans.questionId);
              if (!question) return null;
              const isCorrect = question.type !== "ShortAnswer" && ans.answer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();
              return (
                <Card key={i}>
                  <CardContent className="py-3 px-4 space-y-1">
                    <p className="text-sm font-medium">Q{i + 1}: {question.prompt}</p>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Answer:</span>
                      <span className={question.type !== "ShortAnswer" ? (isCorrect ? "text-green-600" : "text-red-600") : ""}>{ans.answer}</span>
                    </div>
                    {question.type !== "ShortAnswer" && (
                      <div className="text-xs text-muted-foreground">Correct: {question.correctAnswer}</div>
                    )}
                    <Badge variant="outline">{question.type === "TrueFalse" ? "T/F" : question.type} - {question.marks} mark{question.marks > 1 ? "s" : ""}</Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {attempt.status === "Submitted" && (
            <div className="space-y-2 border-t pt-4">
              <Label>Manual Score Override</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={manualScore}
                  onChange={(e) => setManualScore(Number(e.target.value))}
                  min={0}
                  max={attempt.maxScore}
                  className="w-24"
                  data-testid="input-manual-score"
                />
                <span className="text-sm text-muted-foreground">/ {attempt.maxScore}</span>
                <Button onClick={handleGrade} data-testid="button-grade">Mark as Graded</Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function RecordAttemptDialog({ quizzes, questions, submitAttempt, onClose, isPending, toast }: {
  quizzes: Quiz[];
  questions: Question[];
  submitAttempt: (data: InsertQuizAttempt) => Promise<any>;
  onClose: () => void;
  isPending: boolean;
  toast: any;
}) {
  const [quizId, setQuizId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [studentName, setStudentName] = useState("");
  const [studentClass, setStudentClass] = useState("");
  const [studentSection, setStudentSection] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const selectedQuiz = quizzes.find(q => q.id === quizId);
  const quizQuestions = selectedQuiz
    ? selectedQuiz.questions.map(qr => questions.find(q => q.id === qr.questionId)).filter(Boolean) as Question[]
    : [];

  const handleSubmit = async () => {
    if (!quizId || !studentId || !studentName || !studentClass) {
      toast({ title: "Error", description: "Please fill all required fields", variant: "destructive" });
      return;
    }

    try {
      const answerArray = Object.entries(answers).map(([questionId, answer]) => ({ questionId, answer }));
      await submitAttempt({
        quizId,
        quizTitle: selectedQuiz?.title || "",
        studentId,
        studentName,
        class: studentClass,
        section: studentSection || undefined,
        answers: answerArray,
        score: 0,
        maxScore: selectedQuiz?.totalMarks || 0,
        autoGraded: true,
        status: "Submitted",
      });
      toast({ title: "Success", description: "Quiz attempt recorded and auto-graded" });
      onClose();
    } catch {
      toast({ title: "Error", description: "Failed to record attempt", variant: "destructive" });
    }
  };

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Record Quiz Attempt</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>Select Quiz *</Label>
            <Select value={quizId} onValueChange={(v) => { setQuizId(v); setAnswers({}); }}>
              <SelectTrigger data-testid="select-record-quiz"><SelectValue placeholder="Select a published quiz" /></SelectTrigger>
              <SelectContent>
                {quizzes.map(q => <SelectItem key={q.id} value={q.id}>{q.title} - {q.class} ({q.subject})</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Student ID *</Label>
              <Input value={studentId} onChange={(e) => setStudentId(e.target.value)} placeholder="e.g., STU-001" data-testid="input-student-id" />
            </div>
            <div className="space-y-2">
              <Label>Student Name *</Label>
              <Input value={studentName} onChange={(e) => setStudentName(e.target.value)} placeholder="Full name" data-testid="input-student-name" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Class *</Label>
              <Input value={studentClass} onChange={(e) => setStudentClass(e.target.value)} placeholder="e.g., Class 3" data-testid="input-student-class" />
            </div>
            <div className="space-y-2">
              <Label>Section</Label>
              <Input value={studentSection} onChange={(e) => setStudentSection(e.target.value)} placeholder="e.g., A" data-testid="input-student-section" />
            </div>
          </div>

          {quizQuestions.length > 0 && (
            <div className="space-y-3">
              <Label>Answers</Label>
              {quizQuestions.map((q, i) => (
                <Card key={q.id}>
                  <CardContent className="py-3 px-4 space-y-2">
                    <p className="text-sm font-medium">Q{i + 1}: {q.prompt} <span className="text-muted-foreground">({q.marks} mark{q.marks > 1 ? "s" : ""})</span></p>
                    {q.type === "MCQ" && q.options ? (
                      <div className="space-y-1">
                        {q.options.map((opt, oi) => (
                          <label key={oi} className="flex items-center gap-2 text-sm cursor-pointer">
                            <input
                              type="radio"
                              name={`q-${q.id}`}
                              checked={answers[q.id] === opt}
                              onChange={() => setAnswers(prev => ({ ...prev, [q.id]: opt }))}
                            />
                            {String.fromCharCode(65 + oi)}. {opt}
                          </label>
                        ))}
                      </div>
                    ) : q.type === "TrueFalse" ? (
                      <div className="flex gap-4">
                        {["True", "False"].map(val => (
                          <label key={val} className="flex items-center gap-2 text-sm cursor-pointer">
                            <input
                              type="radio"
                              name={`q-${q.id}`}
                              checked={answers[q.id] === val}
                              onChange={() => setAnswers(prev => ({ ...prev, [q.id]: val }))}
                            />
                            {val}
                          </label>
                        ))}
                      </div>
                    ) : (
                      <Input
                        value={answers[q.id] || ""}
                        onChange={(e) => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                        placeholder="Enter answer..."
                        data-testid={`input-answer-${q.id}`}
                      />
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={isPending} data-testid="button-submit-attempt">
              {isPending ? "Submitting..." : "Submit & Auto-Grade"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
