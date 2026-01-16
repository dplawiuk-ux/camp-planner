import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { 
  Plus, 
  Search, 
  Tent,
  Moon,
  Flame,
  Droplets,
  Ship,
  Package,
  Loader2,
  Edit3,
  Trash2,
  Camera,
  UtensilsCrossed
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from 'react-i18next';
import EquipmentForm from "@/components/shed/EquipmentForm";
import PhotoRecognition from "@/components/shed/PhotoRecognition";
import TopNavBar from "@/components/layout/TopNavBar";

const equipmentIcons = {
  tents: Tent,
  watercraft: Ship,
  sleeping: Moon,
  fire: Flame,
  water: Droplets,
  kitchen: UtensilsCrossed,
  other: Package
};

const equipmentColors = {
  tents: "bg-emerald-100 text-emerald-700",
  watercraft: "bg-cyan-100 text-cyan-700",
  sleeping: "bg-purple-100 text-purple-700",
  fire: "bg-orange-100 text-orange-700",
  water: "bg-blue-100 text-blue-700",
  kitchen: "bg-amber-100 text-amber-700",
  other: "bg-slate-100 text-slate-700"
};

const typeOrder = ['tents', 'watercraft', 'sleeping', 'fire', 'water', 'kitchen', 'other'];

export default function Shed() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showPhotoRecognition, setShowPhotoRecognition] = useState(false);

  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: equipment = [], isLoading } = useQuery({
    queryKey: ['equipment'],
    queryFn: async () => {
      if (!user) return [];
      return base44.entities.Equipment.filter({ created_by: user.email }, '-created_date');
    },
    enabled: !!user
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Equipment.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      setShowForm(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Equipment.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      setShowForm(false);
      setEditingItem(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Equipment.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
    }
  });

  const handleSubmit = (data) => {
    if (editingItem?.id) {
      updateMutation.mutate({ id: editingItem.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handlePhotoRecognized = (recognizedData) => {
    setEditingItem(recognizedData);
    setShowForm(true);
  };

  const filteredEquipment = equipment.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || item.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const groupedEquipment = filteredEquipment.reduce((acc, item) => {
    if (!acc[item.type]) acc[item.type] = [];
    acc[item.type].push(item);
    return acc;
  }, {});

  const uniqueTypes = typeOrder;

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
        <DropdownMenuItem onClick={() => {
          setEditingItem(null);
          setShowForm(true);
        }}>
          <Plus className="w-4 h-4 mr-2" />
          Add Gear
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setShowPhotoRecognition(true)}>
          <Camera className="w-4 h-4 mr-2" />
          Scan Photo
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-emerald-50/30 pt-14">
      <TopNavBar title={t('shed.title')} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Actions Bar */}
        <div className="flex gap-3 mb-10">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder={t('shed.searchGear', 'Search My Gear')}
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
              <DropdownMenuItem onClick={() => {
                setEditingItem(null);
                setShowForm(true);
              }}>
                <Plus className="w-4 h-4 mr-2" />
                {t('shed.addEquipment')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowPhotoRecognition(true)}>
                <Camera className="w-4 h-4 mr-2" />
                {t('shed.scanPhoto')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

        </div>

        <div className="flex gap-1.5 mb-10 overflow-x-auto">
          <Button
            variant={typeFilter === "all" ? "default" : "outline"}
            onClick={() => setTypeFilter("all")}
            className={`h-9 px-3 text-sm flex-shrink-0 ${typeFilter === "all" ? "bg-slate-800" : ""}`}
          >
            {t('common.all')}
          </Button>
          {uniqueTypes.map((type) => {
            const Icon = equipmentIcons[type];
            return (
              <Button
                key={type}
                size="icon"
                variant={typeFilter === type ? "default" : "outline"}
                onClick={() => setTypeFilter(type)}
                className={`h-9 w-9 flex-shrink-0 ${typeFilter === type ? "bg-emerald-600" : ""}`}
                title={t(`gear.types.${type}`)}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
              </Button>
            );
          })}
        </div>

        {/* Equipment Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          </div>
        ) : filteredEquipment.length > 0 ? (
          <div className="space-y-8">
            {typeOrder.filter(type => groupedEquipment[type]).map((type) => {
              const items = groupedEquipment[type];
              const Icon = equipmentIcons[type] || Package;
              const colorClass = equipmentColors[type] || "bg-slate-100 text-slate-700";
              
              return (
                <div key={type}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-lg ${colorClass}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-semibold text-slate-800 capitalize">
                      {t(`gear.types.${type}`)}
                    </h2>
                    <Badge variant="outline">{items.length}</Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <AnimatePresence>
                      {items.map((item, index) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Card 
                            className="group hover:shadow-lg transition-all bg-white border-slate-200 cursor-pointer"
                            onClick={() => handleEdit(item)}
                          >
                            <CardHeader className="pb-3">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h3 className="font-semibold text-slate-800 mb-1">
                                    {item.name}
                                  </h3>
                                  {item.capacity && (
                                    <Badge variant="outline" className="text-xs">
                                      {t('tent.capacity')}: {item.capacity}
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEdit(item);
                                    }}
                                    className="h-8 w-8"
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteMutation.mutate(item.id);
                                    }}
                                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardHeader>
                            {(item.notes || item.image_url) && (
                              <CardContent className="pt-0">
                                {item.image_url && (
                                  <img
                                    src={item.image_url}
                                    alt={item.name}
                                    className="w-full h-32 object-cover rounded-lg mb-2"
                                  />
                                )}
                                {item.notes && (
                                  <p className="text-sm text-slate-600 line-clamp-2">
                                    {item.notes}
                                  </p>
                                )}
                              </CardContent>
                            )}
                          </Card>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-24"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 rounded-3xl mb-6">
              <Package className="w-10 h-10 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-semibold text-slate-800 mb-2">
              {searchQuery || typeFilter !== "all" 
                ? t('shed.noEquipmentFound')
                : t('shed.gearShedEmpty')}
            </h3>
            <p className="text-slate-500 mb-8">
              {searchQuery || typeFilter !== "all"
                ? t('shed.tryAdjusting')
                : t('shed.startAdding')}
            </p>
            {!searchQuery && typeFilter === "all" && (
              <Button
                onClick={() => setShowForm(true)}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                {t('shed.addFirstItem')}
              </Button>
            )}
          </motion.div>
        )}
      </div>

      {/* Photo Recognition Modal */}
      <PhotoRecognition
        open={showPhotoRecognition}
        onClose={() => setShowPhotoRecognition(false)}
        onRecognized={handlePhotoRecognized}
      />

      {/* Equipment Form Modal */}
      <EquipmentForm
        key={editingItem?.id || 'new'}
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingItem(null);
        }}
        onSubmit={handleSubmit}
        initialData={editingItem}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}