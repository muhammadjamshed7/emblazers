import { ModuleLayout } from "@/components/layout/module-layout";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, StatusBadge } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { transportNavItems, useTransportData } from "./transport-data";
import { Plus, Edit } from "lucide-react";

export default function Vehicles() {
  const { vehicles, routes } = useTransportData();

  const columns = [
    { key: "regNo" as const, label: "Reg No", sortable: true },
    { key: "type" as const, label: "Type", render: (item: typeof vehicles[0]) => <Badge variant="outline" size="sm">{item.type}</Badge> },
    { key: "capacity" as const, label: "Capacity" },
    { 
      key: "assignedRouteId" as const, 
      label: "Assigned Route", 
      render: (item: typeof vehicles[0]) => {
        const route = routes.find((r) => r.id === item.assignedRouteId);
        return route ? route.routeName : "-";
      }
    },
    { key: "status" as const, label: "Status", render: (item: typeof vehicles[0]) => <StatusBadge status={item.status} /> },
  ];

  const actions = (item: typeof vehicles[0]) => (
    <Button variant="ghost" size="icon" data-testid={`button-edit-${item.id}`}>
      <Edit className="w-4 h-4" />
    </Button>
  );

  return (
    <ModuleLayout module="transport" navItems={transportNavItems}>
      <div className="space-y-6">
        <PageHeader
          title="Vehicles"
          description="Manage transport vehicles"
          actions={
            <Button data-testid="button-add-vehicle">
              <Plus className="w-4 h-4 mr-2" />
              Add Vehicle
            </Button>
          }
        />

        <DataTable
          data={vehicles}
          columns={columns}
          searchKey="regNo"
          searchPlaceholder="Search vehicles..."
          actions={actions}
          getRowKey={(item) => item.id}
        />
      </div>
    </ModuleLayout>
  );
}
