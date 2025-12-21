"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { NeonButton } from "@/components/ui/NeonButton";
import { BentoCard } from "@/components/ui/BentoCard";
import { Brain, FileText, Upload, Copy, CheckCircle2, Zap } from "lucide-react";

export default function FeaturesPage() {
    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            <main className="pt-40 pb-20 px-6">
                {/* Header */}
                <div className="mx-auto max-w-3xl text-center mb-24">
                    <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-gray-900 mb-8">
                        Power tools for your <span className="relative z-10">brain<span className="absolute bottom-2 left-0 right-0 h-4 bg-brand-neon -z-10 rotate-[-1deg]"></span></span>.
                    </h1>
                    <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                        SeTutor combines advanced AI with cognitive science principles to help you learn faster and remember longer.
                    </p>
                </div>

                {/* Feature Grid - Moved from Home to here */}
                <div className="mx-auto max-w-7xl mb-32">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Large Card 1 */}
                        <BentoCard
                            className="md:col-span-2 min-h-[400px] bg-white border-gray-200"
                            title="Upload once, generate everything."
                            description="Drop your PDF lecture notes and watch SeTutor generate flashcards, summaries, and quizzes in seconds."
                            icon={<Upload className="size-6 text-brand-neon" />}
                        >
                            <div className="mt-8 flex gap-4 overflow-hidden mask-linear-fade h- full">
                                <div className="flex-1 bg-gray-50 rounded-xl p-6 border border-gray-100 shadow-sm transform translate-y-4">
                                    <div className="h-2 w-20 bg-gray-200 rounded mb-4" />
                                    <div className="space-y-3">
                                        <div className="h-2 w-full bg-gray-200 rounded opacity-50" />
                                        <div className="h-2 w-3/4 bg-gray-200 rounded opacity-50" />
                                        <div className="h-16 w-full bg-gray-100 rounded border border-dashed border-gray-300 mt-4 flex items-center justify-center text-xs text-gray-400">PDF Preview</div>
                                    </div>
                                </div>
                                <div className="flex-1 bg-white rounded-xl p-6 border border-brand-neon shadow-lg relative z-10">
                                    <div className="flex items-center gap-2 mb-6">
                                        <div className="size-6 bg-brand-neon rounded-md flex items-center justify-center">
                                            <Zap className="size-3 text-black" />
                                        </div>
                                        <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Processing Complete</span>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-100">
                                            <span className="text-sm font-medium">Flashcards</span>
                                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Ready</span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-100">
                                            <span className="text-sm font-medium">Summary</span>
                                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Ready</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </BentoCard>

                        {/* Tall Card 2 (Fixed Light Mode) */}
                        <BentoCard
                            className="md:row-span-2 bg-white border-gray-200"
                            title="Smart Flashcards"
                            description="Spaced repetition built-in."
                            icon={<Brain className="size-6 text-brand-neon" />}
                        >
                            <div className="bg-gray-50 rounded-2xl p-6 mt-8 h-full flex items-center justify-center relative overflow-hidden border border-gray-100 min-h-[300px]">
                                <div className="absolute inset-0 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                                    <div className="w-40 h-52 bg-white shadow-xl rounded-2xl rotate-6 absolute top-10 right-4 border border-gray-200" />
                                    <div className="w-40 h-52 bg-gray-50 shadow-lg rounded-2xl -rotate-6 absolute top-14 left-4 border border-white" />
                                    <div className="w-40 h-52 bg-white border-2 border-brand-neon rounded-2xl z-10 flex items-center justify-center font-bold text-center p-6 text-lg shadow-2xl">
                                        What is the powerhouse of the cell?
                                    </div>
                                </div>
                            </div>
                        </BentoCard>

                        {/* Card 3 */}
                        <BentoCard
                            className="bg-white border-gray-200"
                            title="Instant Summaries"
                            description="Get the gist of 100-page documents."
                            icon={<FileText className="size-6 text-brand-neon" />}
                        >
                            <div className="mt-4 space-y-3">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="flex gap-3 items-center text-sm text-gray-600 p-2 rounded hover:bg-gray-50 transition-colors">
                                        <CheckCircle2 className="size-5 text-brand-neon shrink-0" />
                                        <span>Key concept {i} extracted and simplified</span>
                                    </div>
                                ))}
                            </div>
                        </BentoCard>

                        {/* Card 4 */}
                        <BentoCard
                            className="bg-white border-gray-200"
                            title="Study Plans"
                            description="AI Personalized schedules."
                            icon={<Copy className="size-6 text-brand-neon" />}
                        />
                    </div>
                </div>

                {/* CTA */}
                <div className="mx-auto max-w-4xl text-center pt-16 border-t border-gray-100">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">See the difference yourself.</h2>
                    <NeonButton className="h-12 px-8 text-base shadow-lg shadow-brand-neon/20">Try Pro Features Free</NeonButton>
                </div>

            </main>

            <Footer />
        </div>
    );
}
