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
import MembersList from "@/components/trips/MembersList";
import TripChat from "@/components/trips/TripChat";
import TripMap from "@/components/trips/TripMap";
import TentAllocation from "@/components/trips/TentAllocation";

export default function TripDetails() {
  const urlParams = new URLSearchParams(window.location.search);
  const tripId = urlParams.get('id');
  
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: trip, isLoading } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: async () => {
      const trips = await base44.entities.Trip.filter({ id: tripId });
      return trips[0];
    },
    enabled: !!tripId
  });

  const { data: members = [] } = useQuery({
    queryKey: ['tripMembers', tripId],
    queryFn: () => base44.entities.TripMember.filter({ trip_id: tripId }),
    enabled: !!tripId
  });

  const currentMember = members.find(m => m.user_email === user?.email);
  const currentUserRole = currentMember?.role || 'guest';
  const canEdit = ['lead', 'admin'].includes(currentUserRole);
  const canDelete = currentUserRole === 'lead';

  const updateMutation = useMutation({
    mutationFn: ({ tripData }) => base44.entities.Trip.update(tripId, tripData),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
      await queryClient.refetchQueries({ queryKey: ['trip', tripId] });
      setShowEditForm(false);
    }
  });

  const removeMemberMutation = useMutation({
    mutationFn: (memberId) => base44.entities.TripMember.delete(memberId),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['tripMembers', tripId] });
    }
  });

  const inviteMembersMutation = useMutation({
    mutationFn: async ({ invitations, customMessage }) => {
      await base44.entities.TripMember.bulkCreate(
        invitations.map(inv => ({
          trip_id: tripId,
          user_email: inv.email,
          role: inv.role,
          status: 'pending'
        }))
      );
      
      // Send invitation emails
      const tripUrl = `${window.location.origin}${createPageUrl('TripDetails')}?id=${tripId}`;
      for (const inv of invitations) {
        const emailBody = `${user.full_name} has invited you to join their camping trip "${trip.name}" at ${trip.location}.\n\nTrip dates: ${trip.start_date}${trip.end_date ? ` to ${trip.end_date}` : ''}\n\nRole: ${inv.role}${customMessage ? `\n\nPersonal message:\n${customMessage}` : ''}\n\nView trip details: ${tripUrl}`;
        
        await base44.integrations.Core.SendEmail({
          to: inv.email,
          subject: `You're invited to ${trip.name}`,
          body: emailBody
        });
      }
    },
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['tripMembers', tripId] });
    }
  });

  const updateMemberNameMutation = useMutation({
    mutationFn: ({ memberId, name }) => 
      base44.entities.TripMember.update(memberId, { user_name: name }),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['tripMembers', tripId] });
    }
  });

  const resendInviteMutation = useMutation({
    mutationFn: async (member) => {
      const tripUrl = `${window.location.origin}${createPageUrl('TripDetails')}?id=${tripId}`;
      const emailBody = `${user.full_name} has invited you to join their camping trip "${trip.name}" at ${trip.location}.\n\nTrip dates: ${trip.start_date}${trip.end_date ? ` to ${trip.end_date}` : ''}\n\nRole: ${member.role}\n\nView trip details: ${tripUrl}`;
      
      await base44.integrations.Core.SendEmail({
        to: member.user_email,
        subject: `Reminder: You're invited to ${trip.name}`,
        body: emailBody
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: () => base44.entities.Trip.delete(tripId),
    onSuccess: () => {
      window.location.href = createPageUrl("CampingTrips");
    }
  });

  const handlePackingUpdate = (items) => {
    updateMutation.mutate({ tripData: { packing_items: items } });
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
            {canEdit && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowEditForm(true)}
                className="bg-white/10 backdrop-blur-md text-white hover:bg-white/20"
              >
                <Edit3 className="w-4 h-4" />
              </Button>
            )}
            {canDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowDeleteDialog(true)}
                className="bg-white/10 backdrop-blur-md text-white hover:bg-red-500/80"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
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
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column - Trip Info & Members */}
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

            {/* Map */}
            {trip.location_lat && trip.location_lng && (
              <TripMap
                location={trip.location}
                lat={trip.location_lat}
                lng={trip.location_lng}
              />
            )}

            {/* Members List */}
            <MembersList 
              members={members}
              currentUserRole={currentUserRole}
              currentUserEmail={user?.email}
              onRemove={canEdit ? (id) => removeMemberMutation.mutate(id) : null}
              onInvite={canEdit ? (invitations, customMessage) => inviteMembersMutation.mutate({ invitations, customMessage }) : null}
              isInviting={inviteMembersMutation.isPending}
              onUpdateName={(memberId, name) => updateMemberNameMutation.mutate({ memberId, name })}
              isUpdatingName={updateMemberNameMutation.isPending}
              onResendInvite={canEdit ? (member) => resendInviteMutation.mutate(member) : null}
              isResending={resendInviteMutation.isPending}
            />
          </div>

          {/* Middle Column - Tent Allocation & Packing List */}
          <div className="lg:col-span-1 space-y-6">
            <TentAllocation
              items={trip.packing_items || []}
              members={members}
              onUpdate={handlePackingUpdate}
            />
            <PackingList
              items={trip.packing_items || []}
              onUpdate={handlePackingUpdate}
            />
          </div>

          {/* Right Column - Chat */}
          <div className="lg:col-span-2">
            <TripChat
              tripId={tripId}
              currentUserRole={currentUserRole}
              currentUserEmail={user?.email}
            />
          </div>
        </div>
      </div>

      {/* Edit Form Modal */}
      {canEdit && (
        <TripForm
          open={showEditForm}
          onClose={() => setShowEditForm(false)}
          onSubmit={(data) => updateMutation.mutate(data)}
          initialData={trip}
          isLoading={updateMutation.isPending}
        />
      )}

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