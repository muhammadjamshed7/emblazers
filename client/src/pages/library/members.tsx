import { useState } from "react";
import { ModuleLayout } from "@/components/layout/module-layout";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { libraryNavItems, useLibraryData, memberTypes } from "./library-data";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit } from "lucide-react";

export default function Members() {
  const { members, addMember, isPending } = useLibraryData();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  
  const [name, setName] = useState("");
  const [type, setType] = useState<typeof memberTypes[number]>("Student");
  const [contact, setContact] = useState("");
  const [referenceId, setReferenceId] = useState("");

  const resetForm = () => {
    setName("");
    setType("Student");
    setContact("");
    setReferenceId("");
  };

  const handleSubmit = async () => {
    if (!name || !referenceId) {
      toast({ title: "Error", description: "Please fill all required fields", variant: "destructive" });
      return;
    }

    try {
      await addMember({ name, type, contact, referenceId });
      toast({ title: "Success", description: "Member added successfully" });
      setIsOpen(false);
      resetForm();
    } catch (error) {
      console.error("Failed to add member:", error);
      toast({ title: "Error", description: "Failed to add member. Please try again.", variant: "destructive" });
    }
  };

  const columns = [
    { key: "memberId" as const, label: "Member ID" },
    { key: "name" as const, label: "Name", sortable: true },
    { key: "type" as const, label: "Type", render: (item: typeof members[0]) => <Badge variant="outline">{item.type}</Badge> },
    { key: "contact" as const, label: "Contact" },
    { key: "referenceId" as const, label: "Student/Staff ID" },
  ];

  const actions = (item: typeof members[0]) => (
    <Button variant="ghost" size="icon" data-testid={`button-edit-${item.id}`}>
      <Edit className="w-4 h-4" />
    </Button>
  );

  return (
    <ModuleLayout module="library" navItems={libraryNavItems}>
      <div className="space-y-6">
        <PageHeader
          title="Members"
          description="Manage library members"
          actions={
            <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-member">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Member
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Member</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Name *</Label>
                    <Input 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      placeholder="Full name" 
                      data-testid="input-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
                      <SelectTrigger data-testid="select-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {memberTypes.map((t) => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Contact</Label>
                      <Input 
                        value={contact} 
                        onChange={(e) => setContact(e.target.value)} 
                        placeholder="Phone number" 
                        data-testid="input-contact"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Student/Staff ID *</Label>
                      <Input 
                        value={referenceId} 
                        onChange={(e) => setReferenceId(e.target.value)} 
                        placeholder="e.g., STU2024001" 
                        data-testid="input-reference-id"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => { setIsOpen(false); resetForm(); }}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={isPending} data-testid="button-save-member">
                      {isPending ? "Saving..." : "Add Member"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          }
        />

        <DataTable
          data={members}
          columns={columns}
          searchKey="name"
          searchPlaceholder="Search members by name or ID..."
          actions={actions}
          getRowKey={(item) => item.id}
        />
      </div>
    </ModuleLayout>
  );
}
