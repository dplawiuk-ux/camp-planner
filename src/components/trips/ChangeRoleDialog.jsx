import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Crown, Shield, User } from "lucide-react";

const roleConfig = {
  lead: {
    icon: Crown,
    color: "bg-amber-100 text-amber-700 border-amber-200",
    label: "Trip Leader",
    description: "Full access - can edit, delete, manage members"
  },
  admin: {
    icon: Shield,
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
    label: "Pack Leader",
    description: "Can edit trip, manage packing list, invite guests"
  },
  guest: {
    icon: User,
    color: "bg-slate-100 text-slate-700 border-slate-200",
    label: "Camper",
    description: "Can view and chat, mark items as packed"
  }
};

export default function ChangeRoleDialog({ open, onClose, member, onSave, isLoading }) {
  const [role, setRole] = useState(member?.role || 'guest');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (role && role !== member?.role) {
      onSave(role);
    }
  };

  if (!member) return null;

  const currentConfig = roleConfig[role];
  const Icon = currentConfig.icon;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change Member Role</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-sm text-slate-600">Member</Label>
            <p className="font-semibold text-slate-800">
              {member.user_name || member.user_email || "Unnamed member"}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">New Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(roleConfig).map(([key, { label, icon: RoleIcon }]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <RoleIcon className="w-4 h-4" />
                      {label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Role Description */}
          <div className={`p-3 rounded-lg ${currentConfig.color}`}>
            <div className="flex items-start gap-2">
              <Icon className="w-4 h-4 mt-0.5" />
              <div>
                <p className="font-medium text-sm">{currentConfig.label}</p>
                <p className="text-xs opacity-80 mt-1">{currentConfig.description}</p>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || role === member?.role}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Update Role"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}