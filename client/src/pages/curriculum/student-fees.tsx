import { ModuleLayout } from "@/components/layout/module-layout";
import { studentNavItems, useStudentFees } from "./student-data";
import { useAuth } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard } from "lucide-react";

export default function StudentFeesPage() {
  const { session } = useAuth();
  const { data: fees = [], isLoading } = useStudentFees();

  const totalAmount = fees.reduce((sum: number, f: any) => sum + (f.totalAmount || 0), 0);
  const totalPaid = fees.reduce((sum: number, f: any) => sum + (f.paidAmount || 0), 0);
  const totalPending = totalAmount - totalPaid;

  return (
    <ModuleLayout module="curriculum" navItems={studentNavItems}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">My Fees</h1>
          <p className="text-muted-foreground">View your fee vouchers and payment status</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Total Amount</p>
              <p className="text-3xl font-bold">Rs. {totalAmount.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Paid</p>
              <p className="text-3xl font-bold text-emerald-600">Rs. {totalPaid.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-3xl font-bold text-amber-600">Rs. {totalPending.toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>

        {isLoading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />)}</div>
        ) : fees.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">
            <CreditCard className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
            No fee records found.
          </CardContent></Card>
        ) : (
          <div className="rounded-lg border overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 text-sm font-medium">Month</th>
                  <th className="text-left p-3 text-sm font-medium">Total Amount</th>
                  <th className="text-left p-3 text-sm font-medium">Paid</th>
                  <th className="text-left p-3 text-sm font-medium">Due Date</th>
                  <th className="text-left p-3 text-sm font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {fees.map((f: any) => (
                  <tr key={f.id} className="border-t" data-testid={`row-fee-${f.id}`}>
                    <td className="p-3 text-sm font-medium">{f.month || "-"}</td>
                    <td className="p-3 text-sm">Rs. {(f.totalAmount || 0).toLocaleString()}</td>
                    <td className="p-3 text-sm">Rs. {(f.paidAmount || 0).toLocaleString()}</td>
                    <td className="p-3 text-sm text-muted-foreground">{f.dueDate ? new Date(f.dueDate).toLocaleDateString() : "-"}</td>
                    <td className="p-3">
                      <Badge variant={f.status === "paid" ? "default" : f.status === "partial" ? "secondary" : "destructive"}>
                        {f.status || "Unpaid"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </ModuleLayout>
  );
}
