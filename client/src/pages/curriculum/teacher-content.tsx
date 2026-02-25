import { useState } from "react";
import { ModuleLayout } from "@/components/layout/module-layout";
import { teacherNavItems, useTeacherAssignments, useTeacherContent } from "./teacher-data";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Plus, FileText, Image, Link2, StickyNote, Trash2, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function TeacherContentPage() {
  const { session } = useAuth();
  const { toast } = useToast();
  const staffId = session?.staffId || "";
  const { data: assignments = [] } = useTeacherAssignments(staffId);
  const { content, createContent, updateContent, deleteContent, isPending } = useTeacherContent(staffId);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filterSubject, setFilterSubject] = useState("all");

  const [form, setForm] = useState({
    className: "", section: "", subject: "", title: "", description: "",
    contentType: "note" as "pdf" | "image" | "note" | "link",
    fileData: "", fileName: "",
  });

  const uniqueSubjects = [...new Set(assignments.map((a: any) => a.subject))];
  const filtered = filterSubject === "all" ? content : content.filter((c: any) => c.subject === filterSubject);

  const handleAssignmentSelect = (assignmentId: string) => {
    const a = assignments.find((x: any) => x.id === assignmentId);
    if (a) setForm(f => ({ ...f, className: a.className, section: a.section, subject: a.subject }));
  };

  const handleSubmit = async () => {
    if (!form.className || !form.title) {
      toast({ title: "Missing fields", description: "Select an assignment and provide a title", variant: "destructive" });
      return;
    }
    try {
      await createContent({ ...form, staffId, teacherName: session?.name || "" });
      toast({ title: "Content created" });
      setDialogOpen(false);
      setForm({ className: "", section: "", subject: "", title: "", description: "", contentType: "note", fileData: "", fileName: "" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const togglePublish = async (item: any) => {
    await updateContent(item.id, { isPublished: !item.isPublished });
    toast({ title: item.isPublished ? "Unpublished" : "Published" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this content?")) return;
    await deleteContent(id);
    toast({ title: "Deleted" });
  };

  const typeIcons: Record<string, any> = { pdf: FileText, image: Image, note: StickyNote, link: Link2 };

  return (
    <ModuleLayout module="curriculum" navItems={teacherNavItems}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-page-title">My Content</h1>
            <p className="text-muted-foreground">Upload and manage learning materials</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-content"><Plus className="w-4 h-4 mr-2" /> Add Content</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Add New Content</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Assignment (Class/Section/Subject)</Label>
                  <Select onValueChange={handleAssignmentSelect}>
                    <SelectTrigger data-testid="select-assignment"><SelectValue placeholder="Select assignment" /></SelectTrigger>
                    <SelectContent>
                      {assignments.map((a: any) => (
                        <SelectItem key={a.id} value={a.id}>{a.className} - {a.section} ({a.subject})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Content title" data-testid="input-content-title" />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Description (optional)" data-testid="input-content-description" />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={form.contentType} onValueChange={(v: any) => setForm(f => ({ ...f, contentType: v }))}>
                    <SelectTrigger data-testid="select-content-type"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="note">Note</SelectItem>
                      <SelectItem value="link">Link / URL</SelectItem>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="image">Image</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {form.contentType === "link" && (
                  <div className="space-y-2">
                    <Label>URL</Label>
                    <Input value={form.fileData} onChange={e => setForm(f => ({ ...f, fileData: e.target.value }))} placeholder="https://..." data-testid="input-content-url" />
                  </div>
                )}
                {form.contentType === "note" && (
                  <div className="space-y-2">
                    <Label>Note Content</Label>
                    <Textarea value={form.fileData} onChange={e => setForm(f => ({ ...f, fileData: e.target.value }))} placeholder="Write your notes here..." rows={6} data-testid="input-content-note" />
                  </div>
                )}
                <Button onClick={handleSubmit} disabled={isPending} className="w-full" data-testid="button-submit-content">
                  {isPending ? "Saving..." : "Save Content"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex gap-2 items-center">
          <Label className="text-sm">Filter by subject:</Label>
          <Select value={filterSubject} onValueChange={setFilterSubject}>
            <SelectTrigger className="w-[200px]" data-testid="select-filter-subject"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {uniqueSubjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {filtered.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">No content yet. Click "Add Content" to get started.</CardContent></Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((item: any) => {
              const TypeIcon = typeIcons[item.contentType] || FileText;
              return (
                <Card key={item.id} data-testid={`card-content-${item.id}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <TypeIcon className="w-5 h-5 text-muted-foreground" />
                        <CardTitle className="text-base">{item.title}</CardTitle>
                      </div>
                      <Badge variant={item.isPublished ? "default" : "secondary"}>{item.isPublished ? "Published" : "Draft"}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">{item.className} - {item.section} | {item.subject}</p>
                    {item.description && <p className="text-sm mb-3 line-clamp-2">{item.description}</p>}
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => togglePublish(item)} data-testid={`button-toggle-publish-${item.id}`}>
                        {item.isPublished ? <><EyeOff className="w-3 h-3 mr-1" /> Unpublish</> : <><Eye className="w-3 h-3 mr-1" /> Publish</>}
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(item.id)} data-testid={`button-delete-content-${item.id}`}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
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
