/**
 * Hook for making authenticated API requests with Firebase JWT tokens
 * 
 * This hook provides a fetch wrapper that automatically includes the
 * Firebase ID token in the Authorization header for secure API calls.
 */

import { useCallback } from 'react';
import { getFirebaseAuth } from '@/lib/firebase/config';

/**
 * Custom hook that returns an authenticated fetch function
 * Automatically attaches the Firebase ID token to requests
 */
export function useAuthenticatedFetch() {
  const authenticatedFetch = useCallback(async (
    url: string,
    options: RequestInit = {}
  ): Promise<Response> => {
    const auth = getFirebaseAuth();
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      throw new Error('User is not authenticated');
    }
    
    // Get fresh ID token (Firebase handles caching and refresh)
    const idToken = await currentUser.getIdToken();
    
    // Merge headers with Authorization
    const headers = new Headers(options.headers);
    headers.set('Authorization', `Bearer ${idToken}`);
    
    return fetch(url, {
      ...options,
      headers,
    });
  }, []);
  
  return { authenticatedFetch };
}

/**
 * Standalone function to get the current user's ID token
 * Useful for non-hook contexts
 */
export async function getIdToken(): Promise<string | null> {
  const auth = getFirebaseAuth();
  const currentUser = auth.currentUser;
  
  if (!currentUser) {
    return null;
  }
  
  return currentUser.getIdToken();
}

/**
 * Create authenticated fetch headers
 * Useful when you need to construct headers manually
 */
export async function createAuthHeaders(
  additionalHeaders?: Record<string, string>
): Promise<Headers> {
  const headers = new Headers(additionalHeaders);
  const token = await getIdToken();
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  return headers;
}
