import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, X, UserPlus, Shield, User, Crown, MessageSquare, Copy, Check, Ticket } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

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

export default function InviteMembers({ invitations = [], onChange, customMessage = "", onMessageChange, tripCode, onGenerateTripCode }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("guest");
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    if (tripCode) {
      navigator.clipboard.writeText(tripCode);
      setCopied(true);
      toast.success("Trip code copied!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAdd = () => {
    const emailValue = email.trim();
    const nameValue = name.trim();
    
    // Must have either email or name
    if (!emailValue && !nameValue) return;
    
    // If email provided, validate it
    if (emailValue && !emailValue.includes('@')) return;
    
    // Check for duplicates
    const existing = invitations.find(inv => 
      (emailValue && inv.email === emailValue) || 
      (nameValue && !emailValue && inv.name === nameValue)
    );
    if (existing) return;

    const newInvitation = { 
      email: emailValue || undefined, 
      name: nameValue || undefined,
      role 
    };
    
    onChange([...invitations, newInvitation]);
    setEmail("");
    setName("");
    setRole("guest");
  };

  const handleRemove = (index) => {
    onChange(invitations.filter((_, i) => i !== index));
  };

  const handleRoleChange = (index, newRole) => {
    onChange(invitations.map((inv, i) => 
      i === index ? { ...inv, role: newRole } : inv
    ));
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium text-slate-700 flex items-center gap-2 mb-3">
          <UserPlus className="w-4 h-4 text-emerald-600" />
          Add Trip Members
        </Label>
        <p className="text-xs text-slate-500 mb-4">
          Add members to your trip - email optional for kids or offline campers
        </p>
      </div>

      {/* Trip Code Section */}
      {onGenerateTripCode && (
        <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200 space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-emerald-800 flex items-center gap-2">
              <Ticket className="w-4 h-4" />
              Trip Join Code
            </Label>
            {!tripCode && (
              <Button
                type="button"
                onClick={onGenerateTripCode}
                size="sm"
                variant="outline"
                className="h-8 text-xs border-emerald-300 hover:bg-emerald-100"
              >
                Generate Code
              </Button>
            )}
          </div>
          {tripCode ? (
            <div className="flex items-center gap-2">
              <div className="flex-1 p-3 bg-white rounded border border-emerald-300 font-mono text-lg font-semibold text-emerald-700 tracking-wider">
                {tripCode}
              </div>
              <Button
                type="button"
                onClick={handleCopyCode}
                size="icon"
                variant="outline"
                className="h-12 w-12 border-emerald-300 hover:bg-emerald-100"
              >
                {copied ? <Check className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
              </Button>
            </div>
          ) : (
            <p className="text-xs text-emerald-700">
              Generate a code to let others join your trip without an email invitation
            </p>
          )}
        </div>
      )}

      {/* Add Member */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <Input
            placeholder="Name (required)"
            value={name}
            onChange={(e) => setName(e.target.value)}
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
        <Input
          type="email"
          placeholder="Email (optional - for invitations)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
          className="h-11 border-slate-200"
        />
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

      {/* Custom Message */}
      {invitations.length > 0 && onMessageChange && (
        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-slate-500" />
            Custom Message (Optional)
          </Label>
          <Textarea
            placeholder="Add a personal message to your invitation..."
            value={customMessage}
            onChange={(e) => onMessageChange(e.target.value)}
            className="min-h-20 border-slate-200 resize-none"
          />
        </div>
      )}

      {/* Invitations List */}
      {invitations.length > 0 && (
        <div className="space-y-2">
          <Label className="text-xs text-slate-500 uppercase tracking-wide">
            Invited ({invitations.length})
          </Label>
          <AnimatePresence>
            {invitations.map((invitation, index) => {
              const config = roleConfig[invitation.role];
              const Icon = config.icon;
              const displayText = invitation.name || invitation.email;
              
              return (
                <motion.div
                  key={index}
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
                      {displayText}
                    </p>
                    {invitation.email && invitation.name && (
                      <p className="text-xs text-slate-500 truncate">{invitation.email}</p>
                    )}
                    {!invitation.email && (
                      <Badge variant="outline" className="text-xs mt-1">No email</Badge>
                    )}
                  </div>
                  <Select 
                    value={invitation.role} 
                    onValueChange={(newRole) => handleRoleChange(index, newRole)}
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
                    onClick={() => handleRemove(index)}
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