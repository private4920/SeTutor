"use client";

import { memo } from 'react';

interface FormErrorProps {
  message?: string;
  className?: string;
}

/**
 * Form field error message component
 * Requirements: 4.5 - Add form validation error displays
 */
export const FormError = memo(function FormError({ 
  message, 
  className = '' 
}: FormErrorProps) {
  if (!message) return null;

  return (
    <p 
      className={`mt-1 text-sm text-red-600 ${className}`}
      role="alert"
    >
      {message}
    </p>
  );
});

interface FormFieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
}

/**
 * Form field wrapper with label and error display
 */
export function FormField({ 
  label, 
  htmlFor, 
  error, 
  required, 
  children,
  hint 
}: FormFieldProps) {
  return (
    <div className="space-y-1">
      <label 
        htmlFor={htmlFor} 
        className="block text-sm font-medium text-gray-700"
      >
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="text-xs text-gray-500">{hint}</p>
      )}
      <FormError message={error} />
    </div>
  );
}

interface FormErrorSummaryProps {
  errors: Record<string, string | undefined>;
  title?: string;
}

/**
 * Summary of all form errors displayed at the top of a form
 */
export function FormErrorSummary({ 
  errors, 
  title = 'Please fix the following errors:' 
}: FormErrorSummaryProps) {
  const errorMessages = Object.entries(errors)
    .filter(([, message]) => message)
    .map(([field, message]) => ({ field, message: message! }));

  if (errorMessages.length === 0) return null;

  return (
    <div 
      className="rounded-lg border border-red-200 bg-red-50 p-4"
      role="alert"
      aria-live="polite"
    >
      <div className="flex">
        <svg 
          className="h-5 w-5 flex-shrink-0 text-red-400" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
          />
        </svg>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">{title}</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-red-700">
            {errorMessages.map(({ field, message }) => (
              <li key={field}>{message}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

interface InputWithErrorProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

/**
 * Input component with error styling
 */
export const InputWithError = memo(function InputWithError({ 
  error, 
  className = '', 
  ...props 
}: InputWithErrorProps) {
  const baseClasses = 'block w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-offset-0';
  const normalClasses = 'border-gray-300 focus:border-blue-500 focus:ring-blue-500';
  const errorClasses = 'border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50';

  return (
    <div>
      <input
        className={`${baseClasses} ${error ? errorClasses : normalClasses} ${className}`}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${props.id}-error` : undefined}
        {...props}
      />
      {error && (
        <p 
          id={`${props.id}-error`}
          className="mt-1 text-sm text-red-600"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
});

interface TextareaWithErrorProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

/**
 * Textarea component with error styling
 */
export const TextareaWithError = memo(function TextareaWithError({ 
  error, 
  className = '', 
  ...props 
}: TextareaWithErrorProps) {
  const baseClasses = 'block w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-offset-0';
  const normalClasses = 'border-gray-300 focus:border-blue-500 focus:ring-blue-500';
  const errorClasses = 'border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50';

  return (
    <div>
      <textarea
        className={`${baseClasses} ${error ? errorClasses : normalClasses} ${className}`}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${props.id}-error` : undefined}
        {...props}
      />
      {error && (
        <p 
          id={`${props.id}-error`}
          className="mt-1 text-sm text-red-600"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
});
