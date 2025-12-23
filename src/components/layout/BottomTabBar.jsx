import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Map, Package, FileText, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { name: 'Trips', page: 'CampingTrips', icon: Map },
  { name: 'Gear', page: 'Shed', icon: Package },
  { name: 'Profile', page: 'Profile', icon: User },
];

export default function BottomTabBar({ currentPageName }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 safe-area-pb z-50">
      <div className="flex items-center justify-around h-20 max-w-7xl mx-auto px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentPageName === tab.page;
          
          return (
            <Link
              key={tab.name}
              to={createPageUrl(tab.page)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors",
                isActive ? "text-emerald-600" : "text-slate-500"
              )}
            >
              <Icon className={cn("w-6 h-6", isActive && "fill-emerald-600")} strokeWidth={isActive ? 2 : 1.5} />
              <span className="text-xs font-medium">{tab.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}