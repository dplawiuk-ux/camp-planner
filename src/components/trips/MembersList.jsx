import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
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
  Edit3
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

export default function MembersList({ members = [], currentUserRole, currentUserEmail, onRemove, onInvite, isInviting, onUpdateName, isUpdatingName }) {
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [invitations, setInvitations] = useState([]);
  const [customMessage, setCustomMessage] = useState("");
  const [showEditName, setShowEditName] = useState(false);
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
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold text-slate-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            Trip Members
            <Badge variant="outline" className="ml-2">
              {members.length}
            </Badge>
          </CardTitle>
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
              className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${config.color} flex-shrink-0`}>
                  <Icon className="w-4 h-4" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-slate-700">
                      {member.user_name || member.user_email}
                    </p>
                    {isCurrentUser && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowEditName(true)}
                        className="h-5 w-5 text-slate-400 hover:text-emerald-600 flex-shrink-0"
                      >
                        <Edit3 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                  
                  {member.user_name && (
                    <p className="text-xs text-slate-500 mb-2">
                      {member.user_email}
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

                {canManageMembers && !isCurrentUser && member.role !== 'lead' && onRemove && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemove(member.id)}
                    className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
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
    </Card>
  );
}