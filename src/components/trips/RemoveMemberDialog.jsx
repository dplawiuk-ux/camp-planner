import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ShieldAlert, Loader2 } from "lucide-react";

export default function RemoveMemberDialog({ open, onClose, member, onConfirm, isLoading }) {
  const [lockOut, setLockOut] = useState(false);

  const handleConfirm = () => {
    onConfirm(lockOut);
    setLockOut(false);
  };

  const handleClose = () => {
    setLockOut(false);
    onClose();
  };

  if (!member) return null;

  return (
    <AlertDialog open={open} onOpenChange={handleClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove {member.user_name || member.user_email}?</AlertDialogTitle>
          <AlertDialogDescription>
            This will remove this member from the trip.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {member.user_email && (
          <div className="flex items-start space-x-3 py-4">
            <Checkbox 
              id="lockout" 
              checked={lockOut} 
              onCheckedChange={setLockOut}
            />
            <div className="grid gap-1.5 leading-none">
              <Label
                htmlFor="lockout"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
              >
                <ShieldAlert className="w-4 h-4 text-orange-600" />
                Lock out this user
              </Label>
              <p className="text-xs text-slate-500">
                Prevent them from re-joining this trip with the trip code
              </p>
            </div>
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Removing...
              </>
            ) : (
              "Remove Member"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}