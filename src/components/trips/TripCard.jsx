import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, CheckCircle2, Circle } from "lucide-react";
import { format, differenceInDays, isPast, isFuture } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";

export default function TripCard({ trip, index }) {
  const startDate = new Date(trip.start_date);
  const endDate = trip.end_date ? new Date(trip.end_date) : null;
  const daysUntil = differenceInDays(startDate, new Date());
  
  const packedCount = trip.packing_items?.filter(item => item.packed).length || 0;
  const totalItems = trip.packing_items?.length || 0;
  const packingProgress = totalItems > 0 ? Math.round((packedCount / totalItems) * 100) : 0;

  const statusColors = {
    planning: "bg-amber-100 text-amber-800 border-amber-200",
    upcoming: "bg-emerald-100 text-emerald-800 border-emerald-200",
    completed: "bg-slate-100 text-slate-600 border-slate-200"
  };

  const defaultImages = [
    "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80",
    "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=800&q=80",
    "https://images.unsplash.com/photo-1537905569824-f89f14cceb68?w=800&q=80"
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Link to={createPageUrl("TripDetails") + `?id=${trip.id}`}>
        <Card className="group overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer bg-white">
          <div className="relative h-48 overflow-hidden">
            <img
              src={trip.image_url || defaultImages[index % 3]}
              alt={trip.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <Badge className={`absolute top-4 right-4 ${statusColors[trip.status]} border`}>
              {trip.status}
            </Badge>
            {daysUntil > 0 && daysUntil <= 14 && trip.status !== 'completed' && (
              <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <span className="text-sm font-semibold text-emerald-700">
                  {daysUntil} days away
                </span>
              </div>
            )}
          </div>
          
          <CardContent className="p-5">
            <h3 className="text-xl font-semibold text-slate-800 mb-2 group-hover:text-emerald-700 transition-colors">
              {trip.name}
            </h3>
            
            <div className="flex items-center gap-2 text-slate-500 mb-3">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span className="text-sm">{trip.location}</span>
            </div>
            
            <div className="flex items-center gap-2 text-slate-500 mb-4">
              <Calendar className="w-4 h-4 text-amber-600" />
              <span className="text-sm">
                {format(startDate, "MMM d")}
                {endDate && ` - ${format(endDate, "MMM d, yyyy")}`}
              </span>
            </div>

            {totalItems > 0 && (
              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                    Packing Progress
                  </span>
                  <span className="text-sm font-semibold text-slate-700">
                    {packedCount}/{totalItems}
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${packingProgress}%` }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}