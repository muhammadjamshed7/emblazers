import { useState } from "react";
import { ModuleLayout } from "@/components/layout/module-layout";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, StatusBadge } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { libraryNavItems, useLibraryData } from "./library-data";
import { useToast } from "@/hooks/use-toast";
import { Plus, RotateCcw, Search, BookOpen, User } from "lucide-react";

export default function IssueReturn() {
  const { books, members, issues, issueBook, returnBook, isPending } = useLibraryData();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  const [studentSearch, setStudentSearch] = useState("");
  const [selectedMember, setSelectedMember] = useState<typeof members[0] | null>(null);
  const [selectedBookId, setSelectedBookId] = useState("");
  const [dueDate, setDueDate] = useState("");

  const availableBooks = books.filter(b => b.status === "Available");
  
  const searchMember = () => {
    const found = members.find(m => 
      m.referenceId.toLowerCase() === studentSearch.toLowerCase() ||
      m.memberId.toLowerCase() === studentSearch.toLowerCase()
    );
    if (found) {
      setSelectedMember(found);
      toast({ title: "Member Found", description: `${found.name} (${found.type})` });
    } else {
      setSelectedMember(null);
      toast({ title: "Not Found", description: "No member found with that ID", variant: "destructive" });
    }
  };

  const resetForm = () => {
    setStudentSearch("");
    setSelectedMember(null);
    setSelectedBookId("");
    setDueDate("");
  };

  const handleIssue = async () => {
    if (!selectedMember || !selectedBookId || !dueDate) {
      toast({ title: "Error", description: "Please fill all required fields", variant: "destructive" });
      return;
    }

    const book = books.find(b => b.id === selectedBookId);
    if (!book) {
      toast({ title: "Error", description: "Book not found", variant: "destructive" });
      return;
    }

    try {
      await issueBook({
        bookId: book.id,
        bookTitle: book.title,
        memberId: selectedMember.id,
        memberName: selectedMember.name,
        issueDate: new Date().toISOString().split("T")[0],
        dueDate,
        fine: 0,
        status: "Issued"
      });
      toast({ title: "Success", description: `Book issued to ${selectedMember.name}` });
      setIsOpen(false);
      resetForm();
    } catch (error) {
      console.error("Failed to issue book:", error);
      toast({ title: "Error", description: "Failed to issue book. Please try again.", variant: "destructive" });
    }
  };

  const handleReturn = async (issueId: string) => {
    try {
      await returnBook(issueId);
      toast({ title: "Success", description: "Book returned successfully" });
    } catch (error) {
      console.error("Failed to return book:", error);
      toast({ title: "Error", description: "Failed to return book", variant: "destructive" });
    }
  };

  const filteredIssues = statusFilter === "all"
    ? issues
    : issues.filter(i => i.status === statusFilter);

  const issuedCount = issues.filter(i => i.status === "Issued").length;
  const overdueCount = issues.filter(i => i.status === "Overdue").length;
  const returnedCount = issues.filter(i => i.status === "Returned").length;

  const columns = [
    { key: "bookTitle" as const, label: "Book", sortable: true },
    { key: "memberName" as const, label: "Member" },
    { key: "issueDate" as const, label: "Issue Date" },
    { key: "dueDate" as const, label: "Due Date" },
    { key: "returnDate" as const, label: "Return Date", render: (item: typeof issues[0]) => item.returnDate || "-" },
    { key: "fine" as const, label: "Fine", render: (item: typeof issues[0]) => item.fine > 0 ? `Rs. ${item.fine}` : "-" },
    { key: "status" as const, label: "Status", render: (item: typeof issues[0]) => <StatusBadge status={item.status} /> },
  ];

  const actions = (item: typeof issues[0]) => (
    item.status !== "Returned" && (
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleReturn(item.id)}
        data-testid={`button-return-${item.id}`}
      >
        <RotateCcw className="w-4 h-4 mr-1" />
        Return
      </Button>
    )
  );

  return (
    <ModuleLayout module="library" navItems={libraryNavItems}>
      <div className="space-y-6">
        <PageHeader
          title="Issue / Return"
          description="Manage book issues and returns"
          actions={
            <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
              <DialogTrigger asChild>
                <Button data-testid="button-issue-book">
                  <Plus className="w-4 h-4 mr-2" />
                  Issue Book
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Issue Book to Student</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Search Student/Staff by ID *</Label>
                    <div className="flex gap-2">
                      <Input 
                        value={studentSearch} 
                        onChange={(e) => setStudentSearch(e.target.value)} 
                        placeholder="Enter Student ID or Member ID" 
                        data-testid="input-student-search"
                        onKeyDown={(e) => e.key === 'Enter' && searchMember()}
                      />
                      <Button type="button" onClick={searchMember} data-testid="button-search-member">
                        <Search className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {selectedMember && (
                    <Card>
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{selectedMember.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {selectedMember.type} | ID: {selectedMember.referenceId}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <div className="space-y-2">
                    <Label>Select Book *</Label>
                    <Select value={selectedBookId} onValueChange={setSelectedBookId}>
                      <SelectTrigger data-testid="select-book">
                        <SelectValue placeholder="Select an available book" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableBooks.length === 0 ? (
                          <SelectItem value="none" disabled>No books available</SelectItem>
                        ) : (
                          availableBooks.map((book) => (
                            <SelectItem key={book.id} value={book.id}>
                              {book.title} ({book.accessionNo})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      {availableBooks.length} books available for issue
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Due Date *</Label>
                    <Input 
                      type="date" 
                      value={dueDate} 
                      onChange={(e) => setDueDate(e.target.value)} 
                      min={new Date().toISOString().split("T")[0]}
                      data-testid="input-due-date"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => { setIsOpen(false); resetForm(); }}>Cancel</Button>
                    <Button 
                      onClick={handleIssue} 
                      disabled={isPending || !selectedMember || !selectedBookId || !dueDate} 
                      data-testid="button-confirm-issue"
                    >
                      {isPending ? "Issuing..." : "Issue Book"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          }
        />

        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Label className="text-sm">Filter by Status:</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]" data-testid="select-status-filter">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="Issued">Issued</SelectItem>
                <SelectItem value="Returned">Returned</SelectItem>
                <SelectItem value="Overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-4 ml-auto text-sm">
            <span className="text-amber-600">Issued: {issuedCount}</span>
            <span className="text-red-600">Overdue: {overdueCount}</span>
            <span className="text-green-600">Returned: {returnedCount}</span>
          </div>
        </div>

        <DataTable
          data={filteredIssues}
          columns={columns}
          searchKey="bookTitle"
          searchPlaceholder="Search by book or member..."
          actions={actions}
          getRowKey={(item) => item.id}
        />
      </div>
    </ModuleLayout>
  );
}
