import { useState } from "react";
import { ModuleLayout } from "@/components/layout/module-layout";
import { teacherNavItems, useTeacherAssignments, useTeacherQuizzes } from "./teacher-data";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Eye, EyeOff, Users, ClipboardList } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QuizQuestion {
  questionText: string;
  questionType: "mcq" | "truefalse" | "short";
  options: string[];
  correctAnswer: string;
  marks: number;
}

export default function TeacherQuizzesPage() {
  const { session } = useAuth();
  const { toast } = useToast();
  const staffId = session?.staffId || "";
  const { data: assignments = [] } = useTeacherAssignments(staffId);
  const { quizzes, attempts, createQuiz, updateQuiz, deleteQuiz, isPending } = useTeacherQuizzes(staffId);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewAttemptsQuizId, setViewAttemptsQuizId] = useState<string | null>(null);

  const [form, setForm] = useState({
    className: "", section: "", subject: "", title: "", instructions: "",
    timeLimitMinutes: 30, passingMarks: 0, totalMarks: 0,
    startDateTime: "", endDateTime: "",
  });
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);

  const handleAssignmentSelect = (assignmentId: string) => {
    const a = assignments.find((x: any) => x.id === assignmentId);
    if (a) setForm(f => ({ ...f, className: a.className, section: a.section, subject: a.subject }));
  };

  const addQuestion = () => {
    setQuestions(q => [...q, { questionText: "", questionType: "mcq", options: ["", "", "", ""], correctAnswer: "", marks: 1 }]);
  };

  const updateQuestion = (idx: number, updates: Partial<QuizQuestion>) => {
    setQuestions(q => q.map((item, i) => i === idx ? { ...item, ...updates } : item));
  };

  const removeQuestion = (idx: number) => {
    setQuestions(q => q.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    if (!form.className || !form.title || questions.length === 0) {
      toast({ title: "Missing fields", description: "Fill all required fields and add at least one question", variant: "destructive" });
      return;
    }
    const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);
    try {
      await createQuiz({
        ...form,
        staffId,
        teacherName: session?.name || "",
        totalMarks,
        passingMarks: form.passingMarks || Math.ceil(totalMarks * 0.4),
        questions,
        isPublished: false,
      });
      toast({ title: "Quiz created" });
      setDialogOpen(false);
      setForm({ className: "", section: "", subject: "", title: "", instructions: "", timeLimitMinutes: 30, passingMarks: 0, totalMarks: 0, startDateTime: "", endDateTime: "" });
      setQuestions([]);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const togglePublish = async (quiz: any) => {
    await updateQuiz(quiz.id, { isPublished: !quiz.isPublished });
    toast({ title: quiz.isPublished ? "Unpublished" : "Published" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this quiz?")) return;
    await deleteQuiz(id);
    toast({ title: "Deleted" });
  };

  const quizAttempts = (quizId: string) => attempts.filter((a: any) => a.quizId === quizId);

  return (
    <ModuleLayout module="curriculum" navItems={teacherNavItems}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-page-title">My Quizzes</h1>
            <p className="text-muted-foreground">Create and manage quizzes for your classes</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-quiz"><Plus className="w-4 h-4 mr-2" /> Create Quiz</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Create New Quiz</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Assignment</Label>
                  <Select onValueChange={handleAssignmentSelect}>
                    <SelectTrigger data-testid="select-quiz-assignment"><SelectValue placeholder="Select assignment" /></SelectTrigger>
                    <SelectContent>
                      {assignments.map((a: any) => (
                        <SelectItem key={a.id} value={a.id}>{a.className} - {a.section} ({a.subject})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Quiz title" data-testid="input-quiz-title" />
                  </div>
                  <div className="space-y-2">
                    <Label>Time Limit (minutes)</Label>
                    <Input type="number" value={form.timeLimitMinutes} onChange={e => setForm(f => ({ ...f, timeLimitMinutes: parseInt(e.target.value) || 30 }))} data-testid="input-quiz-time" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Instructions</Label>
                  <Textarea value={form.instructions} onChange={e => setForm(f => ({ ...f, instructions: e.target.value }))} placeholder="Quiz instructions (optional)" data-testid="input-quiz-instructions" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date/Time</Label>
                    <Input type="datetime-local" value={form.startDateTime} onChange={e => setForm(f => ({ ...f, startDateTime: e.target.value }))} data-testid="input-quiz-start" />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date/Time</Label>
                    <Input type="datetime-local" value={form.endDateTime} onChange={e => setForm(f => ({ ...f, endDateTime: e.target.value }))} data-testid="input-quiz-end" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Passing Marks (0 = auto 40%)</Label>
                  <Input type="number" value={form.passingMarks} onChange={e => setForm(f => ({ ...f, passingMarks: parseInt(e.target.value) || 0 }))} data-testid="input-quiz-passing" />
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-base font-semibold">Questions ({questions.length})</Label>
                    <Button size="sm" onClick={addQuestion} data-testid="button-add-question"><Plus className="w-3 h-3 mr-1" /> Add Question</Button>
                  </div>
                  <div className="space-y-4">
                    {questions.map((q, idx) => (
                      <Card key={idx} className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label className="font-medium">Question {idx + 1}</Label>
                            <Button size="sm" variant="ghost" onClick={() => removeQuestion(idx)}><Trash2 className="w-3 h-3 text-destructive" /></Button>
                          </div>
                          <Input value={q.questionText} onChange={e => updateQuestion(idx, { questionText: e.target.value })} placeholder="Question text" data-testid={`input-question-${idx}`} />
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-xs">Type</Label>
                              <Select value={q.questionType} onValueChange={(v: any) => {
                                const opts = v === "truefalse" ? ["True", "False"] : v === "mcq" ? ["", "", "", ""] : [];
                                updateQuestion(idx, { questionType: v, options: opts });
                              }}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="mcq">MCQ</SelectItem>
                                  <SelectItem value="truefalse">True/False</SelectItem>
                                  <SelectItem value="short">Short Answer</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className="text-xs">Marks</Label>
                              <Input type="number" value={q.marks} onChange={e => updateQuestion(idx, { marks: parseInt(e.target.value) || 1 })} min={1} />
                            </div>
                          </div>
                          {q.questionType === "mcq" && (
                            <div className="space-y-2">
                              <Label className="text-xs">Options</Label>
                              {q.options.map((opt, oi) => (
                                <Input key={oi} value={opt} onChange={e => {
                                  const newOpts = [...q.options];
                                  newOpts[oi] = e.target.value;
                                  updateQuestion(idx, { options: newOpts });
                                }} placeholder={`Option ${oi + 1}`} data-testid={`input-option-${idx}-${oi}`} />
                              ))}
                            </div>
                          )}
                          <div>
                            <Label className="text-xs">Correct Answer</Label>
                            {q.questionType === "truefalse" ? (
                              <Select value={q.correctAnswer} onValueChange={v => updateQuestion(idx, { correctAnswer: v })}>
                                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="True">True</SelectItem>
                                  <SelectItem value="False">False</SelectItem>
                                </SelectContent>
                              </Select>
                            ) : (
                              <Input value={q.correctAnswer} onChange={e => updateQuestion(idx, { correctAnswer: e.target.value })} placeholder="Correct answer" data-testid={`input-answer-${idx}`} />
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                <Button onClick={handleSubmit} disabled={isPending} className="w-full" data-testid="button-submit-quiz">
                  {isPending ? "Creating..." : "Create Quiz"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {quizzes.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">No quizzes yet. Click "Create Quiz" to get started.</CardContent></Card>
        ) : (
          <div className="space-y-4">
            {quizzes.map((quiz: any) => {
              const qa = quizAttempts(quiz.id);
              return (
                <Card key={quiz.id} data-testid={`card-quiz-${quiz.id}`}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <ClipboardList className="w-5 h-5 text-muted-foreground" />
                          <h3 className="font-semibold text-lg">{quiz.title}</h3>
                          <Badge variant={quiz.isPublished ? "default" : "secondary"}>{quiz.isPublished ? "Published" : "Draft"}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{quiz.className} - {quiz.section} | {quiz.subject}</p>
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          <span>{quiz.questions?.length || 0} questions</span>
                          <span>{quiz.totalMarks} marks</span>
                          <span>{quiz.timeLimitMinutes} min</span>
                          <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {qa.length} attempts</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => setViewAttemptsQuizId(viewAttemptsQuizId === quiz.id ? null : quiz.id)} data-testid={`button-view-attempts-${quiz.id}`}>
                          <Users className="w-3 h-3 mr-1" /> Attempts
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => togglePublish(quiz)} data-testid={`button-toggle-quiz-${quiz.id}`}>
                          {quiz.isPublished ? <><EyeOff className="w-3 h-3 mr-1" /> Unpublish</> : <><Eye className="w-3 h-3 mr-1" /> Publish</>}
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(quiz.id)} data-testid={`button-delete-quiz-${quiz.id}`}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    {viewAttemptsQuizId === quiz.id && (
                      <div className="mt-4 border-t pt-4">
                        <h4 className="font-medium mb-2">Student Attempts ({qa.length})</h4>
                        {qa.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No attempts yet.</p>
                        ) : (
                          <div className="rounded-lg border overflow-hidden">
                            <table className="w-full text-sm">
                              <thead className="bg-muted/50">
                                <tr>
                                  <th className="text-left p-2">Student</th>
                                  <th className="text-left p-2">Score</th>
                                  <th className="text-left p-2">Percentage</th>
                                  <th className="text-left p-2">Grade</th>
                                  <th className="text-left p-2">Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                {qa.map((a: any) => (
                                  <tr key={a.id} className="border-t">
                                    <td className="p-2">{a.studentName}</td>
                                    <td className="p-2">{a.totalMarksObtained}/{a.totalMarks}</td>
                                    <td className="p-2">{a.percentage}%</td>
                                    <td className="p-2"><Badge variant="outline">{a.grade}</Badge></td>
                                    <td className="p-2"><Badge variant={a.isPassed ? "default" : "destructive"}>{a.isPassed ? "Pass" : "Fail"}</Badge></td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </ModuleLayout>
  );
}
