import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Package, 
  Plus, 
  Trash2, 
  Users,
  Tent,
  Moon,
  Flame,
  Ship,
  MoreVertical
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const gearIcons = {
  tents: Tent,
  sleeping_pads: Moon,
  sleeping_bags: Moon,
  kitchen: Package,
  fire: Flame,
  watercraft: Ship,
  other: Package
};

const gearColors = {
  tents: "bg-emerald-100 text-emerald-700 border-emerald-200",
  sleeping_pads: "bg-purple-100 text-purple-700 border-purple-200",
  sleeping_bags: "bg-indigo-100 text-indigo-700 border-indigo-200",
  kitchen: "bg-amber-100 text-amber-700 border-amber-200",
  fire: "bg-orange-100 text-orange-700 border-orange-200",
  watercraft: "bg-cyan-100 text-cyan-700 border-cyan-200",
  other: "bg-slate-100 text-slate-700 border-slate-200"
};

export default function GearList({ items = [], onUpdate, members = [] }) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedShedItem, setSelectedShedItem] = useState(null);
  const [newItemData, setNewItemData] = useState({
    name: "",
    type: "other",
    capacity: "",
    notes: "",
    is_rental: false,
    add_to_shed: false
  });
  const [assigningItem, setAssigningItem] = useState(null);

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
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddFromShed = async (equipment) => {
    const newItem = {
      id: `gear-${Date.now()}`,
      name: equipment.name,
      type: equipment.type,
      equipment_id: equipment.id,
      capacity: equipment.capacity,
      notes: equipment.notes,
      is_rental: false,
      assigned_to: []
    };
    onUpdate([...items, newItem]);
    setShowAddDialog(false);
    setSearchQuery("");
    setSelectedShedItem(null);
  };

  const handleAddNew = async () => {
    const newItem = {
      id: `gear-${Date.now()}`,
      name: newItemData.name,
      type: newItemData.type,
      capacity: newItemData.capacity ? parseFloat(newItemData.capacity) : undefined,
      notes: newItemData.notes,
      is_rental: newItemData.is_rental,
      assigned_to: []
    };

    // Add to shed if requested
    if (newItemData.add_to_shed) {
      await base44.entities.Equipment.create({
        name: newItemData.name,
        type: newItemData.type,
        capacity: newItemData.capacity ? parseFloat(newItemData.capacity) : undefined,
        notes: newItemData.notes
      });
    }

    onUpdate([...items, newItem]);
    setShowAddDialog(false);
    setNewItemData({
      name: "",
      type: "other",
      capacity: "",
      notes: "",
      is_rental: false,
      add_to_shed: false
    });
  };

  const handleRemove = (itemId) => {
    onUpdate(items.filter(item => item.id !== itemId));
  };

  const handleAssign = (itemId, memberId) => {
    onUpdate(items.map(item => {
      if (item.id === itemId) {
        const assigned = item.assigned_to || [];
        const isAssigned = assigned.includes(memberId);
        return {
          ...item,
          assigned_to: isAssigned 
            ? assigned.filter(id => id !== memberId)
            : [...assigned, memberId]
        };
      }
      return item;
    }));
  };

  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.type]) acc[item.type] = [];
    acc[item.type].push(item);
    return acc;
  }, {});

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold text-slate-800 flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-600" />
            Shared Gear
            {items.length > 0 && (
              <Badge variant="outline">{items.length}</Badge>
            )}
          </CardTitle>
          <Button
            size="sm"
            onClick={() => setShowAddDialog(true)}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Shared Gear
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {items.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-2xl mb-4">
              <Package className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-600 mb-2">No shared gear added yet</p>
            <p className="text-sm text-slate-500">Add items from your gear shed or create new ones</p>
          </div>
        ) : (
          Object.entries(groupedItems).map(([type, typeItems]) => {
            const Icon = gearIcons[type] || Package;
            const colorClass = gearColors[type] || "bg-slate-100 text-slate-700";

            return (
              <div key={type}>
                <div className="flex items-center gap-2 mb-3">
                  <div className={`p-1.5 rounded-lg ${colorClass} border`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="font-medium text-slate-700 capitalize">
                    {type.replace(/_/g, ' ')}
                  </h3>
                  <Badge variant="outline" className="ml-auto">{typeItems.length}</Badge>
                </div>

                <div className="space-y-2">
                  <AnimatePresence>
                    {typeItems.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <p className="font-medium text-slate-800">{item.name}</p>
                              {item.is_rental && (
                                <Badge variant="outline" className="text-xs border-amber-300 bg-amber-50 text-amber-700">
                                  Rental
                                </Badge>
                              )}
                              {item.capacity && (
                                <Badge variant="outline" className="text-xs">
                                  Capacity: {item.capacity}
                                </Badge>
                              )}
                            </div>
                            
                            {item.notes && (
                              <p className="text-xs text-slate-500 mb-2">{item.notes}</p>
                            )}

                            {item.assigned_to && item.assigned_to.length > 0 && (
                              <div className="flex items-center gap-1 flex-wrap mt-2">
                                <Users className="w-3 h-3 text-slate-400" />
                                {item.assigned_to.map(memberId => {
                                  const member = members.find(m => m.id === memberId);
                                  return (
                                    <Badge key={memberId} variant="secondary" className="text-xs">
                                      {member?.user_name || member?.user_email || 'Unknown'}
                                    </Badge>
                                  );
                                })}
                              </div>
                            )}
                          </div>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setAssigningItem(item)}>
                                <Users className="w-4 h-4 mr-2" />
                                Assign Members
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleRemove(item.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Remove
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            );
          })
        )}
      </CardContent>

      {/* Add Gear Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Shared Gear</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Search Gear Shed */}
            <div>
              <Label>From Your Gear Shed</Label>
              <Input
                placeholder="Search your gear..."
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
                        onClick={() => handleAddFromShed(item)}
                        className="w-full text-left p-3 bg-slate-50 hover:bg-emerald-50 rounded-lg transition-colors"
                      >
                        <p className="font-medium text-slate-800">{item.name}</p>
                        <p className="text-xs text-slate-500 capitalize">{item.type.replace(/_/g, ' ')}</p>
                      </button>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500 p-3">No matching items in your gear shed</p>
                  )}
                </div>
              )}
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-500">Or add new</span>
              </div>
            </div>

            {/* Add New Shared Gear */}
            <div className="space-y-4">
              <div>
                <Label>Item Name</Label>
                <Input
                  placeholder="e.g., Coleman Stove"
                  value={newItemData.name}
                  onChange={(e) => setNewItemData({...newItemData, name: e.target.value})}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Type</Label>
                <Select 
                  value={newItemData.type} 
                  onValueChange={(value) => setNewItemData({...newItemData, type: value})}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tents">Tents</SelectItem>
                    <SelectItem value="sleeping_pads">Sleeping Pads</SelectItem>
                    <SelectItem value="sleeping_bags">Sleeping Bags</SelectItem>
                    <SelectItem value="kitchen">Kitchen</SelectItem>
                    <SelectItem value="fire">Fire</SelectItem>
                    <SelectItem value="watercraft">Watercraft</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {['tents', 'watercraft'].includes(newItemData.type) && (
                <div>
                  <Label>Capacity (people)</Label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="e.g., 4"
                    value={newItemData.capacity}
                    onChange={(e) => setNewItemData({...newItemData, capacity: e.target.value})}
                    className="mt-2"
                  />
                </div>
              )}

              <div className="flex items-center gap-2">
                <Checkbox
                  id="is_rental"
                  checked={newItemData.is_rental}
                  onCheckedChange={(checked) => setNewItemData({...newItemData, is_rental: checked})}
                />
                <Label htmlFor="is_rental" className="text-sm font-normal cursor-pointer">
                  This is a rental
                </Label>
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
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddNew}
              disabled={!newItemData.name}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Add to Trip
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Members Dialog */}
      <Dialog open={!!assigningItem} onOpenChange={() => setAssigningItem(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Members to {assigningItem?.name}</DialogTitle>
          </DialogHeader>

          <div className="space-y-2 py-4">
            {members.length > 0 ? (
              members.map(member => {
                const isAssigned = assigningItem?.assigned_to?.includes(member.id);
                return (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                    onClick={() => handleAssign(assigningItem.id, member.id)}
                  >
                    <Checkbox checked={isAssigned} />
                    <div className="flex-1">
                      <p className="font-medium text-slate-800">
                        {member.user_name || member.user_email || 'Unnamed'}
                      </p>
                      {member.user_name && member.user_email && (
                        <p className="text-xs text-slate-500">{member.user_email}</p>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-slate-500 text-center py-8">No members to assign</p>
            )}
          </div>

          <DialogFooter>
            <Button onClick={() => setAssigningItem(null)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}