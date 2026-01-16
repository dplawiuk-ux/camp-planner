import React from 'react';
import BottomTabBar from '@/components/layout/BottomTabBar';
import I18nProvider from '@/components/i18n/I18nProvider';
import LanguageSwitcher from '@/components/layout/LanguageSwitcher';

export default function Layout({ children, currentPageName }) {
  return (
    <I18nProvider>
      <div className="min-h-screen bg-stone-50 pb-20">
        {/* Language Switcher */}
        <div className="fixed top-4 right-4 z-50">
          <LanguageSwitcher />
        </div>

        {/* Main content */}
        <main>
          {children}
        </main>

        {/* Bottom Tab Bar */}
        <BottomTabBar currentPageName={currentPageName} />
      </div>
    </I18nProvider>
  );
}