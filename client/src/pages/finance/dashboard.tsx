import { ModuleLayout } from "@/components/layout/module-layout";
import { StatsCard, StatsGrid } from "@/components/shared/stats-card";
import { RecentTable } from "@/components/shared/recent-table";
import { financeNavItems, useFinanceData } from "./finance-data";
import { Building2, TrendingUp, TrendingDown, Receipt } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function FinanceDashboard() {
  const { accounts, vouchers } = useFinanceData();

  const totalAssets = accounts.filter((a) => a.type === "Assets").reduce((s, a) => s + a.balance, 0);
  const totalIncome = accounts.filter((a) => a.type === "Income").reduce((s, a) => s + a.balance, 0);
  const totalExpenses = accounts.filter((a) => a.type === "Expense").reduce((s, a) => s + a.balance, 0);
  const totalLiabilities = accounts.filter((a) => a.type === "Liabilities").reduce((s, a) => s + a.balance, 0);

  const recentVouchers = vouchers.slice(-5).reverse();

  return (
    <ModuleLayout module="finance" navItems={financeNavItems}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-semibold" data-testid="text-page-title">Finance Dashboard</h1>
          <p className="text-muted-foreground mt-1">Financial overview and account summary</p>
        </div>

        <StatsGrid>
          <StatsCard
            title="Total Assets"
            value={`Rs. ${totalAssets.toLocaleString()}`}
            icon={Building2}
            iconColor="text-indigo-500"
          />
          <StatsCard
            title="Total Income"
            value={`Rs. ${totalIncome.toLocaleString()}`}
            icon={TrendingUp}
            iconColor="text-green-500"
            trend={{ value: 8, label: "vs last month", direction: "up" }}
          />
          <StatsCard
            title="Total Expenses"
            value={`Rs. ${totalExpenses.toLocaleString()}`}
            icon={TrendingDown}
            iconColor="text-red-500"
          />
          <StatsCard
            title="Liabilities"
            value={`Rs. ${totalLiabilities.toLocaleString()}`}
            icon={Receipt}
            iconColor="text-orange-500"
          />
        </StatsGrid>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentTable
            title="Recent Vouchers"
            data={recentVouchers}
            columns={[
              { key: "voucherNo", label: "Voucher" },
              { key: "type", label: "Type", render: (item) => (
                <Badge variant={item.type === "Receipt" ? "default" : item.type === "Payment" ? "secondary" : "outline"}>
                  {item.type}
                </Badge>
              )},
              { key: "accountName", label: "Account" },
              { key: "amount", label: "Amount", render: (item) => `Rs. ${item.amount.toLocaleString()}` },
            ]}
            getRowKey={(item) => item.id}
          />

          <RecentTable
            title="Accounts Summary"
            data={accounts.slice(0, 5)}
            columns={[
              { key: "code", label: "Code" },
              { key: "name", label: "Account Name" },
              { key: "type", label: "Type", render: (item) => <Badge variant="outline">{item.type}</Badge> },
              { key: "balance", label: "Balance", render: (item) => `Rs. ${item.balance.toLocaleString()}` },
            ]}
            getRowKey={(item) => item.id}
          />
        </div>
      </div>
    </ModuleLayout>
  );
}
