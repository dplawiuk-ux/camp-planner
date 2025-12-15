import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Tent, Mountain, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import TripCard from "@/components/trips/TripCard";
import TripForm from "@/components/trips/TripForm";

export default function CampingTrips() {
  const [showForm, setShowForm] = useState(false);
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
      return base44.entities.TripMember.filter({ user_email: user.email });
    },
    enabled: !!user
  });

  const { data: allTrips = [], isLoading } = useQuery({
    queryKey: ['trips'],
    queryFn: () => base44.entities.Trip.list('-created_date'),
  });

  // Filter to only show trips where user is a member
  const trips = allTrips.filter(trip => 
    myMemberships.some(m => m.trip_id === trip.id)
  );

  const createMutation = useMutation({
    mutationFn: async ({ tripData, invitations }) => {
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
      
      // Add invited members
      if (invitations && invitations.length > 0) {
        await base44.entities.TripMember.bulkCreate(
          invitations.map(inv => ({
            trip_id: trip.id,
            user_email: inv.email,
            role: inv.role,
            status: 'pending'
          }))
        );
      }
      
      return trip;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['myMemberships'] });
      setShowForm(false);
    }
  });

  const filteredTrips = trips.filter(trip => {
    const matchesSearch = trip.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         trip.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || trip.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-emerald-50/30">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-800 to-emerald-900 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-20 w-96 h-96 bg-amber-400 rounded-full blur-3xl" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-4"
          >
            <div className="p-3 bg-white/10 backdrop-blur-sm rounded-2xl">
              <Tent className="w-8 h-8" />
            </div>
            <span className="text-emerald-200 font-medium">Adventure Awaits</span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold mb-4"
          >
            Your Camping
            <br />
            <span className="text-amber-300">Adventures</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-emerald-100 text-lg max-w-xl mb-8"
          >
            Plan your perfect outdoor escape. Track gear, organize trips, and never forget essentials again.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Button
              onClick={() => setShowForm(true)}
              size="lg"
              className="bg-white text-emerald-800 hover:bg-emerald-50 font-semibold px-8 h-14 rounded-xl shadow-lg shadow-emerald-900/30"
            >
              <Plus className="w-5 h-5 mr-2" />
              Plan New Trip
            </Button>
          </motion.div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-stone-50 to-transparent" />
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Search trips..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 bg-white border-slate-200 rounded-xl"
            />
          </div>
          
          <Tabs value={statusFilter} onValueChange={setStatusFilter}>
            <TabsList className="h-12 bg-white border border-slate-200 p-1 rounded-xl">
              <TabsTrigger value="all" className="rounded-lg px-6">All</TabsTrigger>
              <TabsTrigger value="planning" className="rounded-lg px-6">Planning</TabsTrigger>
              <TabsTrigger value="upcoming" className="rounded-lg px-6">Upcoming</TabsTrigger>
              <TabsTrigger value="completed" className="rounded-lg px-6">Completed</TabsTrigger>
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
    </div>
  );
}