/**
 * File security validation utilities
 */

// Dangerous file extensions that should never be allowed
const DANGEROUS_EXTENSIONS = [
  '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', '.jar',
  '.app', '.deb', '.pkg', '.dmg', '.rpm', '.msi', '.sh', '.ps1', '.php',
  '.asp', '.aspx', '.jsp', '.py', '.rb', '.pl', '.sql'
]

// Suspicious file patterns
const SUSPICIOUS_PATTERNS = [
  /\.(?:exe|bat|cmd|com|pif|scr|vbs|js|jar)$/i,
  /^\./, // Hidden files
  /[<>:"|?*]/, // Windows forbidden characters
  /\0/, // Null bytes
]

/**
 * Check if filename contains dangerous extensions
 */
export function hasDangerousExtension(fileName: string): boolean {
  const lowerFileName = fileName.toLowerCase()
  return DANGEROUS_EXTENSIONS.some(ext => lowerFileName.endsWith(ext))
}

/**
 * Check if filename matches suspicious patterns
 */
export function hasSuspiciousPattern(fileName: string): boolean {
  return SUSPICIOUS_PATTERNS.some(pattern => pattern.test(fileName))
}

/**
 * Sanitize filename by removing dangerous characters
 */
export function sanitizeFileName(fileName: string): string {
  // Remove dangerous characters and replace with underscore
  return fileName
    .replace(/[<>:"|?*\0]/g, '_')
    .replace(/\.\./g, '_') // Prevent directory traversal
    .replace(/^\.+/, '') // Remove leading dots
    .substring(0, 255) // Limit length
}

/**
 * Validate file MIME type against filename extension
 */
export function validateMimeType(fileName: string, mimeType: string): boolean {
  const extension = fileName.toLowerCase().split('.').pop()
  
  const mimeTypeMap: Record<string, string[]> = {
    'pdf': ['application/pdf'],
    'doc': ['application/msword'],
    'docx': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    'jpg': ['image/jpeg'],
    'jpeg': ['image/jpeg'],
    'png': ['image/png'],
    'gif': ['image/gif'],
    'webp': ['image/webp'],
  }
  
  if (!extension || !mimeTypeMap[extension]) {
    return false
  }
  
  return mimeTypeMap[extension].includes(mimeType.toLowerCase())
}

/**
 * Comprehensive file security check
 */
export function validateFileSecurity(fileName: string, mimeType: string): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  if (hasDangerousExtension(fileName)) {
    errors.push('File type not allowed for security reasons')
  }
  
  if (hasSuspiciousPattern(fileName)) {
    errors.push('Filename contains suspicious patterns')
  }
  
  if (!validateMimeType(fileName, mimeType)) {
    errors.push('File extension does not match MIME type')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Generate secure random filename while preserving extension
 */
export function generateSecureFileName(originalFileName: string, userId: string): string {
  const extension = originalFileName.split('.').pop()?.toLowerCase() || ''
  const timestamp = Date.now()
  const randomSuffix = Math.random().toString(36).substring(2, 8)
  
  return `${userId}_${timestamp}_${randomSuffix}.${extension}`
}