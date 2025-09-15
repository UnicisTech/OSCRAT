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


