/**
 * Common disposable/temporary email domains
 * This list includes popular free email services and known temporary email providers
 */
const DISPOSABLE_EMAIL_DOMAINS = new Set([
  // Popular temporary/disposable email services
  "tempmail.com",
  "throwaway.email",
  "guerrillamail.com",
  "guerrillamail.de",
  "guerrillamail.net",
  "guerrillamail.org",
  "guerrillamailblock.com",
  "mailinator.com",
  "maildrop.cc",
  "trashmail.com",
  "trashmail.me",
  "trashmail.net",
  "yopmail.com",
  "yopmail.fr",
  "10minutemail.com",
  "10minutemail.net",
  "sharklasers.com",
  "spam4.me",
  "temp-mail.org",
  "temp-mail.io",
  "tmpmail.com",
  "tmpmail.net",
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
  // Additional widely-used disposable services
  "dispostable.com",
  "mailcatch.com",
  "mailexpire.com",
  "mailforspam.com",
  "mailnull.com",
  "mailscrap.com",
  "mailseal.de",
  "mailzilla.com",
  "nomail.xl.cx",
  "nospam.ze.tc",
  "owlpic.com",
  "proxymail.eu",
  "rcpt.at",
  "reallymymail.com",
  "recode.me",
  "regbypass.com",
  "safetymail.info",
  "squizzy.de",
  "superrito.com",
  "suremail.info",
  "tempemail.co.za",
  "tempemail.net",
  "tempinbox.com",
  "tempmailer.com",
  "tempsky.com",
  "thrma.com",
  "throwam.com",
  "tmail.ws",
  "wegwerfemail.de",
  "wegwerfmail.de",
  "wegwerfmail.net",
  "wh4f.org",
  "yolanda.dev",
  "zehnminutenmail.de",
  "getairmail.com",
  "grr.la",
  "guerrillamail.info",
  "harakirimail.com",
  "jetable.org",
  "mohmal.com",
  "burner.kiwi",
  "burnermail.io",
  "discard.email",
  "dropmail.me",
  "emailfake.com",
  "emkei.cz",
  "getnada.com",
  "inboxbear.com",
  "mailsac.com",
  "mytemp.email",
  "tempail.com",
  "tempr.email",
  "throwaway.email",
  "trash-mail.com",
  // Other suspicious / test domains
  "test.com",
  "example.com",
  "example.org",
  "example.net",
  "temp.com",
  "fake.com",
  "spam.com",
  "nobody.com",
  "noone.com",
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
