import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Camera, X, Download, Trash2, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

export default function PhotoGallery({ photos = [], onDelete, selectedTrip }) {
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const filteredPhotos = selectedTrip === 'all' 
    ? photos 
    : photos.filter(photo => photo.trip_id === selectedTrip);

  return (
    <>
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-slate-800 flex items-center gap-2">
            <Camera className="w-5 h-5 text-emerald-600" />
            Trip Photos
            {filteredPhotos.length > 0 && (
              <Badge variant="outline">{filteredPhotos.length}</Badge>
            )}
          </CardTitle>
        </CardHeader>

        <CardContent>
          {filteredPhotos.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-2xl mb-4">
                <Camera className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-600 mb-2">No photos yet</p>
              <p className="text-sm text-slate-500">Upload photos from your trips</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              <AnimatePresence>
                {filteredPhotos.map((photo, index) => (
                  <motion.div
                    key={photo.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.03 }}
                    className="group relative aspect-square rounded-lg overflow-hidden cursor-pointer bg-slate-100"
                    onClick={() => setSelectedPhoto(photo)}
                  >
                    <img
                      src={photo.file_url}
                      alt={photo.name}
                      className="w-full h-full object-cover transition-transform group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-2 left-2 right-2">
                        <p className="text-white text-xs font-medium truncate">
                          {photo.name}
                        </p>
                      </div>
                    </div>
                    {onDelete && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="absolute top-2 right-2 h-7 w-7 bg-white/90 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Delete this photo?')) {
                            onDelete(photo.id);
                          }
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-600" />
                      </Button>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Photo Lightbox */}
      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-4xl p-0">
          {selectedPhoto && (
            <div className="relative">
              <img
                src={selectedPhoto.file_url}
                alt={selectedPhoto.name}
                className="w-full h-auto max-h-[80vh] object-contain bg-slate-900"
              />
              <div className="absolute top-4 right-4 flex gap-2">
                <Button
                  size="icon"
                  variant="ghost"
                  className="bg-white/90 hover:bg-white"
                  asChild
                >
                  <a href={selectedPhoto.file_url} download target="_blank" rel="noopener noreferrer">
                    <Download className="w-4 h-4" />
                  </a>
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="bg-white/90 hover:bg-white"
                  onClick={() => setSelectedPhoto(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                <h3 className="text-white font-semibold text-lg mb-1">
                  {selectedPhoto.name}
                </h3>
                <div className="flex items-center gap-4 text-sm text-white/80">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(selectedPhoto.created_date), 'MMM d, yyyy')}
                  </div>
                </div>
                {selectedPhoto.notes && (
                  <p className="text-white/90 text-sm mt-2">{selectedPhoto.notes}</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}