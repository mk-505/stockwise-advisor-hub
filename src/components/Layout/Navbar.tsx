
import React from 'react';
import { Link } from 'react-router-dom';
import { Home, LineChart, MessageSquareText, Bell, UserCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";

const Navbar = () => {
  return (
    <header className="border-b border-border/40 bg-card py-2 px-4 sticky top-0 z-50">
      <div className="container flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LineChart className="h-6 w-6 text-primary" />
          <Link to="/" className="font-bold text-xl tracking-tight">
            InvestorCenter
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center space-x-1">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/" className="flex items-center gap-1.5">
              <Home className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/predict" className="flex items-center gap-1.5">
              <LineChart className="h-4 w-4" />
              <span>Predictions</span>
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/chat" className="flex items-center gap-1.5">
              <MessageSquareText className="h-4 w-4" />
              <span>Advisor</span>
            </Link>
          </Button>
        </nav>

        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <UserCircle className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
