import { ModuleLayout } from "@/components/layout/module-layout";
import { StatsCard, StatsGrid } from "@/components/shared/stats-card";
import { RecentTable } from "@/components/shared/recent-table";
import { StatusBadge } from "@/components/shared/data-table";
import { payrollNavItems, usePayrollData } from "./payroll-data";
import { CreditCard, CheckCircle, Clock, Users } from "lucide-react";

export default function PayrollDashboard() {
  const { payrolls } = usePayrollData();

  const totalSalary = payrolls.reduce((sum, p) => sum + p.netSalary, 0);
  const paidPayrolls = payrolls.filter((p) => p.status === "Paid");
  const unpaidPayrolls = payrolls.filter((p) => p.status === "Unpaid");
  const paidAmount = paidPayrolls.reduce((sum, p) => sum + p.netSalary, 0);
  const pendingAmount = unpaidPayrolls.reduce((sum, p) => sum + p.netSalary, 0);

  const recentPayrolls = payrolls.slice(0, 5);

  return (
    <ModuleLayout module="payroll" navItems={payrollNavItems}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-semibold" data-testid="text-page-title">Payroll Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of staff salaries and payroll</p>
        </div>

        <StatsGrid>
          <StatsCard
            title="Total Payroll"
            value={`Rs. ${totalSalary.toLocaleString()}`}
            icon={CreditCard}
            iconColor="text-teal-500"
            subtitle="This month"
          />
          <StatsCard
            title="Paid"
            value={`Rs. ${paidAmount.toLocaleString()}`}
            icon={CheckCircle}
            iconColor="text-green-500"
            subtitle={`${paidPayrolls.length} staff members`}
          />
          <StatsCard
            title="Pending"
            value={`Rs. ${pendingAmount.toLocaleString()}`}
            icon={Clock}
            iconColor="text-orange-500"
            subtitle={`${unpaidPayrolls.length} staff members`}
          />
          <StatsCard
            title="Total Staff"
            value={payrolls.length}
            icon={Users}
            iconColor="text-blue-500"
          />
        </StatsGrid>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentTable
            title="Recent Payroll"
            data={recentPayrolls}
            columns={[
              { key: "staffName", label: "Staff" },
              { key: "designation", label: "Designation" },
              { key: "netSalary", label: "Net Salary", render: (item) => `Rs. ${item.netSalary.toLocaleString()}` },
              {
                key: "status",
                label: "Status",
                render: (item) => <StatusBadge status={item.status} />,
              },
            ]}
            getRowKey={(item) => item.id}
          />

          <RecentTable
            title="By Department"
            data={[
              ...new Set(payrolls.map((p) => p.department)),
            ].map((dept) => ({
              department: dept,
              count: payrolls.filter((p) => p.department === dept).length,
              total: payrolls.filter((p) => p.department === dept).reduce((s, p) => s + p.netSalary, 0),
            }))}
            columns={[
              { key: "department", label: "Department" },
              { key: "count", label: "Staff" },
              { key: "total", label: "Total", render: (item) => `Rs. ${item.total.toLocaleString()}` },
            ]}
            getRowKey={(item) => item.department}
          />
        </div>
      </div>
    </ModuleLayout>
  );
}
