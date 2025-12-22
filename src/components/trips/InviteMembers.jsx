import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Copy, Check, Ticket, Users } from "lucide-react";
import { toast } from "sonner";

export default function InviteMembers({ tripCode, tripName, tripStartDate }) {
  const [copied, setCopied] = useState(false);

  const inviteText = `Join my camping trip!

Trip: ${tripName}
Start Date: ${tripStartDate}

To join, visit: https://trailhead-planner-1412cfe0.base44.app
Then use this Trip Code: ${tripCode}`;

  const handleCopyInvite = () => {
    navigator.clipboard.writeText(inviteText);
    setCopied(true);
    toast.success("Invite copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium text-slate-700 flex items-center gap-2 mb-2">
          <Users className="w-4 h-4 text-emerald-600" />
          Invite People to Your Trip
        </Label>
        <p className="text-xs text-slate-500 mb-4">
          Copy the text below and share it via text, WhatsApp, or any messaging app. All new members will join as Campers.
        </p>
      </div>

      {/* Invite Text Box */}
      <div className="relative">
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 font-mono text-sm text-slate-700 whitespace-pre-wrap">
          {inviteText}
        </div>
        <Button
          type="button"
          onClick={handleCopyInvite}
          className="absolute top-2 right-2 h-8 gap-2 bg-emerald-600 hover:bg-emerald-700"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copy Invite
            </>
          )}
        </Button>
      </div>

      {/* Trip Code Display */}
      <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200 space-y-2">
        <Label className="text-sm font-medium text-emerald-800 flex items-center gap-2">
          <Ticket className="w-4 h-4" />
          Trip Join Code
        </Label>
        <div className="p-3 bg-white rounded border border-emerald-300 font-mono text-xl font-bold text-emerald-700 tracking-wider text-center">
          {tripCode}
        </div>
        <p className="text-xs text-emerald-700">
          Members use this code at the app to join your trip
        </p>
      </div>
    </div>
  );
}