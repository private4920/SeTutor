"use client";

import { BrainCircuit, Sparkles } from "lucide-react";
import { SummaryConfig } from "./SummaryConfigForm";

interface SummaryLoadingProps {
    config: SummaryConfig;
    documentCount: number;
    progress: number;
}

export function SummaryLoading({ config, documentCount, progress }: SummaryLoadingProps) {
    return (
        <div className="mx-auto max-w-xl min-h-[50vh] flex flex-col items-center justify-center p-8 text-center space-y-8 animate-in fade-in zoom-in-95 duration-500">

            {/* Minimalist Visual */}
            <div className="relative flex flex-col items-center gap-6">
                <div className="relative text-brand-neon">
                    <BrainCircuit className="size-16 animate-pulse text-brand-neon" strokeWidth={1.5} />
                </div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                        Generating Summary...
                    </h2>
                    <p className="text-sm text-gray-500">
                        Analyzing <span className="font-semibold text-gray-900">{documentCount} document{documentCount !== 1 ? 's' : ''}</span>
                    </p>
                </div>
            </div>

            {/* Progress Section */}
            <div className="w-full max-w-sm space-y-3">
                <div className="flex justify-between text-xs font-semibold text-gray-400 uppercase tracking-widest">
                    <span>Processing</span>
                    <span>{Math.round(progress)}%</span>
                </div>

                <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                    <div
                        className="h-full rounded-full bg-brand-neon"
                        style={{ width: `${progress}%`, transition: "width 0.5s ease-out" }}
                    />
                </div>
            </div>

            {/* Config Pills - Minimalist */}
            <div className="flex flex-wrap justify-center gap-3 pt-4 opacity-80">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 bg-white text-xs font-medium text-gray-600">
                    <span className="size-1.5 rounded-full bg-brand-neon" />
                    <span className="capitalize">{config.length} Length</span>
                </div>
                {config.focusAreas.map((focus) => (
                    <div
                        key={focus}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 bg-white text-xs font-medium text-gray-600"
                    >
                        <Sparkles className="size-3 text-brand-neon fill-brand-neon" />
                        <span className="capitalize">{focus.replace('-', ' ')}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
