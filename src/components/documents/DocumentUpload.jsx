import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Loader2, Upload, FileText } from "lucide-react";

export default function DocumentUpload({ open, onClose, onSubmit, isLoading, trips = [] }) {
  const [formData, setFormData] = useState({
    name: "",
    category: "other",
    trip_id: "",
    notes: ""
  });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (!formData.name) {
        setFormData(prev => ({ ...prev, name: selectedFile.name }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      const documentData = {
        ...formData,
        file_url,
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
            Upload Document
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-4">
          <div className="space-y-2">
            <Label htmlFor="file">File</Label>
            <div className="flex items-center gap-3">
              <Input
                id="file"
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
                className="h-11"
                required
              />
              {file && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Upload className="w-4 h-4" />
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </div>
              )}
            </div>
            <p className="text-xs text-slate-500">
              Supported formats: PDF, JPG, PNG, GIF, WEBP
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Document Name</Label>
            <Input
              id="name"
              placeholder="e.g., Park Entry Permit"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="h-11"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={formData.category} onValueChange={(value) => handleChange("category", value)}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="permit">Permit</SelectItem>
                <SelectItem value="booking">Booking/Reservation</SelectItem>
                <SelectItem value="parking_pass">Parking Pass</SelectItem>
                <SelectItem value="map">Map</SelectItem>
                <SelectItem value="directions">Directions</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="trip">Associated Trip (optional)</Label>
            <Select value={formData.trip_id} onValueChange={(value) => handleChange("trip_id", value)}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select trip (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>No trip</SelectItem>
                {trips.map((trip) => (
                  <SelectItem key={trip.id} value={trip.id}>
                    {trip.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Additional details..."
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
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!file || uploading || isLoading}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            >
              {uploading || isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Upload Document"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}