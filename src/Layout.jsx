import React from 'react';
import BottomTabBar from '@/components/layout/BottomTabBar';

export default function Layout({ children, currentPageName }) {
  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      {/* Main content */}
      <main>
        {children}
      </main>

      {/* Bottom Tab Bar */}
      <BottomTabBar currentPageName={currentPageName} />
    </div>
  );
}