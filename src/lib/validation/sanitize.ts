/**
 * Input sanitization utilities for XSS and injection prevention
 * Implements Requirements 11.3 - Input validation and sanitization
 */

// ============================================================================
// XSS Prevention
// ============================================================================

/**
 * HTML entities map for escaping
 */
const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;',
};

/**
 * Escape HTML special characters to prevent XSS attacks
 * @param input - String to escape
 * @returns Escaped string safe for HTML output
 */
export function escapeHtml(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }
  return input.replace(/[&<>"'`=/]/g, (char) => HTML_ENTITIES[char] || char);
}

/**
 * Remove HTML tags from input
 * @param input - String to strip tags from
 * @returns String with HTML tags removed
 */
export function stripHtmlTags(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }
  return input.replace(/<[^>]*>/g, '');
}

/**
 * Sanitize string for safe display - removes dangerous patterns
 * @param input - String to sanitize
 * @returns Sanitized string
 */
export function sanitizeForDisplay(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }
  
  let sanitized = input;
  
  // Remove script tags and their content
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove event handlers (onclick, onerror, etc.)
  sanitized = sanitized.replace(/\bon\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/\bon\w+\s*=\s*[^\s>]*/gi, '');
  
  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, '');
  
  // Remove data: protocol (can be used for XSS)
  sanitized = sanitized.replace(/data:/gi, '');
  
  // Remove vbscript: protocol
  sanitized = sanitized.replace(/vbscript:/gi, '');
  
  // Escape remaining HTML entities
  sanitized = escapeHtml(sanitized);
  
  return sanitized;
}

/**
 * Check if a string contains potentially dangerous XSS patterns
 * @param input - String to check
 * @returns true if dangerous patterns detected
 */
export function containsXssPatterns(input: string): boolean {
  if (typeof input !== 'string') {
    return false;
  }
  
  const xssPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /data:/i,
    /vbscript:/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /<form/i,
    /expression\s*\(/i,
    /url\s*\(/i,
  ];
  
  return xssPatterns.some((pattern) => pattern.test(input));
}

// ============================================================================
// SQL Injection Prevention
// ============================================================================

/**
 * Common SQL injection patterns
 */
const SQL_INJECTION_PATTERNS = [
  /'\s*or\s+'?1'?\s*=\s*'?1/i,
  /'\s*or\s+'?'?\s*=\s*'?/i,
  /;\s*drop\s+table/i,
  /;\s*delete\s+from/i,
  /;\s*insert\s+into/i,
  /;\s*update\s+\w+\s+set/i,
  /union\s+select/i,
  /union\s+all\s+select/i,
  /'\s*;\s*--/i,
  /--\s*$/,
  /\/\*.*\*\//,
  /xp_cmdshell/i,
  /exec\s*\(/i,
  /execute\s*\(/i,
];

/**
 * Check if a string contains SQL injection patterns
 * @param input - String to check
 * @returns true if SQL injection patterns detected
 */
export function containsSqlInjectionPatterns(input: string): boolean {
  if (typeof input !== 'string') {
    return false;
  }
  
  return SQL_INJECTION_PATTERNS.some((pattern) => pattern.test(input));
}

/**
 * Escape special characters for SQL (use parameterized queries instead when possible)
 * This is a fallback - always prefer parameterized queries
 * @param input - String to escape
 * @returns Escaped string
 */
export function escapeSqlString(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }
  
  // Double single quotes (standard SQL escaping)
  return input.replace(/'/g, "''");
}

/**
 * Sanitize input for use in LIKE queries
 * Escapes SQL wildcards and special characters
 * @param input - String to sanitize
 * @returns Sanitized string safe for LIKE queries
 */
export function sanitizeForLikeQuery(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }
  
  // Escape SQL LIKE wildcards
  return input
    .replace(/\\/g, '\\\\')
    .replace(/%/g, '\\%')
    .replace(/_/g, '\\_');
}

// ============================================================================
// General Input Sanitization
// ============================================================================

/**
 * Sanitize a string for safe storage and display
 * Combines multiple sanitization techniques
 * @param input - String to sanitize
 * @returns Sanitized string
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }
  
  let sanitized = input;
  
  // Trim whitespace
  sanitized = sanitized.trim();
  
  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');
  
  // Normalize unicode
  sanitized = sanitized.normalize('NFC');
  
  // Remove control characters except newlines and tabs
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  return sanitized;
}

/**
 * Sanitize a filename for safe storage
 * @param filename - Filename to sanitize
 * @returns Sanitized filename
 */
export function sanitizeFilename(filename: string): string {
  if (typeof filename !== 'string') {
    return '';
  }
  
  let sanitized = filename;
  
  // Remove path traversal attempts
  sanitized = sanitized.replace(/\.\./g, '');
  sanitized = sanitized.replace(/[/\\]/g, '');
  
  // Remove dangerous characters
  sanitized = sanitized.replace(/[<>:"|?*\x00-\x1F]/g, '');
  
  // Replace spaces with underscores
  sanitized = sanitized.replace(/\s+/g, '_');
  
  // Limit length
  if (sanitized.length > 255) {
    const ext = sanitized.split('.').pop() || '';
    const name = sanitized.slice(0, 255 - ext.length - 1);
    sanitized = `${name}.${ext}`;
  }
  
  return sanitized;
}

/**
 * Sanitize a folder/path name
 * @param name - Name to sanitize
 * @returns Sanitized name
 */
export function sanitizeFolderName(name: string): string {
  if (typeof name !== 'string') {
    return '';
  }
  
  let sanitized = name;
  
  // Trim whitespace
  sanitized = sanitized.trim();
  
  // Remove path separators
  sanitized = sanitized.replace(/[/\\]/g, '');
  
  // Remove dangerous characters
  sanitized = sanitized.replace(/[<>:"|?*\x00-\x1F]/g, '');
  
  // Limit length
  if (sanitized.length > 255) {
    sanitized = sanitized.slice(0, 255);
  }
  
  return sanitized;
}

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Validate and sanitize input, returning result with error if invalid
 * @param input - Input to validate
 * @param options - Validation options
 * @returns Validation result
 */
export function validateAndSanitize(
  input: string,
  options: {
    maxLength?: number;
    minLength?: number;
    allowHtml?: boolean;
    checkSqlInjection?: boolean;
    checkXss?: boolean;
  } = {}
): { valid: boolean; sanitized: string; error?: string } {
  const {
    maxLength = 1000,
    minLength = 0,
    allowHtml = false,
    checkSqlInjection = true,
    checkXss = true,
  } = options;
  
  if (typeof input !== 'string') {
    return { valid: false, sanitized: '', error: 'Input must be a string' };
  }
  
  let sanitized = sanitizeInput(input);
  
  // Check length
  if (sanitized.length < minLength) {
    return { valid: false, sanitized, error: `Input must be at least ${minLength} characters` };
  }
  
  if (sanitized.length > maxLength) {
    return { valid: false, sanitized, error: `Input cannot exceed ${maxLength} characters` };
  }
  
  // Check for XSS patterns
  if (checkXss && containsXssPatterns(sanitized)) {
    return { valid: false, sanitized, error: 'Input contains potentially dangerous content' };
  }
  
  // Check for SQL injection patterns
  if (checkSqlInjection && containsSqlInjectionPatterns(sanitized)) {
    return { valid: false, sanitized, error: 'Input contains invalid characters' };
  }
  
  // Sanitize HTML if not allowed
  if (!allowHtml) {
    sanitized = stripHtmlTags(sanitized);
  }
  
  return { valid: true, sanitized };
}
