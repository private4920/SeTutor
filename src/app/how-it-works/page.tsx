"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { NeonButton } from "@/components/ui/NeonButton";

export default function HowItWorksPage() {
    const steps = [
        {
            num: "01",
            title: "Upload your materials",
            desc: "Drag and drop your PDF textbooks, lecture slides, or even handwritten notes into the dashboard.",
        },
        {
            num: "02",
            title: "AI Analysis",
            desc: "Our engine scans the text, recognizing core concepts, definitions, dates, and formulas automatically.",
        },
        {
            num: "03",
            title: "Generate & Study",
            desc: "Instantly create decks of flashcards or practice quizzes. Start your personalized study session immediately.",
        },
    ];

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            <main className="pt-32 pb-20 px-6">
                <div className="mx-auto max-w-3xl text-center mb-24">
                    <h1 className="text-5xl font-bold tracking-tight text-gray-900 mb-6">
                        From PDF to A+ in <span className="bg-brand-neon px-1">three steps</span>.
                    </h1>
                    <p className="text-lg text-gray-500">
                        SeTutor streamlines the entire study process so you never have to start from a blank page again.
                    </p>
                </div>

                <div className="mx-auto max-w-5xl relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="absolute top-12 left-0 w-full h-0.5 bg-gray-100 hidden md:block" />

                    <div className="grid md:grid-cols-3 gap-12">
                        {steps.map((step, i) => (
                            <div key={i} className="relative bg-white pt-8">
                                <div className="size-24 rounded-2xl bg-white border border-gray-100 shadow-xl flex items-center justify-center text-4xl font-bold text-gray-900 mb-8 mx-auto relative z-10">
                                    {step.num}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 text-center mb-4">{step.title}</h3>
                                <p className="text-gray-500 text-center leading-relaxed">
                                    {step.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Visual Demo Section */}
                <div className="mt-32 max-w-6xl mx-auto rounded-3xl border border-gray-200 bg-gray-50 overflow-hidden shadow-sm">
                    <div className="p-12 text-center border-b border-gray-200">
                        <h3 className="text-2xl font-bold text-gray-900">See it in action</h3>
                    </div>
                    {/* Placeholder for a video or large screenshot */}
                    <div className="aspect-video bg-white flex items-center justify-center text-gray-400">
                        <div className="text-center">
                            <div className="size-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                                <div className="border-l-4 border-gray-400 h-6 ml-1" />
                            </div>
                            <p className="font-medium">Interface Walkthrough Video</p>
                        </div>
                    </div>
                </div>

            </main>

            <Footer />
        </div>
    );
}
