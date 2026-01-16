import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Copy, Check, Ticket, Users, UserPlus } from "lucide-react";
import { toast } from "sonner";

export default function InviteMembers({ tripCode, tripName, tripStartDate, onAddOfflineMember }) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [offlineMemberName, setOfflineMemberName] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const inviteText = `${t('members.inviteText.joinTrip')}

${t('trip.tripName')}: ${tripName}
${t('trip.startDate')}: ${tripStartDate}

${t('members.inviteText.toJoin')}: www.camp-planner.com
${t('members.inviteText.useCode')}: ${tripCode}`;

  const handleCopyInvite = () => {
    navigator.clipboard.writeText(inviteText);
    setCopied(true);
    toast.success(t('members.inviteCopied'));
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddOfflineMember = async () => {
    if (!offlineMemberName.trim() || !onAddOfflineMember) return;
    
    setIsAdding(true);
    try {
      await onAddOfflineMember(offlineMemberName.trim());
      setOfflineMemberName("");
      toast.success(t('members.camperAdded'));
    } catch (error) {
      toast.error(t('members.camperAddFailed'));
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Tabs defaultValue="invite" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-4">
        <TabsTrigger value="invite">
          <Ticket className="w-4 h-4 mr-2" />
          {t('members.shareInvite')}
        </TabsTrigger>
        <TabsTrigger value="offline">
          <UserPlus className="w-4 h-4 mr-2" />
          {t('members.addCamper')}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="invite" className="space-y-4">
        <div>
          <Label className="text-sm font-medium text-slate-700 flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-emerald-600" />
            {t('members.invitePeople')}
          </Label>
          <p className="text-xs text-slate-500 mb-4">
            {t('members.inviteInstructions')}
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
                {t('members.copied')}
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                {t('members.copyInvite')}
              </>
            )}
          </Button>
        </div>

        {/* Trip Code Display */}
        <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200 space-y-2">
          <Label className="text-sm font-medium text-emerald-800 flex items-center gap-2">
            <Ticket className="w-4 h-4" />
            {t('members.tripJoinCode')}
          </Label>
          <div className="p-3 bg-white rounded border border-emerald-300 font-mono text-xl font-bold text-emerald-700 tracking-wider text-center">
            {tripCode}
          </div>
          <p className="text-xs text-emerald-700">
            {t('members.codeUsageHelp')}
          </p>
        </div>
      </TabsContent>

      <TabsContent value="offline" className="space-y-4">
        <div>
          <Label className="text-sm font-medium text-slate-700 flex items-center gap-2 mb-2">
            <UserPlus className="w-4 h-4 text-emerald-600" />
            {t('members.addCamperWithoutAccount')}
          </Label>
          <p className="text-xs text-slate-500 mb-4">
            {t('members.addCamperHelp')}
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <Label htmlFor="offline-name">{t('members.camperName')}</Label>
            <Input
              id="offline-name"
              placeholder={t('members.camperNamePlaceholder', 'e.g., Sarah (age 8)')}
              value={offlineMemberName}
              onChange={(e) => setOfflineMemberName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && offlineMemberName.trim()) {
                  handleAddOfflineMember();
                }
              }}
              className="mt-2"
            />
          </div>

          <Button
            onClick={handleAddOfflineMember}
            disabled={!offlineMemberName.trim() || isAdding}
            className="w-full bg-emerald-600 hover:bg-emerald-700"
          >
            {isAdding ? t('members.adding', 'Adding') : t('members.addCamper')}
          </Button>
        </div>
      </TabsContent>
    </Tabs>
  );
}