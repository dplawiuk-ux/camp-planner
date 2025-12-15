import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Search, 
  Plus,
  Loader2,
  Filter
} from "lucide-react";
import { motion } from "framer-motion";
import DocumentUpload from "@/components/documents/DocumentUpload";
import DocumentCard from "@/components/documents/DocumentCard";

export default function Documents() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [tripFilter, setTripFilter] = useState("all");
  const [showUpload, setShowUpload] = useState(false);

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

  const { data: allDocuments = [], isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: () => base44.entities.Document.list('-created_date'),
  });

  // Filter documents: show if user is member of the trip OR if no trip assigned and user created it
  const documents = allDocuments.filter(doc => {
    if (doc.trip_id) {
      return myMemberships.some(m => m.trip_id === doc.trip_id);
    }
    return doc.created_by === user?.email;
  });

  const { data: allTrips = [] } = useQuery({
    queryKey: ['trips'],
    queryFn: () => base44.entities.Trip.list('-created_date'),
  });

  // Filter to only show trips user is a member of
  const trips = allTrips.filter(trip => 
    myMemberships.some(m => m.trip_id === trip.id)
  );

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Document.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      setShowUpload(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Document.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    }
  });

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || doc.category === categoryFilter;
    const matchesTrip = tripFilter === "all" || doc.trip_id === tripFilter;
    return matchesSearch && matchesCategory && matchesTrip;
  });

  const categories = [
    { value: "all", label: "All" },
    { value: "permit", label: "Permits" },
    { value: "booking", label: "Bookings" },
    { value: "parking_pass", label: "Parking Passes" },
    { value: "map", label: "Maps" },
    { value: "directions", label: "Directions" },
    { value: "other", label: "Other" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-emerald-50/30">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-800 to-emerald-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-white/10 backdrop-blur-sm rounded-2xl">
                <FileText className="w-8 h-8" />
              </div>
              <span className="text-emerald-200 font-medium">Files & Documents</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Documents
            </h1>
            <p className="text-emerald-100 text-lg max-w-xl">
              Store and organize permits, bookings, maps, and other trip documents
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Search & Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-10">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 bg-white border-slate-200 rounded-xl"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <Button
                key={cat.value}
                variant={categoryFilter === cat.value ? "default" : "outline"}
                size="sm"
                onClick={() => setCategoryFilter(cat.value)}
                className={categoryFilter === cat.value ? "bg-emerald-600" : ""}
              >
                {cat.label}
              </Button>
            ))}
          </div>

          <Button
            onClick={() => setShowUpload(true)}
            className="bg-emerald-600 hover:bg-emerald-700 whitespace-nowrap"
          >
            <Plus className="w-5 h-5 mr-2" />
            Upload Document
          </Button>
        </div>

        {/* Trip Filter */}
        {trips.length > 0 && (
          <div className="mb-6 flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-slate-500" />
            <span className="text-sm text-slate-600">Filter by trip:</span>
            <Button
              variant={tripFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setTripFilter("all")}
              className={tripFilter === "all" ? "bg-slate-800" : ""}
            >
              All Trips
            </Button>
            {trips.map((trip) => (
              <Button
                key={trip.id}
                variant={tripFilter === trip.id ? "default" : "outline"}
                size="sm"
                onClick={() => setTripFilter(trip.id)}
                className={tripFilter === trip.id ? "bg-emerald-600" : ""}
              >
                {trip.name}
              </Button>
            ))}
          </div>
        )}

        {/* Documents Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          </div>
        ) : filteredDocuments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocuments.map((doc, index) => (
              <DocumentCard
                key={doc.id}
                document={doc}
                index={index}
                onDelete={() => deleteMutation.mutate(doc.id)}
                trip={trips.find(t => t.id === doc.trip_id)}
              />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-24"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 rounded-3xl mb-6">
              <FileText className="w-10 h-10 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-semibold text-slate-800 mb-2">
              {searchQuery || categoryFilter !== "all" || tripFilter !== "all"
                ? "No documents found" 
                : "No documents yet"}
            </h3>
            <p className="text-slate-500 mb-8">
              {searchQuery || categoryFilter !== "all" || tripFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Upload permits, bookings, maps and other trip documents"}
            </p>
            {!searchQuery && categoryFilter === "all" && tripFilter === "all" && (
              <Button
                onClick={() => setShowUpload(true)}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Upload First Document
              </Button>
            )}
          </motion.div>
        )}
      </div>

      {/* Upload Modal */}
      <DocumentUpload
        open={showUpload}
        onClose={() => setShowUpload(false)}
        onSubmit={(data) => createMutation.mutate(data)}
        isLoading={createMutation.isPending}
        trips={trips}
      />
    </div>
  );
}