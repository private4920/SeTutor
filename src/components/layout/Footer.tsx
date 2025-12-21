"use client";

import Link from "next/link";
import { Zap } from "lucide-react";

export function Footer() {
    return (
        <footer className="border-t border-gray-200 bg-white">
            <div className="mx-auto max-w-7xl px-6 py-16">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-16">
                    <div className="col-span-2 lg:col-span-2">
                        <Link href="/" className="flex items-center gap-2 mb-6">
                            <div className="size-8 rounded-lg bg-brand-neon flex items-center justify-center">
                                <Zap className="text-black size-5 fill-current" />
                            </div>
                            <span className="text-gray-900 font-bold text-xl">SeTutor</span>
                        </Link>
                        <p className="text-gray-500 max-w-xs leading-relaxed">
                            The AI-powered study companion that turns your course materials into interactive learning experiences.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-bold text-gray-900 mb-6">Product</h4>
                        <ul className="space-y-4 text-gray-500">
                            <li><Link href="/features" className="hover:text-black transition-colors">Features</Link></li>
                            <li><Link href="/pricing" className="hover:text-black transition-colors">Pricing</Link></li>
                            <li><Link href="/how-it-works" className="hover:text-black transition-colors">How it works</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-gray-900 mb-6">Company</h4>
                        <ul className="space-y-4 text-gray-500">
                            <li><Link href="/about" className="hover:text-black transition-colors">About</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-gray-900 mb-6">Legal</h4>
                        <ul className="space-y-4 text-gray-500">
                            <li><Link href="/privacy" className="hover:text-black transition-colors">Privacy</Link></li>
                            <li><Link href="/terms" className="hover:text-black transition-colors">Terms</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
                    <p>© 2025 SeTutor Inc. All rights reserved.</p>
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-gray-900 transition-colors">Twitter</a>
                        <a href="#" className="hover:text-gray-900 transition-colors">LinkedIn</a>
                        <a href="#" className="hover:text-gray-900 transition-colors">Instagram</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
