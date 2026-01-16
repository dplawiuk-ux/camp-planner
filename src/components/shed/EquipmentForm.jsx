import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Loader2, Package } from "lucide-react";
import { useTranslation } from 'react-i18next';
import ImageUpload from "@/components/shared/ImageUpload";

const equipmentTypes = [
  { value: "tents", label: "Tents" },
  { value: "watercraft", label: "Watercraft" },
  { value: "sleeping", label: "Sleeping" },
  { value: "fire", label: "Fire" },
  { value: "water", label: "Water" },
  { value: "kitchen", label: "Kitchen" },
  { value: "other", label: "Other" }
];

export default function EquipmentForm({ open, onClose, onSubmit, initialData, isLoading }) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState(initialData || {
    name: "",
    type: "tents",
    capacity: "",
    notes: "",
    image_url: ""
  });

  React.useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        name: "",
        type: "tents",
        capacity: "",
        notes: "",
        image_url: ""
      });
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      capacity: formData.capacity ? parseFloat(formData.capacity) : undefined
    };
    onSubmit(data);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const showCapacity = ['tents', 'watercraft'].includes(formData.type);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-slate-800 flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-600" />
            {initialData ? t('shed.editEquipment') : t('shed.addEquipment')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t('shed.equipmentName')}</Label>
            <Input
              id="name"
              placeholder={t('shed.namePlaceholder', 'e.g., Big Red Tent')}
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="h-11"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">{t('shed.equipmentType')}</Label>
            <Select value={formData.type} onValueChange={(value) => handleChange("type", value)}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder={t('shed.selectType', 'Select type')} />
              </SelectTrigger>
              <SelectContent>
                {equipmentTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {t(`gear.types.${type.value}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {showCapacity && (
            <div className="space-y-2">
              <Label htmlFor="capacity">
                {t('tent.capacity')} {formData.type === 'tents' && `(${t('common.people', 'people')})`}
                {formData.type === 'watercraft' && `(${t('common.people', 'people')})`}
              </Label>
              <Select 
                value={String(formData.capacity || 2)} 
                onValueChange={(value) => handleChange("capacity", parseInt(value))}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder={t('shed.selectCapacity', 'Select capacity')} />
                </SelectTrigger>
                <SelectContent side="bottom" align="start">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <SelectItem key={num} value={String(num)}>
                      {num} {num === 1 ? t('common.person', 'person') : t('common.people', 'people')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <ImageUpload
            label={t('shed.imageOptional', 'Image (optional)')}
            value={formData.image_url}
            onChange={(url) => handleChange("image_url", url)}
          />

          <div className="space-y-2">
            <Label htmlFor="notes">{t('shed.notesOptional', 'Notes (optional)')}</Label>
            <Textarea
              id="notes"
              placeholder={t('shed.notesPlaceholder', 'Brand, condition, special features...')}
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              className="min-h-20 resize-none"
            />
          </div>

          <DialogFooter className="gap-3 pt-2 pb-6">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              {t('common.cancel')}
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('common.saving')}...
                </>
              ) : (
                initialData ? t('common.saveChanges') : t('shed.addEquipment')
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}