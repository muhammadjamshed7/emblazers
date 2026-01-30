import { useState } from "react";
import { ModuleLayout } from "@/components/layout/module-layout";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { posNavItems, usePosData, categories } from "./pos-data";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit } from "lucide-react";

export default function Items() {
  const { items, addItem, updateItem, isPending } = usePosData();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<typeof items[0] | null>(null);
  
  const [itemCode, setItemCode] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState<typeof categories[number]>("Stationery");
  const [price, setPrice] = useState(0);
  const [stock, setStock] = useState(0);

  const resetForm = () => {
    setItemCode("");
    setName("");
    setCategory("Stationery");
    setPrice(0);
    setStock(0);
    setEditingItem(null);
  };

  const handleSubmit = async () => {
    if (!itemCode || !name || !price) {
      toast({ title: "Error", description: "Please fill all required fields", variant: "destructive" });
      return;
    }

    try {
      if (editingItem) {
        await updateItem(editingItem.id, { itemCode, name, category, price, stock });
        toast({ title: "Success", description: "Item updated successfully" });
      } else {
        await addItem({ itemCode, name, category, price, stock });
        toast({ title: "Success", description: "Item added successfully" });
      }
      setIsOpen(false);
      resetForm();
    } catch (error) {
      console.error("Failed to save item:", error);
      toast({ title: "Error", description: "Failed to save item. Please try again.", variant: "destructive" });
    }
  };

  const handleEdit = (item: typeof items[0]) => {
    setEditingItem(item);
    setItemCode(item.itemCode);
    setName(item.name);
    setCategory(item.category);
    setPrice(item.price);
    setStock(item.stock);
    setIsOpen(true);
  };

  const columns = [
    { key: "itemCode" as const, label: "Code" },
    { key: "name" as const, label: "Item Name", sortable: true },
    { key: "category" as const, label: "Category", render: (item: typeof items[0]) => <Badge variant="outline">{item.category}</Badge> },
    { key: "price" as const, label: "Price", render: (item: typeof items[0]) => `Rs. ${item.price.toLocaleString()}` },
    { 
      key: "stock" as const, 
      label: "Stock", 
      render: (item: typeof items[0]) => (
        <span className={item.stock < 10 ? "text-red-500 font-medium" : ""}>
          {item.stock}
        </span>
      )
    },
  ];

  const actions = (item: typeof items[0]) => (
    <Button variant="ghost" size="icon" onClick={() => handleEdit(item)} data-testid={`button-edit-${item.id}`}>
      <Edit className="w-4 h-4" />
    </Button>
  );

  return (
    <ModuleLayout module="pos" navItems={posNavItems}>
      <div className="space-y-6">
        <PageHeader
          title="Items"
          description="Manage inventory items"
          actions={
            <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-item">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingItem ? "Edit Item" : "Add New Item"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Item Code *</Label>
                      <Input 
                        value={itemCode} 
                        onChange={(e) => setItemCode(e.target.value)} 
                        placeholder="e.g., ITM001" 
                        data-testid="input-item-code"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select value={category} onValueChange={(v) => setCategory(v as typeof category)}>
                        <SelectTrigger data-testid="select-category">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Item Name *</Label>
                    <Input 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      placeholder="Enter item name" 
                      data-testid="input-name"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Price *</Label>
                      <Input 
                        type="number" 
                        value={price} 
                        onChange={(e) => setPrice(Number(e.target.value))} 
                        min={0}
                        data-testid="input-price"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Stock</Label>
                      <Input 
                        type="number" 
                        value={stock} 
                        onChange={(e) => setStock(Number(e.target.value))} 
                        min={0}
                        data-testid="input-stock"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => { setIsOpen(false); resetForm(); }}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={isPending} data-testid="button-save-item">
                      {isPending ? "Saving..." : editingItem ? "Update Item" : "Add Item"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          }
        />

        <DataTable
          data={items}
          columns={columns}
          searchKey="name"
          searchPlaceholder="Search items..."
          actions={actions}
          getRowKey={(item) => item.id}
        />
      </div>
    </ModuleLayout>
  );
}
