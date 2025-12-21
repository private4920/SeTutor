"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            <main className="pt-32 pb-20 px-6">
                <div className="mx-auto max-w-3xl">
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-8">Privacy Policy</h1>
                    <p className="text-sm text-gray-500 mb-12">Last updated: December 21, 2025</p>

                    <div className="space-y-8 text-gray-600">
                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-4">1. Data Collection</h2>
                            <p>We collect information you provide directly to us, such as when you create or modify your account, request on-demand services, contact customer support, or otherwise communicate with us. This information may include: name, email, phone number, postal address, profile picture, payment method, items requested (for delivery services), delivery notes, and other information you choose to provide.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-4">2. Use of Information</h2>
                            <p>We use the information we collect to provide, maintain, and improve our services, such as to determine the probability of exam success, generate personalized study materials, and facilitate payments.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-4">3. Sharing of Information</h2>
                            <p>We may share the information we collect about you as described in this Statement or as described at the time of collection or sharing, including as follows: with third party service providers to enable them to provide the Services you request.</p>
                        </section>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
