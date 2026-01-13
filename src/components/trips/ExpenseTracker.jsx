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
import { DollarSign, Plus, Trash2, Download, ChevronDown, Receipt, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import ImageUpload from "@/components/shared/ImageUpload";

const categoryConfig = {
  food: { label: "Food", color: "bg-orange-100 text-orange-700 border-orange-200" },
  accommodation: { label: "Accommodation", color: "bg-purple-100 text-purple-700 border-purple-200" },
  gear_rental: { label: "Gear Rental", color: "bg-blue-100 text-blue-700 border-blue-200" },
  transportation: { label: "Transportation", color: "bg-green-100 text-green-700 border-green-200" },
  permits: { label: "Permits", color: "bg-amber-100 text-amber-700 border-amber-200" },
  activities: { label: "Activities", color: "bg-pink-100 text-pink-700 border-pink-200" },
  other: { label: "Other", color: "bg-slate-100 text-slate-700 border-slate-200" }
};

export default function ExpenseTracker({ tripId, members = [], currentUserEmail }) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    category: 'other',
    paid_by_member_id: '',
    split_between: [],
    date: format(new Date(), 'yyyy-MM-dd'),
    receipt_url: ''
  });
  const [isOpen, setIsOpen] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const queryClient = useQueryClient();

  const { data: expenses = [] } = useQuery({
    queryKey: ['expenses', tripId],
    queryFn: () => base44.entities.Expense.filter({ trip_id: tripId }),
    enabled: !!tripId
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Expense.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses', tripId] });
      setShowAddDialog(false);
      resetForm();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Expense.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses', tripId] });
      setShowAddDialog(false);
      setEditingExpense(null);
      resetForm();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Expense.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses', tripId] });
    }
  });

  const resetForm = () => {
    setNewExpense({
      description: '',
      amount: '',
      category: 'other',
      paid_by_member_id: '',
      split_between: [],
      date: format(new Date(), 'yyyy-MM-dd'),
      receipt_url: ''
    });
  };

  const handleSubmit = () => {
    const expenseData = {
      ...newExpense,
      trip_id: tripId,
      amount: parseFloat(newExpense.amount)
    };

    if (editingExpense) {
      updateMutation.mutate({ id: editingExpense.id, data: expenseData });
    } else {
      createMutation.mutate(expenseData);
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setNewExpense({
      description: expense.description,
      amount: expense.amount.toString(),
      category: expense.category,
      paid_by_member_id: expense.paid_by_member_id,
      split_between: expense.split_between || [],
      date: expense.date || format(new Date(), 'yyyy-MM-dd'),
      receipt_url: expense.receipt_url || ''
    });
    setShowAddDialog(true);
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await base44.functions.invoke('exportExpenses', { 
        tripId,
        expenses: expenses.map(exp => ({
          ...exp,
          paid_by_name: getMemberName(exp.paid_by_member_id),
          split_names: (exp.split_between || []).map(id => getMemberName(id))
        }))
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `trip-expenses-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const getMemberName = (memberId) => {
    const member = members.find(m => m.id === memberId);
    return member?.user_name || 'Unknown';
  };

  const toggleSplitMember = (memberId) => {
    setNewExpense(prev => ({
      ...prev,
      split_between: prev.split_between.includes(memberId)
        ? prev.split_between.filter(id => id !== memberId)
        : [...prev.split_between, memberId]
    }));
  };

  // Filter out members excluded from expenses
  const expenseMembers = members.filter(m => !m.excluded_from_expenses);
  
  // Calculate totals
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  
  // Calculate per-member breakdown
  const memberBalances = {};
  expenseMembers.forEach(member => {
    memberBalances[member.id] = { paid: 0, owes: 0, name: member.user_name };
  });

  expenses.forEach(expense => {
    // Add to what they paid
    if (memberBalances[expense.paid_by_member_id]) {
      memberBalances[expense.paid_by_member_id].paid += expense.amount;
    }

    // Calculate what they owe (split)
    const splitCount = expense.split_between?.length || 0;
    if (splitCount > 0) {
      const perPerson = expense.amount / splitCount;
      expense.split_between.forEach(memberId => {
        if (memberBalances[memberId]) {
          memberBalances[memberId].owes += perPerson;
        }
      });
    }
  });

  // Group expenses by category
  const expensesByCategory = expenses.reduce((acc, exp) => {
    if (!acc[exp.category]) acc[exp.category] = [];
    acc[exp.category].push(exp);
    return acc;
  }, {});

  return (
    <>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CollapsibleTrigger className="flex items-center gap-2 hover:opacity-70 transition-opacity">
                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? '' : '-rotate-90'}`} />
                <div>
                  <CardTitle className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    Expense Tracker
                  </CardTitle>
                  <p className="text-sm text-slate-500 mt-1">
                    ${totalExpenses.toFixed(2)} total • {expenses.length} expense{expenses.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </CollapsibleTrigger>
              <div className="flex gap-2">
                <Button
                  onClick={handleExport}
                  variant="outline"
                  size="sm"
                  disabled={expenses.length === 0 || isExporting}
                  className="h-8"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {isExporting ? 'Exporting...' : 'Export'}
                </Button>
                <Button
                  onClick={() => setShowAddDialog(true)}
                  size="icon"
                  className="h-8 w-8 bg-green-600 hover:bg-green-700"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CollapsibleContent>
            <CardContent className="space-y-6">
              {/* Member Balances */}
              {Object.keys(memberBalances).length > 0 && (
                <div className="bg-slate-50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Member Balances
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {Object.values(memberBalances).map((balance) => {
                      const netBalance = balance.paid - balance.owes;
                      return (
                        <div key={balance.name} className="bg-white rounded-lg p-3 border border-slate-200">
                          <p className="font-medium text-slate-800 text-sm mb-2">{balance.name}</p>
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between text-slate-600">
                              <span>Paid:</span>
                              <span className="font-medium">${balance.paid.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-slate-600">
                              <span>Owes:</span>
                              <span className="font-medium">${balance.owes.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between pt-1 border-t border-slate-200">
                              <span className="font-semibold">Balance:</span>
                              <span className={`font-semibold ${netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {netBalance >= 0 ? '+' : ''}{netBalance.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Expenses List */}
              {expenses.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <DollarSign className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p>No expenses yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(expensesByCategory).map(([category, categoryExpenses]) => (
                    <div key={category} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge className={`${categoryConfig[category].color} border`}>
                          {categoryConfig[category].label}
                        </Badge>
                        <span className="text-sm text-slate-500">
                          ${categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0).toFixed(2)}
                        </span>
                      </div>
                      <div className="space-y-2 ml-4">
                        <AnimatePresence>
                          {categoryExpenses.map((expense) => (
                            <motion.div
                              key={expense.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="bg-white border border-slate-200 rounded-lg p-3 hover:border-slate-300 transition-colors"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <button
                                      onClick={() => handleEdit(expense)}
                                      className="font-medium text-slate-800 hover:text-slate-600"
                                    >
                                      {expense.description}
                                    </button>
                                    {expense.receipt_url && (
                                      <Receipt className="w-3 h-3 text-slate-400" />
                                    )}
                                  </div>
                                  <div className="flex items-center gap-3 text-xs text-slate-500">
                                    <span>Paid by {getMemberName(expense.paid_by_member_id)}</span>
                                    {expense.split_between?.length > 0 && (
                                      <span>• Split {expense.split_between.length} ways</span>
                                    )}
                                    {expense.date && (
                                      <span>• {format(new Date(expense.date), 'MMM d')}</span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-green-600">
                                    ${expense.amount.toFixed(2)}
                                  </span>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => deleteMutation.mutate(expense.id)}
                                    className="h-6 w-6 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Add/Edit Expense Dialog */}
      <Dialog open={showAddDialog} onOpenChange={(open) => {
        setShowAddDialog(open);
        if (!open) {
          setEditingExpense(null);
          resetForm();
        }
      }}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingExpense ? 'Edit Expense' : 'Add Expense'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="e.g., Groceries at camp"
                value={newExpense.description}
                onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={newExpense.date}
                  onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={newExpense.category}
                onValueChange={(value) => setNewExpense({ ...newExpense, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(categoryConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paid-by">Paid By</Label>
              <Select
                value={newExpense.paid_by_member_id}
                onValueChange={(value) => setNewExpense({ ...newExpense, paid_by_member_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select member" />
                </SelectTrigger>
                <SelectContent>
                  {expenseMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.user_name || 'Unnamed'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Split Between</Label>
              <div className="space-y-2 max-h-40 overflow-y-auto border border-slate-200 rounded-lg p-3">
                {expenseMembers.map((member) => (
                  <div key={member.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`split-${member.id}`}
                      checked={newExpense.split_between.includes(member.id)}
                      onCheckedChange={() => toggleSplitMember(member.id)}
                    />
                    <label
                      htmlFor={`split-${member.id}`}
                      className="text-sm text-slate-700 cursor-pointer"
                    >
                      {member.user_name || 'Unnamed'}
                    </label>
                  </div>
                ))}
              </div>
              {newExpense.split_between.length > 0 && (
                <p className="text-xs text-slate-500">
                  ${newExpense.amount ? (parseFloat(newExpense.amount) / newExpense.split_between.length).toFixed(2) : '0.00'} per person
                </p>
              )}
            </div>

            <ImageUpload
              label="Receipt (optional)"
              value={newExpense.receipt_url}
              onChange={(url) => setNewExpense({ ...newExpense, receipt_url: url })}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowAddDialog(false);
              setEditingExpense(null);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!newExpense.description || !newExpense.amount || !newExpense.paid_by_member_id || createMutation.isPending || updateMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {editingExpense ? 'Update' : 'Add'} Expense
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}