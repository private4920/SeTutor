"use client";

import Link from "next/link";
import { NeonButton } from "@/components/ui/NeonButton";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ArrowRight, Brain, Zap, Clock } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-gray-900 selection:bg-brand-neon selection:text-black">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-40 pb-32 px-6 bg-white overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 inset-x-0 h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-50 via-white to-transparent opacity-80" />

        <div className="mx-auto max-w-7xl relative z-10 text-center">

          <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm font-medium text-gray-900 mb-8 shadow-sm animate-fade-in-up">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-neon opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-neon"></span>
            </span>
            <span>v2.0 is now live</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-bold tracking-tight leading-[1.05] mb-8 text-gray-900">
            Study costs,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-400 to-gray-200">not sanity.</span>
          </h1>

          <p className="text-xl text-gray-400 mb-10 leading-relaxed max-w-2xl mx-auto">
            Make learning automatic. Upload PDFs and let AI generate your flashcards, quizzes, and summaries instantly.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <Link href="/signup">
              <NeonButton className="h-14 px-10 text-lg font-bold shadow-xl shadow-brand-neon/25 hover:scale-105 transition-transform">Start Learning Free</NeonButton>
            </Link>
            <Link href="/how-it-works">
              <button className="h-14 px-10 rounded-full border border-gray-200 bg-white hover:bg-gray-50 font-medium transition-colors text-gray-900 flex items-center gap-2 group">
                How it works
                <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>

          {/* Hero App Preview */}
          <div className="relative mx-auto max-w-5xl">
            <div className="rounded-2xl border border-gray-200 bg-white p-2 shadow-2xl">
              <div className="rounded-xl bg-gray-50 overflow-hidden border border-gray-100 aspect-[16/9] flex items-center justify-center relative">
                {/* Abstract UI Representation */}
                <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-center p-8">
                  <div className="size-20 rounded-3xl bg-brand-neon flex items-center justify-center mb-6 shadow-lg rotate-12">
                    <Zap className="size-10 text-black fill-current" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Your Second Brain</h3>
                  <p className="text-gray-500">Organized. Summarized. Memorized.</p>
                </div>
                {/* Background lines to look like UI */}
                <div className="grid grid-cols-3 gap-4 w-full h-full p-8 opacity-20">
                  <div className="col-span-1 bg-gray-300 rounded-lg h-full" />
                  <div className="col-span-2 space-y-4">
                    <div className="h-12 bg-gray-300 rounded-lg w-full" />
                    <div className="h-32 bg-gray-300 rounded-lg w-full" />
                    <div className="grid grid-cols-2 gap-4">
                      <div className="h-24 bg-gray-300 rounded-lg" />
                      <div className="h-24 bg-gray-300 rounded-lg" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Value Proposition / Teaser Section */}
      <section className="py-32 px-6 bg-white border-t border-gray-100">
        <div className="mx-auto max-w-7xl">
          <div className="text-center md:text-left md:flex justify-between items-end mb-16">
            <h2 className="text-4xl font-bold max-w-xl text-gray-900">
              Everything you need to <span className="underline decoration-brand-neon decoration-4 underline-offset-4">ace your exams</span>.
            </h2>
            <Link href="/features" className="hidden md:flex items-center gap-2 text-brand-neon font-bold hover:gap-3 transition-all">
              See all features <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                icon: <Brain className="size-6 text-black" />,
                title: "AI Flashcards",
                desc: "Turn lectures into spaced-repetition decks instantly."
              },
              {
                icon: <Clock className="size-6 text-black" />,
                title: "Fast Summaries",
                desc: "Digest 100 pages of reading in under 60 seconds."
              },
              {
                icon: <Zap className="size-6 text-black" />,
                title: "Smart Quizzes",
                desc: "Test your knowledge with AI-generated practice questions."
              }
            ].map((feature, i) => (
              <div key={i} className="group p-8 rounded-3xl bg-gray-50 border border-gray-100 hover:border-brand-neon/50 transition-colors">
                <div className="size-12 rounded-xl bg-brand-neon flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center md:hidden">
            <Link href="/features" className="inline-flex items-center gap-2 text-brand-neon font-bold">
              See all features <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
