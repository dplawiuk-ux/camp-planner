import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { UtensilsCrossed, Plus, Trash2, ChevronDown, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const mealTypes = ['breakfast', 'lunch', 'dinner', 'dessert'];

export default function MealPlanner({ tripId, members = [], startDate, endDate }) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showSharedDialog, setShowSharedDialog] = useState(false);
  const [newItem, setNewItem] = useState({ item_name: '', day_number: 1, meal_type: 'breakfast', assigned_member_id: '' });
  const [newSharedItem, setNewSharedItem] = useState({ item_name: '' });
  const [isOpen, setIsOpen] = useState(true);
  const [isSharedOpen, setIsSharedOpen] = useState(true);

  const queryClient = useQueryClient();

  // Calculate number of days
  const tripDays = startDate && endDate 
    ? Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1 
    : 3;

  const { data: mealItems = [] } = useQuery({
    queryKey: ['mealPlanItems', tripId],
    queryFn: () => base44.entities.MealPlanItem.filter({ trip_id: tripId }),
    enabled: !!tripId
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.MealPlanItem.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mealPlanItems', tripId] });
      setShowAddDialog(false);
      setShowSharedDialog(false);
      setNewItem({ item_name: '', day_number: 1, meal_type: 'breakfast', assigned_member_id: '' });
      setNewSharedItem({ item_name: '' });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.MealPlanItem.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mealPlanItems', tripId] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.MealPlanItem.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mealPlanItems', tripId] });
    }
  });

  const handleAddMealItem = () => {
    if (!newItem.item_name) return;
    createMutation.mutate({
      ...newItem,
      trip_id: tripId,
      is_shared_food: false
    });
  };

  const handleAddSharedFood = () => {
    if (!newSharedItem.item_name) return;
    createMutation.mutate({
      item_name: newSharedItem.item_name,
      trip_id: tripId,
      is_shared_food: true,
      request_status: 'open'
    });
  };

  const handleAcceptRequest = (itemId, memberId) => {
    updateMutation.mutate({
      id: itemId,
      data: { request_status: 'accepted', assigned_member_id: memberId }
    });
  };

  const handleDeclineRequest = (itemId) => {
    updateMutation.mutate({
      id: itemId,
      data: { request_status: 'declined', assigned_member_id: null }
    });
  };

  const getMemberName = (memberId) => {
    const member = members.find(m => m.id === memberId);
    return member?.user_name || member?.user_email || 'Unassigned';
  };

  const regularMeals = mealItems.filter(item => !item.is_shared_food);
  const sharedFoodRequests = mealItems.filter(item => item.is_shared_food && item.request_status === 'open');
  const sharedFoodConfirmed = mealItems.filter(item => item.is_shared_food && item.request_status === 'accepted');

  // Group meals by day and meal type
  const mealsByDay = {};
  for (let day = 1; day <= tripDays; day++) {
    mealsByDay[day] = {};
    mealTypes.forEach(type => {
      mealsByDay[day][type] = regularMeals.filter(
        item => item.day_number === day && item.meal_type === type
      );
    });
  }

  return (
    <div className="space-y-6">
      {/* Meal Plan by Day */}
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CollapsibleTrigger className="flex items-center gap-2 hover:opacity-70 transition-opacity">
                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? '' : '-rotate-90'}`} />
                <CardTitle className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                  <UtensilsCrossed className="w-5 h-5 text-orange-600" />
                  Meal Plan
                </CardTitle>
              </CollapsibleTrigger>
              <Button
                onClick={() => setShowAddDialog(true)}
                size="icon"
                className="h-8 w-8 bg-orange-600 hover:bg-orange-700"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>

          <CollapsibleContent>
            <CardContent className="space-y-6">
              {Array.from({ length: tripDays }, (_, i) => i + 1).map((day) => (
                <div key={day} className="border border-slate-200 rounded-lg p-4 bg-white">
                  <h3 className="font-semibold text-slate-800 mb-4">Day {day}</h3>
                  <div className="space-y-4">
                    {mealTypes.map((mealType) => (
                      <div key={mealType} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="capitalize">
                            {mealType}
                          </Badge>
                        </div>
                        {mealsByDay[day][mealType].length > 0 ? (
                          <div className="ml-4 space-y-1">
                            <AnimatePresence>
                              {mealsByDay[day][mealType].map((item) => (
                                <motion.div
                                  key={item.id}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  exit={{ opacity: 0, x: 10 }}
                                  className="flex items-center justify-between py-1 group"
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm text-slate-700">• {item.item_name}</span>
                                    {item.assigned_member_id && (
                                      <Badge variant="secondary" className="text-xs">
                                        {getMemberName(item.assigned_member_id)}
                                      </Badge>
                                    )}
                                  </div>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => deleteMutation.mutate(item.id)}
                                    className="h-6 w-6 opacity-0 group-hover:opacity-100 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </motion.div>
                              ))}
                            </AnimatePresence>
                          </div>
                        ) : (
                          <p className="ml-4 text-sm text-slate-400 italic">No items planned</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Shared Food */}
      <Collapsible open={isSharedOpen} onOpenChange={setIsSharedOpen}>
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CollapsibleTrigger className="flex items-center gap-2 hover:opacity-70 transition-opacity">
                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isSharedOpen ? '' : '-rotate-90'}`} />
                <CardTitle className="text-xl font-semibold text-slate-800">Shared Food</CardTitle>
              </CollapsibleTrigger>
              <Button
                onClick={() => setShowSharedDialog(true)}
                size="icon"
                className="h-8 w-8 bg-amber-600 hover:bg-amber-700"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>

          <CollapsibleContent>
            <CardContent className="space-y-6">
              {/* Open Requests */}
              {sharedFoodRequests.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-3">Open Requests</h4>
                  <div className="space-y-2">
                    {sharedFoodRequests.map((item) => (
                      <div
                        key={item.id}
                        className="border border-slate-200 rounded-lg p-3 bg-white flex items-center justify-between"
                      >
                        <span className="text-sm text-slate-700">{item.item_name}</span>
                        <div className="flex gap-2">
                          <Select
                            onValueChange={(memberId) => handleAcceptRequest(item.id, memberId)}
                          >
                            <SelectTrigger className="h-8 w-32 text-xs">
                              <SelectValue placeholder="I'll bring it" />
                            </SelectTrigger>
                            <SelectContent>
                              {members.map((member) => (
                                <SelectItem key={member.id} value={member.id}>
                                  {member.user_name || member.user_email}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => deleteMutation.mutate(item.id)}
                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Confirmed Items */}
              {sharedFoodConfirmed.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-3">Confirmed</h4>
                  <div className="space-y-2">
                    {sharedFoodConfirmed.map((item) => (
                      <div
                        key={item.id}
                        className="border border-green-200 rounded-lg p-3 bg-green-50 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-slate-700">{item.item_name}</span>
                          <Badge variant="secondary" className="text-xs">
                            {getMemberName(item.assigned_member_id)}
                          </Badge>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDeclineRequest(item.id)}
                          className="h-8 w-8 text-slate-600 hover:text-slate-700 hover:bg-slate-100"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {sharedFoodRequests.length === 0 && sharedFoodConfirmed.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <p className="text-sm">No shared food items yet</p>
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Add Meal Item Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Meal Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="day">Day</Label>
              <Select
                value={String(newItem.day_number)}
                onValueChange={(value) => setNewItem({ ...newItem, day_number: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: tripDays }, (_, i) => i + 1).map((day) => (
                    <SelectItem key={day} value={String(day)}>
                      Day {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="meal-type">Meal Type</Label>
              <Select
                value={newItem.meal_type}
                onValueChange={(value) => setNewItem({ ...newItem, meal_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select meal type" />
                </SelectTrigger>
                <SelectContent>
                  {mealTypes.map((type) => (
                    <SelectItem key={type} value={type} className="capitalize">
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="item-name">Food Item</Label>
              <Input
                id="item-name"
                placeholder="e.g., Beef fajitas"
                value={newItem.item_name}
                onChange={(e) => setNewItem({ ...newItem, item_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="member">Assigned To</Label>
              <Select
                value={newItem.assigned_member_id}
                onValueChange={(value) => setNewItem({ ...newItem, assigned_member_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select member (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>Unassigned</SelectItem>
                  {members.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.user_name || member.user_email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddMealItem}
              disabled={!newItem.item_name || createMutation.isPending}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Add Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Shared Food Dialog */}
      <Dialog open={showSharedDialog} onOpenChange={setShowSharedDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Request Shared Food</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="shared-item-name">Food Item</Label>
              <Input
                id="shared-item-name"
                placeholder="e.g., Ground Coffee, Ice, Marshmallows"
                value={newSharedItem.item_name}
                onChange={(e) => setNewSharedItem({ item_name: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSharedDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddSharedFood}
              disabled={!newSharedItem.item_name || createMutation.isPending}
              className="bg-amber-600 hover:bg-amber-700"
            >
              Request Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}