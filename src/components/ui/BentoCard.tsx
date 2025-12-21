import React from "react";
import { cn } from "@/lib/utils";

interface BentoCardProps {
    children: React.ReactNode;
    className?: string;
    title?: string;
    description?: string;
    icon?: React.ReactNode;
}

export function BentoCard({ children, className, title, description, icon }: BentoCardProps) {
    return (
        <div
            className={cn(
                "group relative overflow-hidden rounded-3xl bg-white border border-gray-200 p-6 transition-all hover:border-brand-neon hover:shadow-lg",
                className
            )}
        >
            <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

            <div className="relative z-10 flex flex-col h-full">
                {icon && <div className="mb-4 text-brand-neon bg-black/5 p-2 rounded-lg w-fit">{icon}</div>}
                {title && <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>}
                {description && <p className="text-gray-500 text-sm mb-6">{description}</p>}
                <div className="flex-1">
                    {children}
                </div>
            </div>
        </div>
    );
}
