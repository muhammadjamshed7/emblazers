import { useState } from "react";
import { ModuleLayout } from "@/components/layout/module-layout";
import { studentNavItems, useStudentContent } from "./student-data";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, Image, StickyNote, Link2, ExternalLink } from "lucide-react";

export default function StudentContentPage() {
  const { session } = useAuth();
  const className = session?.className || "";
  const section = session?.section || "";
  const { data, isLoading } = useStudentContent();
  const [filterSubject, setFilterSubject] = useState("all");
  const [selectedContent, setSelectedContent] = useState<any>(null);

  const contentMap: Record<string, any[]> = data?.content || {};
  const subjects = Object.keys(contentMap);
  const allContent = filterSubject === "all"
    ? subjects.flatMap(s => contentMap[s])
    : contentMap[filterSubject] || [];

  const typeIcons: Record<string, any> = { pdf: FileText, image: Image, note: StickyNote, link: Link2 };
  const typeLabels: Record<string, string> = { pdf: "PDF", image: "Image", note: "Note", link: "Link" };

  return (
    <ModuleLayout module="curriculum" navItems={studentNavItems}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Study Material</h1>
          <p className="text-muted-foreground">Browse learning content for {className} - {section} ({data?.total || 0} items)</p>
        </div>

        <div className="flex gap-2 items-center">
          <Label className="text-sm">Filter by subject:</Label>
          <Select value={filterSubject} onValueChange={setFilterSubject}>
            <SelectTrigger className="w-[200px]" data-testid="select-filter-subject"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3].map(i => <div key={i} className="h-40 rounded-lg bg-muted animate-pulse" />)}
          </div>
        ) : allContent.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">No study material available yet.</CardContent></Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allContent.map((item: any) => {
              const TypeIcon = typeIcons[item.contentType] || FileText;
              return (
                <Card key={item.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedContent(item)} data-testid={`card-content-${item.id}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <TypeIcon className="w-5 h-5 text-muted-foreground" />
                      <CardTitle className="text-base">{item.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">{item.subject}</Badge>
                      <Badge variant="secondary">{typeLabels[item.contentType] || item.contentType}</Badge>
                    </div>
                    {item.description && <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>}
                    <p className="text-xs text-muted-foreground mt-2">By {item.teacherName}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <Dialog open={!!selectedContent} onOpenChange={() => setSelectedContent(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            {selectedContent && (
              <>
                <DialogHeader>
                  <DialogTitle>{selectedContent.title}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Badge variant="outline">{selectedContent.subject}</Badge>
                    <Badge variant="secondary">{typeLabels[selectedContent.contentType]}</Badge>
                    <Badge variant="secondary">By {selectedContent.teacherName}</Badge>
                  </div>
                  {selectedContent.description && <p className="text-sm">{selectedContent.description}</p>}

                  {selectedContent.contentType === "note" && selectedContent.fileData && (
                    <div className="p-4 bg-muted rounded-lg whitespace-pre-wrap text-sm">{selectedContent.fileData}</div>
                  )}
                  {selectedContent.contentType === "link" && selectedContent.fileData && (
                    <Button variant="outline" asChild>
                      <a href={selectedContent.fileData} target="_blank" rel="noopener noreferrer" data-testid="link-external">
                        <ExternalLink className="w-4 h-4 mr-2" /> Open Link
                      </a>
                    </Button>
                  )}
                  {selectedContent.contentType === "image" && selectedContent.fileData && (
                    <img src={selectedContent.fileData} alt={selectedContent.title} className="max-w-full rounded-lg" />
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </ModuleLayout>
  );
}
