import { useState } from "react";
import { ModuleLayout } from "@/components/layout/module-layout";
import { PageHeader } from "@/components/shared/page-header";
import { financeNavItems, useExpenses, useVendors, expenseCategories, paymentStatuses } from "./finance-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Eye, Trash2, Search, Filter, TrendingDown, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { type Expense, type InsertExpense } from "@shared/schema";
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

export default function FinanceExpenses() {
  const { expenses, createExpense, deleteExpense, isPending } = useExpenses();
  const { vendors } = useVendors();
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    category: "Other" as typeof expenseCategories[number],
    subcategory: "",
    description: "",
    vendorId: "",
    amount: 0,
    paymentMode: "Cash" as "Cash" | "Bank Transfer" | "Cheque",
    referenceNo: "",
    status: "Pending" as typeof paymentStatuses[number],
    notes: "",
  });

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split("T")[0],
      category: "Other",
      subcategory: "",
      description: "",
      vendorId: "",
      amount: 0,
      paymentMode: "Cash",
      referenceNo: "",
      status: "Pending",
      notes: "",
    });
  };

  const handleCreateExpense = async () => {
    if (!formData.description || formData.amount <= 0) {
      toast({ title: "Error", description: "Please fill all required fields", variant: "destructive" });
      return;
    }

    try {
      const expense: InsertExpense = {
        date: formData.date,
        category: formData.category,
        subcategory: formData.subcategory || undefined,
        description: formData.description,
        vendorId: formData.vendorId || undefined,
        vendorName: vendors.find(v => v.id === formData.vendorId)?.name,
        amount: formData.amount,
        paymentMode: formData.paymentMode,
        referenceNo: formData.referenceNo || undefined,
        status: formData.status,
        notes: formData.notes || undefined,
        approvedBy: formData.status === "Approved" ? "System" : undefined,
      };

      await createExpense(expense);
      toast({ title: "Success", description: "Expense recorded successfully" });
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({ title: "Error", description: String(error), variant: "destructive" });
    }
  };

  const handleViewExpense = (expense: Expense) => {
    setSelectedExpense(expense);
    setViewDialogOpen(true);
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      await deleteExpense(id);
      toast({ title: "Success", description: "Expense deleted" });
    } catch (error) {
      toast({ title: "Error", description: String(error), variant: "destructive" });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      "Pending": "secondary",
      "Approved": "outline",
      "Paid": "default",
      "Cancelled": "destructive",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.expenseId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || expense.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const paidExpenses = expenses.filter(e => e.status === "Paid").reduce((sum, e) => sum + e.amount, 0);
  const pendingExpenses = expenses.filter(e => e.status === "Pending").reduce((sum, e) => sum + e.amount, 0);

  return (
    <ModuleLayout module="finance" navItems={financeNavItems}>
      <PageHeader
        title="Expense Tracking"
        description="Record and manage all organizational expenses"
      />

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs. {totalExpenses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{expenses.length} transactions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium">Paid</CardTitle>
            <Calendar className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Rs. {paidExpenses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{expenses.filter(e => e.status === "Paid").length} paid</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Calendar className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">Rs. {pendingExpenses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{expenses.filter(e => e.status === "Pending").length} pending</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-2 items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search expenses..."
                className="pl-10 w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="input-search-expense"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40" data-testid="select-category-filter">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {expenseCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => setDialogOpen(true)} data-testid="button-add-expense">
            <Plus className="w-4 h-4 mr-2" />
            Add Expense
          </Button>
        </div>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExpenses.map((expense) => (
                <TableRow key={expense.id} data-testid={`row-expense-${expense.id}`}>
                  <TableCell className="font-medium">{expense.expenseId}</TableCell>
                  <TableCell>{expense.date}</TableCell>
                  <TableCell>{expense.description}</TableCell>
                  <TableCell>{expense.category}</TableCell>
                  <TableCell>{expense.vendorName || "-"}</TableCell>
                  <TableCell>Rs. {expense.amount.toLocaleString()}</TableCell>
                  <TableCell>{getStatusBadge(expense.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => handleViewExpense(expense)} data-testid={`button-view-expense-${expense.id}`}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDeleteExpense(expense.id)} data-testid={`button-delete-expense-${expense.id}`}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredExpenses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No expenses found. Click "Add Expense" to record one.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Expense</DialogTitle>
            <DialogDescription>Record a new expense transaction</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  data-testid="input-expense-date"
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(v: typeof expenseCategories[number]) => setFormData(prev => ({ ...prev, category: v }))}
                >
                  <SelectTrigger data-testid="select-expense-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                placeholder="Enter expense description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                data-testid="input-expense-description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={formData.amount || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: Number(e.target.value) }))}
                  data-testid="input-expense-amount"
                />
              </div>
              <div className="space-y-2">
                <Label>Vendor (Optional)</Label>
                <Select value={formData.vendorId} onValueChange={(v) => setFormData(prev => ({ ...prev, vendorId: v }))}>
                  <SelectTrigger data-testid="select-expense-vendor">
                    <SelectValue placeholder="Select vendor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No vendor</SelectItem>
                    {vendors.map((vendor) => (
                      <SelectItem key={vendor.id} value={vendor.id}>{vendor.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Payment Mode</Label>
                <Select 
                  value={formData.paymentMode} 
                  onValueChange={(v: "Cash" | "Bank Transfer" | "Cheque") => setFormData(prev => ({ ...prev, paymentMode: v }))}
                >
                  <SelectTrigger data-testid="select-payment-mode">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                    <SelectItem value="Cheque">Cheque</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(v: typeof paymentStatuses[number]) => setFormData(prev => ({ ...prev, status: v }))}
                >
                  <SelectTrigger data-testid="select-expense-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentStatuses.map((status) => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notes (Optional)</Label>
              <Input
                placeholder="Any additional notes..."
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                data-testid="input-expense-notes"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateExpense} disabled={isPending} data-testid="button-save-expense">
                {isPending ? "Saving..." : "Save Expense"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Expense Details</DialogTitle>
            <DialogDescription>ID: {selectedExpense?.expenseId}</DialogDescription>
          </DialogHeader>
          {selectedExpense && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Date:</span>
                  <p className="font-medium">{selectedExpense.date}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Category:</span>
                  <p className="font-medium">{selectedExpense.category}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Payment Mode:</span>
                  <p className="font-medium">{selectedExpense.paymentMode}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <div>{getStatusBadge(selectedExpense.status)}</div>
                </div>
              </div>

              <div className="text-sm">
                <span className="text-muted-foreground">Description:</span>
                <p className="font-medium">{selectedExpense.description}</p>
              </div>

              <Card>
                <CardContent className="py-4 text-center">
                  <div className="text-3xl font-bold">Rs. {selectedExpense.amount.toLocaleString()}</div>
                </CardContent>
              </Card>

              {selectedExpense.vendorName && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Vendor: </span>
                  <span className="font-medium">{selectedExpense.vendorName}</span>
                </div>
              )}

              {selectedExpense.notes && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Notes: </span>
                  <span>{selectedExpense.notes}</span>
                </div>
              )}

              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setViewDialogOpen(false)}>Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </ModuleLayout>
  );
}
