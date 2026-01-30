import { ModuleLayout } from "@/components/layout/module-layout";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { transportNavItems, useTransportData } from "./transport-data";
import { Plus, Edit } from "lucide-react";

export default function Routes() {
  const { routes } = useTransportData();

  const columns = [
    { key: "routeCode" as const, label: "Code" },
    { key: "routeName" as const, label: "Route Name", sortable: true },
    { 
      key: "stops" as const, 
      label: "Stops", 
      render: (item: typeof routes[0]) => (
        <div className="flex flex-wrap gap-1">
          {item.stops.slice(0, 3).map((stop, idx) => (
            <Badge key={idx} variant="outline" size="sm">{stop}</Badge>
          ))}
          {item.stops.length > 3 && <Badge variant="outline" size="sm">+{item.stops.length - 3}</Badge>}
        </div>
      )
    },
  ];

  const actions = (item: typeof routes[0]) => (
    <Button variant="ghost" size="icon" data-testid={`button-edit-${item.id}`}>
      <Edit className="w-4 h-4" />
    </Button>
  );

  return (
    <ModuleLayout module="transport" navItems={transportNavItems}>
      <div className="space-y-6">
        <PageHeader
          title="Routes"
          description="Manage transport routes"
          actions={
            <Button data-testid="button-add-route">
              <Plus className="w-4 h-4 mr-2" />
              Add Route
            </Button>
          }
        />

        <DataTable
          data={routes}
          columns={columns}
          searchKey="routeName"
          searchPlaceholder="Search routes..."
          actions={actions}
          getRowKey={(item) => item.id}
        />
      </div>
    </ModuleLayout>
  );
}
