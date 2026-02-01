import { ModuleLayout } from "@/components/layout/module-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { reportsNavItems } from "./reports-data";

export default function ReportsDashboard() {
  return (
    <ModuleLayout module="reports" navItems={reportsNavItems}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-semibold" data-testid="text-page-title">Reports Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Centralized reporting across modules with summary insights.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Student & Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Review combined student, attendance, and performance trends in one place.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Finance & Payroll</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Track collections, expenses, and payroll summaries across the organization.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Operations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Monitor library, transport, and hostel activity with consolidated metrics.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </ModuleLayout>
  );
}
