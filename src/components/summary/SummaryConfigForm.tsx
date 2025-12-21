"use client";

import { useState } from "react";
import { NeonButton } from "@/components/ui/NeonButton";
import { Clock, Target, Sparkles, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type SummaryLength = "short" | "medium" | "long";
export type SummaryFocus = "general" | "key-concepts" | "exam-prep" | "timeline";

export interface SummaryConfig {
    length: SummaryLength;
    focusAreas: SummaryFocus[];
}

export interface SummaryConfigFormProps {
    selectedDocumentCount: number;
    onGenerate: (config: SummaryConfig) => void;
    isGenerating: boolean;
}

export function SummaryConfigForm({
    selectedDocumentCount,
    onGenerate,
    isGenerating,
}: SummaryConfigFormProps) {
    const [length, setLength] = useState<SummaryLength>("medium");
    const [focusAreas, setFocusAreas] = useState<SummaryFocus[]>(["general"]);

    const toggleFocus = (focus: SummaryFocus) => {
        setFocusAreas((prev) => {
            // General is exclusive
            if (focus === "general") return ["general"];

            const newAreas = prev.filter((f) => f !== "general");
            if (prev.includes(focus)) {
                return newAreas.filter((f) => f !== focus);
            } else {
                return [...newAreas, focus];
            }
        });
    };

    const handleGenerate = () => {
        onGenerate({ length, focusAreas });
    };

    return (
        <div className="space-y-8">
            {/* Length Selection */}
            <div className="space-y-4">
                <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-wide">
                    <Clock className="size-4 text-brand-neon" />
                    Summary Length
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {(["short", "medium", "long"] as const).map((l) => (
                        <button
                            key={l}
                            onClick={() => setLength(l)}
                            className={cn(
                                "group relative flex flex-col items-start p-4 rounded-xl border text-left transition-all duration-200",
                                length === l
                                    ? "border-brand-neon bg-brand-neon/5 ring-1 ring-brand-neon"
                                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                            )}
                        >
                            <span className="text-sm font-bold capitalize mb-1">{l}</span>
                            <span className={cn("text-xs", length === l ? "text-gray-900" : "text-gray-500")}>
                                {l === "short" && "~200 words. Quick overview."}
                                {l === "medium" && "~500 words. Balanced detail."}
                                {l === "long" && "~1000 words. Deep dive."}
                            </span>
                            {length === l && (
                                <div className="absolute top-4 right-4">
                                    <Sparkles className="size-4 text-brand-neon fill-brand-neon text-black" />
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Focus Selection */}
            <div className="space-y-4">
                <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-wide">
                    <Target className="size-4 text-brand-neon" />
                    Focus Area
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { id: "general", label: "General Overview", desc: "Balanced summary of all topics" },
                        { id: "key-concepts", label: "Key Concepts", desc: "Definitions and core theories" },
                        { id: "exam-prep", label: "Exam Prep", desc: "High-yield topics and questions" },
                        { id: "timeline", label: "Timeline", desc: "Chronological events and dates" },
                    ].map((item) => {
                        const isSelected = focusAreas.includes(item.id as SummaryFocus);
                        return (
                            <button
                                key={item.id}
                                onClick={() => toggleFocus(item.id as SummaryFocus)}
                                className={cn(
                                    "relative p-4 rounded-xl border text-left transition-all duration-200 flex flex-col h-full",
                                    isSelected
                                        ? "border-brand-neon bg-brand-neon/5 ring-1 ring-brand-neon"
                                        : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                                )}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <span className={cn("font-bold text-sm", isSelected ? "text-black" : "text-gray-900")}>
                                        {item.label}
                                    </span>
                                    {isSelected && <Sparkles className="size-4 text-brand-neon fill-brand-neon text-black" />}
                                </div>
                                <p className="text-xs text-gray-500 mt-auto">{item.desc}</p>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Action Bar */}
            <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                    <AlertCircle className="size-4 text-brand-neon" />
                    <span>Generating content uses 1 credit per 100 words</span>
                </div>
                <div className="w-full sm:w-auto">
                    <NeonButton
                        onClick={handleGenerate}
                        disabled={selectedDocumentCount === 0 || isGenerating}
                        isLoading={isGenerating}
                        fullWidth
                        className="min-w-[200px]"
                    >
                        {isGenerating ? "Analyzing..." : `Generate Summary (${selectedDocumentCount} docs)`}
                    </NeonButton>
                </div>
            </div>
        </div >
    );
}
