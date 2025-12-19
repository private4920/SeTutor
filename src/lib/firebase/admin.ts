/**
 * Firebase Admin SDK configuration for server-side JWT token verification
 * 
 * This module provides secure backend authentication by verifying Firebase ID tokens.
 * It ensures that API requests are authenticated using cryptographically signed JWTs
 * rather than trusting client-provided user IDs.
 */

import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth, Auth, DecodedIdToken } from 'firebase-admin/auth';

let adminApp: App | null = null;
let adminAuth: Auth | null = null;

/**
 * Initialize Firebase Admin SDK
 * Uses environment variables for service account credentials
 */
function getAdminApp(): App {
  if (adminApp === null) {
    const existingApps = getApps();
    
    if (existingApps.length > 0) {
      adminApp = existingApps[0]!;
    } else {
      // Initialize with service account credentials from environment
      const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
      
      if (serviceAccount) {
        // Parse JSON service account key from environment variable
        const credentials = JSON.parse(serviceAccount);
        adminApp = initializeApp({
          credential: cert(credentials),
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        });
      } else {
        // Fallback: Initialize with project ID only (for development with emulator)
        adminApp = initializeApp({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        });
      }
    }
  }
  return adminApp;
}

/**
 * Get Firebase Admin Auth instance
 */
function getAdminAuth(): Auth {
  if (adminAuth === null) {
    adminAuth = getAuth(getAdminApp());
  }
  return adminAuth;
}

/**
 * Verify a Firebase ID token and return the decoded token
 * 
 * @param idToken - The Firebase ID token from the client
 * @returns The decoded token containing user information
 * @throws Error if token is invalid, expired, or revoked
 */
export async function verifyIdToken(idToken: string): Promise<DecodedIdToken> {
  const auth = getAdminAuth();
  
  try {
    // Verify the token with checkRevoked=true for additional security
    const decodedToken = await auth.verifyIdToken(idToken, true);
    return decodedToken;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Token verification failed';
    throw new Error(`Invalid authentication token: ${errorMessage}`);
  }
}

/**
 * Authentication result type
 */
export interface AuthResult {
  success: true;
  uid: string;
  email: string | null;
  displayName: string | null;
  emailVerified: boolean;
}

export interface AuthError {
  success: false;
  error: string;
  status: number;
}

export type AuthResponse = AuthResult | AuthError;

/**
 * Authenticate a request using the Authorization header
 * Expects: Authorization: Bearer <firebase-id-token>
 * 
 * @param request - The incoming request
 * @returns Authentication result with user info or error
 */
export async function authenticateRequest(request: Request): Promise<AuthResponse> {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader) {
    return {
      success: false,
      error: 'Authorization header is required',
      status: 401,
    };
  }
  
  // Extract Bearer token
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return {
      success: false,
      error: 'Invalid authorization format. Expected: Bearer <token>',
      status: 401,
    };
  }
  
  const idToken = parts[1];
  
  if (!idToken || idToken.trim() === '') {
    return {
      success: false,
      error: 'Token is required',
      status: 401,
    };
  }
  
  try {
    const decodedToken = await verifyIdToken(idToken);
    
    return {
      success: true,
      uid: decodedToken.uid,
      email: decodedToken.email || null,
      displayName: decodedToken.name || null,
      emailVerified: decodedToken.email_verified || false,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
    return {
      success: false,
      error: errorMessage,
      status: 401,
    };
  }
}
