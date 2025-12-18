import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Loader2, Ticket } from "lucide-react";

export default function JoinTripDialog({ open, onClose, onJoin, isLoading }) {
  const [tripCode, setTripCode] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const code = tripCode.trim().toUpperCase();
    if (code.length === 8) {
      onJoin(code);
    }
  };

  const handleCodeChange = (e) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (value.length <= 8) {
      setTripCode(value);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ticket className="w-5 h-5 text-emerald-600" />
            Join a Trip
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="trip-code">Trip Code</Label>
            <Input
              id="trip-code"
              placeholder="Enter 8-character code"
              value={tripCode}
              onChange={handleCodeChange}
              className="h-14 text-center font-mono text-xl tracking-wider uppercase"
              maxLength={8}
              autoFocus
            />
            <p className="text-xs text-slate-500">
              Enter the 8-character code shared by the trip organizer
            </p>
          </div>

          <DialogFooter className="gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={tripCode.length !== 8 || isLoading}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Joining...
                </>
              ) : (
                "Join Trip"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}