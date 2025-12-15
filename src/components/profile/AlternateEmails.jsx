import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Mail, Plus, Trash2, Loader2, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AlternateEmails({ open, onClose }) {
  const [newEmail, setNewEmail] = useState("");
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const updateEmailsMutation = useMutation({
    mutationFn: (emails) => base44.auth.updateMe({ alternate_emails: emails }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      queryClient.refetchQueries({ queryKey: ['myMemberships'] });
      setNewEmail("");
    }
  });

  const handleAddEmail = () => {
    if (!newEmail.trim() || !newEmail.includes('@')) return;
    
    const currentEmails = user?.alternate_emails || [];
    if (currentEmails.includes(newEmail) || user?.email === newEmail) {
      return;
    }
    
    updateEmailsMutation.mutate([...currentEmails, newEmail.toLowerCase().trim()]);
  };

  const handleRemoveEmail = (emailToRemove) => {
    const currentEmails = user?.alternate_emails || [];
    updateEmailsMutation.mutate(currentEmails.filter(e => e !== emailToRemove));
  };

  const alternateEmails = user?.alternate_emails || [];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-600" />
            Email Addresses
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Primary Email */}
          <div>
            <Label className="text-xs text-slate-500 mb-2 block">Primary Email</Label>
            <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
              <Mail className="w-4 h-4 text-emerald-600" />
              <span className="text-sm text-slate-700">{user?.email}</span>
              <Badge variant="secondary" className="ml-auto bg-emerald-100 text-emerald-700">
                Primary
              </Badge>
            </div>
          </div>

          {/* Alternate Emails */}
          <div>
            <Label className="text-xs text-slate-500 mb-2 block">
              Alternate Emails
              {alternateEmails.length > 0 && (
                <span className="ml-1 text-slate-400">({alternateEmails.length})</span>
              )}
            </Label>
            
            <div className="space-y-2 mb-3">
              <AnimatePresence>
                {alternateEmails.map((email, index) => (
                  <motion.div
                    key={email}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200"
                  >
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-700 flex-1">{email}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveEmail(email)}
                      disabled={updateEmailsMutation.isPending}
                      className="h-7 w-7 text-slate-400 hover:text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Add Email Form */}
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="additional@email.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddEmail()}
                className="h-10"
              />
              <Button
                onClick={handleAddEmail}
                disabled={!newEmail.trim() || updateEmailsMutation.isPending}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
              >
                {updateEmailsMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Email
                  </>
                )}
              </Button>
            </div>

            <p className="text-xs text-slate-500 mt-3">
              Add alternate emails to receive trip invitations at different addresses
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}