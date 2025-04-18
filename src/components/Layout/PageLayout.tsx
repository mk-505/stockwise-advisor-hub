
import React from 'react';
import Navbar from './Navbar';
import MobileNav from './MobileNav';

interface PageLayoutProps {
  children: React.ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container py-6 px-4 md:py-8 animate-fade-in">
        {children}
      </main>
      <div className="h-16 md:hidden" /> {/* Spacer for mobile nav */}
      <MobileNav />
    </div>
  );
};

export default PageLayout;
