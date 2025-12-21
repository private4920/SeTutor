import React from "react";
import { cn } from "@/lib/utils";

interface NeonButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    variant?: "primary" | "secondary" | "outline";
    fullWidth?: boolean;
    isLoading?: boolean;
}

export const NeonButton = React.forwardRef<HTMLButtonElement, NeonButtonProps>(
    ({ className, children, variant = "primary", fullWidth, isLoading, disabled, ...props }, ref) => {
        const variants = {
            primary: "bg-brand-neon text-brand-black hover:bg-[#b3e600] border-transparent shadow-sm disabled:opacity-50",
            secondary: "bg-black text-white hover:bg-gray-800 border-transparent disabled:opacity-50",
            outline: "bg-transparent border-gray-200 text-gray-900 hover:border-brand-neon hover:text-brand-black disabled:opacity-50",
        };

        return (
            <button
                ref={ref}
                disabled={isLoading || disabled}
                className={cn(
                    "inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition-all duration-200 active:scale-95 disabled:pointer-events-none",
                    "border",
                    variants[variant],
                    fullWidth && "w-full",
                    className
                )}
                {...props}
            >
                {isLoading && (
                    <svg className="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                )}
                {children}
            </button>
        );
    }
);

NeonButton.displayName = "NeonButton";
