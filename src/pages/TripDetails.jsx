import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Edit3, 
  Trash2, 
  FileText,
  Loader2,
  Tent
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { motion } from "framer-motion";

import TripForm from "@/components/trips/TripForm";
import PackingList from "@/components/trips/PackingList";

export default function TripDetails() {
  const urlParams = new URLSearchParams(window.location.search);
  const tripId = urlParams.get('id');
  
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const queryClient = useQueryClient();

  const { data: trip, isLoading } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: async () => {
      const trips = await base44.entities.Trip.filter({ id: tripId });
      return trips[0];
    },
    enabled: !!tripId
  });

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Trip.update(tripId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
      setShowEditForm(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: () => base44.entities.Trip.delete(tripId),
    onSuccess: () => {
      window.location.href = createPageUrl("CampingTrips");
    }
  });

  const handlePackingUpdate = (items) => {
    updateMutation.mutate({ packing_items: items });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50">
        <Tent className="w-16 h-16 text-slate-300 mb-4" />
        <h2 className="text-xl font-semibold text-slate-800 mb-2">Trip not found</h2>
        <Link to={createPageUrl("CampingTrips")}>
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Trips
          </Button>
        </Link>
      </div>
    );
  }

  const startDate = new Date(trip.start_date);
  const endDate = trip.end_date ? new Date(trip.end_date) : null;
  const daysUntil = differenceInDays(startDate, new Date());
  const tripDuration = endDate ? differenceInDays(endDate, startDate) + 1 : 1;

  const statusColors = {
    planning: "bg-amber-100 text-amber-800 border-amber-200",
    upcoming: "bg-emerald-100 text-emerald-800 border-emerald-200",
    completed: "bg-slate-100 text-slate-600 border-slate-200"
  };

  const defaultImages = [
    "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1200&q=80",
    "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=1200&q=80",
    "https://images.unsplash.com/photo-1537905569824-f89f14cceb68?w=1200&q=80"
  ];

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero Header */}
      <div className="relative h-80 md:h-96 overflow-hidden">
        <img
          src={trip.image_url || defaultImages[0]}
          alt={trip.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        
        <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
          <Link to={createPageUrl("CampingTrips")}>
            <Button 
              variant="ghost" 
              className="bg-white/10 backdrop-blur-md text-white hover:bg-white/20 border-0"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowEditForm(true)}
              className="bg-white/10 backdrop-blur-md text-white hover:bg-white/20"
            >
              <Edit3 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowDeleteDialog(true)}
              className="bg-white/10 backdrop-blur-md text-white hover:bg-red-500/80"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Badge className={`${statusColors[trip.status]} border mb-4`}>
              {trip.status}
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-3">
              {trip.name}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-white/90">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                <span>{trip.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>
                  {format(startDate, "MMM d")}
                  {endDate && ` - ${format(endDate, "MMM d, yyyy")}`}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Trip Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-5 text-center">
                  <div className="text-3xl font-bold text-emerald-600 mb-1">
                    {tripDuration}
                  </div>
                  <div className="text-sm text-slate-500">
                    {tripDuration === 1 ? "Day" : "Days"}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-sm">
                <CardContent className="p-5 text-center">
                  <div className="text-3xl font-bold text-amber-600 mb-1">
                    {daysUntil > 0 ? daysUntil : trip.status === 'completed' ? '✓' : 'Now'}
                  </div>
                  <div className="text-sm text-slate-500">
                    {daysUntil > 0 ? "Days Until" : trip.status === 'completed' ? "Complete" : "Today!"}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Notes */}
            {trip.notes && (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="w-5 h-5 text-slate-400" />
                    <h3 className="font-semibold text-slate-800">Notes</h3>
                  </div>
                  <p className="text-slate-600 whitespace-pre-wrap leading-relaxed">
                    {trip.notes}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Packing List */}
          <div className="lg:col-span-2">
            <PackingList
              items={trip.packing_items || []}
              onUpdate={handlePackingUpdate}
            />
          </div>
        </div>
      </div>

      {/* Edit Form Modal */}
      <TripForm
        open={showEditForm}
        onClose={() => setShowEditForm(false)}
        onSubmit={(data) => updateMutation.mutate(data)}
        initialData={trip}
        isLoading={updateMutation.isPending}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this trip?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{trip.name}" and all its packing items. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate()}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Delete Trip"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}