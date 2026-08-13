import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import CampusAIWidget from '../components/ai/CampusAIWidget';

const DashboardLayout = () => {
  return (
    <div className="min-h-screen flex bg-slate-50 font-sans text-slate-800 antialiased relative">
      {/* Fixed Full Height Left Sidebar */}
      <Sidebar />

      {/* Main Content Area Container */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Compact Horizontal Top Header */}
        <Navbar />

        {/* Main Dashboard Scrollable View Area */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl w-full mx-auto space-y-6">
          <Outlet />
        </main>
      </div>

      <CampusAIWidget />
    </div>
  );
};

export default DashboardLayout;
