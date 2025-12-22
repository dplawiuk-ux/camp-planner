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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { 
  Package, 
  Plus, 
  Trash2, 
  Users,
  Tent,
  Moon,
  Flame,
  Ship,
  MoreVertical,
  ChevronDown,
  MessageSquarePlus,
  Check,
  X,
  UserPlus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import GearRequestDialog from "./GearRequestDialog";
import ConfirmGearDialog from "./ConfirmGearDialog";

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

export default function GearList({ items = [], onUpdate, members = [], requests = [], onUpdateRequests, currentUserRole, currentUserEmail }) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmingRequest, setConfirmingRequest] = useState(null);
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
  const [isOpen, setIsOpen] = useState(true);
  
  const canManageRequests = ['lead', 'admin'].includes(currentUserRole);

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

  const filteredItems = items.filter(item => item.type !== 'watercraft');
  const filteredRequests = (requests || []).filter(req => req.type !== 'watercraft');
  
  const groupedItems = filteredItems.reduce((acc, item) => {
    if (!acc[item.type]) acc[item.type] = [];
    acc[item.type].push(item);
    return acc;
  }, {});

  const groupedRequests = filteredRequests.reduce((acc, req) => {
    if (!acc[req.type]) acc[req.type] = [];
    acc[req.type].push(req);
    return acc;
  }, {});

  const handleAddRequest = (request) => {
    onUpdateRequests([...(requests || []), request]);
  };

  const handleVolunteer = (requestId) => {
    const currentMember = members.find(m => m.user_email === currentUserEmail);
    if (!currentMember) return;
    
    onUpdateRequests((requests || []).map(req =>
      req.id === requestId
        ? { ...req, assigned_to_member_id: currentMember.id, status: "assigned" }
        : req
    ));
  };

  const handleConfirmRequest = async (requestId, equipmentId) => {
    const request = (requests || []).find(req => req.id === requestId);
    if (!request) return;

    // Add confirmed request to shared gear
    const newGearItem = {
      id: `gear-${Date.now()}`,
      name: request.name,
      type: request.type,
      equipment_id: equipmentId || null,
      notes: request.notes,
      is_rental: false,
      assigned_to: request.assigned_to_member_id ? [request.assigned_to_member_id] : []
    };

    onUpdate([...items, newGearItem]);

    // Update request status
    onUpdateRequests((requests || []).map(req =>
      req.id === requestId
        ? { 
            ...req, 
            status: "confirmed",
            fulfilled_by_equipment_id: equipmentId
          }
        : req
    ));
    
    setShowConfirmDialog(false);
    setConfirmingRequest(null);
  };

  const handleDeclineRequest = (requestId) => {
    onUpdateRequests((requests || []).map(req =>
      req.id === requestId
        ? { ...req, status: "open", assigned_to_member_id: null }
        : req
    ));
  };

  const handleRemoveRequest = (requestId) => {
    onUpdateRequests((requests || []).filter(req => req.id !== requestId));
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CollapsibleTrigger className="flex items-center gap-2 hover:opacity-70 transition-opacity">
              <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? '' : '-rotate-90'}`} />
              <CardTitle className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-600" />
                Shared Gear
                {filteredItems.length > 0 && (
                  <Badge variant="outline">{filteredItems.length}</Badge>
                )}
              </CardTitle>
            </CollapsibleTrigger>
            <div className="flex gap-2">
              {canManageRequests && (
                <Button
                  size="sm"
                  onClick={() => setShowRequestDialog(true)}
                  variant="outline"
                  className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                >
                  <MessageSquarePlus className="w-4 h-4 mr-2" />
                  Request Gear
                </Button>
              )}
              <Button
                size="sm"
                onClick={() => setShowAddDialog(true)}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Shared Gear
              </Button>
            </div>
          </div>
        </CardHeader>

        <CollapsibleContent>

      <CardContent className="space-y-6">
        {/* Gear Requests Section */}
        {filteredRequests.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <MessageSquarePlus className="w-5 h-5 text-amber-600" />
              Gear Requests
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                {filteredRequests.filter(r => r.status === 'open' || r.status === 'assigned').length}
              </Badge>
            </h3>
            
            <div className="space-y-2">
              <AnimatePresence>
                {filteredRequests.map((request, index) => {
                  const Icon = gearIcons[request.type] || Package;
                  const colorClass = gearColors[request.type] || "bg-slate-100 text-slate-700";
                  const assignedMember = request.assigned_to_member_id 
                    ? members.find(m => m.id === request.assigned_to_member_id)
                    : null;
                  const currentMember = members.find(m => m.user_email === currentUserEmail);
                  const isAssignedToMe = assignedMember?.id === currentMember?.id;

                  return (
                    <motion.div
                      key={request.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-3 rounded-lg border-2 ${
                        request.status === 'confirmed' 
                          ? 'bg-emerald-50 border-emerald-300'
                          : request.status === 'declined'
                          ? 'bg-red-50 border-red-200'
                          : 'bg-amber-50 border-amber-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <div className={`p-1.5 rounded-lg ${colorClass} border`}>
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <p className="font-medium text-slate-800">{request.name}</p>
                            {request.status === 'open' && (
                              <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                                Open
                              </Badge>
                            )}
                            {request.status === 'assigned' && (
                              <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                                Assigned
                              </Badge>
                            )}
                            {request.status === 'confirmed' && (
                              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                                Confirmed
                              </Badge>
                            )}
                          </div>

                          {request.notes && (
                            <p className="text-xs text-slate-600 mb-2">{request.notes}</p>
                          )}

                          {assignedMember && (
                            <div className="flex items-center gap-1 mb-2">
                              <Users className="w-3 h-3 text-slate-400" />
                              <span className="text-xs text-slate-600">
                                {assignedMember.user_name || assignedMember.user_email}
                              </span>
                            </div>
                          )}

                          {/* Action buttons for assigned member */}
                          {isAssignedToMe && request.status === 'assigned' && (
                            <div className="flex gap-2 mt-2">
                              <Button
                                size="sm"
                                onClick={() => {
                                  setConfirmingRequest(request);
                                  setShowConfirmDialog(true);
                                }}
                                className="bg-emerald-600 hover:bg-emerald-700 h-8"
                              >
                                <Check className="w-3 h-3 mr-1" />
                                Confirm
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeclineRequest(request.id)}
                                className="border-red-300 text-red-700 hover:bg-red-50 h-8"
                              >
                                <X className="w-3 h-3 mr-1" />
                                Decline
                              </Button>
                            </div>
                          )}

                          {/* Volunteer button for open requests */}
                          {!assignedMember && request.status === 'open' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleVolunteer(request.id)}
                              className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 h-8 mt-2"
                            >
                              <UserPlus className="w-3 h-3 mr-1" />
                              I'll bring this
                            </Button>
                          )}
                        </div>

                        {canManageRequests && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem 
                                onClick={() => handleRemoveRequest(request.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Remove Request
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Existing Shared Gear Section */}
        {filteredItems.length === 0 && filteredRequests.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-2xl mb-4">
              <Package className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-600 mb-2">No shared gear or requests yet</p>
            <p className="text-sm text-slate-500">Add items from your gear shed or create new ones</p>
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="space-y-6">
            {Object.entries(groupedItems).map(([type, typeItems]) => {
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
          })}
          </div>
        ) : null}
      </CardContent>
        </CollapsibleContent>

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

      {/* Gear Request Dialog */}
      <GearRequestDialog
        open={showRequestDialog}
        onClose={() => setShowRequestDialog(false)}
        onSubmit={handleAddRequest}
        members={members}
      />

      {/* Confirm Gear Dialog */}
      <ConfirmGearDialog
        open={showConfirmDialog}
        onClose={() => {
          setShowConfirmDialog(false);
          setConfirmingRequest(null);
        }}
        request={confirmingRequest}
        onConfirm={handleConfirmRequest}
      />
      </Card>
    </Collapsible>
  );
}