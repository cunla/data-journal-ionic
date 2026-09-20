// Turns a Firebase auth error into something worth showing the user.
// Returns null when the user simply cancelled, which needs no message.
export function authErrorMessage(error: { code?: string; message?: string } | string): string | null {
  if (typeof error === 'string') {
    return error;
  }
  switch (error?.code) {
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return null;
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Wrong email or password.';
    case 'auth/invalid-email':
      return 'That email address is not valid.';
    case 'auth/missing-password':
      return 'Please enter a password.';
    case 'auth/user-disabled':
      return 'This account has been disabled.';
    case 'auth/email-already-in-use':
      return 'An account with that email already exists.';
    case 'auth/weak-password':
      return 'Please choose a password of at least 6 characters.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a moment and try again.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection and try again.';
    case 'auth/popup-blocked':
      return 'Your browser blocked the sign-in popup. Allow popups and try again.';
    default:
      return error?.message || 'Something went wrong. Please try again.';
  }
}
