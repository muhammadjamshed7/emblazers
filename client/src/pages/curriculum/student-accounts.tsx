import { useState } from "react";
import { ModuleLayout } from "@/components/layout/module-layout";
import { curriculumNavItems, classes } from "./curriculum-data";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Student } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UserPlus, RotateCcw, Users, ShieldCheck, ShieldOff, InfoIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const sections = ["A", "B", "C", "D"];

export default function StudentAccountsPage() {
  const { toast } = useToast();
  const [filterClass, setFilterClass] = useState("all");
  const [filterSection, setFilterSection] = useState("all");
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  const { data: students = [] } = useQuery<Student[]>({ queryKey: ['/api/students'] });
  const { data: accounts = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/curriculum/student-accounts'],
    queryFn: async () => {
      const res = await fetch('/api/curriculum/student-accounts', { headers: { Authorization: `Bearer ${localStorage.getItem("emblazers_token")}` } });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    }
  });

  const createAccountsMutation = useMutation({
    mutationFn: async (studentIds: string[]) => {
      const results = { created: 0, skipped: 0, errors: [] as string[] };
      for (const sid of studentIds) {
        const res = await apiRequest('POST', '/api/curriculum/student-accounts/create', { studentId: sid });
        const data = await res.json();
        results.created += data.created || 0;
        results.skipped += data.skipped || 0;
      }
      return results;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/curriculum/student-accounts'] });
      toast({ title: `Created ${data.created} accounts, ${data.skipped} skipped` });
      setSelectedStudentIds([]);
    }
  });

  const bulkCreateByClassMutation = useMutation({
    mutationFn: async ({ className, section }: { className: string; section?: string }) => {
      const res = await apiRequest('POST', '/api/curriculum/student-accounts/create', { className, section });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/curriculum/student-accounts'] });
      toast({ title: `Created ${data.created} accounts, ${data.skipped} skipped` });
    }
  });

  const toggleAccountMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const res = await apiRequest('PATCH', `/api/curriculum/student-accounts/${id}`, { isActive });
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/curriculum/student-accounts'] }),
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (studentId: string) => {
      const res = await apiRequest('POST', `/api/curriculum/student-accounts/reset-password/${studentId}`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/curriculum/student-accounts'] });
      toast({ title: "Password reset to DOB default" });
    }
  });

  const accountStudentIds = new Set(accounts.map((a: any) => a.studentId));
  const unregistered = students.filter(s => !accountStudentIds.has(s.studentId));
  const filteredUnregistered = filterClass === "all" ? unregistered : unregistered.filter(s => s.class === filterClass && (filterSection === "all" || s.section === filterSection));
  const filteredAccounts = filterClass === "all" ? accounts : accounts.filter((a: any) => a.className === filterClass && (filterSection === "all" || a.section === filterSection));

  const toggleSelection = (sid: string) => {
    setSelectedStudentIds(prev => prev.includes(sid) ? prev.filter(x => x !== sid) : [...prev, sid]);
  };

  const selectAll = () => {
    if (selectedStudentIds.length === filteredUnregistered.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(filteredUnregistered.map(s => s.studentId));
    }
  };

  return (
    <ModuleLayout module="curriculum" navItems={curriculumNavItems}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-page-title">Student Portal Accounts</h1>
            <p className="text-muted-foreground">Create and manage student login accounts for the curriculum portal</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            {accounts.length} accounts | {unregistered.length} unregistered
          </div>
        </div>

        <Alert className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
          <InfoIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-blue-900 dark:text-blue-100">
            Default password = Student's Date of Birth (DDMMYYYY format). Student must change on first login.
          </AlertDescription>
        </Alert>

        <div className="flex gap-4 items-end flex-wrap">
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium">Filter by class:</Label>
            <Select value={filterClass} onValueChange={setFilterClass}>
              <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {classes.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium">Filter by section:</Label>
            <Select value={filterSection} onValueChange={setFilterSection}>
              <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sections</SelectItem>
                {sections.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button 
            onClick={() => {
              if (filterClass !== "all") {
                bulkCreateByClassMutation.mutate({ className: filterClass, section: filterSection !== "all" ? filterSection : undefined });
              } else {
                toast({ title: "Please select a class first" });
              }
            }}
            disabled={bulkCreateByClassMutation.isPending}
            data-testid="button-bulk-create-class"
          >
            <Users className="w-4 h-4 mr-1" /> Bulk Create Accounts for This Class
          </Button>
        </div>

        {filteredUnregistered.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">Unregistered Students ({filteredUnregistered.length})</h3>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={selectAll} data-testid="button-select-all">
                    {selectedStudentIds.length === filteredUnregistered.length ? "Deselect All" : "Select All"}
                  </Button>
                  <Button size="sm" onClick={() => createAccountsMutation.mutate(selectedStudentIds)} disabled={selectedStudentIds.length === 0 || createAccountsMutation.isPending} data-testid="button-create-accounts">
                    <UserPlus className="w-4 h-4 mr-1" /> Create Accounts ({selectedStudentIds.length})
                  </Button>
                </div>
              </div>
              <div className="rounded-lg border overflow-hidden max-h-[300px] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 sticky top-0">
                    <tr>
                      <th className="p-2 w-10"></th>
                      <th className="text-left p-2">Student ID</th>
                      <th className="text-left p-2">Name</th>
                      <th className="text-left p-2">Class</th>
                      <th className="text-left p-2">Section</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUnregistered.map(s => (
                      <tr key={s.studentId} className="border-t">
                        <td className="p-2">
                          <Checkbox checked={selectedStudentIds.includes(s.studentId)} onCheckedChange={() => toggleSelection(s.studentId)} data-testid={`checkbox-${s.studentId}`} />
                        </td>
                        <td className="p-2 font-mono">{s.studentId}</td>
                        <td className="p-2">{s.name}</td>
                        <td className="p-2">{s.class}</td>
                        <td className="p-2">{s.section}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        <div>
          <h3 className="font-semibold text-lg mb-3">Registered Accounts ({filteredAccounts.length})</h3>
          {isLoading ? (
            <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />)}</div>
          ) : filteredAccounts.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">No accounts created yet.</CardContent></Card>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3">Student ID</th>
                    <th className="text-left p-3">Student Name</th>
                    <th className="text-left p-3">Portal Account</th>
                    <th className="text-left p-3">Last Login</th>
                    <th className="text-left p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAccounts.map((a: any) => (
                    <tr key={a.id} className="border-t" data-testid={`row-account-${a.id}`}>
                      <td className="p-3 font-mono">{a.studentId}</td>
                      <td className="p-3">{a.studentName}</td>
                      <td className="p-3">
                        <Badge variant={a.isActive ? "default" : "secondary"}>
                          {a.isActive ? "Active" : "Not Created"}
                        </Badge>
                      </td>
                      <td className="p-3 text-muted-foreground">{a.lastLogin ? new Date(a.lastLogin).toLocaleDateString() : "Never"}</td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          {a.isActive ? (
                            <Button size="sm" variant="outline" onClick={() => {
                              if (confirm("Reset password to DOB default?")) resetPasswordMutation.mutate(a.studentId);
                            }} title="Reset Password" data-testid={`button-reset-${a.id}`}>
                              <RotateCcw className="w-3 h-3 mr-1" /> Reset Password
                            </Button>
                          ) : (
                            <Button size="sm" onClick={() => createAccountsMutation.mutate([a.studentId])} disabled={createAccountsMutation.isPending} data-testid={`button-create-${a.id}`}>
                              <UserPlus className="w-3 h-3 mr-1" /> Create Account
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </ModuleLayout>
  );
}
