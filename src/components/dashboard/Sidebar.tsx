"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, Files, Brain, Zap, Calendar, X, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Files", href: "/dashboard/files", icon: Files },
  { name: "Flashcards", href: "/dashboard/flashcards", icon: Brain },
  { name: "Quizzes", href: "/dashboard/quizzes", icon: Zap },
  { name: "Summaries", href: "/dashboard/summaries", icon: FileText },
  { name: "Learning Plans", href: "/dashboard/learning-plans", icon: Calendar },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100 transition-transform duration-300 lg:static lg:translate-x-0 h-screen flex flex-col",
          isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        )}
      >
        {/* Logo Area */}
        <div className="h-20 flex items-center px-6 border-b border-gray-100">
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="size-8 rounded-lg bg-brand-neon flex items-center justify-center transition-transform group-hover:rotate-12">
              <Zap className="size-5 text-black fill-current" />
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900">SeTutor</span>
          </Link>
          <button onClick={onClose} className="ml-auto lg:hidden text-gray-400 hover:text-gray-900">
            <X className="size-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group relative overflow-hidden",
                  active
                    ? "bg-gray-900 text-white shadow-lg shadow-gray-900/10"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                {/* Active Indicator Neon Pill (Optional decorative element) */}
                {active && <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-neon" />}

                <item.icon className={cn("size-5 transition-colors", active ? "text-brand-neon" : "text-gray-400 group-hover:text-gray-600")} />
                <span className="relative z-10">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Mini Profile (Optional footer area) */}
        <div className="p-4 border-t border-gray-100">
          <div className="p-4 rounded-xl bg-gray-50 flex items-center gap-3">
            <div className="size-8 rounded-full bg-gray-200" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">Settings</p>
              <p className="text-xs text-gray-500 truncate">Manage account</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
