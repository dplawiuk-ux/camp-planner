import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Check } from "lucide-react";

export default function ConfirmGearDialog({ open, onClose, request, onConfirm }) {
  const [mode, setMode] = useState("none"); // none, from_shed, new
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [newItemData, setNewItemData] = useState({
    name: request?.name || "",
    type: request?.type || "other",
    capacity: "",
    notes: request?.notes || "",
    add_to_shed: true
  });

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: shedEquipment = [] } = useQuery({
    queryKey: ['equipment'],
    queryFn: async () => {
      if (!user) return [];
      return base44.entities.Equipment.filter({ created_by: user.email }, '-created_date');
    },
    enabled: !!user
  });

  const filteredShedEquipment = shedEquipment.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    item.type === request?.type
  );

  const handleConfirm = async () => {
    let equipmentId = null;

    if (mode === "from_shed" && selectedEquipment) {
      equipmentId = selectedEquipment.id;
    } else if (mode === "new" && newItemData.add_to_shed) {
      const created = await base44.entities.Equipment.create({
        name: newItemData.name,
        type: newItemData.type,
        capacity: newItemData.capacity ? parseFloat(newItemData.capacity) : undefined,
        notes: newItemData.notes
      });
      equipmentId = created.id;
    }

    onConfirm(equipmentId);
    setMode("none");
    setSearchQuery("");
    setSelectedEquipment(null);
    setNewItemData({
      name: request?.name || "",
      type: request?.type || "other",
      capacity: "",
      notes: request?.notes || "",
      add_to_shed: true
    });
  };

  if (!request) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Confirm Gear: {request.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
            <p className="text-sm text-emerald-800">
              You're confirming that you'll bring this gear for the trip.
            </p>
          </div>

          <RadioGroup value={mode} onValueChange={setMode}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="none" id="none" />
              <Label htmlFor="none" className="flex-1 cursor-pointer">
                Confirm without linking gear
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="from_shed" id="from_shed" />
              <Label htmlFor="from_shed" className="flex-1 cursor-pointer">
                Link gear from my Gear Shed
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="new" id="new" />
              <Label htmlFor="new" className="flex-1 cursor-pointer">
                Add new gear to my Gear Shed
              </Label>
            </div>
          </RadioGroup>

          {mode === "from_shed" && (
            <div>
              <Label>Search Your Gear Shed</Label>
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mt-2"
              />
              {searchQuery && (
                <div className="mt-2 max-h-48 overflow-y-auto space-y-1">
                  {filteredShedEquipment.length > 0 ? (
                    filteredShedEquipment.map(item => (
                      <button
                        key={item.id}
                        onClick={() => setSelectedEquipment(item)}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${
                          selectedEquipment?.id === item.id
                            ? 'bg-emerald-100 border-2 border-emerald-500'
                            : 'bg-slate-50 hover:bg-slate-100'
                        }`}
                      >
                        <p className="font-medium text-slate-800">{item.name}</p>
                        {item.capacity && (
                          <p className="text-xs text-slate-500">Capacity: {item.capacity}</p>
                        )}
                      </button>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500 p-3">No matching items</p>
                  )}
                </div>
              )}
            </div>
          )}

          {mode === "new" && (
            <div className="space-y-3">
              <div>
                <Label>Item Name</Label>
                <Input
                  value={newItemData.name}
                  onChange={(e) => setNewItemData({...newItemData, name: e.target.value})}
                  className="mt-2"
                />
              </div>

              {['tents', 'watercraft'].includes(newItemData.type) && (
                <div>
                  <Label>Capacity (people)</Label>
                  <Input
                    type="number"
                    min="1"
                    value={newItemData.capacity}
                    onChange={(e) => setNewItemData({...newItemData, capacity: e.target.value})}
                    className="mt-2"
                  />
                </div>
              )}

              <div>
                <Label>Notes (optional)</Label>
                <Textarea
                  value={newItemData.notes}
                  onChange={(e) => setNewItemData({...newItemData, notes: e.target.value})}
                  className="mt-2"
                />
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="add_to_shed"
                  checked={newItemData.add_to_shed}
                  onCheckedChange={(checked) => setNewItemData({...newItemData, add_to_shed: checked})}
                />
                <Label htmlFor="add_to_shed" className="text-sm font-normal cursor-pointer">
                  Add to my Gear Shed
                </Label>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={mode === "from_shed" && !selectedEquipment}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Check className="w-4 h-4 mr-2" />
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}