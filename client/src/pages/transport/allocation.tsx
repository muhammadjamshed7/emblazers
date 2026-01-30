import { ModuleLayout } from "@/components/layout/module-layout";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { transportNavItems, useTransportData } from "./transport-data";
import { Plus, Edit } from "lucide-react";

export default function StudentAllocation() {
  const { allocations, vehicles } = useTransportData();

  const columns = [
    { key: "studentId" as const, label: "Student ID" },
    { key: "studentName" as const, label: "Student Name", sortable: true },
    { key: "class" as const, label: "Class" },
    { key: "routeName" as const, label: "Route" },
    { key: "stop" as const, label: "Stop" },
    { 
      key: "vehicleId" as const, 
      label: "Vehicle", 
      render: (item: typeof allocations[0]) => {
        const vehicle = vehicles.find((v) => v.id === item.vehicleId);
        return vehicle ? vehicle.regNo : "-";
      }
    },
  ];

  const actions = (item: typeof allocations[0]) => (
    <Button variant="ghost" size="icon" data-testid={`button-edit-${item.id}`}>
      <Edit className="w-4 h-4" />
    </Button>
  );

  return (
    <ModuleLayout module="transport" navItems={transportNavItems}>
      <div className="space-y-6">
        <PageHeader
          title="Student Allocation"
          description="Manage student transport allocation"
          actions={
            <Button data-testid="button-add-allocation">
              <Plus className="w-4 h-4 mr-2" />
              Add Allocation
            </Button>
          }
        />

        <DataTable
          data={allocations}
          columns={columns}
          searchKey="studentName"
          searchPlaceholder="Search students..."
          actions={actions}
          getRowKey={(item) => item.id}
        />
      </div>
    </ModuleLayout>
  );
}
