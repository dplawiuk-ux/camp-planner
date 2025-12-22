import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, Upload, Loader2 } from "lucide-react";

export default function PhotoUpload({ open, onClose, onSubmit, trips = [] }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    trip_id: '',
    notes: ''
  });

  const handleFilesSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    try {
      for (const file of selectedFiles) {
        const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
        
        await onSubmit({
          name: file.name,
          file_url: file_uri,
          file_type: file.type,
          category: 'photo',
          trip_id: formData.trip_id || undefined,
          notes: formData.notes || undefined
        });
      }
      
      setSelectedFiles([]);
      setFormData({ trip_id: '', notes: '' });
      onClose();
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-emerald-600" />
            Upload Photos
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="photos">Select Photos</Label>
            <div className="mt-2">
              <label
                htmlFor="photos"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-emerald-500 transition-colors"
              >
                <Upload className="w-8 h-8 text-slate-400 mb-2" />
                <p className="text-sm text-slate-600">
                  {selectedFiles.length > 0
                    ? `${selectedFiles.length} photo${selectedFiles.length > 1 ? 's' : ''} selected`
                    : 'Click to select photos'}
                </p>
                <p className="text-xs text-slate-400 mt-1">JPG, PNG, GIF up to 10MB each</p>
              </label>
              <input
                id="photos"
                type="file"
                accept="image/*"
                multiple
                onChange={handleFilesSelect}
                className="hidden"
              />
            </div>
          </div>

          {trips.length > 0 && (
            <div>
              <Label htmlFor="trip">Associated Trip (Optional)</Label>
              <Select
                value={formData.trip_id}
                onValueChange={(value) => setFormData({ ...formData, trip_id: value })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select a trip..." />
                </SelectTrigger>
                <SelectContent>
                  {trips.map((trip) => (
                    <SelectItem key={trip.id} value={trip.id}>
                      {trip.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add a caption or description..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="mt-2"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isUploading}>
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={selectedFiles.length === 0 || isUploading}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload {selectedFiles.length > 0 && `(${selectedFiles.length})`}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}