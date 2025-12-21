"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            <main className="pt-32 pb-20 px-6">
                <div className="mx-auto max-w-3xl">
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-8">About SeTutor</h1>

                    <div className="prose prose-lg prose-gray">
                        <p className="lead text-xl text-gray-500 mb-8">
                            We are on a mission to democratize effective study habits. We believe that every student deserves access to tools that help them learn faster, deeper, and with less stress.
                        </p>

                        <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">Our Story</h2>
                        <p className="text-gray-600 mb-6">
                            SeTutor started in a dorm room when two engineering students realized they were spending more time making flashcards than actually studying them. They built a script to automate the process, shared it with friends, and realized they had solved a massive pain point.
                        </p>

                        <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">Why AI?</h2>
                        <p className="text-gray-600 mb-6">
                            Artificial Intelligence isn't just a buzzword for us; it's the engine that powers personalized learning. By analyzing lecture notes and textbooks, we can identify exactly what matters, creating a custom curriculum for every single user.
                        </p>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
