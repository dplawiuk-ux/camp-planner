import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Trash2, 
  Tent, 
  Moon, 
  Flame, 
  Shirt, 
  Shield, 
  Wrench, 
  User, 
  Apple,
  Package,
  CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const categoryConfig = {
  shelter: { icon: Tent, color: "bg-emerald-100 text-emerald-700", label: "Shelter" },
  sleep: { icon: Moon, color: "bg-indigo-100 text-indigo-700", label: "Sleep" },
  cooking: { icon: Flame, color: "bg-orange-100 text-orange-700", label: "Cooking" },
  clothing: { icon: Shirt, color: "bg-pink-100 text-pink-700", label: "Clothing" },
  safety: { icon: Shield, color: "bg-red-100 text-red-700", label: "Safety" },
  tools: { icon: Wrench, color: "bg-slate-100 text-slate-700", label: "Tools" },
  personal: { icon: User, color: "bg-purple-100 text-purple-700", label: "Personal" },
  food: { icon: Apple, color: "bg-amber-100 text-amber-700", label: "Food" },
  other: { icon: Package, color: "bg-gray-100 text-gray-700", label: "Other" }
};

export default function PackingList({ items = [], onUpdate }) {
  const [newItem, setNewItem] = useState("");
  const [newCategory, setNewCategory] = useState("other");
  const [filter, setFilter] = useState("all");

  const handleAddItem = () => {
    if (!newItem.trim()) return;
    const updatedItems = [...items, { name: newItem, category: newCategory, packed: false }];
    onUpdate(updatedItems);
    setNewItem("");
  };

  const handleToggle = (index) => {
    const updatedItems = items.map((item, i) => 
      i === index ? { ...item, packed: !item.packed } : item
    );
    onUpdate(updatedItems);
  };

  const handleDelete = (index) => {
    const updatedItems = items.filter((_, i) => i !== index);
    onUpdate(updatedItems);
  };

  const packedCount = items.filter(item => item.packed).length;
  const progress = items.length > 0 ? Math.round((packedCount / items.length) * 100) : 0;

  const filteredItems = filter === "all" 
    ? items 
    : filter === "packed" 
      ? items.filter(item => item.packed)
      : filter === "unpacked"
        ? items.filter(item => !item.packed)
        : items.filter(item => item.category === filter);

  const groupedItems = filteredItems.reduce((acc, item, index) => {
    const cat = item.category || 'other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push({ ...item, originalIndex: items.indexOf(item) });
    return acc;
  }, {});

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold text-slate-800">
            Packing Checklist
          </CardTitle>
          {items.length > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-500">
                {packedCount} of {items.length} packed
              </span>
              {progress === 100 && (
                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Ready!
                </Badge>
              )}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="mt-4">
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
              />
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Add new item */}
        <div className="flex gap-2">
          <Input
            placeholder="Add item..."
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
            className="h-11 border-slate-200"
          />
          <Select value={newCategory} onValueChange={setNewCategory}>
            <SelectTrigger className="w-36 h-11 border-slate-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(categoryConfig).map(([key, { label }]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleAddItem} className="h-11 bg-emerald-600 hover:bg-emerald-700">
            <Plus className="w-5 h-5" />
          </Button>
        </div>

        {/* Filter */}
        {items.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("all")}
              className={filter === "all" ? "bg-slate-800" : ""}
            >
              All
            </Button>
            <Button
              variant={filter === "unpacked" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("unpacked")}
              className={filter === "unpacked" ? "bg-amber-600" : ""}
            >
              Unpacked
            </Button>
            <Button
              variant={filter === "packed" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("packed")}
              className={filter === "packed" ? "bg-emerald-600" : ""}
            >
              Packed
            </Button>
          </div>
        )}

        {/* Items grouped by category */}
        <div className="space-y-6">
          <AnimatePresence>
            {Object.entries(groupedItems).map(([category, categoryItems]) => {
              const config = categoryConfig[category];
              const Icon = config.icon;
              
              return (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-2"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`p-1.5 rounded-lg ${config.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-medium text-slate-700">{config.label}</span>
                    <span className="text-xs text-slate-400">
                      ({categoryItems.filter(i => i.packed).length}/{categoryItems.length})
                    </span>
                  </div>

                  <div className="space-y-1 pl-2">
                    {categoryItems.map((item) => (
                      <motion.div
                        key={item.originalIndex}
                        layout
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                          item.packed 
                            ? "bg-emerald-50/50" 
                            : "bg-slate-50 hover:bg-slate-100"
                        }`}
                      >
                        <Checkbox
                          checked={item.packed}
                          onCheckedChange={() => handleToggle(item.originalIndex)}
                          className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                        />
                        <span className={`flex-1 ${item.packed ? "line-through text-slate-400" : "text-slate-700"}`}>
                          {item.name}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(item.originalIndex)}
                          className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {items.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No items yet. Start adding gear!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}