"use client";

import { memo } from 'react';
import Link from "next/link";

interface QuickAction {
  name: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  gradient: string;
}

const quickActions: QuickAction[] = [
  {
    name: "Upload Files",
    description: "Add new PDFs to your library",
    href: "/dashboard/files/upload",
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
        />
      </svg>
    ),
    gradient: "from-blue-500 to-blue-600",
  },
  {
    name: "Browse Files",
    description: "View and organize your files",
    href: "/dashboard/files",
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
        />
      </svg>
    ),
    gradient: "from-purple-500 to-purple-600",
  },
  {
    name: "Generate Flashcards",
    description: "Create study cards from documents",
    href: "/dashboard/flashcards/generate",
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
        />
      </svg>
    ),
    gradient: "from-green-500 to-green-600",
  },
];

/**
 * Memoized quick actions component
 * Requirements: 1.3, 6.4, 12.1, 12.3 - Responsive design and performance optimization
 * Accessibility: Semantic structure and ARIA labels
 */
export const QuickActions = memo(function QuickActions() {
  return (
    <section 
      className="rounded-lg bg-white p-4 sm:p-6 shadow-sm"
      aria-labelledby="quick-actions-heading"
    >
      <h3 id="quick-actions-heading" className="text-base sm:text-lg font-semibold text-gray-900">Quick Actions</h3>
      <nav aria-label="Quick actions" className="mt-3 sm:mt-4">
        <ul role="list" className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
          {quickActions.map((action) => (
            <li key={action.name}>
              <Link
                href={action.href}
                className="group flex flex-row sm:flex-col items-center sm:items-center gap-3 sm:gap-0 rounded-lg border border-gray-200 p-3 sm:p-4 text-left sm:text-center transition-all hover:border-transparent hover:shadow-md active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                aria-label={`${action.name}: ${action.description}`}
              >
                <div
                  className={`flex h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-r ${action.gradient} text-white transition-transform group-hover:scale-110`}
                  aria-hidden="true"
                >
                  {action.icon}
                </div>
                <div className="sm:mt-3">
                  <span className="text-sm font-medium text-gray-900">
                    {action.name}
                  </span>
                  <p className="mt-0.5 sm:mt-1 text-xs text-gray-600">{action.description}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </section>
  );
});
