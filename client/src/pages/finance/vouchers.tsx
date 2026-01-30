import { ModuleLayout } from "@/components/layout/module-layout";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { financeNavItems, useFinanceData } from "./finance-data";
import { Badge } from "@/components/ui/badge";

export default function FinanceVouchers() {
  const { vouchers } = useFinanceData();

  const columns = [
    { key: "voucherNo" as const, label: "Voucher No", sortable: true },
    { key: "date" as const, label: "Date", sortable: true },
    { key: "type" as const, label: "Type", render: (item: typeof vouchers[0]) => (
      <Badge variant={item.type === "Receipt" ? "default" : item.type === "Payment" ? "secondary" : "outline"}>
        {item.type}
      </Badge>
    )},
    { key: "accountName" as const, label: "Account" },
    { key: "narration" as const, label: "Narration" },
    { key: "debit" as const, label: "Debit", render: (item: typeof vouchers[0]) => 
      item.debit > 0 ? `Rs. ${item.debit.toLocaleString()}` : "-" 
    },
    { key: "credit" as const, label: "Credit", render: (item: typeof vouchers[0]) => 
      item.credit > 0 ? `Rs. ${item.credit.toLocaleString()}` : "-" 
    },
  ];

  return (
    <ModuleLayout module="finance" navItems={financeNavItems}>
      <div className="space-y-6">
        <PageHeader
          title="Finance Vouchers"
          description="Payment, Receipt, and Journal vouchers"
        />

        <DataTable
          data={vouchers}
          columns={columns}
          searchKey="narration"
          searchPlaceholder="Search vouchers..."
          filterKey="type"
          filterOptions={["Payment", "Receipt", "Journal"]}
          getRowKey={(item) => item.id}
          exportOptions={{
            enabled: true,
            title: "Finance Vouchers",
            filename: "finance-vouchers",
          }}
        />
      </div>
    </ModuleLayout>
  );
}
