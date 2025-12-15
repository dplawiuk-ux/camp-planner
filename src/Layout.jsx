import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Tent, Compass } from 'lucide-react';

export default function Layout({ children, currentPageName }) {
  const isHomePage = currentPageName === 'CampingTrips';

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Simple floating nav for non-home pages */}
      {!isHomePage && (
        <div className="fixed top-4 left-4 z-50">
          <Link
            to={createPageUrl("CampingTrips")}
            className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-md rounded-full shadow-lg hover:shadow-xl transition-all text-emerald-800 font-medium"
          >
            <Tent className="w-5 h-5" />
            <span className="hidden sm:inline">Camp Planner</span>
          </Link>
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
    </div>
  );
}