import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, X, UserPlus, Shield, User, Crown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

export default function InviteMembers({ invitations = [], onChange }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("guest");

  const handleAdd = () => {
    if (!email.trim() || !email.includes('@')) return;
    
    const existing = invitations.find(inv => inv.email === email);
    if (existing) return;

    onChange([...invitations, { email: email.trim(), role }]);
    setEmail("");
    setRole("guest");
  };

  const handleRemove = (emailToRemove) => {
    onChange(invitations.filter(inv => inv.email !== emailToRemove));
  };

  const handleRoleChange = (email, newRole) => {
    onChange(invitations.map(inv => 
      inv.email === email ? { ...inv, role: newRole } : inv
    ));
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium text-slate-700 flex items-center gap-2 mb-3">
          <UserPlus className="w-4 h-4 text-emerald-600" />
          Invite Trip Members
        </Label>
        <p className="text-xs text-slate-500 mb-4">
          Invite others to plan and join your camping trip
        </p>
      </div>

      {/* Add Invitation */}
      <div className="flex gap-2">
        <Input
          type="email"
          placeholder="email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
          className="flex-1 h-11 border-slate-200"
        />
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger className="w-32 h-11 border-slate-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(roleConfig).map(([key, { label, icon: Icon }]) => (
              <SelectItem key={key} value={key}>
                <div className="flex items-center gap-2">
                  <Icon className="w-3 h-3" />
                  {label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button 
          type="button"
          onClick={handleAdd} 
          className="h-11 bg-emerald-600 hover:bg-emerald-700"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Role Descriptions */}
      <div className="grid grid-cols-1 gap-2 p-3 bg-slate-50 rounded-lg">
        {Object.entries(roleConfig).map(([key, { icon: Icon, label, description }]) => (
          <div key={key} className="flex items-start gap-2 text-xs">
            <Icon className="w-3 h-3 text-slate-400 mt-0.5" />
            <div>
              <span className="font-medium text-slate-700">{label}:</span>
              <span className="text-slate-500 ml-1">{description}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Invitations List */}
      {invitations.length > 0 && (
        <div className="space-y-2">
          <Label className="text-xs text-slate-500 uppercase tracking-wide">
            Invited ({invitations.length})
          </Label>
          <AnimatePresence>
            {invitations.map((invitation) => {
              const config = roleConfig[invitation.role];
              const Icon = config.icon;
              
              return (
                <motion.div
                  key={invitation.email}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200"
                >
                  <div className={`p-2 rounded-lg ${config.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">
                      {invitation.email}
                    </p>
                  </div>
                  <Select 
                    value={invitation.role} 
                    onValueChange={(newRole) => handleRoleChange(invitation.email, newRole)}
                  >
                    <SelectTrigger className="w-28 h-8 text-xs border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(roleConfig).map(([key, { label }]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemove(invitation.email)}
                    className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}