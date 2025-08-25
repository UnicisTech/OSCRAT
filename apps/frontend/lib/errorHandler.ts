import { ApiError } from '@/types';

/**
 * Handles API errors and returns user-friendly error messages
 */
export function handleApiError(error: ApiError): string {
  const message = error.message;
  
  // Handle specific known error cases
  
  // Authentication errors
  if (message.includes('Unauthorized')) {
    return 'Your session has expired. Please log in again.';
  }
  
  // Method not allowed
  if (message.includes('Method') && message.includes('Not Allowed')) {
    return 'Invalid request method. Please try again.';
  }
  
  // User registration errors
  if (message.includes('An user with this email already exists')) {
    return 'This email address is already registered. Please try logging in instead.';
  }
  
  // Recaptcha errors
  if (message.includes('Recaptcha validation failed') || message.includes('Invalid captcha')) {
    return 'Security verification failed. Please try again.';
  }
  
  // Invitation errors
  if (message.includes('Invitation expired')) {
    return 'Your invitation has expired. Please request a new one.';
  }
  
  if (message.includes('Failed to get invitation')) {
    return 'Invalid or expired invitation. Please request a new one.';
  }
  
  // Team creation errors
  if (message.includes('A team with the name already exists')) {
    return 'A team with this name already exists. Please choose a different name.';
  }
  
  // Database/server errors
  if (message.includes('Failed to create user') || message.includes('Failed to check existing user')) {
    return 'We\'re experiencing technical difficulties. Please try again in a few moments.';
  }
  
  // Return the original message for other API errors
  return message;
}

/**
 * Handles NextAuth authentication errors and returns user-friendly messages
 */
export function handleAuthError(error: string): string {
  switch (error) {
    case 'auth-limited':
      return 'Too many login attempts. Please wait a moment and try again.';
    case 'invalid-credentials':
      return 'Invalid email or password. Please try again.';
    case 'confirm-your-email':
      return 'Account created successfully! Please check your email for verification instructions before logging in.';
    case 'allow-only-work-email':
      return 'Only business email addresses are allowed for registration.';
    case 'no-credentials':
      return 'Login credentials are required. Please try again.';
    default:
      return 'Account created but login failed. Please try logging in manually.';
  }
}


