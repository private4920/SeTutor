"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NeonButton } from "@/components/ui/NeonButton";
import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 h-20 flex items-center">
            <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="size-10 rounded-xl bg-brand-neon flex items-center justify-center transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110 shadow-sm shadow-brand-neon/20">
                        <Zap className="text-black size-6 fill-current" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-black">SeTutor</span>
                </Link>

                {/* Navigation Links */}
                <div className="hidden md:flex items-center gap-1">
                    {[
                        { name: "Features", href: "/features" },
                        { name: "How it works", href: "/how-it-works" },
                        { name: "Pricing", href: "/pricing" },
                    ].map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={cn(
                                "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                                isActive(link.href)
                                    ? "bg-gray-100 text-black font-semibold"
                                    : "text-gray-500 hover:text-black hover:bg-gray-50"
                            )}
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>

                {/* Auth Buttons */}
                <div className="flex items-center gap-3">
                    <Link href="/login" className="px-4 py-2 text-sm font-bold text-gray-600 hover:text-black transition-colors hidden sm:block">
                        Log in
                    </Link>
                    <Link href="/signup">
                        <NeonButton className="h-10 px-5 text-sm font-bold shadow-md shadow-brand-neon/10 hover:shadow-brand-neon/30">Get Started</NeonButton>
                    </Link>
                </div>
            </div>
        </nav>
    );
}
