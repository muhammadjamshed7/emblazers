import { useState } from "react";
import { ModuleLayout } from "@/components/layout/module-layout";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { curriculumNavItems, useQuizData, classes, subjects, questionTypes, difficultyLevels, terms } from "./curriculum-data";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, CheckCircle, ClipboardList, X } from "lucide-react";
import type { Question, Quiz } from "@shared/schema";

export default function Quizzes() {
  const { questions, quizzes, addQuestion, updateQuestion, deleteQuestion, addQuiz, updateQuiz, deleteQuiz, isPending } = useQuizData();
  const { toast } = useToast();

  return (
    <ModuleLayout module="curriculum" navItems={curriculumNavItems}>
      <div className="space-y-6">
        <PageHeader
          title="Quizzes & Question Bank"
          description="Create questions, build quizzes, and assign them to classes"
        />
        <Tabs defaultValue="questions" className="space-y-4">
          <TabsList>
            <TabsTrigger value="questions" data-testid="tab-questions">Question Bank ({questions.length})</TabsTrigger>
            <TabsTrigger value="quizzes" data-testid="tab-quizzes">Quizzes ({quizzes.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="questions">
            <QuestionBankTab
              questions={questions}
              addQuestion={addQuestion}
              updateQuestion={updateQuestion}
              deleteQuestion={deleteQuestion}
              isPending={isPending}
              toast={toast}
            />
          </TabsContent>

          <TabsContent value="quizzes">
            <QuizManagerTab
              quizzes={quizzes}
              questions={questions}
              addQuiz={addQuiz}
              updateQuiz={updateQuiz}
              deleteQuiz={deleteQuiz}
              isPending={isPending}
              toast={toast}
            />
          </TabsContent>
        </Tabs>
      </div>
    </ModuleLayout>
  );
}

function QuestionBankTab({ questions, addQuestion, updateQuestion, deleteQuestion, isPending, toast }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [qType, setQType] = useState<"MCQ" | "TrueFalse" | "ShortAnswer">("MCQ");
  const [prompt, setPrompt] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [marks, setMarks] = useState(1);
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">("Easy");
  const [qClass, setQClass] = useState("");
  const [qSubject, setQSubject] = useState("");

  const resetForm = () => {
    setQType("MCQ");
    setPrompt("");
    setOptions(["", "", "", ""]);
    setCorrectAnswer("");
    setMarks(1);
    setDifficulty("Easy");
    setQClass("");
    setQSubject("");
    setEditingQuestion(null);
  };

  const handleEdit = (q: Question) => {
    setEditingQuestion(q);
    setQType(q.type);
    setPrompt(q.prompt);
    setOptions(q.options && q.options.length > 0 ? q.options : ["", "", "", ""]);
    setCorrectAnswer(q.correctAnswer);
    setMarks(q.marks);
    setDifficulty((q.difficulty as any) || "Easy");
    setQClass(q.class);
    setQSubject(q.subject);
    setIsOpen(true);
  };

  const handleSubmit = async () => {
    if (!prompt || !correctAnswer || !qClass || !qSubject) {
      toast({ title: "Error", description: "Please fill all required fields", variant: "destructive" });
      return;
    }

    const filteredOptions = qType === "MCQ" ? options.filter(o => o.trim()) : qType === "TrueFalse" ? ["True", "False"] : undefined;

    if (qType === "MCQ" && (!filteredOptions || filteredOptions.length < 2)) {
      toast({ title: "Error", description: "Please provide at least 2 options for MCQ", variant: "destructive" });
      return;
    }

    try {
      const data: any = {
        type: qType,
        prompt,
        correctAnswer,
        marks,
        difficulty,
        class: qClass,
        subject: qSubject,
        options: filteredOptions,
      };

      if (editingQuestion) {
        await updateQuestion(editingQuestion.id, data);
        toast({ title: "Success", description: "Question updated" });
      } else {
        await addQuestion(data);
        toast({ title: "Success", description: "Question added to bank" });
      }
      setIsOpen(false);
      resetForm();
    } catch (error) {
      toast({ title: "Error", description: "Failed to save question", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteQuestion(id);
      toast({ title: "Success", description: "Question deleted" });
    } catch {
      toast({ title: "Error", description: "Failed to delete question", variant: "destructive" });
    }
  };

  const columns = [
    { key: "prompt" as const, label: "Question", render: (item: Question) => <span className="max-w-[300px] truncate block">{item.prompt}</span> },
    { key: "type" as const, label: "Type", render: (item: Question) => <Badge variant="outline">{item.type}</Badge> },
    { key: "class" as const, label: "Class" },
    { key: "subject" as const, label: "Subject" },
    { key: "marks" as const, label: "Marks" },
    { key: "difficulty" as const, label: "Difficulty", render: (item: Question) => {
      const colors: Record<string, string> = { Easy: "text-green-600", Medium: "text-amber-600", Hard: "text-red-600" };
      return <span className={colors[item.difficulty || "Easy"] || ""}>{item.difficulty || "Easy"}</span>;
    }},
  ];

  const actions = (item: Question) => (
    <div className="flex gap-1">
      <Button variant="ghost" size="icon" onClick={() => handleEdit(item)} data-testid={`button-edit-question-${item.id}`}>
        <Edit className="w-4 h-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} data-testid={`button-delete-question-${item.id}`}>
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-question">
              <Plus className="w-4 h-4 mr-2" />
              Add Question
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingQuestion ? "Edit Question" : "Add New Question"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Class *</Label>
                  <Select value={qClass} onValueChange={setQClass}>
                    <SelectTrigger data-testid="select-question-class"><SelectValue placeholder="Select class" /></SelectTrigger>
                    <SelectContent>
                      {classes.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Subject *</Label>
                  <Select value={qSubject} onValueChange={setQSubject}>
                    <SelectTrigger data-testid="select-question-subject"><SelectValue placeholder="Select subject" /></SelectTrigger>
                    <SelectContent>
                      {subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Type *</Label>
                  <Select value={qType} onValueChange={(v) => setQType(v as any)}>
                    <SelectTrigger data-testid="select-question-type"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {questionTypes.map(t => <SelectItem key={t} value={t}>{t === "TrueFalse" ? "True/False" : t === "ShortAnswer" ? "Short Answer" : t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Marks</Label>
                  <Input type="number" value={marks} onChange={(e) => setMarks(Number(e.target.value))} min={1} data-testid="input-marks" />
                </div>
                <div className="space-y-2">
                  <Label>Difficulty</Label>
                  <Select value={difficulty} onValueChange={(v) => setDifficulty(v as any)}>
                    <SelectTrigger data-testid="select-difficulty"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {difficultyLevels.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Question *</Label>
                <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Enter your question..." data-testid="input-prompt" />
              </div>

              {qType === "MCQ" && (
                <div className="space-y-2">
                  <Label>Options *</Label>
                  {options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground w-6">{String.fromCharCode(65 + i)}.</span>
                      <Input
                        value={opt}
                        onChange={(e) => { const newOpts = [...options]; newOpts[i] = e.target.value; setOptions(newOpts); }}
                        placeholder={`Option ${String.fromCharCode(65 + i)}`}
                        data-testid={`input-option-${i}`}
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                <Label>Correct Answer *</Label>
                {qType === "TrueFalse" ? (
                  <Select value={correctAnswer} onValueChange={setCorrectAnswer}>
                    <SelectTrigger data-testid="select-correct-answer"><SelectValue placeholder="Select answer" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="True">True</SelectItem>
                      <SelectItem value="False">False</SelectItem>
                    </SelectContent>
                  </Select>
                ) : qType === "MCQ" ? (
                  <Select value={correctAnswer} onValueChange={setCorrectAnswer}>
                    <SelectTrigger data-testid="select-correct-answer"><SelectValue placeholder="Select correct option" /></SelectTrigger>
                    <SelectContent>
                      {options.filter(o => o.trim()).map((opt, i) => (
                        <SelectItem key={i} value={opt}>{String.fromCharCode(65 + i)}. {opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input value={correctAnswer} onChange={(e) => setCorrectAnswer(e.target.value)} placeholder="Expected answer" data-testid="input-correct-answer" />
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => { setIsOpen(false); resetForm(); }}>Cancel</Button>
                <Button onClick={handleSubmit} disabled={isPending} data-testid="button-save-question">
                  {isPending ? "Saving..." : editingQuestion ? "Update" : "Add Question"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        data={questions}
        columns={columns}
        searchKey="prompt"
        searchPlaceholder="Search questions..."
        actions={actions}
        getRowKey={(item) => item.id}
      />
    </div>
  );
}

function QuizManagerTab({ quizzes, questions, addQuiz, updateQuiz, deleteQuiz, isPending, toast }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [title, setTitle] = useState("");
  const [qClass, setQClass] = useState("");
  const [section, setSection] = useState("");
  const [qSubject, setQSubject] = useState("");
  const [term, setTerm] = useState("");
  const [timeLimit, setTimeLimit] = useState<number | undefined>();
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState<"Draft" | "Published" | "Closed">("Draft");

  const resetForm = () => {
    setTitle("");
    setQClass("");
    setSection("");
    setQSubject("");
    setTerm("");
    setTimeLimit(undefined);
    setSelectedQuestionIds(new Set());
    setStatus("Draft");
    setEditingQuiz(null);
  };

  const handleEdit = (quiz: Quiz) => {
    setEditingQuiz(quiz);
    setTitle(quiz.title);
    setQClass(quiz.class);
    setSection(quiz.section || "");
    setQSubject(quiz.subject);
    setTerm(quiz.term || "");
    setTimeLimit(quiz.timeLimit);
    setStatus(quiz.status);
    setSelectedQuestionIds(new Set(quiz.questions.map(q => q.questionId)));
    setIsOpen(true);
  };

  const filteredQuestions = questions.filter((q: Question) => {
    if (qClass && q.class !== qClass) return false;
    if (qSubject && q.subject !== qSubject) return false;
    return true;
  });

  const totalMarks = filteredQuestions
    .filter((q: Question) => selectedQuestionIds.has(q.id))
    .reduce((sum: number, q: Question) => sum + q.marks, 0);

  const toggleQuestion = (id: string) => {
    const newSet = new Set(selectedQuestionIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedQuestionIds(newSet);
  };

  const handleSubmit = async () => {
    if (!title || !qClass || !qSubject || selectedQuestionIds.size === 0) {
      toast({ title: "Error", description: "Please fill all required fields and select at least one question", variant: "destructive" });
      return;
    }

    try {
      const quizQuestions = filteredQuestions
        .filter((q: Question) => selectedQuestionIds.has(q.id))
        .map((q: Question) => ({ questionId: q.id, marks: q.marks }));

      const data: any = {
        title,
        class: qClass,
        section: section || undefined,
        subject: qSubject,
        term: term || undefined,
        totalMarks,
        timeLimit: timeLimit || undefined,
        questions: quizQuestions,
        status,
      };

      if (editingQuiz) {
        await updateQuiz(editingQuiz.id, data);
        toast({ title: "Success", description: "Quiz updated" });
      } else {
        await addQuiz(data);
        toast({ title: "Success", description: "Quiz created" });
      }
      setIsOpen(false);
      resetForm();
    } catch (error) {
      toast({ title: "Error", description: "Failed to save quiz", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteQuiz(id);
      toast({ title: "Success", description: "Quiz deleted" });
    } catch {
      toast({ title: "Error", description: "Failed to delete quiz", variant: "destructive" });
    }
  };

  const handleStatusChange = async (quiz: Quiz, newStatus: "Draft" | "Published" | "Closed") => {
    try {
      await updateQuiz(quiz.id, { status: newStatus });
      toast({ title: "Success", description: `Quiz ${newStatus.toLowerCase()}` });
    } catch {
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
    }
  };

  const columns = [
    { key: "title" as const, label: "Title", sortable: true },
    { key: "class" as const, label: "Class" },
    { key: "subject" as const, label: "Subject" },
    { key: "totalMarks" as const, label: "Marks" },
    { key: "questions" as const, label: "Questions", render: (item: Quiz) => item.questions.length },
    { key: "status" as const, label: "Status", render: (item: Quiz) => {
      const colors: Record<string, "default" | "secondary" | "outline"> = {
        Draft: "secondary", Published: "default", Closed: "outline"
      };
      return <Badge variant={colors[item.status] || "outline"}>{item.status}</Badge>;
    }},
  ];

  const actions = (item: Quiz) => (
    <div className="flex gap-1">
      {item.status === "Draft" && (
        <Button variant="ghost" size="icon" onClick={() => handleStatusChange(item, "Published")} data-testid={`button-publish-${item.id}`} title="Publish">
          <CheckCircle className="w-4 h-4" />
        </Button>
      )}
      {item.status === "Published" && (
        <Button variant="ghost" size="icon" onClick={() => handleStatusChange(item, "Closed")} data-testid={`button-close-${item.id}`} title="Close">
          <X className="w-4 h-4" />
        </Button>
      )}
      <Button variant="ghost" size="icon" onClick={() => handleEdit(item)} data-testid={`button-edit-quiz-${item.id}`}>
        <Edit className="w-4 h-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} data-testid={`button-delete-quiz-${item.id}`}>
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-quiz">
              <Plus className="w-4 h-4 mr-2" />
              Create Quiz
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingQuiz ? "Edit Quiz" : "Create New Quiz"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Quiz Title *</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Math Chapter 1 Quiz" data-testid="input-quiz-title" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Class *</Label>
                  <Select value={qClass} onValueChange={setQClass}>
                    <SelectTrigger data-testid="select-quiz-class"><SelectValue placeholder="Select class" /></SelectTrigger>
                    <SelectContent>
                      {classes.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Subject *</Label>
                  <Select value={qSubject} onValueChange={setQSubject}>
                    <SelectTrigger data-testid="select-quiz-subject"><SelectValue placeholder="Select subject" /></SelectTrigger>
                    <SelectContent>
                      {subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Section</Label>
                  <Input value={section} onChange={(e) => setSection(e.target.value)} placeholder="e.g., A" data-testid="input-section" />
                </div>
                <div className="space-y-2">
                  <Label>Term</Label>
                  <Select value={term} onValueChange={setTerm}>
                    <SelectTrigger data-testid="select-quiz-term"><SelectValue placeholder="Select term" /></SelectTrigger>
                    <SelectContent>
                      {terms.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Time Limit (min)</Label>
                  <Input type="number" value={timeLimit || ""} onChange={(e) => setTimeLimit(Number(e.target.value) || undefined)} placeholder="Optional" data-testid="input-time-limit" />
                </div>
              </div>

              {editingQuiz && (
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={status} onValueChange={(v) => setStatus(v as any)}>
                    <SelectTrigger data-testid="select-quiz-status"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Draft">Draft</SelectItem>
                      <SelectItem value="Published">Published</SelectItem>
                      <SelectItem value="Closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Select Questions * ({selectedQuestionIds.size} selected, {totalMarks} marks)</Label>
                </div>
                {(!qClass || !qSubject) && (
                  <p className="text-sm text-muted-foreground">Select a class and subject to see available questions</p>
                )}
                {qClass && qSubject && filteredQuestions.length === 0 && (
                  <p className="text-sm text-muted-foreground">No questions found for {qClass} - {qSubject}. Add some in the Question Bank first.</p>
                )}
                <div className="space-y-2 max-h-[250px] overflow-y-auto border rounded-md p-2">
                  {filteredQuestions.map((q: Question) => (
                    <div
                      key={q.id}
                      className={`flex items-start gap-3 p-2 rounded-md cursor-pointer hover-elevate ${selectedQuestionIds.has(q.id) ? "bg-accent" : ""}`}
                      onClick={() => toggleQuestion(q.id)}
                      data-testid={`question-select-${q.id}`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedQuestionIds.has(q.id)}
                        readOnly
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">{q.prompt}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <Badge variant="outline">{q.type === "TrueFalse" ? "T/F" : q.type}</Badge>
                          <span className="text-xs text-muted-foreground">{q.marks} mark{q.marks > 1 ? "s" : ""}</span>
                          {q.difficulty && <span className="text-xs text-muted-foreground">{q.difficulty}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => { setIsOpen(false); resetForm(); }}>Cancel</Button>
                <Button onClick={handleSubmit} disabled={isPending} data-testid="button-save-quiz">
                  {isPending ? "Saving..." : editingQuiz ? "Update Quiz" : "Create Quiz"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        data={quizzes}
        columns={columns}
        searchKey="title"
        searchPlaceholder="Search quizzes..."
        actions={actions}
        getRowKey={(item) => item.id}
      />
    </div>
  );
}
