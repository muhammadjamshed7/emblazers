import { useState, useMemo } from "react";
import { ModuleLayout } from "@/components/layout/module-layout";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, StatusBadge } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { transportNavItems, useTransportData, useStudentsForTransport, allocationStatuses } from "./transport-data";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";
import type { StudentTransport } from "@shared/schema";

const emptyForm = {
  studentId: "",
  studentName: "",
  class: "",
  section: "",
  routeId: "",
  routeName: "",
  stopName: "",
  pickupTime: "",
  dropTime: "",
  monthlyFee: 0,
  startDate: "",
  endDate: "",
  vehicleId: "",
  status: "Active" as StudentTransport["status"],
};

export default function StudentAllocation() {
  const { allocations, routes, vehicles, addAllocation, updateAllocation, deleteAllocation, isPending } = useTransportData();
  const { data: students = [] } = useStudentsForTransport();
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StudentTransport | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteItem, setDeleteItem] = useState<StudentTransport | null>(null);

  const selectedRoute = useMemo(() => routes.find((r) => r.id === form.routeId), [routes, form.routeId]);
  const routeVehicles = useMemo(() => vehicles.filter((v) => v.routeId === form.routeId), [vehicles, form.routeId]);

  const openCreate = () => {
    setEditingItem(null);
    setForm({ ...emptyForm });
    setDialogOpen(true);
  };

  const openEdit = (item: StudentTransport) => {
    setEditingItem(item);
    setForm({
      studentId: item.studentId,
      studentName: item.studentName,
      class: item.class,
      section: item.section,
      routeId: item.routeId,
      routeName: item.routeName,
      stopName: item.stopName,
      pickupTime: item.pickupTime,
      dropTime: item.dropTime,
      monthlyFee: item.monthlyFee,
      startDate: item.startDate,
      endDate: item.endDate || "",
      vehicleId: item.vehicleId || "",
      status: item.status,
    });
    setDialogOpen(true);
  };

  const handleStudentChange = (studentId: string) => {
    const student = students.find((s) => s.studentId === studentId);
    if (student) {
      setForm((f) => ({
        ...f,
        studentId: student.studentId,
        studentName: student.name,
        class: student.class,
        section: student.section,
      }));
    }
  };

  const handleRouteChange = (routeId: string) => {
    if (routeId === "__none__") {
      setForm((f) => ({ ...f, routeId: "", routeName: "", stopName: "", vehicleId: "" }));
    } else {
      const route = routes.find((r) => r.id === routeId);
      setForm((f) => ({ ...f, routeId, routeName: route?.routeName || "", stopName: "", vehicleId: "" }));
    }
  };

  const handleSave = async () => {
    if (!form.studentId || !form.routeId || !form.stopName || !form.pickupTime || !form.dropTime || !form.startDate) {
      toast({ title: "Validation Error", description: "Please fill all required fields", variant: "destructive" });
      return;
    }
    try {
      const payload = {
        studentId: form.studentId,
        studentName: form.studentName,
        class: form.class,
        section: form.section,
        routeId: form.routeId,
        routeName: form.routeName,
        stopName: form.stopName,
        pickupTime: form.pickupTime,
        dropTime: form.dropTime,
        monthlyFee: form.monthlyFee,
        startDate: form.startDate,
        endDate: form.endDate || undefined,
        vehicleId: form.vehicleId || undefined,
        status: form.status,
      };
      if (editingItem) {
        await updateAllocation(editingItem.id, payload);
        toast({ title: "Allocation updated successfully" });
      } else {
        await addAllocation(payload);
        toast({ title: "Allocation created successfully" });
      }
      setDialogOpen(false);
      setForm({ ...emptyForm });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to save allocation", variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    try {
      await deleteAllocation(deleteItem.id);
      toast({ title: "Allocation deleted successfully" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to delete allocation", variant: "destructive" });
    }
    setDeleteItem(null);
  };

  const columns = [
    { key: "allocationId" as const, label: "Allocation ID" },
    { key: "studentName" as const, label: "Student Name", sortable: true },
    { key: "class" as const, label: "Class" },
    { key: "section" as const, label: "Section" },
    { key: "routeName" as const, label: "Route" },
    { key: "stopName" as const, label: "Stop" },
    {
      key: "monthlyFee" as const,
      label: "Monthly Fee",
      render: (item: StudentTransport) => `Rs. ${item.monthlyFee.toLocaleString()}`,
    },
    { key: "status" as const, label: "Status", render: (item: StudentTransport) => <StatusBadge status={item.status} /> },
  ];

  return (
    <ModuleLayout module="transport" navItems={transportNavItems}>
      <div className="space-y-6">
        <PageHeader
          title="Student Allocation"
          description="Manage student transport allocation"
          actions={
            <Button onClick={openCreate} data-testid="button-add-allocation">
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
          onEdit={openEdit}
          onDelete={(item) => setDeleteItem(item)}
          getRowKey={(item) => item.id}
        />
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Allocation" : "Add Allocation"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2 sm:col-span-2">
              <Label>Student</Label>
              <Select value={form.studentId || "__none__"} onValueChange={(v) => v !== "__none__" && handleStudentChange(v)}>
                <SelectTrigger data-testid="select-student"><SelectValue placeholder="Select student" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Select a student</SelectItem>
                  {students.filter((s) => s.status === "Active").map((s) => (
                    <SelectItem key={s.studentId} value={s.studentId}>
                      {s.studentId} - {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {form.studentId && (
              <>
                <div className="space-y-2">
                  <Label>Student Name</Label>
                  <Input value={form.studentName} readOnly data-testid="input-student-name" />
                </div>
                <div className="space-y-2">
                  <Label>Class / Section</Label>
                  <Input value={`${form.class} - ${form.section}`} readOnly data-testid="input-class-section" />
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label>Route</Label>
              <Select value={form.routeId || "__none__"} onValueChange={handleRouteChange}>
                <SelectTrigger data-testid="select-route"><SelectValue placeholder="Select route" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Select a route</SelectItem>
                  {routes.map((r) => <SelectItem key={r.id} value={r.id}>{r.routeName}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Stop</Label>
              <Select value={form.stopName || "__none__"} onValueChange={(v) => setForm((f) => ({ ...f, stopName: v === "__none__" ? "" : v }))}>
                <SelectTrigger data-testid="select-stop"><SelectValue placeholder="Select stop" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Select a stop</SelectItem>
                  {(selectedRoute?.stops || []).map((stop) => (
                    <SelectItem key={stop} value={stop}>{stop}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Pickup Time</Label>
              <Input type="time" value={form.pickupTime} onChange={(e) => setForm((f) => ({ ...f, pickupTime: e.target.value }))} data-testid="input-pickup-time" />
            </div>
            <div className="space-y-2">
              <Label>Drop Time</Label>
              <Input type="time" value={form.dropTime} onChange={(e) => setForm((f) => ({ ...f, dropTime: e.target.value }))} data-testid="input-drop-time" />
            </div>
            <div className="space-y-2">
              <Label>Monthly Fee</Label>
              <Input type="number" value={form.monthlyFee || ""} onChange={(e) => setForm((f) => ({ ...f, monthlyFee: parseInt(e.target.value) || 0 }))} data-testid="input-monthly-fee" />
            </div>
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input type="date" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} data-testid="input-start-date" />
            </div>
            <div className="space-y-2">
              <Label>End Date (Optional)</Label>
              <Input type="date" value={form.endDate} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))} data-testid="input-end-date" />
            </div>
            <div className="space-y-2">
              <Label>Vehicle (Optional)</Label>
              <Select value={form.vehicleId || "__none__"} onValueChange={(v) => setForm((f) => ({ ...f, vehicleId: v === "__none__" ? "" : v }))}>
                <SelectTrigger data-testid="select-vehicle"><SelectValue placeholder="Select vehicle" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">None</SelectItem>
                  {routeVehicles.map((v) => <SelectItem key={v.id} value={v.id}>{v.registrationNumber}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v as StudentTransport["status"] }))}>
                <SelectTrigger data-testid="select-status"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {allocationStatuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} data-testid="button-cancel">Cancel</Button>
            <Button onClick={handleSave} disabled={isPending} data-testid="button-save-allocation">
              {isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteItem} onOpenChange={(open) => !open && setDeleteItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Allocation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete allocation for "{deleteItem?.studentName}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} data-testid="button-confirm-delete">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ModuleLayout>
  );
}
