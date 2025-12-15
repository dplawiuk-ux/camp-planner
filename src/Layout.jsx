import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Tent, Compass, Map, FileText, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AlternateEmails from '@/components/profile/AlternateEmails';

export default function Layout({ children, currentPageName }) {
  const isHomePage = currentPageName === 'CampingTrips';
  const [showEmailSettings, setShowEmailSettings] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Simple floating nav for non-home pages */}
      {!isHomePage && (
        <div className="fixed top-4 left-4 right-4 z-50 flex items-center justify-between">
          <div className="flex gap-2">
            <Link
              to={createPageUrl("CampingTrips")}
              className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-md rounded-full shadow-lg hover:shadow-xl transition-all text-emerald-800 font-medium"
            >
              <Map className="w-5 h-5" />
              <span className="hidden sm:inline">Trips</span>
            </Link>
            <Link
              to={createPageUrl("Shed")}
              className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-md rounded-full shadow-lg hover:shadow-xl transition-all text-emerald-800 font-medium"
            >
              <Tent className="w-5 h-5" />
              <span className="hidden sm:inline">Gear Shed</span>
            </Link>
            <Link
              to={createPageUrl("Documents")}
              className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-md rounded-full shadow-lg hover:shadow-xl transition-all text-emerald-800 font-medium"
            >
              <FileText className="w-5 h-5" />
              <span className="hidden sm:inline">Docs</span>
            </Link>
          </div>

          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-md rounded-full shadow-lg hover:shadow-xl transition-all text-emerald-800 font-medium"
                >
                  <User className="w-5 h-5" />
                  <span className="hidden sm:inline">{user.full_name || user.email}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowEmailSettings(true)}>
                  <User className="w-4 h-4 mr-2" />
                  Email Addresses
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => base44.auth.logout()}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      )}

      {/* Main content */}
      <main>
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-emerald-700">
              <Compass className="w-5 h-5" />
              <span className="font-semibold">Camp Planner</span>
            </div>
            <p className="text-sm text-slate-500">
              Plan your adventure, pack with confidence
            </p>
          </div>
        </div>
      </footer>

      {/* Email Settings Modal */}
      <AlternateEmails 
        open={showEmailSettings} 
        onClose={() => setShowEmailSettings(false)} 
      />
      </div>
      );
      }