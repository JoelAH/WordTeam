// Common disposable email domains
const DISPOSABLE_EMAIL_DOMAINS = [
  'tempmail.com',
  'mailinator.com',
  'guerrillamail.com',
  'yopmail.com',
  'throwawaymail.com',
  '10minutemail.com',
  'temp-mail.org',
  'dispostable.com',
  'maildrop.cc',
  'tempmail.net',
  'fakeinbox.com',
  'trashmail.com',
  'sharklasers.com',
  'getairmail.com',
  'mailnesia.com'
];

// Basic email format validation
export const isValidEmailFormat = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Check if email is from a disposable domain
export const isDisposableEmail = (email: string): boolean => {
  const domain = email.split('@')[1]?.toLowerCase();
  return domain ? DISPOSABLE_EMAIL_DOMAINS.includes(domain) : false;
};

// Combined validation
export const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }

  if (!isValidEmailFormat(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  if (isDisposableEmail(email)) {
    return { isValid: false, error: 'Email is not valid' };
  }

  return { isValid: true };
}; 