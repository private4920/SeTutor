"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { NeonButton } from "@/components/ui/NeonButton";
import { Zap } from "lucide-react";
import { useAuth } from "@/lib/firebase/AuthContext";

export default function SignupPage() {
    const router = useRouter();
    const { user, loading, signInWithGoogle, error } = useAuth();

    // Redirect to dashboard if already logged in
    useEffect(() => {
        if (user && !loading) {
            router.push("/dashboard");
        }
    }, [user, loading, router]);

    const handleGoogleSignIn = async () => {
        try {
            await signInWithGoogle();
            // Redirect happens automatically via useEffect when user state updates
        } catch (err) {
            console.error("Signup failed:", err);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-md space-y-8">
                <div className="flex flex-col items-center text-center">
                    <Link href="/" className="flex items-center gap-2 mb-8">
                        <div className="size-10 rounded-xl bg-brand-neon flex items-center justify-center">
                            <Zap className="text-black size-6 fill-current" />
                        </div>
                        <span className="text-2xl font-bold tracking-tight">SeTutor</span>
                    </Link>
                    <h2 className="text-3xl font-bold tracking-tight">Create your account</h2>
                    <p className="mt-2 text-gray-500">
                        Start studying smarter in under 30 seconds
                    </p>
                </div>

                <div className="bg-white border border-gray-200 p-8 rounded-2xl shadow-xl space-y-6">
                    {error && (
                        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                            {error}
                        </div>
                    )}

                    <button
                        onClick={handleGoogleSignIn}
                        disabled={loading}
                        className="w-full h-12 flex items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <div className="size-5 border-2 border-gray-300 border-t-brand-neon rounded-full animate-spin" />
                        ) : (
                            <>
                                <svg className="size-5" viewBox="0 0 24 24">
                                    <path
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        fill="#4285F4"
                                    />
                                    <path
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        fill="#34A853"
                                    />
                                    <path
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        fill="#FBBC05"
                                    />
                                    <path
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        fill="#EA4335"
                                    />
                                </svg>
                                Sign up with Google
                            </>
                        )}
                    </button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-gray-200" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-gray-400">Free forever</span>
                        </div>
                    </div>

                    <p className="text-center text-sm text-gray-500">
                        By signing up, you agree to our{" "}
                        <Link href="/terms" className="underline hover:text-brand-neon">Terms</Link>
                        {" "}and{" "}
                        <Link href="/privacy" className="underline hover:text-brand-neon">Privacy Policy</Link>.
                    </p>
                </div>

                <p className="px-8 text-center text-sm text-gray-500">
                    Already have an account?{" "}
                    <Link href="/login" className="underline underline-offset-4 hover:text-brand-neon font-medium">
                        Log in
                    </Link>
                </p>
            </div>
        </div>
    );
}
