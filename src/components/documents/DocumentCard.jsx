import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Download, 
  Trash2,
  ExternalLink,
  FileImage,
  File
} from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

const categoryColors = {
  permit: "bg-red-100 text-red-700 border-red-200",
  booking: "bg-blue-100 text-blue-700 border-blue-200",
  parking_pass: "bg-purple-100 text-purple-700 border-purple-200",
  map: "bg-green-100 text-green-700 border-green-200",
  directions: "bg-amber-100 text-amber-700 border-amber-200",
  other: "bg-slate-100 text-slate-700 border-slate-200"
};

const categoryLabels = {
  permit: "Permit",
  booking: "Booking",
  parking_pass: "Parking Pass",
  map: "Map",
  directions: "Directions",
  other: "Other"
};

export default function DocumentCard({ document, index, onDelete, trip }) {
  const isImage = document.file_type?.includes('image') || 
                  /\.(jpg|jpeg|png|gif|webp)$/i.test(document.file_url);
  const isPDF = document.file_type?.includes('pdf') || 
                document.file_url?.toLowerCase().endsWith('.pdf');

  const Icon = isImage ? FileImage : isPDF ? FileText : File;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="group hover:shadow-lg transition-all bg-white border-slate-200 overflow-hidden">
        {/* Preview */}
        <div className="relative h-48 bg-slate-100 overflow-hidden">
          {isImage ? (
            <img
              src={document.file_url}
              alt={document.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Icon className="w-16 h-16 text-slate-300" />
            </div>
          )}
          <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => window.open(document.file_url, '_blank')}
              className="h-8 w-8 bg-white/90 hover:bg-white"
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={onDelete}
              className="h-8 w-8 bg-white/90 hover:bg-white text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-slate-800 line-clamp-1">
              {document.name}
            </h3>
            <Badge className={`${categoryColors[document.category]} border text-xs whitespace-nowrap`}>
              {categoryLabels[document.category]}
            </Badge>
          </div>

          {trip && (
            <div className="mb-2">
              <Badge variant="outline" className="text-xs">
                {trip.name}
              </Badge>
            </div>
          )}

          {document.notes && (
            <p className="text-sm text-slate-600 line-clamp-2 mb-3">
              {document.notes}
            </p>
          )}

          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>{format(new Date(document.created_date), 'MMM d, yyyy')}</span>
            <a
              href={document.file_url}
              download
              className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700"
            >
              <Download className="w-3 h-3" />
              Download
            </a>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}