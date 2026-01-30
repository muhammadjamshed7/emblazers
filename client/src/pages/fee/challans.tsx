import { useState } from "react";
import { ModuleLayout } from "@/components/layout/module-layout";
import { PageHeader } from "@/components/shared/page-header";
import { feeNavItems, useChallans, useFeeStructures, useDiscountRules, sessionOptions } from "./fee-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Eye, Trash2, Search, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { type Student, type Challan, type InsertChallan } from "@shared/schema";
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

export default function FeeChallans() {
  const { challans, createChallan, deleteChallan, isPending } = useChallans();
  const { structures } = useFeeStructures();
  const { rules: discountRules } = useDiscountRules();
  const { data: students = [] } = useQuery<Student[]>({ queryKey: ["/api/students"] });
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedChallan, setSelectedChallan] = useState<Challan | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [formData, setFormData] = useState({
    studentId: "",
    feeStructureId: "",
    period: "",
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    discountId: "",
    lateFee: 0,
    notes: "",
  });

  const selectedStudent = students.find(s => s.id === formData.studentId);
  const selectedStructure = structures.find(s => s.id === formData.feeStructureId);
  const selectedDiscount = discountRules.find(r => r.id === formData.discountId);

  const calculateAmounts = () => {
    const totalAmount = selectedStructure?.totalAmount || 0;
    let discountAmount = 0;
    
    if (selectedDiscount) {
      discountAmount = selectedDiscount.type === "Percentage" 
        ? (totalAmount * selectedDiscount.value / 100)
        : selectedDiscount.value;
    }
    
    const netAmount = totalAmount - discountAmount + (formData.lateFee || 0);
    return { totalAmount, discountAmount, netAmount };
  };

  const { totalAmount, discountAmount, netAmount } = calculateAmounts();

  const handleCreateChallan = async () => {
    if (!formData.studentId || !formData.feeStructureId || !formData.period || !formData.dueDate) {
      toast({ title: "Error", description: "Please fill all required fields", variant: "destructive" });
      return;
    }

    try {
      const challan: InsertChallan = {
        studentId: formData.studentId,
        studentName: selectedStudent?.name || "",
        class: selectedStudent?.class || "",
        section: selectedStudent?.section || "",
        academicSession: selectedStructure?.academicSession || sessionOptions[1],
        period: formData.period,
        feeStructureId: formData.feeStructureId,
        feeHeads: selectedStructure?.feeHeads.map(fh => ({ name: fh.name, amount: fh.amount })) || [],
        totalAmount,
        discountId: formData.discountId || undefined,
        discountName: selectedDiscount?.name,
        discountAmount,
        lateFee: formData.lateFee,
        adjustments: 0,
        netAmount,
        paidAmount: 0,
        balanceAmount: netAmount,
        issueDate: new Date().toISOString().split("T")[0],
        dueDate: formData.dueDate,
        status: "Pending",
      };

      await createChallan(challan);
      toast({ title: "Success", description: "Challan created successfully" });
      setDialogOpen(false);
      setFormData({
        studentId: "",
        feeStructureId: "",
        period: "",
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        discountId: "",
        lateFee: 0,
        notes: "",
      });
    } catch (error) {
      toast({ title: "Error", description: String(error), variant: "destructive" });
    }
  };

  const handleViewChallan = (challan: Challan) => {
    setSelectedChallan(challan);
    setViewDialogOpen(true);
  };

  const handleDeleteChallan = async (id: string) => {
    try {
      await deleteChallan(id);
      toast({ title: "Success", description: "Challan deleted" });
    } catch (error) {
      toast({ title: "Error", description: String(error), variant: "destructive" });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      "Pending": "secondary",
      "Partial": "outline",
      "Paid": "default",
      "Overdue": "destructive",
      "Cancelled": "secondary",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  const filteredChallans = challans.filter(challan => {
    const matchesSearch = challan.challanNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      challan.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      challan.studentName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || challan.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const periodOptions = [
    "January 2025", "February 2025", "March 2025", "April 2025", "May 2025", "June 2025",
    "July 2025", "August 2025", "September 2025", "October 2025", "November 2025", "December 2025",
    "January 2026", "February 2026", "March 2026", "April 2026", "May 2026", "June 2026",
  ];

  return (
    <ModuleLayout module="fee" navItems={feeNavItems}>
      <PageHeader
        title="Challan Management"
        description="Generate and manage fee challans for students"
      />

      <div className="space-y-4">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-2 items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by challan number..."
                className="pl-10 w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="input-search-challan"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36" data-testid="select-status-filter">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Partial">Partial</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => setDialogOpen(true)} data-testid="button-generate-challan">
            <Plus className="w-4 h-4 mr-2" />
            Generate Challan
          </Button>
        </div>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Challan #</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Net Amount</TableHead>
                <TableHead>Paid</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredChallans.map((challan) => (
                <TableRow key={challan.id} data-testid={`row-challan-${challan.id}`}>
                  <TableCell className="font-medium">{challan.challanNo}</TableCell>
                  <TableCell>{challan.studentName}</TableCell>
                  <TableCell>{challan.period}</TableCell>
                  <TableCell>{challan.dueDate}</TableCell>
                  <TableCell>Rs. {challan.netAmount.toLocaleString()}</TableCell>
                  <TableCell>Rs. {challan.paidAmount.toLocaleString()}</TableCell>
                  <TableCell>Rs. {challan.balanceAmount.toLocaleString()}</TableCell>
                  <TableCell>{getStatusBadge(challan.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => handleViewChallan(challan)} data-testid={`button-view-challan-${challan.id}`}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDeleteChallan(challan.id)} data-testid={`button-delete-challan-${challan.id}`}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredChallans.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No challans found. Click "Generate Challan" to create one.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Generate Fee Challan</DialogTitle>
            <DialogDescription>Create a new fee challan for a student</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Student</Label>
                <Select value={formData.studentId} onValueChange={(v) => setFormData(prev => ({ ...prev, studentId: v }))}>
                  <SelectTrigger data-testid="select-student">
                    <SelectValue placeholder="Select student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.name} - {student.studentId}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Fee Structure</Label>
                <Select value={formData.feeStructureId} onValueChange={(v) => setFormData(prev => ({ ...prev, feeStructureId: v }))}>
                  <SelectTrigger data-testid="select-fee-structure">
                    <SelectValue placeholder="Select fee structure" />
                  </SelectTrigger>
                  <SelectContent>
                    {structures.filter(s => s.isActive).map((structure) => (
                      <SelectItem key={structure.id} value={structure.id}>
                        {structure.name} (Rs. {structure.totalAmount.toLocaleString()})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Period</Label>
                <Select value={formData.period} onValueChange={(v) => setFormData(prev => ({ ...prev, period: v }))}>
                  <SelectTrigger data-testid="select-period">
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    {periodOptions.map((period) => (
                      <SelectItem key={period} value={period}>{period}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                  data-testid="input-due-date"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Apply Discount (Optional)</Label>
                <Select value={formData.discountId} onValueChange={(v) => setFormData(prev => ({ ...prev, discountId: v }))}>
                  <SelectTrigger data-testid="select-discount">
                    <SelectValue placeholder="No discount" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No discount</SelectItem>
                    {discountRules.filter(r => r.isActive).map((rule) => (
                      <SelectItem key={rule.id} value={rule.id}>
                        {rule.name} ({rule.type === "Percentage" ? `${rule.value}%` : `Rs. ${rule.value}`})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Late Fee</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.lateFee || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, lateFee: Number(e.target.value) }))}
                  data-testid="input-late-fee"
                />
              </div>
            </div>

            {selectedStructure && (
              <Card className="bg-muted/50">
                <CardHeader className="py-3">
                  <CardTitle className="text-sm">Fee Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="py-2 space-y-1 text-sm">
                  {selectedStructure.feeHeads.map((fh, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>{fh.name}</span>
                      <span>Rs. {fh.amount.toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="border-t pt-1 flex justify-between">
                    <span>Total Amount</span>
                    <span>Rs. {totalAmount.toLocaleString()}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>- Rs. {discountAmount.toLocaleString()}</span>
                    </div>
                  )}
                  {formData.lateFee > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>Late Fee</span>
                      <span>+ Rs. {formData.lateFee.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="border-t pt-1 flex justify-between font-semibold">
                    <span>Net Amount</span>
                    <span>Rs. {netAmount.toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateChallan} disabled={isPending} data-testid="button-create-challan">
                {isPending ? "Creating..." : "Create Challan"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Challan Details</DialogTitle>
            <DialogDescription>Challan #{selectedChallan?.challanNo}</DialogDescription>
          </DialogHeader>
          {selectedChallan && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Student:</span>
                  <p className="font-medium">{selectedChallan.studentName}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Period:</span>
                  <p className="font-medium">{selectedChallan.period}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Issue Date:</span>
                  <p className="font-medium">{selectedChallan.issueDate}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Due Date:</span>
                  <p className="font-medium">{selectedChallan.dueDate}</p>
                </div>
              </div>

              <Card>
                <CardContent className="py-3 space-y-2 text-sm">
                  {selectedChallan.feeHeads.map((fh, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>{fh.name}</span>
                      <span>Rs. {fh.amount.toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 space-y-1">
                    <div className="flex justify-between">
                      <span>Total Amount</span>
                      <span>Rs. {selectedChallan.totalAmount.toLocaleString()}</span>
                    </div>
                    {selectedChallan.discountAmount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount</span>
                        <span>- Rs. {selectedChallan.discountAmount.toLocaleString()}</span>
                      </div>
                    )}
                    {selectedChallan.lateFee > 0 && (
                      <div className="flex justify-between text-red-600">
                        <span>Late Fee</span>
                        <span>+ Rs. {selectedChallan.lateFee.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="border-t pt-1 flex justify-between font-semibold">
                      <span>Net Amount</span>
                      <span>Rs. {selectedChallan.netAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Paid Amount</span>
                      <span>Rs. {selectedChallan.paidAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-primary">
                      <span>Balance Due</span>
                      <span>Rs. {selectedChallan.balanceAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between items-center">
                <div>Status: {getStatusBadge(selectedChallan.status)}</div>
                <Button variant="outline" onClick={() => setViewDialogOpen(false)}>Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </ModuleLayout>
  );
}
