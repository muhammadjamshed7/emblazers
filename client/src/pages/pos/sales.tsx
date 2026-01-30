import { ModuleLayout } from "@/components/layout/module-layout";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { posNavItems, usePosData } from "./pos-data";
import { Button } from "@/components/ui/button";
import { Plus, Eye } from "lucide-react";
import { Link } from "wouter";

export default function Sales() {
  const { sales } = usePosData();

  const columns = [
    { key: "invoiceNo" as const, label: "Invoice No", sortable: true },
    { key: "date" as const, label: "Date", sortable: true },
    { key: "customer" as const, label: "Customer" },
    { key: "items" as const, label: "Items", render: (item: typeof sales[0]) => item.items.length },
    { key: "grandTotal" as const, label: "Total", render: (item: typeof sales[0]) => `Rs. ${item.grandTotal.toLocaleString()}` },
  ];

  const actions = (item: typeof sales[0]) => (
    <Button variant="ghost" size="icon" data-testid={`button-view-${item.id}`}>
      <Eye className="w-4 h-4" />
    </Button>
  );

  return (
    <ModuleLayout module="pos" navItems={posNavItems}>
      <div className="space-y-6">
        <PageHeader
          title="Sales"
          description="View all sales transactions"
          actions={
            <Link href="/pos/new">
              <Button data-testid="button-new-sale">
                <Plus className="w-4 h-4 mr-2" />
                New Sale
              </Button>
            </Link>
          }
        />

        <DataTable
          data={sales}
          columns={columns}
          searchKey="customer"
          searchPlaceholder="Search by customer..."
          actions={actions}
          getRowKey={(item) => item.id}
        />
      </div>
    </ModuleLayout>
  );
}
