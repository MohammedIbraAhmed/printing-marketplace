import bcrypt from 'bcryptjs'
import crypto from 'crypto'

/**
 * Password complexity requirements
 */
export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
}

/**
 * Password validation result
 */
export interface PasswordValidationResult {
  isValid: boolean
  errors: string[]
  strength: 'weak' | 'medium' | 'strong' | 'very-strong'
}

/**
 * Validate password complexity
 */
export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = []
  let score = 0

  // Length check
  if (password.length < PASSWORD_REQUIREMENTS.minLength) {
    errors.push(`Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters long`)
  } else if (password.length >= 12) {
    score += 2
  } else {
    score += 1
  }

  if (password.length > PASSWORD_REQUIREMENTS.maxLength) {
    errors.push(`Password must not exceed ${PASSWORD_REQUIREMENTS.maxLength} characters`)
  }

  // Uppercase check
  if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  } else if (/[A-Z]/.test(password)) {
    score += 1
  }

  // Lowercase check
  if (PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  } else if (/[a-z]/.test(password)) {
    score += 1
  }

  // Numbers check
  if (PASSWORD_REQUIREMENTS.requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  } else if (/\d/.test(password)) {
    score += 1
  }

  // Special characters check
  if (PASSWORD_REQUIREMENTS.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*(),.?":{}|<>)')
  } else if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score += 1
  }

  // Common patterns check
  if (/(.)\1{2,}/.test(password)) {
    errors.push('Password should not contain repeated characters')
    score -= 1
  }

  if (/123|abc|qwe|asd/i.test(password)) {
    errors.push('Password should not contain common sequences')
    score -= 1
  }

  // Determine strength
  let strength: PasswordValidationResult['strength'] = 'weak'
  if (score >= 7) strength = 'very-strong'
  else if (score >= 5) strength = 'strong'
  else if (score >= 3) strength = 'medium'

  return {
    isValid: errors.length === 0,
    errors,
    strength,
  }
}

/**
 * Hash password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return await bcrypt.hash(password, saltRounds)
}

/**
 * Verify password against hash
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword)
}

/**
 * Generate secure random token
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex')
}

/**
 * Generate password reset token with expiration
 */
export interface PasswordResetToken {
  token: string
  hashedToken: string
  expiresAt: Date
}

export function generatePasswordResetToken(): PasswordResetToken {
  const token = generateSecureToken(32)
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex')
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

  return {
    token,
    hashedToken,
    expiresAt,
  }
}

/**
 * Verify password reset token
 */
export function verifyPasswordResetToken(token: string, hashedToken: string): boolean {
  const hashedInputToken = crypto.createHash('sha256').update(token).digest('hex')
  return hashedInputToken === hashedToken
}

/**
 * Generate email verification token
 */
export interface EmailVerificationToken {
  token: string
  hashedToken: string
  expiresAt: Date
}

export function generateEmailVerificationToken(): EmailVerificationToken {
  const token = generateSecureToken(32)
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex')
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

  return {
    token,
    hashedToken,
    expiresAt,
  }
}

/**
 * Check if password meets minimum requirements for login
 */
export function isPasswordSecure(password: string): boolean {
  return password.length >= PASSWORD_REQUIREMENTS.minLength &&
         /[A-Z]/.test(password) &&
         /[a-z]/.test(password) &&
         /\d/.test(password)
}

/**
 * Generate password strength score (0-100)
 */
export function calculatePasswordStrength(password: string): number {
  let score = 0
  
  // Length scoring
  if (password.length >= 8) score += 20
  if (password.length >= 12) score += 10
  if (password.length >= 16) score += 10
  
  // Character type scoring
  if (/[a-z]/.test(password)) score += 10
  if (/[A-Z]/.test(password)) score += 10
  if (/\d/.test(password)) score += 10
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 15
  
  // Variety scoring
  const uniqueChars = new Set(password).size
  if (uniqueChars >= 8) score += 15
  
  // Penalties
  if (/(.)\1{2,}/.test(password)) score -= 10
  if (/123|abc|qwe|asd/i.test(password)) score -= 15
  
  return Math.max(0, Math.min(100, score))
}