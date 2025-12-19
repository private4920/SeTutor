/**
 * CSRF (Cross-Site Request Forgery) token handling utilities
 * Implements Requirements 11.3 - Security measures
 * 
 * Note: Next.js App Router with Server Actions has built-in CSRF protection.
 * This module provides additional CSRF utilities for custom API routes.
 */

import { NextResponse } from 'next/server';

// ============================================================================
// Constants
// ============================================================================

export const CSRF_TOKEN_HEADER = 'x-csrf-token';
export const CSRF_TOKEN_COOKIE = 'csrf-token';
export const CSRF_TOKEN_LENGTH = 32;

// ============================================================================
// Token Generation
// ============================================================================

/**
 * Generate a cryptographically secure random token
 * @param length - Length of the token in bytes (default: 32)
 * @returns Hex-encoded random token
 */
export function generateCsrfToken(length: number = CSRF_TOKEN_LENGTH): string {
  // Use Web Crypto API for secure random generation
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate a token with timestamp for expiration checking
 * @param expiresInMs - Token expiration time in milliseconds (default: 1 hour)
 * @returns Token string with embedded timestamp
 */
export function generateTimestampedToken(expiresInMs: number = 3600000): string {
  const token = generateCsrfToken();
  const expiry = Date.now() + expiresInMs;
  return `${token}.${expiry}`;
}

/**
 * Validate a timestamped token
 * @param token - Token to validate
 * @returns true if token is valid and not expired
 */
export function validateTimestampedToken(token: string): boolean {
  if (!token || typeof token !== 'string') {
    return false;
  }
  
  const parts = token.split('.');
  if (parts.length !== 2) {
    return false;
  }
  
  const expiryStr = parts[1];
  if (!expiryStr) {
    return false;
  }
  
  const expiry = parseInt(expiryStr, 10);
  
  if (isNaN(expiry)) {
    return false;
  }
  
  return Date.now() < expiry;
}

// ============================================================================
// Request Validation
// ============================================================================

/**
 * Validate CSRF token from request headers against cookie
 * @param request - Incoming request
 * @returns true if CSRF token is valid
 */
export function validateCsrfToken(request: Request): boolean {
  // Get token from header
  const headerToken = request.headers.get(CSRF_TOKEN_HEADER);
  
  // Get token from cookie
  const cookieHeader = request.headers.get('cookie');
  const cookieToken = getCookieValue(cookieHeader, CSRF_TOKEN_COOKIE);
  
  // Both tokens must exist and match
  if (!headerToken || !cookieToken) {
    return false;
  }
  
  // Constant-time comparison to prevent timing attacks
  return constantTimeCompare(headerToken, cookieToken);
}

/**
 * Extract a cookie value from the cookie header
 * @param cookieHeader - Cookie header string
 * @param name - Cookie name to extract
 * @returns Cookie value or null
 */
function getCookieValue(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) {
    return null;
  }
  
  const cookies = cookieHeader.split(';');
  for (const cookie of cookies) {
    const [cookieName, ...cookieValueParts] = cookie.trim().split('=');
    if (cookieName === name) {
      return cookieValueParts.join('=');
    }
  }
  
  return null;
}

/**
 * Constant-time string comparison to prevent timing attacks
 * @param a - First string
 * @param b - Second string
 * @returns true if strings are equal
 */
function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  
  return result === 0;
}

// ============================================================================
// Response Helpers
// ============================================================================

/**
 * Create a response with CSRF token cookie set
 * @param response - Response to add cookie to
 * @param token - CSRF token (generates new one if not provided)
 * @returns Response with CSRF cookie
 */
export function setCsrfCookie(
  response: NextResponse,
  token?: string
): NextResponse {
  const csrfToken = token || generateCsrfToken();
  
  response.cookies.set(CSRF_TOKEN_COOKIE, csrfToken, {
    httpOnly: false, // Must be readable by JavaScript
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 3600, // 1 hour
  });
  
  return response;
}

/**
 * Create an error response for CSRF validation failure
 * @returns NextResponse with 403 status
 */
export function csrfErrorResponse(): NextResponse {
  return NextResponse.json(
    { error: 'Invalid or missing CSRF token' },
    { status: 403 }
  );
}

// ============================================================================
// Middleware Helper
// ============================================================================

/**
 * CSRF protection middleware for API routes
 * Validates CSRF token for state-changing requests (POST, PUT, PATCH, DELETE)
 * @param request - Incoming request
 * @returns null if valid, error response if invalid
 */
export function csrfProtection(request: Request): NextResponse | null {
  const method = request.method.toUpperCase();
  
  // Only validate state-changing methods
  const protectedMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
  if (!protectedMethods.includes(method)) {
    return null;
  }
  
  // Skip CSRF check for same-origin requests with proper content type
  // This is a common pattern for API routes that use JSON
  const contentType = request.headers.get('content-type');
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');
  
  // If origin matches host, it's a same-origin request
  if (origin && host) {
    try {
      const originUrl = new URL(origin);
      if (originUrl.host === host) {
        // Same-origin request with JSON content type is generally safe
        if (contentType?.includes('application/json')) {
          return null;
        }
      }
    } catch {
      // Invalid origin URL, continue with CSRF check
    }
  }
  
  // Validate CSRF token
  if (!validateCsrfToken(request)) {
    return csrfErrorResponse();
  }
  
  return null;
}

// ============================================================================
// Client-Side Helpers (for use in React components)
// ============================================================================

/**
 * Get CSRF token from cookie (client-side)
 * @returns CSRF token or null
 */
export function getClientCsrfToken(): string | null {
  if (typeof document === 'undefined') {
    return null;
  }
  
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, ...valueParts] = cookie.trim().split('=');
    if (name === CSRF_TOKEN_COOKIE) {
      return valueParts.join('=');
    }
  }
  
  return null;
}

/**
 * Create headers object with CSRF token included
 * @param additionalHeaders - Additional headers to include
 * @returns Headers object with CSRF token
 */
export function createHeadersWithCsrf(
  additionalHeaders: Record<string, string> = {}
): Record<string, string> {
  const csrfToken = getClientCsrfToken();
  
  return {
    ...additionalHeaders,
    ...(csrfToken ? { [CSRF_TOKEN_HEADER]: csrfToken } : {}),
  };
}
