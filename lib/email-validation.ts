/**
 * Common disposable/temporary email domains
 * This list includes popular free email services and known temporary email providers
 */
const DISPOSABLE_EMAIL_DOMAINS = new Set([
  // Temporary email services
  "tempmail.com",
  "throwaway.email",
  "guerrillamail.com",
  "mailinator.com",
  "maildrop.cc",
  "trashmail.com",
  "yopmail.com",
  "10minutemail.com",
  "sharklasers.com",
  "spam4.me",
  "temp-mail.org",
  "temp-mail.io",
  "tmpmail.com",
  "fakeinbox.com",
  "catchall.com",
  "deadaddress.com",
  "email.net.au",
  "fakeemail.com",
  "mailnesia.com",
  "mailst.net",
  "mintemail.com",
  "permalink.de",
  "sneakemail.com",
  "spamgourmet.com",
  "spamherelots.com",
  "emailondeck.com",
  "pokemail.net",
  "anonbox.net",
  // Other suspicious domains
  "test.com",
  "example.com",
  "temp.com",
  "fake.com",
  "spam.com",
]);

/**
 * Email regex pattern - RFC 5322 simplified
 * This pattern validates the basic structure of an email address
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validate email format and check for disposable/fake domains
 * @param email - The email address to validate
 * @returns Object with validation status and error message if invalid
 */
export function validateEmail(email: string): {
  isValid: boolean;
  error?: string;
} {
  const trimmedEmail = email.trim().toLowerCase();

  // Check for empty email
  if (!trimmedEmail) {
    return {
      isValid: false,
      error: "Email address is required",
    };
  }

  // Check email format
  if (!EMAIL_REGEX.test(trimmedEmail)) {
    return {
      isValid: false,
      error: "Please enter a valid email address",
    };
  }

  // Validate email length (RFC 5321)
  if (trimmedEmail.length > 254) {
    return {
      isValid: false,
      error: "Email address is too long",
    };
  }

  // Extract domain from email
  const domain = trimmedEmail.split("@")[1].toLowerCase();

  // Check for disposable/temporary email domains
  if (DISPOSABLE_EMAIL_DOMAINS.has(domain)) {
    return {
      isValid: false,
      error: "Please use a valid email address. Temporary email services are not allowed",
    };
  }

  // Check for obviously invalid patterns
  if (trimmedEmail.includes("..") || trimmedEmail.startsWith(".") || trimmedEmail.endsWith(".")) {
    return {
      isValid: false,
      error: "Please enter a valid email address",
    };
  }

  return {
    isValid: true,
  };
}

/**
 * Check if an email domain is a disposable/temporary email service
 * Useful for real-time validation feedback
 * @param email - The email address to check
 * @returns true if the domain is in the disposable list
 */
export function isDisposableEmail(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase();
  return domain ? DISPOSABLE_EMAIL_DOMAINS.has(domain) : false;
}
