"use client";

import { GeneratedSummary } from "./mockSummaryGenerator";
import { SummaryConfig } from "./SummaryConfigForm";
import { NeonButton } from "@/components/ui/NeonButton";
import { ArrowLeft, Copy, Download, RefreshCw, Clock, FileText, CheckCircle2, Sparkles } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export interface SummaryDisplayProps {
    summary: GeneratedSummary;
    onRegenerate: (config: SummaryConfig) => void;
    onBack: () => void;
    isRegenerating: boolean;
}

export function SummaryDisplay({
    summary,
    onRegenerate,
    onBack,
    isRegenerating,
}: SummaryDisplayProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(summary.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleExport = () => {
        // Mock export
        alert("Exporting summary to PDF...");
    };

    // Format content with basic markdown handling (bolding)
    const formatContent = (text: string) => {
        return text.split('\n\n').map((paragraph, idx) => {
            if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                return <h3 key={idx} className="text-xl font-bold text-gray-900 mt-8 mb-4">{paragraph.replace(/\*\*/g, '')}</h3>;
            }
            return <p key={idx} className="text-gray-600 leading-relaxed mb-4">{paragraph}</p>;
        });
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
            {/* Header Actions */}
            <div className="flex items-center justify-between">
                <button
                    onClick={onBack}
                    className="group flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
                >
                    <div className="size-8 rounded-full bg-white border border-gray-200 flex items-center justify-center group-hover:border-gray-300 transition-colors">
                        <ArrowLeft className="size-4" />
                    </div>
                    Back to Selection
                </button>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        <Download className="size-3.5" />
                        Export
                    </button>
                    <button
                        onClick={handleCopy}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        {copied ? <CheckCircle2 className="size-3.5 text-green-500" /> : <Copy className="size-3.5" />}
                        {copied ? "Copied" : "Copy"}
                    </button>
                </div>
            </div>

            {/* Main Content Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Banner / Title Area */}
                <div className="border-b border-gray-100 bg-gray-50/50 p-6 sm:p-8">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <span className="inline-flex items-center gap-1 rounded-full bg-brand-neon/10 px-2 py-0.5 text-xs font-medium text-black border border-brand-neon/20">
                                    <Sparkles className="size-3 text-brand-neon fill-current" />
                                    AI Generated
                                </span>
                                <span className="text-xs text-gray-400">
                                    {summary.generatedAt.toLocaleDateString()}
                                </span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Document Summary</h1>
                        </div>

                        {/* Stats Pill */}
                        <div className="hidden sm:flex items-center gap-4 text-xs font-medium text-gray-500 bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-1.5">
                                <Clock className="size-3.5" />
                                {summary.readingTimeMinutes} min read
                            </div>
                            <div className="w-px h-3 bg-gray-200" />
                            <div className="flex items-center gap-1.5">
                                <FileText className="size-3.5" />
                                {summary.wordCount} words
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 sm:p-8 space-y-8">
                    {/* Key Takeaways - Bento Style */}
                    <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-6 overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <Sparkles className="size-24 text-blue-600" />
                        </div>

                        <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wide mb-4 flex items-center gap-2 relative z-10">
                            <div className="size-1.5 rounded-full bg-blue-500" />
                            Key Takeaways
                        </h3>

                        <ul className="grid gap-3 relative z-10">
                            {summary.keyTakeaways.map((takeaway, i) => (
                                <li key={i} className="flex gap-3 items-start group">
                                    <CheckCircle2 className="size-5 text-blue-500 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                                    <span className="text-gray-800 leading-relaxed font-medium">{takeaway}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Full Content */}
                    <div className="prose prose-gray max-w-none">
                        {formatContent(summary.content)}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="bg-gray-50 border-t border-gray-100 p-4 sm:px-8 flex items-center justify-between">
                    <div className="text-xs text-gray-400">
                        Generated from {summary.sourceDocuments.length} document{summary.sourceDocuments.length !== 1 && 's'}
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => onRegenerate(summary.config)}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                            disabled={isRegenerating}
                        >
                            <RefreshCw className={cn("size-4", isRegenerating && "animate-spin")} />
                            Regenerate
                        </button>
                        <NeonButton
                            onClick={handleExport}
                            className="h-9 text-xs"
                        >
                            Save Summary
                        </NeonButton>
                    </div>
                </div>
            </div>
        </div>
    );
}
