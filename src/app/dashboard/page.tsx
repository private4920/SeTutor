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
import { Files, Folder, Brain, Zap } from "lucide-react"; // Import compatible icons

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
      <div className="space-y-8">
        {/* Welcome Banner - Premium Black & Neon */}
        <div className="relative overflow-hidden rounded-3xl bg-black p-8 sm:p-12 shadow-2xl">
          <div className="absolute top-0 right-0 p-8 opacity-10 blur-xl">
            <div className="size-64 rounded-full bg-brand-neon" />
          </div>

          <div className="relative z-10 max-w-2xl">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4">
              Welcome back, <span className="text-brand-neon">{user?.displayName?.split(" ")[0] || "Student"}</span>!
            </h2>
            <p className="text-gray-400 text-lg leading-relaxed">
              You're on a 3-day streak! Ready to turn today's lectures into A+ exam materials?
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Documents"
            value={stats.documents || "0"}
            loading={statsLoading}
            icon={<Files className="size-5" />}
          />
          <StatCard
            title="Folders"
            value={stats.folders || "0"}
            loading={statsLoading}
            icon={<Folder className="size-5" />}
          />
          <StatCard
            title="Flashcards"
            value={stats.flashcards || "0"}
            loading={statsLoading}
            icon={<Brain className="size-5" />}
          />
          <StatCard
            title="Quizzes"
            value={stats.quizzes || "0"}
            loading={statsLoading}
            icon={<Zap className="size-5" />}
          />
        </div>

        {/* Quick Actions */}
        <QuickActions />

        {/* Recent Documents Section */}
        <section>
          <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Documents</h3>
          <RecentDocuments documents={recentDocuments} loading={docsLoading} />
        </section>
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
