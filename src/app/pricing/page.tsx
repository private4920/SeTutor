"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { NeonButton } from "@/components/ui/NeonButton";
import { Check } from "lucide-react";

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            <main className="pt-32 pb-20 px-6">
                <div className="mx-auto max-w-3xl text-center mb-24">
                    <h1 className="text-5xl font-bold tracking-tight text-gray-900 mb-6">
                        Simple, transparent <span className="bg-brand-neon px-1">pricing</span>.
                    </h1>
                    <p className="text-lg text-gray-500">
                        Start for free, upgrade when you need to ace that final.
                    </p>
                </div>

                <div className="mx-auto max-w-5xl grid md:grid-cols-2 gap-8 items-start">

                    {/* Free Plan */}
                    <div className="p-8 rounded-3xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                        <h3 className="text-xl font-medium text-gray-900 mb-2">Hobby</h3>
                        <div className="flex items-baseline gap-1 mb-6">
                            <span className="text-5xl font-bold text-gray-900">$0</span>
                            <span className="text-gray-500">/month</span>
                        </div>
                        <p className="text-gray-500 mb-8 pb-8 border-b border-gray-100">
                            Perfect for trying out the platform and light study sessions.
                        </p>
                        <ul className="space-y-4 mb-8">
                            {["5 PDF Uploads per month", "Basic Summary Generation", "100 Flashcards per deck", "Standard Support"].map((feat, i) => (
                                <li key={i} className="flex items-center gap-3 text-sm text-gray-600">
                                    <Check className="size-4 text-gray-900" />
                                    {feat}
                                </li>
                            ))}
                        </ul>
                        <NeonButton variant="outline" fullWidth className="h-12">Get Started Free</NeonButton>
                    </div>

                    {/* Pro Plan */}
                    <div className="p-8 rounded-3xl border-2 border-black bg-black text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-brand-neon text-black text-xs font-bold px-3 py-1 rounded-bl-xl">POPULAR</div>
                        <h3 className="text-xl font-medium text-white mb-2">Pro Student</h3>
                        <div className="flex items-baseline gap-1 mb-6">
                            <span className="text-5xl font-bold text-white">$9</span>
                            <span className="text-gray-400">/month</span>
                        </div>
                        <p className="text-gray-400 mb-8 pb-8 border-b border-white/10">
                            Unlimited access for serious students who demand top grades.
                        </p>
                        <ul className="space-y-4 mb-8">
                            {["Unlimited PDF Uploads", "Advanced AI Models (GPT-4)", "Unlimited Flashcards", "Priority Processing", "Export to Anki"].map((feat, i) => (
                                <li key={i} className="flex items-center gap-3 text-sm text-gray-300">
                                    <div className="size-4 rounded-full bg-brand-neon flex items-center justify-center text-black">
                                        <Check className="size-3" />
                                    </div>
                                    {feat}
                                </li>
                            ))}
                        </ul>
                        <NeonButton fullWidth className="h-12">Upgrade to Pro</NeonButton>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
