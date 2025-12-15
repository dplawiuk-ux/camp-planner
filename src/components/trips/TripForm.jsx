import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { MapPin, Calendar, FileText, Image, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import InviteMembers from "./InviteMembers";
import LocationPicker from "./LocationPicker";

const defaultPackingItems = [
  { name: "Tent", category: "shelter", packed: false },
  { name: "Sleeping bag", category: "sleep", packed: false },
  { name: "Sleeping pad", category: "sleep", packed: false },
  { name: "Camp stove", category: "cooking", packed: false },
  { name: "Cooler", category: "cooking", packed: false },
  { name: "First aid kit", category: "safety", packed: false },
  { name: "Flashlight/Headlamp", category: "tools", packed: false },
  { name: "Multi-tool", category: "tools", packed: false },
  { name: "Rain jacket", category: "clothing", packed: false },
  { name: "Hiking boots", category: "clothing", packed: false },
];

export default function TripForm({ open, onClose, onSubmit, initialData, isLoading }) {
  const [formData, setFormData] = useState(initialData || {
    name: "",
    location: "",
    location_lat: null,
    location_lng: null,
    start_date: "",
    end_date: "",
    notes: "",
    image_url: "",
    status: "planning",
    packing_items: defaultPackingItems
  });
  const [invitations, setInvitations] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ tripData: formData, invitations });
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLocationChange = (locationData) => {
    setFormData(prev => ({ 
      ...prev, 
      location: locationData.location,
      location_lat: locationData.location_lat,
      location_lng: locationData.location_lng
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-slate-800">
            {initialData ? "Edit Trip" : "Plan New Adventure"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-slate-700">
              Trip Name
            </Label>
            <Input
              id="name"
              placeholder="Summer Mountain Escape"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="h-12 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
              required
            />
          </div>

          <LocationPicker
            location={formData.location}
            lat={formData.location_lat}
            lng={formData.location_lng}
            onChange={handleLocationChange}
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-600" />
                Start Date
              </Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => handleChange("start_date", e.target.value)}
                className="h-12 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date" className="text-sm font-medium text-slate-700">
                End Date
              </Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => handleChange("end_date", e.target.value)}
                className="h-12 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status" className="text-sm font-medium text-slate-700">
              Status
            </Label>
            <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
              <SelectTrigger className="h-12 border-slate-200">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="planning">Planning</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_url" className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Image className="w-4 h-4 text-slate-500" />
              Cover Image URL (optional)
            </Label>
            <Input
              id="image_url"
              placeholder="https://..."
              value={formData.image_url}
              onChange={(e) => handleChange("image_url", e.target.value)}
              className="h-12 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-500" />
              Notes
            </Label>
            <Textarea
              id="notes"
              placeholder="Any special plans, reservations, or reminders..."
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              className="min-h-24 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 resize-none"
            />
          </div>

          {!initialData && (
            <div className="pt-4 border-t border-slate-200">
              <InviteMembers 
                invitations={invitations}
                onChange={setInvitations}
              />
            </div>
          )}

          <DialogFooter className="gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                initialData ? "Save Changes" : "Create Trip"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}