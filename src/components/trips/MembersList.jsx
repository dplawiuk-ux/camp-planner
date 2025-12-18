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
  Mail,
  MailCheck,
  Trash2,
  Plus,
  Loader2,
  Edit3,
  Send,
  ChevronDown,
  Tent,
  Ship
} from "lucide-react";
import { motion } from "framer-motion";
import InviteMembers from "./InviteMembers";
import EditDisplayName from "./EditDisplayName";

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
  }
};

export default function MembersList({ members = [], currentUserRole, currentUserEmail, onRemove, onInvite, isInviting, onUpdateName, isUpdatingName, onResendInvite, isResending, packingItems = [], gearItems = [], tripCode }) {
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [invitations, setInvitations] = useState([]);
  const [customMessage, setCustomMessage] = useState("");
  const [showEditName, setShowEditName] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [isOpen, setIsOpen] = useState(true);
  const canManageMembers = ['lead', 'admin'].includes(currentUserRole);
  
  const currentMember = members.find(m => m.user_email === currentUserEmail);

  const sortedMembers = [...members].sort((a, b) => {
    const roleOrder = { lead: 0, admin: 1, guest: 2 };
    return roleOrder[a.role] - roleOrder[b.role];
  });

  const handleInviteSubmit = () => {
    if (invitations.length > 0 && onInvite) {
      onInvite(invitations, customMessage);
      setInvitations([]);
      setCustomMessage("");
      setShowInviteDialog(false);
    }
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
        </CardHeader>

        <CollapsibleContent>

      <CardContent className="space-y-2">
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
              onClick={() => setSelectedMember(member)}
              className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${config.color} flex-shrink-0`}>
                  <Icon className="w-4 h-4" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-slate-700">
                      {member.user_name || member.user_email || "Unnamed member"}
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

                  {member.user_email && member.user_name && (
                    <p className="text-xs text-slate-500 mb-2">
                      {member.user_email}
                    </p>
                  )}

                  {!member.user_email && (
                    <p className="text-xs text-slate-500 mb-2">
                      No email address
                    </p>
                  )}
                  
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
                  {canManageMembers && isPending && onResendInvite && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        onResendInvite(member);
                      }}
                      disabled={isResending}
                      className="h-8 w-8 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                      title="Resend invitation"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  )}
                  {canManageMembers && !isCurrentUser && member.role !== 'lead' && onRemove && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemove(member.id);
                      }}
                      className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}

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
            <DialogTitle>Invite Members to Trip</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <InviteMembers
              invitations={invitations}
              onChange={setInvitations}
              customMessage={customMessage}
              onMessageChange={setCustomMessage}
              tripCode={tripCode}
            />
          </div>
          <DialogFooter className="gap-3">
            <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleInviteSubmit}
              disabled={invitations.length === 0 || isInviting}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isInviting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Inviting...
                </>
              ) : (
                <>
                  Send {invitations.length > 0 ? `${invitations.length} ` : ''}Invitation{invitations.length !== 1 ? 's' : ''}
                </>
              )}
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

      {/* Member Details Dialog */}
      {selectedMember && (() => {
        const config = roleConfig[selectedMember.role];
        const Icon = config.icon;
        const isPending = selectedMember.status === 'pending';
        
        // Check tent allocation
        const tents = packingItems.filter(item => item.category === 'shelter');
        const isInTent = tents.some(tent => tent.assigned_to?.includes(selectedMember.id));
        
        // Check watercraft allocation
        const watercraft = gearItems.filter(item => item.type === 'watercraft');
        const isInWatercraft = watercraft.some(w => w.assigned_to?.includes(selectedMember.id));
        
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
                      {selectedMember.user_name || selectedMember.user_email || "Unnamed member"}
                    </h3>
                    {selectedMember.user_email && selectedMember.user_name && (
                      <p className="text-sm text-slate-500">{selectedMember.user_email}</p>
                    )}
                    {!selectedMember.user_email && (
                      <p className="text-sm text-slate-500">No email address</p>
                    )}
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