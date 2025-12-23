import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { 
  Users, 
  Crown, 
  Shield, 
  User, 
  Trash2,
  Plus,
  Loader2,
  Edit3,
  ChevronDown,
  Tent,
  Ship,
  Package
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from "framer-motion";
import InviteMembers from "./InviteMembers";
import EditDisplayName from "./EditDisplayName";
import ChangeRoleDialog from "./ChangeRoleDialog";

const roleConfig = {
  lead: {
    icon: Crown,
    color: "bg-amber-100 text-amber-700 border-amber-200",
    label: "Trip Leader"
  },
  admin: {
    icon: Shield,
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
    label: "Pack Leader"
  },
  guest: {
    icon: User,
    color: "bg-slate-100 text-slate-700 border-slate-200",
    label: "Camper"
  },
  jr_camper: {
    icon: User,
    color: "bg-blue-100 text-blue-700 border-blue-200",
    label: "Jr Camper"
  }
};

export default function MembersList({ members = [], currentUserRole, currentUserEmail, onRemove, onInvite, isInviting, onUpdateName, isUpdatingName, onUpdateRole, isUpdatingRole, packingItems = [], gearItems = [], gearRequests = [], tripCode, tripName, tripStartDate, layout = "compact" }) {
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showEditName, setShowEditName] = useState(false);
  const [showChangeRole, setShowChangeRole] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [isOpen, setIsOpen] = useState(true);
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [showBulkChangeRole, setShowBulkChangeRole] = useState(false);
  const canManageMembers = ['lead', 'admin'].includes(currentUserRole);
  const isLead = currentUserRole === 'lead';
  
  const currentMember = members.find(m => m.user_email === currentUserEmail);

  const sortedMembers = [...members].sort((a, b) => {
    const roleOrder = { lead: 0, admin: 1, guest: 2, jr_camper: 3 };
    return roleOrder[a.role] - roleOrder[b.role];
  });

  const handleMemberClick = (member) => {
    if (multiSelectMode && member.role !== 'lead') {
      const isSelected = selectedMembers.some(m => m.id === member.id);
      if (isSelected) {
        setSelectedMembers(selectedMembers.filter(m => m.id !== member.id));
      } else {
        setSelectedMembers([...selectedMembers, member]);
      }
    } else if (isLead && member.role !== 'lead' && member.user_email !== currentUserEmail) {
      setSelectedMember(member);
      setShowChangeRole(true);
    } else {
      setSelectedMember(member);
    }
  };

  const handleBulkRoleChange = (newRole) => {
    selectedMembers.forEach(member => {
      onUpdateRole(member.id, newRole);
    });
    setMultiSelectMode(false);
    setSelectedMembers([]);
    setShowBulkChangeRole(false);
  };

  return (
    <>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CollapsibleTrigger className="flex items-center gap-2 hover:opacity-70 transition-opacity">
              <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? '' : '-rotate-90'}`} />
              <CardTitle className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                Trip Members
                <Badge variant="outline" className="ml-2">
                  {members.length}
                </Badge>
              </CardTitle>
            </CollapsibleTrigger>
            <div className="flex gap-2">
              {isLead && members.filter(m => m.role !== 'lead').length > 0 && (
                multiSelectMode ? (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setMultiSelectMode(false);
                        setSelectedMembers([]);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => setShowBulkChangeRole(true)}
                      disabled={selectedMembers.length === 0}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      Change Role ({selectedMembers.length})
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setMultiSelectMode(true)}
                    className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Manage Roles
                  </Button>
                )
              )}
              {canManageMembers && onInvite && (
                <Button
                  size="icon"
                  onClick={() => setShowInviteDialog(true)}
                  className="h-9 w-9 bg-emerald-600 hover:bg-emerald-700"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CollapsibleContent>

      <CardContent>
        <div className={`grid grid-cols-1 ${layout === "expanded" ? "lg:grid-cols-3" : ""} gap-3`}>
        {sortedMembers.map((member, index) => {
          const config = roleConfig[member.role];
          const Icon = config.icon;
          const isCurrentUser = member.user_email === currentUserEmail;
          const isPending = member.status === 'pending';

          return (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleMemberClick(member)}
              className={`p-4 rounded-lg transition-colors ${
                multiSelectMode && member.role !== 'lead'
                  ? selectedMembers.some(m => m.id === member.id)
                    ? 'bg-emerald-100 border-2 border-emerald-600 cursor-pointer'
                    : 'bg-slate-50 border-2 border-transparent hover:border-emerald-300 cursor-pointer'
                  : isLead && member.role !== 'lead' && member.user_email !== currentUserEmail
                    ? 'bg-slate-50 hover:bg-emerald-50 cursor-pointer'
                    : 'bg-slate-50 hover:bg-slate-100 cursor-pointer'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${config.color} flex-shrink-0`}>
                  <Icon className="w-4 h-4" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                   <p className="text-sm font-medium text-slate-700">
                     {member.user_name || "Unnamed"}
                   </p>
                    {isCurrentUser && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowEditName(true);
                        }}
                        className="h-5 w-5 text-slate-400 hover:text-emerald-600 flex-shrink-0"
                      >
                        <Edit3 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>


                  
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary" className={`${config.color} border text-xs`}>
                      {config.label}
                    </Badge>
                    {isPending && (
                      <Badge variant="outline" className="text-xs border-amber-200 bg-amber-50 text-amber-700">
                        <Mail className="w-3 h-3 mr-1" />
                        Pending
                      </Badge>
                    )}
                    {!isPending && (
                      <Badge variant="outline" className="text-xs border-emerald-200 bg-emerald-50 text-emerald-700">
                        <MailCheck className="w-3 h-3 mr-1" />
                        Accepted
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex gap-1 flex-shrink-0">
                  {multiSelectMode && member.role !== 'lead' ? (
                    <Checkbox 
                      checked={selectedMembers.some(m => m.id === member.id)}
                      onCheckedChange={() => handleMemberClick(member)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    canManageMembers && !isCurrentUser && member.role !== 'lead' && onRemove && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemove(member);
                        }}
                        className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}

        </div>
        {members.length === 0 && (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No members yet</p>
          </div>
        )}
        </CardContent>
        </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Invite Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Trip Members</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <InviteMembers
              tripCode={tripCode}
              tripName={tripName}
              tripStartDate={tripStartDate}
              onAddOfflineMember={onInvite}
            />
          </div>
          <DialogFooter>
            <Button onClick={() => setShowInviteDialog(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Display Name Dialog */}
      <EditDisplayName
        open={showEditName}
        onClose={() => setShowEditName(false)}
        currentName={currentMember?.user_name}
        onSave={(name) => {
          if (onUpdateName && currentMember) {
            onUpdateName(currentMember.id, name);
            setShowEditName(false);
          }
        }}
        isLoading={isUpdatingName}
      />

      {/* Change Role Dialog */}
      <ChangeRoleDialog
        open={showChangeRole}
        onClose={() => {
          setShowChangeRole(false);
          setSelectedMember(null);
        }}
        member={selectedMember}
        onSave={(newRole) => {
          if (onUpdateRole && selectedMember) {
            onUpdateRole(selectedMember.id, newRole);
            setShowChangeRole(false);
            setSelectedMember(null);
          }
        }}
        isLoading={isUpdatingRole}
      />

      {/* Bulk Change Role Dialog */}
      <Dialog open={showBulkChangeRole} onOpenChange={setShowBulkChangeRole}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Role for {selectedMembers.length} Member{selectedMembers.length > 1 ? 's' : ''}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <p className="text-sm text-slate-600">
              Selected members will be changed to:
            </p>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start h-auto p-4 border-2 hover:border-emerald-600 hover:bg-emerald-50"
                onClick={() => handleBulkRoleChange('admin')}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">Pack Leader</div>
                    <div className="text-xs text-slate-500">Can manage trip details and members</div>
                  </div>
                </div>
              </Button>
              
              <Button
                variant="outline"
                className="w-full justify-start h-auto p-4 border-2 hover:border-slate-400 hover:bg-slate-50"
                onClick={() => handleBulkRoleChange('guest')}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-100 text-slate-700">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">Camper</div>
                    <div className="text-xs text-slate-500">Standard trip member</div>
                  </div>
                </div>
              </Button>
              
              <Button
                variant="outline"
                className="w-full justify-start h-auto p-4 border-2 hover:border-blue-400 hover:bg-blue-50"
                onClick={() => handleBulkRoleChange('jr_camper')}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">Jr Camper</div>
                    <div className="text-xs text-slate-500">Non-registered member</div>
                  </div>
                </div>
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkChangeRole(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Member Details Dialog */}
      {selectedMember && (() => {
        const config = roleConfig[selectedMember.role];
        const Icon = config.icon;
        const isPending = selectedMember.status === 'pending';
        
        // Check tent allocation
        const tents = packingItems.filter(item => item.category === 'shelter');
        const isInTent = tents.some(tent => tent.assigned_to?.includes(selectedMember.id));
        const memberTents = tents.filter(tent => tent.assigned_to?.includes(selectedMember.id));
        
        // Check watercraft allocation
        const watercraft = gearItems.filter(item => item.type === 'watercraft');
        const isInWatercraft = watercraft.some(w => w.assigned_to?.includes(selectedMember.id));
        const memberWatercraft = watercraft.filter(w => w.assigned_to?.includes(selectedMember.id));
        
        // Get all shared gear assigned to this member (excluding tents and watercraft)
        const memberSharedGear = gearItems.filter(item => 
          item.type !== 'watercraft' && 
          item.assigned_to?.includes(selectedMember.id)
        );
        
        // Get confirmed gear requests for this member
        const memberGearRequests = (gearRequests || []).filter(req => 
          req.assigned_to_member_id === selectedMember.id && 
          req.status === 'confirmed'
        );
        
        const hasGearCommitments = memberTents.length > 0 || 
                                    memberWatercraft.length > 0 || 
                                    memberSharedGear.length > 0 || 
                                    memberGearRequests.length > 0;
        
        return (
          <Dialog open={!!selectedMember} onOpenChange={() => setSelectedMember(null)}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Member Details</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${config.color} flex-shrink-0`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                   <h3 className="font-semibold text-lg text-slate-800">
                     {selectedMember.user_name || "Unnamed"}
                   </h3>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Member Level</span>
                    <Badge className={`${config.color} border`}>
                      {config.label}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Status</span>
                    {isPending ? (
                      <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
                        <Mail className="w-3 h-3 mr-1" />
                        Pending
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
                        <MailCheck className="w-3 h-3 mr-1" />
                        Accepted
                      </Badge>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-200">
                    <p className="text-sm font-medium text-slate-700 mb-3">Allocations</p>
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center gap-2 flex-1">
                        <div className={`p-3 rounded-lg ${isInTent ? 'bg-emerald-100' : 'bg-orange-100'}`}>
                          <Tent className={`w-5 h-5 ${isInTent ? 'text-emerald-600' : 'text-orange-600'}`} />
                        </div>
                        <span className="text-xs text-slate-600 text-center">
                          {isInTent ? 'Tent Assigned' : 'No Tent'}
                        </span>
                      </div>
                      <div className="flex flex-col items-center gap-2 flex-1">
                        <div className={`p-3 rounded-lg ${isInWatercraft ? 'bg-emerald-100' : 'bg-orange-100'}`}>
                          <Ship className={`w-5 h-5 ${isInWatercraft ? 'text-emerald-600' : 'text-orange-600'}`} />
                        </div>
                        <span className="text-xs text-slate-600 text-center">
                          {isInWatercraft ? 'Watercraft Assigned' : 'No Watercraft'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {hasGearCommitments && (
                    <div className="pt-3 border-t border-slate-200">
                      <p className="text-sm font-medium text-slate-700 mb-3">Committed to Bring</p>
                      <div className="space-y-2">
                        {memberTents.map(tent => (
                          <div key={tent.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                            <Tent className="w-4 h-4 text-emerald-600" />
                            <span className="text-sm text-slate-700">{tent.name}</span>
                            {tent.capacity && (
                              <Badge variant="outline" className="text-xs ml-auto">
                                {tent.capacity} people
                              </Badge>
                            )}
                          </div>
                        ))}
                        
                        {memberWatercraft.map(craft => (
                          <div key={craft.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                            <Ship className="w-4 h-4 text-cyan-600" />
                            <span className="text-sm text-slate-700">{craft.name}</span>
                            {craft.capacity && (
                              <Badge variant="outline" className="text-xs ml-auto">
                                {craft.capacity} people
                              </Badge>
                            )}
                          </div>
                        ))}
                        
                        {memberSharedGear.map(gear => (
                          <div key={gear.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                            <Package className="w-4 h-4 text-emerald-600" />
                            <span className="text-sm text-slate-700">{gear.name}</span>
                            {gear.is_rental && (
                              <Badge variant="outline" className="text-xs ml-auto border-amber-300 bg-amber-50 text-amber-700">
                                Rental
                              </Badge>
                            )}
                          </div>
                        ))}
                        
                        {memberGearRequests.map(req => (
                          <div key={req.id} className="flex items-center gap-2 p-2 bg-emerald-50 rounded-lg border border-emerald-200">
                            <Package className="w-4 h-4 text-emerald-600" />
                            <span className="text-sm text-slate-700">{req.name}</span>
                            <Badge variant="outline" className="text-xs ml-auto bg-emerald-100 text-emerald-700 border-emerald-300">
                              Confirmed
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button onClick={() => setSelectedMember(null)} className="w-full">
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        );
      })()}
    </>
  );
}