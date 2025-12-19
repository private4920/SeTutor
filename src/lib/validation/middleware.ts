/**
 * Validation middleware helpers for API routes
 * Implements Requirements 11.3 - Input validation and sanitization
 */

import { NextResponse } from 'next/server';
import { ZodError, ZodSchema } from 'zod';

// ============================================================================
// Types
// ============================================================================

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  error?: NextResponse;
}

// ============================================================================
// Request Body Validation
// ============================================================================

/**
 * Validate request body against a Zod schema
 * @param request - Incoming request
 * @param schema - Zod schema to validate against
 * @returns Validation result with parsed data or error response
 */
export async function validateRequestBody<T>(
  request: Request,
  schema: ZodSchema<T>
): Promise<ValidationResult<T>> {
  try {
    const body = await request.json();
    const data = schema.parse(body);
    return { success: true, data };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        error: NextResponse.json(
          {
            error: 'Validation failed',
            details: formatZodErrors(error),
          },
          { status: 400 }
        ),
      };
    }
    
    if (error instanceof SyntaxError) {
      return {
        success: false,
        error: NextResponse.json(
          { error: 'Invalid JSON in request body' },
          { status: 400 }
        ),
      };
    }
    
    return {
      success: false,
      error: NextResponse.json(
        { error: 'Failed to parse request body' },
        { status: 400 }
      ),
    };
  }
}

// ============================================================================
// Query Parameter Validation
// ============================================================================

/**
 * Validate URL query parameters against a Zod schema
 * @param request - Incoming request
 * @param schema - Zod schema to validate against
 * @returns Validation result with parsed data or error response
 */
export function validateQueryParams<T>(
  request: Request,
  schema: ZodSchema<T>
): ValidationResult<T> {
  try {
    const { searchParams } = new URL(request.url);
    const params: Record<string, string | undefined> = {};
    
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    
    const data = schema.parse(params);
    return { success: true, data };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        error: NextResponse.json(
          {
            error: 'Invalid query parameters',
            details: formatZodErrors(error),
          },
          { status: 400 }
        ),
      };
    }
    
    return {
      success: false,
      error: NextResponse.json(
        { error: 'Failed to parse query parameters' },
        { status: 400 }
      ),
    };
  }
}

// ============================================================================
// Form Data Validation
// ============================================================================

/**
 * Validate form data against a Zod schema
 * @param request - Incoming request
 * @param schema - Zod schema to validate against
 * @returns Validation result with parsed data or error response
 */
export async function validateFormData<T>(
  request: Request,
  schema: ZodSchema<T>
): Promise<ValidationResult<T>> {
  try {
    const formData = await request.formData();
    const data: Record<string, unknown> = {};
    
    formData.forEach((value, key) => {
      // Handle File objects separately
      if (value instanceof File) {
        data[key] = value;
      } else {
        data[key] = value;
      }
    });
    
    const parsed = schema.parse(data);
    return { success: true, data: parsed };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        error: NextResponse.json(
          {
            error: 'Validation failed',
            details: formatZodErrors(error),
          },
          { status: 400 }
        ),
      };
    }
    
    return {
      success: false,
      error: NextResponse.json(
        { error: 'Failed to parse form data' },
        { status: 400 }
      ),
    };
  }
}

// ============================================================================
// Route Parameter Validation
// ============================================================================

/**
 * Validate route parameters (e.g., [id] in /api/folders/[id])
 * @param params - Route parameters object
 * @param schema - Zod schema to validate against
 * @returns Validation result with parsed data or error response
 */
export function validateRouteParams<T>(
  params: Record<string, string>,
  schema: ZodSchema<T>
): ValidationResult<T> {
  try {
    const data = schema.parse(params);
    return { success: true, data };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        error: NextResponse.json(
          {
            error: 'Invalid route parameters',
            details: formatZodErrors(error),
          },
          { status: 400 }
        ),
      };
    }
    
    return {
      success: false,
      error: NextResponse.json(
        { error: 'Failed to validate route parameters' },
        { status: 400 }
      ),
    };
  }
}

// ============================================================================
// Error Formatting
// ============================================================================

/**
 * Format Zod validation errors into a user-friendly structure
 * @param error - ZodError instance
 * @returns Formatted error details
 */
export function formatZodErrors(error: ZodError): Record<string, string[]> {
  const errors: Record<string, string[]> = {};
  
  for (const issue of error.issues) {
    const path = issue.path.join('.') || '_root';
    if (!errors[path]) {
      errors[path] = [];
    }
    errors[path].push(issue.message);
  }
  
  return errors;
}

/**
 * Get the first error message from a ZodError
 * @param error - ZodError instance
 * @returns First error message
 */
export function getFirstZodError(error: ZodError): string {
  return error.issues[0]?.message || 'Validation failed';
}

// ============================================================================
// Combined Validation Helper
// ============================================================================

/**
 * Create a validated API handler with automatic request validation
 * @param schema - Zod schema for request body
 * @param handler - Handler function that receives validated data
 * @returns API route handler
 */
export function withValidation<T>(
  schema: ZodSchema<T>,
  handler: (data: T, request: Request) => Promise<NextResponse>
) {
  return async (request: Request): Promise<NextResponse> => {
    const validation = await validateRequestBody(request, schema);
    
    if (!validation.success) {
      return validation.error!;
    }
    
    return handler(validation.data!, request);
  };
}
