"use client";

import { useEffect, useState, useCallback } from "react";
import { ProtectedRoute } from "@/lib/firebase/ProtectedRoute";
import { useAuth } from "@/lib/firebase/AuthContext";
import {
  DashboardLayout,
  StatCard,
  RecentDocuments,
  QuickActions,
} from "@/components/dashboard";
import { Document } from "@/lib/db/types";

interface DashboardStats {
  documents: number;
  folders: number;
  flashcards: number;
  quizzes: number;
}

function DashboardContent() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    documents: 0,
    folders: 0,
    flashcards: 0,
    quizzes: 0,
  });
  const [recentDocuments, setRecentDocuments] = useState<Document[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [docsLoading, setDocsLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    if (!user?.uid) return;
    
    try {
      const { getIdToken } = await import('@/lib/hooks/useAuthenticatedFetch');
      const token = await getIdToken();
      if (!token) return;
      
      const response = await fetch('/api/dashboard/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setStatsLoading(false);
    }
  }, [user?.uid]);

  const fetchRecentDocuments = useCallback(async () => {
    if (!user?.uid) return;
    
    try {
      const { getIdToken } = await import('@/lib/hooks/useAuthenticatedFetch');
      const token = await getIdToken();
      if (!token) return;
      
      const response = await fetch('/api/dashboard/recent-documents?limit=5', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setRecentDocuments(data.documents);
      }
    } catch (error) {
      console.error("Failed to fetch recent documents:", error);
    } finally {
      setDocsLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    fetchStats();
    fetchRecentDocuments();
  }, [fetchStats, fetchRecentDocuments]);

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Welcome section - Requirements 1.3, 6.4: Responsive design */}
        <div className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 p-4 sm:p-6 text-white shadow-sm">
          <h2 className="text-xl sm:text-2xl font-bold">
            Welcome back, {user?.displayName?.split(" ")[0] || "User"}!
          </h2>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base text-blue-100">
            Here&apos;s an overview of your learning progress.
          </p>
        </div>

        {/* Statistics cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Documents"
            value={stats.documents}
            loading={statsLoading}
            iconBgColor="bg-blue-100"
            iconColor="text-blue-600"
            icon={
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            }
          />
          <StatCard
            title="Folders"
            value={stats.folders}
            loading={statsLoading}
            iconBgColor="bg-purple-100"
            iconColor="text-purple-600"
            icon={
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                />
              </svg>
            }
          />
          <StatCard
            title="Flashcards"
            value={stats.flashcards}
            loading={statsLoading}
            iconBgColor="bg-green-100"
            iconColor="text-green-600"
            icon={
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            }
          />
          <StatCard
            title="Quizzes"
            value={stats.quizzes}
            loading={statsLoading}
            iconBgColor="bg-orange-100"
            iconColor="text-orange-600"
            icon={
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
            }
          />
        </div>

        {/* Quick Actions */}
        <QuickActions />

        {/* Recent Documents */}
        <RecentDocuments documents={recentDocuments} loading={docsLoading} />
      </div>
    </DashboardLayout>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute redirectTo="/">
      <DashboardContent />
    </ProtectedRoute>
  );
}
