"use client";

import { useState, ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { ErrorBoundary, ErrorFallback } from "@/components/ui/ErrorBoundary";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const openSidebar = () => setSidebarOpen(true);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <Header onMenuClick={openSidebar} />

        {/* Page content with Error Boundary - Requirements 1.3, 4.5, 6.4: Responsive design */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6">
          <ErrorBoundary fallback={<ErrorFallback error={null} />}>
            {children}
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
