import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import TopNavBar from "@/components/layout/TopNavBar";
import { Edit3, Trash2, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  FileText,
  Loader2,
  Tent
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { motion } from "framer-motion";

import TripForm from "@/components/trips/TripForm";
import MembersList from "@/components/trips/MembersList";
import TripChat from "@/components/trips/TripChat";
import TripMap from "@/components/trips/TripMap";
import TentAllocation from "@/components/trips/TentAllocation";
import WatercraftAllocation from "@/components/trips/WatercraftAllocation";
import GearList from "@/components/trips/GearList";
import RemoveMemberDialog from "@/components/trips/RemoveMemberDialog";
import TripDocuments from "@/components/trips/TripDocuments";
import MealPlanner from "@/components/trips/MealPlanner";
import ExpenseTracker from "@/components/trips/ExpenseTracker";

export default function TripDetails() {
  const urlParams = new URLSearchParams(window.location.search);
  const tripId = urlParams.get('id');
  
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showRemoveMemberDialog, setShowRemoveMemberDialog] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [sectionFilter, setSectionFilter] = useState("all");
  const [showMap, setShowMap] = useState(false);
  
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

  const userEmails = [user?.email, ...(user?.alternate_emails || [])].filter(Boolean);
  const currentMember = members.find(m => m.user_email && userEmails.includes(m.user_email));
  const currentUserRole = currentMember?.role || 'guest';
  const canEdit = ['lead', 'admin'].includes(currentUserRole);
  const canDelete = currentUserRole === 'lead';

  // Debug log
  console.log('Trip ID:', tripId);
  console.log('User emails:', userEmails);
  console.log('All members:', members);
  console.log('Current member:', currentMember);
  console.log('Current role:', currentUserRole);
  console.log('Can edit:', canEdit);

  const updateMutation = useMutation({
    mutationFn: ({ tripData }) => base44.entities.Trip.update(tripId, tripData),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
      await queryClient.refetchQueries({ queryKey: ['trip', tripId] });
      setShowEditForm(false);
    }
  });

  const removeMemberMutation = useMutation({
    mutationFn: async ({ memberId, memberEmail, lockOut }) => {
      await base44.entities.TripMember.delete(memberId);
      
      if (lockOut && memberEmail) {
        const currentLockedEmails = trip.locked_out_emails || [];
        if (!currentLockedEmails.includes(memberEmail)) {
          await base44.entities.Trip.update(tripId, {
            locked_out_emails: [...currentLockedEmails, memberEmail]
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['tripMembers', tripId] });
      queryClient.refetchQueries({ queryKey: ['trip', tripId] });
      setShowRemoveMemberDialog(false);
      setMemberToRemove(null);
    }
  });



  const updateMemberNameMutation = useMutation({
    mutationFn: ({ memberId, name }) => 
      base44.entities.TripMember.update(memberId, { user_name: name }),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['tripMembers', tripId] });
    }
  });

  const updateMemberRoleMutation = useMutation({
    mutationFn: ({ memberId, role, extraData }) => 
      base44.entities.TripMember.update(memberId, { role, ...extraData }),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['tripMembers', tripId] });
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

  const handleGearUpdate = (items) => {
    updateMutation.mutate({ tripData: { gear_items: items } });
  };

  const handleGearRequestsUpdate = (requests) => {
    updateMutation.mutate({ tripData: { gear_requests: requests } });
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
    planning: "bg-emerald-100 text-emerald-800 border-emerald-200",
    completed: "bg-slate-100 text-slate-600 border-slate-200"
  };

  const defaultImages = [
    "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1200&q=80",
    "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=1200&q=80",
    "https://images.unsplash.com/photo-1537905569824-f89f14cceb68?w=1200&q=80"
  ];

  const rightActions = (canEdit || canDelete) ? (
    <div className="flex gap-2">
      {canEdit && (
        <Button
          onClick={() => setShowEditForm(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg"
        >
          <Edit3 className="w-4 h-4 mr-2" />
          Edit Trip
        </Button>
      )}
      {canDelete && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10"
            >
              <MoreVertical className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem 
              onClick={() => setShowDeleteDialog(true)}
              className="text-red-600"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Trip
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  ) : null;

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
        
        <TopNavBar 
          title={trip.name}
          showBack={true}
          backTo="CampingTrips"
          rightActions={rightActions}
          transparent={true}
        />

        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Badge className={`${statusColors[trip.status]} border mb-4`}>
              {trip.status}
            </Badge>

            <div className="flex flex-wrap items-center gap-4 text-white/90">
              <button 
                onClick={() => setShowMap(!showMap)}
                className="flex items-center gap-2 hover:text-white transition-colors"
              >
                <MapPin className="w-5 h-5" />
                <span>{trip.location}</span>
              </button>

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
        {/* Section Filter */}
        <div className="mb-8 flex justify-center overflow-x-auto">
          <Tabs value={sectionFilter} onValueChange={setSectionFilter}>
            <TabsList className="bg-white border border-slate-200 p-1 rounded-xl min-w-max">
              <TabsTrigger value="all" className="rounded-lg px-6">All</TabsTrigger>
              <TabsTrigger value="team" className="rounded-lg px-6">Team</TabsTrigger>
              <TabsTrigger value="gear" className="rounded-lg px-6">Gear</TabsTrigger>
              <TabsTrigger value="meals" className="rounded-lg px-6">Meals</TabsTrigger>
              <TabsTrigger value="expenses" className="rounded-lg px-6">Expenses</TabsTrigger>
              <TabsTrigger value="documents" className="rounded-lg px-6">Documents</TabsTrigger>
              <TabsTrigger value="chat" className="rounded-lg px-6">Chat</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Trip Info & Members & Chat */}
          <div className={`space-y-6 ${
            sectionFilter === 'all' ? 'lg:col-span-1' : 
            sectionFilter === 'team' ? 'lg:col-span-3' : 
            'hidden'
          }`}>
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
            {showMap && trip.location_lat && trip.location_lng && (
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
              onRemove={canEdit ? (member) => {
                setMemberToRemove(member);
                setShowRemoveMemberDialog(true);
              } : null}
              onInvite={canEdit ? async (memberName) => {
                await base44.entities.TripMember.create({
                  trip_id: tripId,
                  user_name: memberName,
                  role: 'jr_camper',
                  status: 'accepted'
                });
                queryClient.refetchQueries({ queryKey: ['tripMembers', tripId] });
              } : null}
              onUpdateName={(memberId, name) => updateMemberNameMutation.mutate({ memberId, name })}
              isUpdatingName={updateMemberNameMutation.isPending}
              onUpdateRole={(memberId, role, extraData) => updateMemberRoleMutation.mutate({ memberId, role, extraData })}
              isUpdatingRole={updateMemberRoleMutation.isPending}
              packingItems={trip.packing_items || []}
              gearItems={trip.gear_items || []}
              gearRequests={trip.gear_requests || []}
              tripCode={trip.trip_code}
              tripName={trip.name}
              tripStartDate={format(startDate, 'MMMM d, yyyy')}
              layout={sectionFilter === 'team' ? 'expanded' : 'compact'}
              paddleIn={trip.paddle_in}
            />

            {/* Trip Chat - shown in first column for 'all' view */}
            {sectionFilter === 'all' && (
              <TripChat
                tripId={tripId}
                currentUserRole={currentUserRole}
                currentUserEmail={user?.email}
              />
            )}
          </div>

          {/* Middle Column - Allocations & Gear & Documents & Expenses */}
          <div className={`${
            sectionFilter === 'all' ? 'lg:col-span-1 space-y-6' :
            sectionFilter === 'gear' ? 'lg:col-span-3' :
            sectionFilter === 'meals' ? 'lg:col-span-3' :
            sectionFilter === 'expenses' ? 'lg:col-span-3' :
            sectionFilter === 'documents' ? 'lg:col-span-3' :
            'hidden'
          }`}>
            {(sectionFilter === 'all' || sectionFilter === 'gear') && (
              <div className={`${
                sectionFilter === 'gear' 
                  ? 'grid grid-cols-1 lg:grid-cols-3 gap-6' 
                  : 'space-y-6'
              }`}>
                <TentAllocation
                  items={trip.packing_items || []}
                  members={members}
                  onUpdate={handlePackingUpdate}
                />
                <WatercraftAllocation
                  gearItems={trip.gear_items || []}
                  members={members}
                  onUpdate={handleGearUpdate}
                />
                <GearList
                  items={trip.gear_items || []}
                  members={members}
                  onUpdate={handleGearUpdate}
                  requests={trip.gear_requests || []}
                  onUpdateRequests={handleGearRequestsUpdate}
                  currentUserRole={currentUserRole}
                  currentUserEmail={user?.email}
                />
              </div>
            )}
            {sectionFilter === 'meals' && (
              <MealPlanner
                tripId={tripId}
                members={members}
                startDate={trip.start_date}
                endDate={trip.end_date}
              />
            )}
            {(sectionFilter === 'all' || sectionFilter === 'documents') && (
              <TripDocuments tripId={tripId} />
            )}
            {sectionFilter === 'expenses' && (
              <ExpenseTracker
                tripId={tripId}
                members={members}
                currentUserEmail={user?.email}
              />
            )}
          </div>

          {/* Right Column - Meals */}
          <div className={`${
            sectionFilter === 'all' ? 'lg:col-span-1' : 
            sectionFilter === 'chat' ? 'lg:col-span-3' : 
            'hidden'
          }`}>
            {sectionFilter === 'all' && (
              <MealPlanner
                tripId={tripId}
                members={members}
                startDate={trip.start_date}
                endDate={trip.end_date}
              />
            )}
            {sectionFilter === 'chat' && (
              <TripChat
                tripId={tripId}
                currentUserRole={currentUserRole}
                currentUserEmail={user?.email}
              />
            )}
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

      {/* Remove Member Dialog */}
      <RemoveMemberDialog
        open={showRemoveMemberDialog}
        onClose={() => {
          setShowRemoveMemberDialog(false);
          setMemberToRemove(null);
        }}
        member={memberToRemove}
        onConfirm={(lockOut) => {
          removeMemberMutation.mutate({
            memberId: memberToRemove.id,
            memberEmail: memberToRemove.user_email,
            lockOut
          });
        }}
        isLoading={removeMemberMutation.isPending}
      />
      </div>
      );
      }