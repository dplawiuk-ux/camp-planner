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
import { Tent, Plus, Users, Trash2, UserPlus, X, Package, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function TentAllocation({ items = [], members = [], onUpdate }) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newTent, setNewTent] = useState({ name: '', capacity: 2 });
  const [assigningTo, setAssigningTo] = useState(null);
  const [addMode, setAddMode] = useState('shed');

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: userTents = [] } = useQuery({
    queryKey: ['userTents'],
    queryFn: async () => {
      if (!user) return [];
      return base44.entities.Equipment.filter({ 
        created_by: user.email, 
        type: 'tent' 
      });
    },
    enabled: !!user
  });

  const tents = items.filter(item => item.category === 'shelter');
  const allMembers = members;
  
  const assignedMemberIds = new Set(
    tents.flatMap(tent => tent.assigned_to || [])
  );
  const unassignedMembers = allMembers.filter(
    m => !assignedMemberIds.has(m.id)
  );

  const handleAddTent = () => {
    if (!newTent.name) return;
    
    const updatedItems = [
      ...items,
      {
        id: `tent-${Date.now()}`,
        name: newTent.name,
        category: 'shelter',
        capacity: newTent.capacity,
        assigned_to: [],
        packed: false
      }
    ];
    
    onUpdate(updatedItems);
    setNewTent({ name: '', capacity: 2 });
    setShowAddDialog(false);
  };

  const handleAddFromShed = (equipmentId) => {
    const equipment = userTents.find(t => t.id === equipmentId);
    if (!equipment) return;

    const updatedItems = [
      ...items,
      {
        id: `tent-${Date.now()}`,
        name: equipment.name,
        category: 'shelter',
        capacity: equipment.capacity || 2,
        assigned_to: [],
        packed: false,
        equipment_id: equipment.id
      }
    ];
    
    onUpdate(updatedItems);
    setShowAddDialog(false);
  };

  const handleRemoveTent = (tentId) => {
    const updatedItems = items.filter(item => item.id !== tentId);
    onUpdate(updatedItems);
  };

  const handleAssignMember = (tentId, memberId) => {
    const updatedItems = items.map(item => {
      if (item.id === tentId) {
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

  const handleUnassignMember = (tentId, memberId) => {
    const updatedItems = items.map(item => {
      if (item.id === tentId) {
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

  const totalCapacity = tents.reduce((sum, tent) => sum + (tent.capacity || 0), 0);
  const totalAssigned = tents.reduce((sum, tent) => sum + (tent.assigned_to?.length || 0), 0);
  const isFullyAllocated = totalAssigned >= allMembers.length && unassignedMembers.length === 0;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CollapsibleTrigger className="flex items-center gap-2 hover:opacity-70 transition-opacity">
              <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? '' : '-rotate-90'}`} />
              <div>
                <CardTitle className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                  <Tent className="w-5 h-5 text-emerald-600" />
                  Sleeping Arrangements
                </CardTitle>
                <p className="text-sm text-slate-500 mt-1">
                  {totalAssigned} of {allMembers.length} members assigned • {totalCapacity} total capacity
                </p>
              </div>
            </CollapsibleTrigger>
            <Button
              onClick={() => setShowAddDialog(true)}
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Tent
            </Button>
          </div>
        </CardHeader>

        <CollapsibleContent>

      <CardContent className="space-y-4">
        {tents.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Tent className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p>No tents added yet</p>
            <p className="text-sm">Add tents to manage sleeping arrangements</p>
          </div>
        ) : (
          <AnimatePresence>
            {tents.map((tent) => {
              const assignedCount = tent.assigned_to?.length || 0;
              const capacity = tent.capacity || 0;
              const isFull = assignedCount >= capacity;
              const availableMembers = unassignedMembers.filter(
                m => !tent.assigned_to?.includes(m.id)
              );

              return (
                <motion.div
                  key={tent.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="border border-slate-200 rounded-lg p-4 bg-white"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-slate-800">{tent.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={isFull ? "default" : "outline"} className="text-xs">
                          <Users className="w-3 h-3 mr-1" />
                          {assignedCount}/{capacity}
                        </Badge>
                        {isFull && (
                          <Badge className="text-xs bg-emerald-100 text-emerald-700">
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
                          onClick={() => setAssigningTo(tent.id)}
                          className="h-8 w-8"
                        >
                          <UserPlus className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleRemoveTent(tent.id)}
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {tent.assigned_to && tent.assigned_to.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {tent.assigned_to.map((memberId) => (
                        <Badge
                          key={memberId}
                          variant="secondary"
                          className="flex items-center gap-1 pr-1"
                        >
                          {getMemberName(memberId)}
                          <button
                            onClick={() => handleUnassignMember(tent.id, memberId)}
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
                  {assigningTo === tent.id && availableMembers.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <Select
                        onValueChange={(memberId) => handleAssignMember(tent.id, memberId)}
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

        {unassignedMembers.length > 0 && tents.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-200">
            <p className="text-sm font-medium text-slate-700 mb-2">
              Unassigned Members ({unassignedMembers.length})
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

      {/* Add Tent Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Tent</DialogTitle>
          </DialogHeader>
          
          <Tabs value={addMode} onValueChange={setAddMode} className="py-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="shed">From Gear Shed</TabsTrigger>
              <TabsTrigger value="custom">Custom</TabsTrigger>
            </TabsList>

            <TabsContent value="shed" className="space-y-4 mt-4">
              {userTents.length > 0 ? (
                <>
                  <p className="text-sm text-slate-600">Select a tent from your gear shed:</p>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {userTents.map((tent) => (
                      <button
                        key={tent.id}
                        onClick={() => handleAddFromShed(tent.id)}
                        className="w-full flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-emerald-50 hover:border-emerald-300 transition-colors text-left"
                      >
                        <div>
                          <div className="font-medium text-slate-800">{tent.name}</div>
                          {tent.capacity && (
                            <div className="text-sm text-slate-500">
                              Capacity: {tent.capacity} people
                            </div>
                          )}
                        </div>
                        <Plus className="w-5 h-5 text-emerald-600" />
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p className="text-slate-600 mb-4">No tents in your gear shed yet</p>
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
                <Label htmlFor="tent-name">Tent Name</Label>
                <Input
                  id="tent-name"
                  placeholder="e.g., Big Red Tent"
                  value={newTent.name}
                  onChange={(e) => setNewTent({ ...newTent, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity (people)</Label>
                <Input
                  id="capacity"
                  type="number"
                  min="1"
                  max="20"
                  value={newTent.capacity}
                  onChange={(e) => setNewTent({ ...newTent, capacity: parseInt(e.target.value) || 2 })}
                />
              </div>
              <Button
                onClick={handleAddTent}
                disabled={!newTent.name}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
              >
                Add Custom Tent
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