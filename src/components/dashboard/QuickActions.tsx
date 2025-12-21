"use client";

import { Upload, Brain, FileText, Zap } from "lucide-react";
import { useRouter } from "next/navigation";

export function QuickActions() {
  const router = useRouter();

  const actions = [
    {
      title: "Upload PDF",
      desc: "Add new materials",
      icon: Upload,
      color: "neon", // Primary brand action
      onClick: () => router.push("/dashboard/files/upload"),
    },
    {
      title: "New Summary",
      desc: "Summarize text",
      icon: FileText,
      color: "blue",
      onClick: () => router.push("/dashboard/summaries"),
    },
    {
      title: "Create Quiz",
      desc: "Practice exam",
      icon: Brain,
      color: "purple",
      onClick: () => router.push("/dashboard/quizzes"),
    },
  ];

  return (
    <section>
      <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {actions.map((action) => (
          <button
            key={action.title}
            onClick={action.onClick}
            className="group relative flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-black"
          >
            <div className={`
                            flex size-14 items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-110
                            ${action.color === 'neon' ? 'bg-black text-brand-neon' :
                action.color === 'blue' ? 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white' :
                  'bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white'}
                        `}>
              <action.icon className="size-7" strokeWidth={1.5} />
            </div>

            <div className="text-center space-y-1">
              <h4 className="font-bold text-gray-900 group-hover:text-black">{action.title}</h4>
              <p className="text-xs text-gray-500 font-medium">{action.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
