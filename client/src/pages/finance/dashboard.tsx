import { ModuleLayout } from "@/components/layout/module-layout";
import { StatsCard, StatsGrid } from "@/components/shared/stats-card";
import { RecentTable } from "@/components/shared/recent-table";
import { financeNavItems, useFinanceData, useChartOfAccounts } from "./finance-data";
import { Building2, TrendingUp, TrendingDown, Receipt, CreditCard, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-4 w-24 mb-3" />
              <Skeleton className="h-8 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader><Skeleton className="h-5 w-40" /></CardHeader>
            <CardContent>
              {[1, 2, 3].map((j) => (
                <Skeleton key={j} className="h-8 w-full mb-2" />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function FinanceDashboard() {
  const { dashboard, isLoading } = useFinanceData();
  const { accounts } = useChartOfAccounts();

  if (isLoading) {
    return (
      <ModuleLayout module="finance" navItems={financeNavItems}>
        <DashboardSkeleton />
      </ModuleLayout>
    );
  }

  const recentVouchers = dashboard.recentVouchers || [];
  const recentFeePayments = dashboard.recentFeePayments || [];
  const recentPayrollPayments = dashboard.recentPayrollPayments || [];
  const topAccounts = accounts.slice(0, 5);

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
            value={`Rs. ${(dashboard.totalAssets || 0).toLocaleString()}`}
            icon={Building2}
            iconColor="text-indigo-500"
          />
          <StatsCard
            title="Total Income"
            value={`Rs. ${(dashboard.totalIncome || 0).toLocaleString()}`}
            icon={TrendingUp}
            iconColor="text-green-500"
          />
          <StatsCard
            title="Total Expenses"
            value={`Rs. ${(dashboard.totalExpenses || 0).toLocaleString()}`}
            icon={TrendingDown}
            iconColor="text-red-500"
          />
          <StatsCard
            title="Total Liabilities"
            value={`Rs. ${(dashboard.totalLiabilities || 0).toLocaleString()}`}
            icon={Receipt}
            iconColor="text-orange-500"
          />
          <StatsCard
            title="Fee Collections"
            value={`Rs. ${(dashboard.totalFeeCollected || 0).toLocaleString()}`}
            icon={CreditCard}
            iconColor="text-emerald-500"
          />
          <StatsCard
            title="Payroll Disbursed"
            value={`Rs. ${(dashboard.totalPayrollPaid || 0).toLocaleString()}`}
            icon={Wallet}
            iconColor="text-violet-500"
          />
        </StatsGrid>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentTable
            title="Recent Vouchers"
            data={recentVouchers}
            columns={[
              { key: "voucherNumber", label: "Voucher #" },
              { key: "type", label: "Type", render: (item: any) => (
                <Badge variant={item.type === "Receipt" ? "default" : item.type === "Payment" ? "secondary" : "outline"}>
                  {item.type}
                </Badge>
              )},
              { key: "date", label: "Date" },
              { key: "totalDebit", label: "Amount", render: (item: any) => `Rs. ${(item.totalDebit || 0).toLocaleString()}` },
              { key: "status", label: "Status", render: (item: any) => (
                <Badge variant={item.status === "Posted" ? "default" : item.status === "Cancelled" ? "destructive" : "secondary"}>
                  {item.status}
                </Badge>
              )},
            ]}
            getRowKey={(item: any) => item.id}
            testId="table-recent-vouchers"
          />

          <RecentTable
            title="Fee Collections"
            data={recentFeePayments}
            columns={[
              { key: "receiptNo", label: "Receipt #" },
              { key: "studentName", label: "Student" },
              { key: "amount", label: "Amount", render: (item: any) => `Rs. ${(item.amount || 0).toLocaleString()}` },
              { key: "paymentMode", label: "Mode", render: (item: any) => (
                <Badge variant="outline">{item.paymentMode}</Badge>
              )},
              { key: "paymentDate", label: "Date" },
            ]}
            getRowKey={(item: any) => item.id}
            testId="table-recent-fee-payments"
          />

          <RecentTable
            title="Payroll Disbursements"
            data={recentPayrollPayments}
            columns={[
              { key: "payrollId", label: "Payroll #" },
              { key: "staffName", label: "Staff" },
              { key: "netSalary", label: "Net Salary", render: (item: any) => `Rs. ${(item.netSalary || 0).toLocaleString()}` },
              { key: "month", label: "Month" },
              { key: "paidDate", label: "Paid Date" },
            ]}
            getRowKey={(item: any) => item.id}
            testId="table-recent-payroll"
          />

          <RecentTable
            title="Accounts Summary"
            data={topAccounts}
            columns={[
              { key: "accountCode", label: "Code" },
              { key: "accountName", label: "Account Name" },
              { key: "accountType", label: "Type", render: (item: any) => (
                <Badge variant="outline">{item.accountType}</Badge>
              )},
            ]}
            getRowKey={(item: any) => item.id}
            testId="table-accounts-summary"
          />
        </div>
      </div>
    </ModuleLayout>
  );
}
