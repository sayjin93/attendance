/**
 * Utility functions for password generation and email management
 */

/**
 * Generates a secure random password
 * @param length - Length of the password (default: 12)
 * @param includeSymbols - Whether to include special characters (default: true)
 * @returns A randomly generated password
 */
export function generateSecurePassword(length: number = 12, includeSymbols: boolean = true): string {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  let charset = lowercase + uppercase + numbers;
  if (includeSymbols) {
    charset += symbols;
  }
  
  let password = '';
  
  // Ensure at least one character from each required set
  password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
  password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
  password += numbers.charAt(Math.floor(Math.random() * numbers.length));
  
  if (includeSymbols && length > 3) {
    password += symbols.charAt(Math.floor(Math.random() * symbols.length));
  }
  
  // Fill the remaining length with random characters
  const remainingLength = length - password.length;
  for (let i = 0; i < remainingLength; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  
  // Shuffle the password to randomize the order
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

/**
 * Validates email format
 * @param email - Email address to validate
 * @returns True if email format is valid
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Formats a name with proper capitalization
 * @param name - Name to format
 * @returns Formatted name (First letter uppercase, rest lowercase)
 */
export function formatName(name: string): string {
  return name.trim().charAt(0).toUpperCase() + name.trim().slice(1).toLowerCase();
}

/**
 * Generates a username from email or name
 * @param email - Email address
 * @param firstName - First name (optional)
 * @param lastName - Last name (optional)
 * @returns Generated username
 */
export function generateUsername(email: string, firstName?: string, lastName?: string): string {
  if (firstName && lastName) {
    const cleanFirst = firstName.toLowerCase().replace(/[^a-z]/g, '');
    const cleanLast = lastName.toLowerCase().replace(/[^a-z]/g, '');
    return `${cleanFirst}.${cleanLast}`;
  }
  
  // Fallback to email prefix
  return email.split('@')[0].toLowerCase();
}