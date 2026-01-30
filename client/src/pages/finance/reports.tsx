import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { financeNavItems, useChartOfAccounts, useExpenses, useLedgerEntries } from "./finance-data";
import { usePayments, useChallans } from "@/pages/fee/fee-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ModuleLayout } from "@/components/layout/module-layout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileDown, FileSpreadsheet, Calendar, TrendingUp, TrendingDown, DollarSign, Users, AlertCircle } from "lucide-react";
import { exportToPDF, exportToExcel } from "@/lib/export-utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function FinanceReports() {
  const { accounts } = useChartOfAccounts();
  const { expenses } = useExpenses();
  const { entries: ledgerEntries } = useLedgerEntries();
  const { payments } = usePayments();
  const { challans } = useChallans();

  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0],
    to: new Date().toISOString().split("T")[0],
  });

  const filterByDate = <T extends { date?: string; paymentDate?: string; createdAt?: string }>(items: T[]) => {
    return items.filter(item => {
      const date = item.date || item.paymentDate || item.createdAt?.split("T")[0];
      if (!date) return true;
      return date >= dateRange.from && date <= dateRange.to;
    });
  };

  const filteredPayments = filterByDate(payments);
  const filteredExpenses = filterByDate(expenses);

  const totalAssets = accounts.filter(a => a.accountType === "Asset").reduce((s, a) => s + a.currentBalance, 0);
  const totalLiabilities = accounts.filter(a => a.accountType === "Liability").reduce((s, a) => s + a.currentBalance, 0);
  const totalIncome = accounts.filter(a => a.accountType === "Income").reduce((s, a) => s + a.currentBalance, 0);
  const totalExpenses = accounts.filter(a => a.accountType === "Expense").reduce((s, a) => s + a.currentBalance, 0);
  const netProfit = totalIncome - totalExpenses;

  const dailyCollections = filteredPayments
    .filter(p => p.type === "Payment" && p.status === "Completed")
    .reduce((sum, p) => sum + p.amount, 0);

  const dailyRefunds = filteredPayments
    .filter(p => p.type === "Refund" && p.status === "Completed")
    .reduce((sum, p) => sum + p.amount, 0);

  const outstandingDues = challans
    .filter(c => c.status !== "Paid" && c.status !== "Cancelled")
    .reduce((sum, c) => sum + c.balanceAmount, 0);

  const overdueChallans = challans.filter(c => 
    c.status === "Overdue" || 
    (c.status !== "Paid" && c.status !== "Cancelled" && new Date(c.dueDate) < new Date())
  );

  const totalExpenseAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const paidExpenseAmount = filteredExpenses.filter(e => e.status === "Paid").reduce((sum, e) => sum + e.amount, 0);
  const pendingExpenseAmount = filteredExpenses.filter(e => e.status === "Pending").reduce((sum, e) => sum + e.amount, 0);

  const expenseByCategory = filteredExpenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const paymentsByMode = filteredPayments.reduce((acc, payment) => {
    if (payment.type === "Payment" && payment.status === "Completed") {
      acc[payment.paymentMode] = (acc[payment.paymentMode] || 0) + payment.amount;
    }
    return acc;
  }, {} as Record<string, number>);

  const collectionSummary = [
    { item: "Total Collections", amount: dailyCollections },
    { item: "Total Refunds", amount: dailyRefunds },
    { item: "Net Collection", amount: dailyCollections - dailyRefunds },
  ];

  const handleExportCollectionsPDF = () => {
    exportToPDF({
      title: `Collection Report (${dateRange.from} to ${dateRange.to})`,
      filename: "collection-report",
      data: collectionSummary,
      columns: [
        { key: "item" as const, label: "Item" },
        { key: "amount" as const, label: "Amount" },
      ],
    });
  };

  const handleExportCollectionsExcel = () => {
    exportToExcel({
      title: "Collection Report",
      filename: "collection-report",
      data: collectionSummary,
      columns: [
        { key: "item" as const, label: "Item" },
        { key: "amount" as const, label: "Amount" },
      ],
    });
  };

  const outstandingData = challans
    .filter(c => c.status !== "Paid" && c.status !== "Cancelled")
    .map(c => ({
      challanNo: c.challanNo,
      student: c.studentName,
      class: c.class,
      period: c.period,
      dueDate: c.dueDate,
      netAmount: c.netAmount,
      paid: c.paidAmount,
      balance: c.balanceAmount,
      status: c.status,
    }));

  const handleExportOutstandingPDF = () => {
    exportToPDF({
      title: "Outstanding Dues Report",
      filename: "outstanding-dues",
      data: outstandingData,
      columns: [
        { key: "challanNo" as const, label: "Challan #" },
        { key: "student" as const, label: "Student" },
        { key: "class" as const, label: "Class" },
        { key: "balance" as const, label: "Balance" },
      ],
    });
  };

  const handleExportOutstandingExcel = () => {
    exportToExcel({
      title: "Outstanding Dues",
      filename: "outstanding-dues",
      data: outstandingData,
      columns: [
        { key: "challanNo" as const, label: "Challan #" },
        { key: "student" as const, label: "Student" },
        { key: "class" as const, label: "Class" },
        { key: "period" as const, label: "Period" },
        { key: "dueDate" as const, label: "Due Date" },
        { key: "netAmount" as const, label: "Net Amount" },
        { key: "paid" as const, label: "Paid" },
        { key: "balance" as const, label: "Balance" },
        { key: "status" as const, label: "Status" },
      ],
    });
  };

  const expenseData = Object.entries(expenseByCategory).map(([category, amount]) => ({ category, amount }));

  const handleExportExpensesPDF = () => {
    exportToPDF({
      title: `Expense Report (${dateRange.from} to ${dateRange.to})`,
      filename: "expense-report",
      data: expenseData,
      columns: [
        { key: "category" as const, label: "Category" },
        { key: "amount" as const, label: "Amount" },
      ],
    });
  };

  const handleExportExpensesExcel = () => {
    exportToExcel({
      title: "Expense Report",
      filename: "expense-report",
      data: expenseData,
      columns: [
        { key: "category" as const, label: "Category" },
        { key: "amount" as const, label: "Amount" },
      ],
    });
  };

  const plData = [
    { item: "Fee Collections", amount: dailyCollections },
    { item: "Less: Refunds", amount: -dailyRefunds },
    { item: "Net Revenue", amount: dailyCollections - dailyRefunds },
    { item: "Less: Expenses", amount: -totalExpenseAmount },
    { item: "Net Profit/Loss", amount: (dailyCollections - dailyRefunds) - totalExpenseAmount },
  ];

  const handleExportPLPDF = () => {
    exportToPDF({
      title: `Profit & Loss Statement (${dateRange.from} to ${dateRange.to})`,
      filename: "profit-loss",
      data: plData,
      columns: [
        { key: "item" as const, label: "Item" },
        { key: "amount" as const, label: "Amount" },
      ],
    });
  };

  const handleExportPLExcel = () => {
    exportToExcel({
      title: "Profit & Loss Statement",
      filename: "profit-loss",
      data: plData,
      columns: [
        { key: "item" as const, label: "Item" },
        { key: "amount" as const, label: "Amount" },
      ],
    });
  };

  return (
    <ModuleLayout module="finance" navItems={financeNavItems}>
      <PageHeader
        title="Financial Reports"
        description="Comprehensive financial analysis and reports"
      />

      <div className="space-y-6">
        <Card>
          <CardContent className="py-4">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="space-y-2">
                <Label>From Date</Label>
                <Input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                  data-testid="input-date-from"
                />
              </div>
              <div className="space-y-2">
                <Label>To Date</Label>
                <Input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                  data-testid="input-date-to"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium">Collections</CardTitle>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Rs. {dailyCollections.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{filteredPayments.filter(p => p.type === "Payment").length} payments</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
              <AlertCircle className="w-4 h-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">Rs. {outstandingDues.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{challans.filter(c => c.status !== "Paid" && c.status !== "Cancelled").length} pending</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium">Expenses</CardTitle>
              <TrendingDown className="w-4 h-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">Rs. {totalExpenseAmount.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{filteredExpenses.length} transactions</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
              <DollarSign className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${netProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                Rs. {netProfit.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="collections" className="space-y-4">
          <TabsList>
            <TabsTrigger value="collections" data-testid="tab-collections">Collections</TabsTrigger>
            <TabsTrigger value="outstanding" data-testid="tab-outstanding">Outstanding Dues</TabsTrigger>
            <TabsTrigger value="expenses" data-testid="tab-expenses">Expenses</TabsTrigger>
            <TabsTrigger value="pl" data-testid="tab-pl">P&L Statement</TabsTrigger>
          </TabsList>

          <TabsContent value="collections" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Collection Report</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleExportCollectionsPDF} data-testid="button-export-collections-pdf">
                    <FileDown className="w-4 h-4 mr-2" /> PDF
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleExportCollectionsExcel} data-testid="button-export-collections-excel">
                    <FileSpreadsheet className="w-4 h-4 mr-2" /> Excel
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Summary</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between py-2 border-b">
                        <span>Total Collections</span>
                        <span className="font-medium text-green-600">Rs. {dailyCollections.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span>Total Refunds</span>
                        <span className="font-medium text-red-600">Rs. {dailyRefunds.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between py-2 font-semibold">
                        <span>Net Collection</span>
                        <span>Rs. {(dailyCollections - dailyRefunds).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-medium">By Payment Mode</h4>
                    <div className="space-y-2">
                      {Object.entries(paymentsByMode).map(([mode, amount]) => (
                        <div key={mode} className="flex justify-between py-2 border-b">
                          <span>{mode}</span>
                          <span className="font-medium">Rs. {amount.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="outstanding" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Outstanding Dues ({outstandingData.length} records)</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleExportOutstandingPDF} data-testid="button-export-outstanding-pdf">
                    <FileDown className="w-4 h-4 mr-2" /> PDF
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleExportOutstandingExcel} data-testid="button-export-outstanding-excel">
                    <FileSpreadsheet className="w-4 h-4 mr-2" /> Excel
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Challan #</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {outstandingData.slice(0, 10).map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{row.challanNo}</TableCell>
                        <TableCell>{row.student}</TableCell>
                        <TableCell>{row.class}</TableCell>
                        <TableCell>{row.period}</TableCell>
                        <TableCell>{row.dueDate}</TableCell>
                        <TableCell className="text-right font-medium">Rs. {row.balance.toLocaleString()}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs ${row.status === "Overdue" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
                            {row.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                    {outstandingData.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No outstanding dues found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="expenses" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Expense Analysis</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleExportExpensesPDF} data-testid="button-export-expenses-pdf">
                    <FileDown className="w-4 h-4 mr-2" /> PDF
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleExportExpensesExcel} data-testid="button-export-expenses-excel">
                    <FileSpreadsheet className="w-4 h-4 mr-2" /> Excel
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Summary</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between py-2 border-b">
                        <span>Total Expenses</span>
                        <span className="font-medium">Rs. {totalExpenseAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span>Paid</span>
                        <span className="font-medium text-green-600">Rs. {paidExpenseAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span>Pending</span>
                        <span className="font-medium text-amber-600">Rs. {pendingExpenseAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-medium">By Category</h4>
                    <div className="space-y-2">
                      {Object.entries(expenseByCategory)
                        .sort((a, b) => b[1] - a[1])
                        .map(([category, amount]) => (
                          <div key={category} className="flex justify-between py-2 border-b">
                            <span>{category}</span>
                            <span className="font-medium">Rs. {amount.toLocaleString()}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pl" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Profit & Loss Statement</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleExportPLPDF} data-testid="button-export-pl-pdf">
                    <FileDown className="w-4 h-4 mr-2" /> PDF
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleExportPLExcel} data-testid="button-export-pl-excel">
                    <FileSpreadsheet className="w-4 h-4 mr-2" /> Excel
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="max-w-lg mx-auto space-y-4">
                  <div className="flex justify-between py-3 border-b">
                    <span className="font-medium">Fee Collections</span>
                    <span className="font-medium text-green-600">Rs. {dailyCollections.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b">
                    <span className="pl-4">Less: Refunds</span>
                    <span className="text-red-600">Rs. {dailyRefunds.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b bg-muted/50 px-2 rounded">
                    <span className="font-semibold">Net Revenue</span>
                    <span className="font-semibold">Rs. {(dailyCollections - dailyRefunds).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b">
                    <span className="pl-4">Less: Operating Expenses</span>
                    <span className="text-red-600">Rs. {totalExpenseAmount.toLocaleString()}</span>
                  </div>
                  <div className={`flex justify-between py-3 bg-muted px-2 rounded ${((dailyCollections - dailyRefunds) - totalExpenseAmount) >= 0 ? "" : "bg-red-50 dark:bg-red-950/20"}`}>
                    <span className="font-bold text-lg">Net Profit/Loss</span>
                    <span className={`font-bold text-lg ${((dailyCollections - dailyRefunds) - totalExpenseAmount) >= 0 ? "text-green-600" : "text-red-600"}`}>
                      Rs. {((dailyCollections - dailyRefunds) - totalExpenseAmount).toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ModuleLayout>
  );
}
