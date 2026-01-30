import { ModuleLayout } from "@/components/layout/module-layout";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { transportNavItems, useTransportData } from "./transport-data";
import { Plus, Edit } from "lucide-react";

export default function Drivers() {
  const { drivers, vehicles } = useTransportData();

  const columns = [
    { key: "name" as const, label: "Name", sortable: true },
    { key: "contact" as const, label: "Contact" },
    { key: "licenseNo" as const, label: "License No" },
    { 
      key: "assignedVehicleId" as const, 
      label: "Assigned Vehicle", 
      render: (item: typeof drivers[0]) => {
        const vehicle = vehicles.find((v) => v.id === item.assignedVehicleId);
        return vehicle ? vehicle.regNo : "-";
      }
    },
  ];

  const actions = (item: typeof drivers[0]) => (
    <Button variant="ghost" size="icon" data-testid={`button-edit-${item.id}`}>
      <Edit className="w-4 h-4" />
    </Button>
  );

  return (
    <ModuleLayout module="transport" navItems={transportNavItems}>
      <div className="space-y-6">
        <PageHeader
          title="Drivers"
          description="Manage transport drivers"
          actions={
            <Button data-testid="button-add-driver">
              <Plus className="w-4 h-4 mr-2" />
              Add Driver
            </Button>
          }
        />

        <DataTable
          data={drivers}
          columns={columns}
          searchKey="name"
          searchPlaceholder="Search drivers..."
          actions={actions}
          getRowKey={(item) => item.id}
        />
      </div>
    </ModuleLayout>
  );
}
