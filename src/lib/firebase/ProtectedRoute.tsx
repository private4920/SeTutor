"use client";

import React, { useEffect, ComponentType } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthContext";

interface ProtectedRouteProps {
  redirectTo?: string;
}

/**
 * Higher-Order Component that protects routes from unauthenticated access.
 * Redirects to sign-in page if user is not authenticated.
 * 
 * @param WrappedComponent - The component to protect
 * @param options - Configuration options including redirect path
 * @returns Protected component that only renders for authenticated users
 */
export function withProtectedRoute<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: ProtectedRouteProps = {}
) {
  const { redirectTo = "/" } = options;

  function ProtectedComponent(props: P) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      // Only redirect after loading is complete and user is not authenticated
      if (!loading && !user) {
        router.replace(redirectTo);
      }
    }, [user, loading, router]);

    // Show loading state while checking authentication
    if (loading) {
      return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      );
    }

    // Don't render protected content if not authenticated
    if (!user) {
      return null;
    }

    // Render the protected component
    return <WrappedComponent {...props} />;
  }

  // Set display name for debugging
  const displayName = WrappedComponent.displayName || WrappedComponent.name || "Component";
  ProtectedComponent.displayName = `withProtectedRoute(${displayName})`;

  return ProtectedComponent;
}

/**
 * Component wrapper for protecting routes declaratively.
 * Use this when you prefer composition over HOC pattern.
 */
interface ProtectedRouteWrapperProps {
  children: React.ReactNode;
  redirectTo?: string;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({
  children,
  redirectTo = "/",
  fallback,
}: ProtectedRouteWrapperProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace(redirectTo);
    }
  }, [user, loading, router, redirectTo]);

  if (loading) {
    return (
      fallback || (
        <div className="flex min-h-screen items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      )
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
