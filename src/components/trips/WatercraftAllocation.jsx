import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Waves, Plus, Users, Trash2, UserPlus, X, Package, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function WatercraftAllocation({ gearItems = [], members = [], onUpdate }) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newWatercraft, setNewWatercraft] = useState({ name: '', capacity: 2 });
  const [assigningTo, setAssigningTo] = useState(null);
  const [addMode, setAddMode] = useState('shed');
  const [isOpen, setIsOpen] = useState(true);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: userWatercraft = [] } = useQuery({
    queryKey: ['userWatercraft'],
    queryFn: async () => {
      if (!user) return [];
      return base44.entities.Equipment.filter({ 
        created_by: user.email, 
        type: 'watercraft' 
      });
    },
    enabled: !!user
  });

  const watercraft = gearItems.filter(item => item.type === 'watercraft');
  const allMembers = members;
  
  const assignedMemberIds = new Set(
    watercraft.flatMap(w => w.assigned_to || [])
  );
  const unassignedMembers = allMembers.filter(
    m => !assignedMemberIds.has(m.id)
  );

  const handleAddWatercraft = () => {
    if (!newWatercraft.name) return;
    
    const updatedItems = [
      ...gearItems,
      {
        id: `watercraft-${Date.now()}`,
        name: newWatercraft.name,
        type: 'watercraft',
        capacity: newWatercraft.capacity,
        assigned_to: [],
        is_rental: false
      }
    ];
    
    onUpdate(updatedItems);
    setNewWatercraft({ name: '', capacity: 2 });
    setShowAddDialog(false);
  };

  const handleAddFromShed = (equipmentId) => {
    const equipment = userWatercraft.find(w => w.id === equipmentId);
    if (!equipment) return;

    const updatedItems = [
      ...gearItems,
      {
        id: `watercraft-${Date.now()}`,
        name: equipment.name,
        type: 'watercraft',
        capacity: equipment.capacity || 2,
        assigned_to: [],
        is_rental: false,
        equipment_id: equipment.id
      }
    ];
    
    onUpdate(updatedItems);
    setShowAddDialog(false);
  };

  const handleRemoveWatercraft = (watercraftId) => {
    const updatedItems = gearItems.filter(item => item.id !== watercraftId);
    onUpdate(updatedItems);
  };

  const handleAssignMember = (watercraftId, memberId) => {
    const updatedItems = gearItems.map(item => {
      if (item.id === watercraftId) {
        const assigned = item.assigned_to || [];
        return {
          ...item,
          assigned_to: [...assigned, memberId]
        };
      }
      return item;
    });
    onUpdate(updatedItems);
    setAssigningTo(null);
  };

  const handleUnassignMember = (watercraftId, memberId) => {
    const updatedItems = gearItems.map(item => {
      if (item.id === watercraftId) {
        return {
          ...item,
          assigned_to: (item.assigned_to || []).filter(id => id !== memberId)
        };
      }
      return item;
    });
    onUpdate(updatedItems);
  };

  const getMemberName = (memberId) => {
    const member = allMembers.find(m => m.id === memberId);
    return member?.user_name || member?.user_email || 'Unknown';
  };

  const totalCapacity = watercraft.reduce((sum, w) => sum + (w.capacity || 0), 0);
  const totalAssigned = watercraft.reduce((sum, w) => sum + (w.assigned_to?.length || 0), 0);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CollapsibleTrigger className="flex items-center gap-2 hover:opacity-70 transition-opacity">
              <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? '' : '-rotate-90'}`} />
              <div>
                <CardTitle className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                  <Waves className="w-5 h-5 text-blue-600" />
                  Watercraft
                </CardTitle>
                <p className="text-sm text-slate-500 mt-1">
                  {totalAssigned} of {allMembers.length} members assigned • {totalCapacity} total capacity
                </p>
              </div>
            </CollapsibleTrigger>
            <Button
              onClick={() => setShowAddDialog(true)}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Watercraft
            </Button>
          </div>
        </CardHeader>

        <CollapsibleContent>

      <CardContent className="space-y-4">
        {watercraft.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Waves className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p>No watercraft added yet</p>
            <p className="text-sm">Add kayaks, canoes, or boats</p>
          </div>
        ) : (
          <AnimatePresence>
            {watercraft.map((craft) => {
              const assignedCount = craft.assigned_to?.length || 0;
              const capacity = craft.capacity || 0;
              const isFull = assignedCount >= capacity;
              const availableMembers = unassignedMembers.filter(
                m => !craft.assigned_to?.includes(m.id)
              );

              return (
                <motion.div
                  key={craft.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="border border-slate-200 rounded-lg p-4 bg-white"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-slate-800">{craft.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={isFull ? "default" : "outline"} className="text-xs">
                          <Users className="w-3 h-3 mr-1" />
                          {assignedCount}/{capacity}
                        </Badge>
                        {isFull && (
                          <Badge className="text-xs bg-blue-100 text-blue-700">
                            Full
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {!isFull && availableMembers.length > 0 && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setAssigningTo(craft.id)}
                          className="h-8 w-8"
                        >
                          <UserPlus className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleRemoveWatercraft(craft.id)}
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {craft.assigned_to && craft.assigned_to.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {craft.assigned_to.map((memberId) => (
                        <Badge
                          key={memberId}
                          variant="secondary"
                          className="flex items-center gap-1 pr-1"
                        >
                          {getMemberName(memberId)}
                          <button
                            onClick={() => handleUnassignMember(craft.id, memberId)}
                            className="hover:bg-slate-200 rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 italic">No one assigned yet</p>
                  )}

                  {/* Quick assign dropdown */}
                  {assigningTo === craft.id && availableMembers.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <Select
                        onValueChange={(memberId) => handleAssignMember(craft.id, memberId)}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Select member to assign" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableMembers.map((member) => (
                            <SelectItem key={member.id} value={member.id}>
                              {member.user_name || member.user_email || 'Unnamed'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}

        {unassignedMembers.length > 0 && watercraft.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-200">
            <p className="text-sm font-medium text-slate-700 mb-2">
              Unassigned to Watercraft ({unassignedMembers.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {unassignedMembers.map((member) => (
                <Badge key={member.id} variant="outline">
                  {member.user_name || member.user_email || 'Unnamed'}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
        </CollapsibleContent>

      {/* Add Watercraft Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Watercraft</DialogTitle>
          </DialogHeader>
          
          <Tabs value={addMode} onValueChange={setAddMode} className="py-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="shed">From Gear Shed</TabsTrigger>
              <TabsTrigger value="custom">Custom</TabsTrigger>
            </TabsList>

            <TabsContent value="shed" className="space-y-4 mt-4">
              {userWatercraft.length > 0 ? (
                <>
                  <p className="text-sm text-slate-600">Select watercraft from your gear shed:</p>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {userWatercraft.map((craft) => (
                      <button
                        key={craft.id}
                        onClick={() => handleAddFromShed(craft.id)}
                        className="w-full flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors text-left"
                      >
                        <div>
                          <div className="font-medium text-slate-800">{craft.name}</div>
                          {craft.capacity && (
                            <div className="text-sm text-slate-500">
                              Capacity: {craft.capacity} people
                            </div>
                          )}
                        </div>
                        <Plus className="w-5 h-5 text-blue-600" />
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p className="text-slate-600 mb-4">No watercraft in your gear shed yet</p>
                  <Link to={createPageUrl("Shed")}>
                    <Button variant="outline" size="sm">
                      Go to Gear Shed
                    </Button>
                  </Link>
                </div>
              )}
            </TabsContent>

            <TabsContent value="custom" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="watercraft-name">Watercraft Name</Label>
                <Input
                  id="watercraft-name"
                  placeholder="e.g., Red Canoe"
                  value={newWatercraft.name}
                  onChange={(e) => setNewWatercraft({ ...newWatercraft, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity (people)</Label>
                <Input
                  id="capacity"
                  type="number"
                  min="1"
                  max="20"
                  value={newWatercraft.capacity}
                  onChange={(e) => setNewWatercraft({ ...newWatercraft, capacity: parseInt(e.target.value) || 2 })}
                />
              </div>
              <Button
                onClick={handleAddWatercraft}
                disabled={!newWatercraft.name}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Add Custom Watercraft
              </Button>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)} className="w-full">
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </Card>
    </Collapsible>
  );
}