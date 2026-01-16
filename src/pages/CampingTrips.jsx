import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Tent, Mountain, Loader2, Package, FileText, Ticket } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import TripCard from "@/components/trips/TripCard";
import TripForm from "@/components/trips/TripForm";
import JoinTripDialog from "@/components/trips/JoinTripDialog";
import TopNavBar from "@/components/layout/TopNavBar";
import { useTranslation } from 'react-i18next';

export default function CampingTrips() {
  const { t } = useTranslation();
  const [showForm, setShowForm] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: myMemberships = [] } = useQuery({
    queryKey: ['myMemberships'],
    queryFn: async () => {
      if (!user) return [];
      const emails = [user.email, ...(user.alternate_emails || [])];
      const membershipsPromises = emails.map(email => 
        base44.entities.TripMember.filter({ user_email: email })
      );
      const results = await Promise.all(membershipsPromises);
      return results.flat();
    },
    enabled: !!user
  });

  const { data: allTrips = [], isLoading } = useQuery({
    queryKey: ['trips'],
    queryFn: () => base44.entities.Trip.list('-created_date'),
  });

  // Filter to only show trips where user is a member and auto-set status based on end date
  const trips = allTrips.filter(trip => 
    myMemberships.some(m => m.trip_id === trip.id)
  ).map(trip => {
    const endDate = trip.end_date ? new Date(trip.end_date) : null;
    const isComplete = endDate && endDate < new Date();
    return {
      ...trip,
      status: isComplete ? 'completed' : 'planning'
    };
  });

  const joinTripMutation = useMutation({
    mutationFn: async (tripCode) => {
      const user = await base44.auth.me();
      
      // Find trip by code
      const trips = await base44.entities.Trip.filter({ trip_code: tripCode });
      if (trips.length === 0) {
        throw new Error("Invalid trip code");
      }
      const trip = trips[0];
      
      // Check if user is locked out
      const emails = [user.email, ...(user.alternate_emails || [])];
      const lockedEmails = trip.locked_out_emails || [];
      const isLockedOut = emails.some(email => lockedEmails.includes(email));
      
      if (isLockedOut) {
        throw new Error("You have been locked out from this trip");
      }
      
      // Check if already a member
      const existingMember = await base44.entities.TripMember.filter({ trip_id: trip.id });
      const alreadyMember = existingMember.some(m => m.user_email && emails.includes(m.user_email));
      
      if (alreadyMember) {
        throw new Error("You're already a member of this trip");
      }
      
      // Add as guest
      await base44.entities.TripMember.create({
        trip_id: trip.id,
        user_email: user.email,
        user_name: user.full_name,
        role: 'guest',
        status: 'accepted'
      });
      
      return trip;
    },
    onSuccess: (trip) => {
      queryClient.refetchQueries({ queryKey: ['trips'] });
      queryClient.refetchQueries({ queryKey: ['myMemberships'] });
      setShowJoinDialog(false);
      toast.success(`Joined "${trip.name}"!`);
      window.location.href = createPageUrl('TripDetails') + '?id=' + trip.id;
    },
    onError: (error) => {
      toast.error(error.message || "Failed to join trip");
    }
  });

  const createMutation = useMutation({
    mutationFn: async ({ tripData }) => {
      const user = await base44.auth.me();

      // Create the trip
      const trip = await base44.entities.Trip.create(tripData);

      // Add creator as lead
      await base44.entities.TripMember.create({
        trip_id: trip.id,
        user_email: user.email,
        user_name: user.full_name,
        role: 'lead',
        status: 'accepted'
      });

      return trip;
    },
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ['trips'] });
      queryClient.refetchQueries({ queryKey: ['myMemberships'] });
      setShowForm(false);
      toast.success('Trip created! Share the trip code to invite members.');
    }
  });

  const filteredTrips = trips.filter(trip => {
    const matchesSearch = trip.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         trip.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || trip.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const headerActions = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="icon"
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <Plus className="w-5 h-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setShowForm(true)}>
          <Tent className="w-4 h-4 mr-2" />
          {t('trip.newTrip')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setShowJoinDialog(true)}>
          <Ticket className="w-4 h-4 mr-2" />
          {t('trip.joinTrip')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-emerald-50/30 pt-14">
      <TopNavBar title={t('trip.trips')} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Filters */}
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder={t('common.search') + " " + t('trip.trips').toLowerCase() + "..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-11 bg-white border-slate-200 rounded-xl"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                className="h-11 w-11 bg-emerald-600 hover:bg-emerald-700 flex-shrink-0"
              >
                <Plus className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowForm(true)}>
                <Tent className="w-4 h-4 mr-2" />
                {t('trip.newTrip')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowJoinDialog(true)}>
                <Ticket className="w-4 h-4 mr-2" />
                {t('trip.joinTrip')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mb-10">
          <Tabs value={statusFilter} onValueChange={setStatusFilter}>
            <TabsList className="h-11 bg-white border border-slate-200 p-1 rounded-xl">
              <TabsTrigger value="all" className="rounded-lg px-6">{t('common.all')}</TabsTrigger>
              <TabsTrigger value="planning" className="rounded-lg px-6">{t('trip.planning')}</TabsTrigger>
              <TabsTrigger value="completed" className="rounded-lg px-6">{t('trip.completed')}</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Trips Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          </div>
        ) : filteredTrips.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredTrips.map((trip, index) => (
                <TripCard key={trip.id} trip={trip} index={index} />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-24"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 rounded-3xl mb-6">
              <Mountain className="w-10 h-10 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-semibold text-slate-800 mb-2">
              {searchQuery || statusFilter !== "all" 
                ? "No trips found" 
                : "No trips yet"}
            </h3>
            <p className="text-slate-500 mb-8">
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Start planning your first camping adventure!"}
            </p>
            {!searchQuery && statusFilter === "all" && (
              <Button
                onClick={() => setShowForm(true)}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Trip
              </Button>
            )}
          </motion.div>
        )}
      </div>

      {/* Trip Form Modal */}
      <TripForm
        open={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={(data) => createMutation.mutate(data)}
        isLoading={createMutation.isPending}
      />

      {/* Join Trip Dialog */}
      <JoinTripDialog
        open={showJoinDialog}
        onClose={() => setShowJoinDialog(false)}
        onJoin={(code) => joinTripMutation.mutate(code)}
        isLoading={joinTripMutation.isPending}
      />
      </div>
      );
      }