import { useState } from "react";
import { ModuleLayout } from "@/components/layout/module-layout";
import { PageHeader } from "@/components/shared/page-header";
import { financeNavItems, useChartOfAccounts, useLedgerEntries, useJournalEntries } from "./finance-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Filter, BookOpen, FileText, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { type InsertJournalEntry } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function FinanceLedger() {
  const { accounts } = useChartOfAccounts();
  const { entries: ledgerEntries } = useLedgerEntries();
  const { entries: journalEntries, createEntry: createJournalEntry, isPending } = useJournalEntries();
  const { toast } = useToast();

  const [journalDialogOpen, setJournalDialogOpen] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const [journalFormData, setJournalFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    description: "",
    entries: [
      { accountId: "", accountCode: "", accountName: "", debit: 0, credit: 0 },
      { accountId: "", accountCode: "", accountName: "", debit: 0, credit: 0 },
    ],
  });

  const handleAddJournalLine = () => {
    setJournalFormData(prev => ({
      ...prev,
      entries: [...prev.entries, { accountId: "", accountCode: "", accountName: "", debit: 0, credit: 0 }]
    }));
  };

  const handleRemoveJournalLine = (index: number) => {
    if (journalFormData.entries.length > 2) {
      setJournalFormData(prev => ({
        ...prev,
        entries: prev.entries.filter((_, i) => i !== index)
      }));
    }
  };

  const handleJournalLineChange = (index: number, field: string, value: string | number) => {
    setJournalFormData(prev => ({
      ...prev,
      entries: prev.entries.map((entry, i) => {
        if (i !== index) return entry;
        if (field === "accountId") {
          const account = accounts.find(a => a.id === value);
          return { 
            ...entry, 
            accountId: value as string, 
            accountCode: account?.accountCode || "",
            accountName: account?.accountName || "" 
          };
        }
        return { ...entry, [field]: value };
      })
    }));
  };

  const calculateTotals = () => {
    const debits = journalFormData.entries.reduce((sum, e) => sum + (e.debit || 0), 0);
    const credits = journalFormData.entries.reduce((sum, e) => sum + (e.credit || 0), 0);
    return { debits, credits, balanced: debits === credits && debits > 0 };
  };

  const { debits, credits, balanced } = calculateTotals();

  const handleCreateJournalEntry = async () => {
    if (!journalFormData.description || !balanced) {
      toast({ 
        title: "Error", 
        description: balanced ? "Please fill all required fields" : "Debits must equal credits", 
        variant: "destructive" 
      });
      return;
    }

    try {
      const journalEntry: InsertJournalEntry = {
        date: journalFormData.date,
        description: journalFormData.description,
        entries: journalFormData.entries
          .filter(e => e.accountId && (e.debit > 0 || e.credit > 0))
          .map(e => ({
            accountId: e.accountId,
            accountCode: e.accountCode,
            accountName: e.accountName,
            debit: e.debit || 0,
            credit: e.credit || 0,
          })),
        totalDebit: debits,
        totalCredit: credits,
        status: "Posted",
        createdBy: "System",
      };

      await createJournalEntry(journalEntry);
      toast({ title: "Success", description: "Journal entry created successfully" });
      setJournalDialogOpen(false);
      setJournalFormData({
        date: new Date().toISOString().split("T")[0],
        description: "",
        entries: [
          { accountId: "", accountCode: "", accountName: "", debit: 0, credit: 0 },
          { accountId: "", accountCode: "", accountName: "", debit: 0, credit: 0 },
        ],
      });
    } catch (error) {
      toast({ title: "Error", description: String(error), variant: "destructive" });
    }
  };

  const filteredLedgerEntries = ledgerEntries.filter(entry => {
    const matchesAccount = selectedAccountId === "all" || entry.accountId === selectedAccountId;
    const matchesSearch = entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.accountName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesAccount && matchesSearch;
  });

  const calculateRunningBalance = () => {
    let balance = 0;
    return filteredLedgerEntries.map(entry => {
      balance += entry.debit - entry.credit;
      return { ...entry, runningBalance: balance };
    });
  };

  const entriesWithBalance = calculateRunningBalance();

  return (
    <ModuleLayout module="finance" navItems={financeNavItems}>
      <PageHeader
        title="General Ledger"
        description="View ledger entries and create journal entries for double-entry accounting"
      />

      <Tabs defaultValue="ledger" className="space-y-4">
        <TabsList>
          <TabsTrigger value="ledger" data-testid="tab-ledger">
            <BookOpen className="w-4 h-4 mr-2" />
            Ledger
          </TabsTrigger>
          <TabsTrigger value="journal" data-testid="tab-journal">
            <FileText className="w-4 h-4 mr-2" />
            Journal Entries
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ledger" className="space-y-4">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-2 items-center">
              <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                <SelectTrigger className="w-64" data-testid="select-account-filter">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Accounts</SelectItem>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.accountCode} - {account.accountName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search entries..."
                  className="pl-10 w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  data-testid="input-search-ledger"
                />
              </div>
            </div>
            <Button onClick={() => setJournalDialogOpen(true)} data-testid="button-create-journal">
              <Plus className="w-4 h-4 mr-2" />
              New Journal Entry
            </Button>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Debit</TableHead>
                  <TableHead className="text-right">Credit</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entriesWithBalance.map((entry) => (
                  <TableRow key={entry.id} data-testid={`row-ledger-${entry.id}`}>
                    <TableCell>{entry.date}</TableCell>
                    <TableCell className="font-medium">{entry.accountName}</TableCell>
                    <TableCell>{entry.description}</TableCell>
                    <TableCell className="text-right">
                      {entry.debit > 0 && (
                        <span className="flex items-center justify-end text-green-600">
                          <ArrowUpRight className="w-3 h-3 mr-1" />
                          Rs. {entry.debit.toLocaleString()}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {entry.credit > 0 && (
                        <span className="flex items-center justify-end text-red-600">
                          <ArrowDownLeft className="w-3 h-3 mr-1" />
                          Rs. {entry.credit.toLocaleString()}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      Rs. {entry.runningBalance.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
                {entriesWithBalance.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No ledger entries found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="journal" className="space-y-4">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Entry #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Debit Total</TableHead>
                  <TableHead className="text-right">Credit Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {journalEntries.map((entry) => (
                  <TableRow key={entry.id} data-testid={`row-journal-${entry.id}`}>
                    <TableCell className="font-medium">{entry.journalNo}</TableCell>
                    <TableCell>{entry.date}</TableCell>
                    <TableCell>{entry.description}</TableCell>
                    <TableCell className="text-right">Rs. {entry.totalDebit.toLocaleString()}</TableCell>
                    <TableCell className="text-right">Rs. {entry.totalCredit.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={entry.status === "Posted" ? "default" : "secondary"}>
                        {entry.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {journalEntries.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No journal entries found. Click "New Journal Entry" to create one.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={journalDialogOpen} onOpenChange={setJournalDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Create Journal Entry</DialogTitle>
            <DialogDescription>Enter debit and credit entries for double-entry accounting</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={journalFormData.date}
                  onChange={(e) => setJournalFormData(prev => ({ ...prev, date: e.target.value }))}
                  data-testid="input-journal-date"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  placeholder="Enter transaction description"
                  value={journalFormData.description}
                  onChange={(e) => setJournalFormData(prev => ({ ...prev, description: e.target.value }))}
                  data-testid="input-journal-description"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Entry Lines</Label>
                <Button type="button" size="sm" variant="outline" onClick={handleAddJournalLine} data-testid="button-add-line">
                  <Plus className="w-4 h-4 mr-1" /> Add Line
                </Button>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {journalFormData.entries.map((entry, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <Select 
                      value={entry.accountId} 
                      onValueChange={(v) => handleJournalLineChange(index, "accountId", v)}
                    >
                      <SelectTrigger className="flex-1" data-testid={`select-account-${index}`}>
                        <SelectValue placeholder="Select account" />
                      </SelectTrigger>
                      <SelectContent>
                        {accounts.map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.accountCode} - {account.accountName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      placeholder="Debit"
                      className="w-28"
                      value={entry.debit || ""}
                      onChange={(e) => handleJournalLineChange(index, "debit", Number(e.target.value))}
                      data-testid={`input-debit-${index}`}
                    />
                    <Input
                      type="number"
                      placeholder="Credit"
                      className="w-28"
                      value={entry.credit || ""}
                      onChange={(e) => handleJournalLineChange(index, "credit", Number(e.target.value))}
                      data-testid={`input-credit-${index}`}
                    />
                    {journalFormData.entries.length > 2 && (
                      <Button 
                        type="button" 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => handleRemoveJournalLine(index)}
                        data-testid={`button-remove-line-${index}`}
                      >
                        x
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <Card className={balanced ? "bg-green-50 dark:bg-green-950/20" : "bg-red-50 dark:bg-red-950/20"}>
              <CardContent className="py-3">
                <div className="flex justify-between text-sm">
                  <div>
                    <span className="text-muted-foreground">Total Debits: </span>
                    <span className="font-semibold text-green-600">Rs. {debits.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total Credits: </span>
                    <span className="font-semibold text-red-600">Rs. {credits.toLocaleString()}</span>
                  </div>
                  <Badge variant={balanced ? "default" : "destructive"}>
                    {balanced ? "Balanced" : "Unbalanced"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setJournalDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateJournalEntry} disabled={isPending || !balanced} data-testid="button-save-journal">
                {isPending ? "Saving..." : "Post Journal Entry"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </ModuleLayout>
  );
}
