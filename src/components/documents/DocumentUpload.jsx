import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Loader2, Upload, FileText } from "lucide-react";

export default function DocumentUpload({ open, onClose, onSubmit, isLoading, trips = [] }) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: "",
    category: "other",
    trip_id: "",
    notes: ""
  });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (!formData.name) {
        setFormData(prev => ({ ...prev, name: selectedFile.name }));
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      setFile(droppedFile);
      if (!formData.name) {
        setFormData(prev => ({ ...prev, name: droppedFile.name }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    try {
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      
      const documentData = {
        ...formData,
        file_url: file_uri,
        file_type: file.type,
        trip_id: formData.trip_id || undefined
      };
      
      await onSubmit(documentData);
      
      setFormData({ name: "", category: "other", trip_id: "", notes: "" });
      setFile(null);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-slate-800 flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            {t('documents.uploadDocument')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-4">
          <div className="space-y-2">
            <Label htmlFor="file">{t('documents.file', 'File')}</Label>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
                isDragging 
                  ? 'border-emerald-500 bg-emerald-50' 
                  : 'border-slate-200 bg-slate-50'
              }`}
            >
              <input
                id="file"
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                required
              />
              <div className="text-center">
                <Upload className={`w-8 h-8 mx-auto mb-2 ${isDragging ? 'text-emerald-600' : 'text-slate-400'}`} />
                {file ? (
                  <div>
                    <p className="font-medium text-slate-700">{file.name}</p>
                    <p className="text-sm text-slate-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-slate-700 mb-1">
                      <span className="font-medium text-emerald-600">{t('documents.clickToUpload', 'Click to upload')}</span> {t('documents.orDragDrop', 'or drag and drop')}
                    </p>
                    <p className="text-xs text-slate-500">
                      PDF, JPG, PNG, GIF, WEBP
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">{t('documents.documentName')}</Label>
            <Input
              id="name"
              placeholder={t('documents.documentNamePlaceholder', 'e.g., Park Entry Permit')}
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="h-11"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">{t('expenses.category')}</Label>
            <Select value={formData.category} onValueChange={(value) => handleChange("category", value)}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder={t('documents.selectCategory', 'Select category')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="permit">{t('documents.categories.permit')}</SelectItem>
                <SelectItem value="booking">{t('documents.categories.booking')}</SelectItem>
                <SelectItem value="parking_pass">{t('documents.categories.parking_pass')}</SelectItem>
                <SelectItem value="map">{t('documents.categories.map')}</SelectItem>
                <SelectItem value="directions">{t('documents.categories.directions')}</SelectItem>
                <SelectItem value="other">{t('documents.categories.other')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="trip">{t('documents.associatedTrip', 'Associated Trip (optional)')}</Label>
            <Select value={formData.trip_id} onValueChange={(value) => handleChange("trip_id", value)}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder={t('documents.selectTripOptional', 'Select trip (optional)')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>{t('documents.noTrip', 'No trip')}</SelectItem>
                {trips.map((trip) => (
                  <SelectItem key={trip.id} value={trip.id}>
                    {trip.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">{t('documents.notesOptional', 'Notes (optional)')}</Label>
            <Textarea
              id="notes"
              placeholder={t('documents.additionalDetails', 'Additional details...')}
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              className="min-h-20 resize-none"
            />
          </div>

          <DialogFooter className="gap-3 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              className="flex-1"
              disabled={uploading || isLoading}
            >
              {t('common.cancel')}
            </Button>
            <Button 
              type="submit" 
              disabled={!file || uploading || isLoading}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            >
              {uploading || isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('documents.uploading', 'Uploading')}...
                </>
              ) : (
                t('documents.uploadDocument')
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}