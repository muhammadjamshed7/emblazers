import { ModuleLayout } from "@/components/layout/module-layout";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, StatusBadge } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { hostelNavItems, useHostelData } from "./hostel-data";
import { Plus, CreditCard } from "lucide-react";

export default function HostelFees() {
  const { fees, updateFee } = useHostelData();

  const handleMarkPaid = (id: string) => {
    updateFee(id, { status: "Paid", paidDate: new Date().toISOString().split("T")[0] });
  };

  const columns = [
    { key: "studentName" as const, label: "Student", sortable: true },
    { key: "month" as const, label: "Month" },
    { key: "amount" as const, label: "Amount", render: (item: typeof fees[0]) => `Rs. ${item.amount.toLocaleString()}` },
    { key: "paidDate" as const, label: "Paid Date", render: (item: typeof fees[0]) => item.paidDate || "-" },
    { key: "status" as const, label: "Status", render: (item: typeof fees[0]) => <StatusBadge status={item.status} /> },
  ];

  const actions = (item: typeof fees[0]) => (
    item.status === "Unpaid" && (
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleMarkPaid(item.id)}
        data-testid={`button-pay-${item.id}`}
      >
        <CreditCard className="w-4 h-4 mr-1" />
        Mark Paid
      </Button>
    )
  );

  return (
    <ModuleLayout module="hostel" navItems={hostelNavItems}>
      <div className="space-y-6">
        <PageHeader
          title="Hostel Fee"
          description="Manage hostel fee collection"
          actions={
            <Button data-testid="button-generate-fee">
              <Plus className="w-4 h-4 mr-2" />
              Generate Fee
            </Button>
          }
        />

        <DataTable
          data={fees}
          columns={columns}
          searchKey="studentName"
          searchPlaceholder="Search by student..."
          actions={actions}
          getRowKey={(item) => item.id}
        />
      </div>
    </ModuleLayout>
  );
}
