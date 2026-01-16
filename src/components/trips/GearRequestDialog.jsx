import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { UserPlus } from "lucide-react";

export default function GearRequestDialog({ open, onClose, onSubmit, members = [] }) {
  const { t } = useTranslation();
  const [requestData, setRequestData] = useState({
    name: "",
    type: "other",
    notes: "",
    assigned_to_member_id: ""
  });

  const handleSubmit = () => {
    const newRequest = {
      id: `request-${Date.now()}`,
      name: requestData.name,
      type: requestData.type,
      notes: requestData.notes,
      assigned_to_member_id: requestData.assigned_to_member_id || null,
      status: requestData.assigned_to_member_id ? "assigned" : "open",
      fulfilled_by_equipment_id: null
    };
    onSubmit(newRequest);
    setRequestData({
      name: "",
      type: "other",
      notes: "",
      assigned_to_member_id: ""
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('gear.requestGear')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label>{t('gear.gearName', 'Gear Name')}</Label>
            <Input
              placeholder={t('gear.gearNamePlaceholder', 'e.g., Camp Stove')}
              value={requestData.name}
              onChange={(e) => setRequestData({...requestData, name: e.target.value})}
              className="mt-2"
            />
          </div>

          <div>
            <Label>{t('gear.gearType')}</Label>
            <Select 
              value={requestData.type} 
              onValueChange={(value) => setRequestData({...requestData, type: value})}
            >
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tents">{t('gear.types.tents')}</SelectItem>
                <SelectItem value="sleeping_pads">{t('gear.types.sleeping_pads', 'Sleeping Pads')}</SelectItem>
                <SelectItem value="sleeping_bags">{t('gear.types.sleeping_bags', 'Sleeping Bags')}</SelectItem>
                <SelectItem value="kitchen">{t('gear.types.kitchen')}</SelectItem>
                <SelectItem value="fire">{t('gear.types.fire')}</SelectItem>
                <SelectItem value="watercraft">{t('gear.types.watercraft')}</SelectItem>
                <SelectItem value="other">{t('gear.types.other')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>{t('gear.notesOptional', 'Notes (optional)')}</Label>
            <Textarea
              placeholder={t('gear.specificRequirements', 'Any specific requirements...')}
              value={requestData.notes}
              onChange={(e) => setRequestData({...requestData, notes: e.target.value})}
              className="mt-2"
            />
          </div>

          <div>
            <Label className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              {t('gear.assignToMemberOptional', 'Assign to Member (optional)')}
            </Label>
            <Select 
              value={requestData.assigned_to_member_id} 
              onValueChange={(value) => setRequestData({...requestData, assigned_to_member_id: value})}
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder={t('gear.leaveOpenVolunteers', 'Leave open for volunteers')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>{t('gear.leaveOpenVolunteers', 'Leave open for volunteers')}</SelectItem>
                {members.map(member => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.user_name || member.user_email || 'Unnamed'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {requestData.assigned_to_member_id && (
              <p className="text-xs text-slate-500 mt-2">
                {t('gear.memberCanConfirm', 'This member will be able to confirm or decline the request')}
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!requestData.name}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {t('gear.createRequest', 'Create Request')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}