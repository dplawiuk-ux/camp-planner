import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { 
  FileText, 
  Camera, 
  Plus, 
  Trash2,
  ExternalLink,
  ChevronDown,
  Image as ImageIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import DocumentUpload from "@/components/documents/DocumentUpload";
import PhotoUpload from "@/components/documents/PhotoUpload";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const categoryIcons = {
  permit: FileText,
  booking: FileText,
  parking_pass: FileText,
  map: FileText,
  directions: FileText,
  photo: Camera,
  other: FileText
};

const categoryColors = {
  permit: "bg-amber-100 text-amber-700 border-amber-200",
  booking: "bg-emerald-100 text-emerald-700 border-emerald-200",
  parking_pass: "bg-blue-100 text-blue-700 border-blue-200",
  map: "bg-purple-100 text-purple-700 border-purple-200",
  directions: "bg-cyan-100 text-cyan-700 border-cyan-200",
  photo: "bg-pink-100 text-pink-700 border-pink-200",
  other: "bg-slate-100 text-slate-700 border-slate-200"
};

export default function TripDocuments({ tripId }) {
  const [showUpload, setShowUpload] = useState(false);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

  const queryClient = useQueryClient();

  const { data: allDocuments = [] } = useQuery({
    queryKey: ['documents'],
    queryFn: () => base44.entities.Document.list('-created_date'),
  });

  const documents = allDocuments.filter(doc => doc.trip_id === tripId);
  const photos = documents.filter(doc => doc.category === 'photo');
  const files = documents.filter(doc => doc.category !== 'photo');

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Document.create({ ...data, trip_id: tripId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      setShowUpload(false);
      setShowPhotoUpload(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Document.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    }
  });

  return (
    <>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CollapsibleTrigger className="flex items-center gap-2 hover:opacity-70 transition-opacity">
                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? '' : '-rotate-90'}`} />
                <CardTitle className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-600" />
                  Documents & Photos
                  {documents.length > 0 && (
                    <Badge variant="outline">{documents.length}</Badge>
                  )}
                </CardTitle>
              </CollapsibleTrigger>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setShowUpload(true)}>
                    <FileText className="w-4 h-4 mr-2" />
                    Upload Document
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowPhotoUpload(true)}>
                    <Camera className="w-4 h-4 mr-2" />
                    Upload Photo
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>

          <CollapsibleContent>
            <CardContent className="space-y-6">
              {/* Photos */}
              {photos.length > 0 && (
                <div>
                  <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-3">
                    <Camera className="w-5 h-5 text-pink-600" />
                    Photos
                    <Badge variant="outline" className="bg-pink-50 text-pink-700 border-pink-200">
                      {photos.length}
                    </Badge>
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <AnimatePresence>
                      {photos.map((photo, index) => (
                        <motion.div
                          key={photo.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ delay: index * 0.05 }}
                          className="relative group aspect-square rounded-lg overflow-hidden bg-slate-100"
                        >
                          <img
                            src={photo.file_url}
                            alt={photo.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-white hover:bg-white/20"
                              onClick={() => window.open(photo.file_url, '_blank')}
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-white hover:bg-red-500/20"
                              onClick={() => deleteMutation.mutate(photo.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {/* Documents */}
              {files.length > 0 && (
                <div>
                  <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-3">
                    <FileText className="w-5 h-5 text-emerald-600" />
                    Documents
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                      {files.length}
                    </Badge>
                  </h3>
                  <div className="space-y-2">
                    <AnimatePresence>
                      {files.map((doc, index) => {
                        const Icon = categoryIcons[doc.category] || FileText;
                        const colorClass = categoryColors[doc.category] || "bg-slate-100 text-slate-700";

                        return (
                          <motion.div
                            key={doc.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ delay: index * 0.05 }}
                            className="p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-3 flex-1 min-w-0">
                                <div className={`p-2 rounded-lg ${colorClass} border flex-shrink-0`}>
                                  <Icon className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-slate-800 truncate">{doc.name}</p>
                                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                                    <Badge variant="outline" className={`text-xs ${colorClass} border`}>
                                      {doc.category.replace('_', ' ')}
                                    </Badge>
                                  </div>
                                  {doc.notes && (
                                    <p className="text-xs text-slate-500 mt-2 line-clamp-2">{doc.notes}</p>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-1 flex-shrink-0">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 text-slate-400 hover:text-emerald-600"
                                  onClick={() => window.open(doc.file_url, '_blank')}
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 text-slate-400 hover:text-red-500"
                                  onClick={() => deleteMutation.mutate(doc.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {/* Empty State */}
              {documents.length === 0 && (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-2xl mb-4">
                    <FileText className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-slate-600 mb-2">No documents or photos yet</p>
                  <p className="text-sm text-slate-500">Upload permits, bookings, maps, or trip photos</p>
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Upload Modals */}
      <DocumentUpload
        open={showUpload}
        onClose={() => setShowUpload(false)}
        onSubmit={(data) => createMutation.mutate(data)}
        isLoading={createMutation.isPending}
        trips={[]}
      />

      <PhotoUpload
        open={showPhotoUpload}
        onClose={() => setShowPhotoUpload(false)}
        onSubmit={(data) => createMutation.mutate(data)}
        trips={[]}
      />
    </>
  );
}