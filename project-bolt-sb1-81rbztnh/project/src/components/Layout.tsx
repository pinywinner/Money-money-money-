import React, { ReactNode } from 'react';
import Navigation from './Navigation';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col lg:flex-row" dir="rtl">
      {/* Navigation Sidebar - Fixed on desktop */}
      <Navigation />
      
      {/* Main Content - Adjusted for sidebar */}
      <main className="flex-1 p-4 pb-20 lg:pb-4 lg:mr-80 lg:pr-6">
        {children}
      </main>
    </div>
  );
};

export default Layout;