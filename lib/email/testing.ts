import { EmailOptions, EmailResult } from './smtp2go'
import { EmailTemplate } from './templates/base'

// Email testing and preview functionality
export interface EmailTestOptions {
  template: EmailTemplate
  recipients?: string[]
  testMode?: boolean
  captureMode?: boolean
}

export interface CapturedEmail {
  id: string
  timestamp: Date
  to: string[]
  cc?: string[]
  bcc?: string[]
  subject: string
  html: string
  text: string
  priority?: string
  tags?: string[]
  attachments?: Array<{
    filename: string
    size: number
    contentType: string
  }>
}

// In-memory email capture for testing (in production, this could be Redis)
class EmailCapture {
  private captured: Map<string, CapturedEmail> = new Map()
  private maxCaptures = 1000 // Limit memory usage

  capture(email: EmailOptions): string {
    const id = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const capturedEmail: CapturedEmail = {
      id,
      timestamp: new Date(),
      to: Array.isArray(email.to) ? email.to : [email.to],
      cc: email.cc ? (Array.isArray(email.cc) ? email.cc : [email.cc]) : undefined,
      bcc: email.bcc ? (Array.isArray(email.bcc) ? email.bcc : [email.bcc]) : undefined,
      subject: email.subject,
      html: email.html || '',
      text: email.text || '',
      priority: email.priority,
      tags: email.tags,
      attachments: email.attachments?.map(att => ({
        filename: att.filename,
        size: Buffer.isBuffer(att.content) ? att.content.length : att.content.length,
        contentType: att.contentType,
      })),
    }

    // Manage memory by removing old captures
    if (this.captured.size >= this.maxCaptures) {
      const oldestKey = this.captured.keys().next().value
      this.captured.delete(oldestKey)
    }

    this.captured.set(id, capturedEmail)
    console.log(`📧 Email captured in test mode: ${id}`)
    
    return id
  }

  get(id: string): CapturedEmail | null {
    return this.captured.get(id) || null
  }

  getAll(): CapturedEmail[] {
    return Array.from(this.captured.values()).sort((a, b) => 
      b.timestamp.getTime() - a.timestamp.getTime()
    )
  }

  clear(): void {
    this.captured.clear()
  }

  getByRecipient(email: string): CapturedEmail[] {
    return this.getAll().filter(captured => 
      captured.to.includes(email) ||
      captured.cc?.includes(email) ||
      captured.bcc?.includes(email)
    )
  }

  count(): number {
    return this.captured.size
  }
}

// Email testing service
export class EmailTestingService {
  private emailCapture = new EmailCapture()
  private isTestMode = process.env.NODE_ENV === 'test' || process.env.EMAIL_TEST_MODE === 'true'
  private isCaptureMode = process.env.EMAIL_CAPTURE_MODE === 'true'

  // Check if we're in test mode
  getTestMode(): boolean {
    return this.isTestMode || this.isCaptureMode
  }

  // Enable/disable test mode
  setTestMode(enabled: boolean): void {
    this.isTestMode = enabled
  }

  // Enable/disable capture mode
  setCaptureMode(enabled: boolean): void {
    this.isCaptureMode = enabled
  }

  // Capture email instead of sending (for testing)
  captureEmail(emailOptions: EmailOptions): EmailResult {
    const captureId = this.emailCapture.capture(emailOptions)
    
    return {
      success: true,
      requestId: captureId,
      messageId: captureId,
    }
  }

  // Get captured emails
  getCapturedEmails(): CapturedEmail[] {
    return this.emailCapture.getAll()
  }

  // Get specific captured email
  getCapturedEmail(id: string): CapturedEmail | null {
    return this.emailCapture.get(id)
  }

  // Get captured emails for specific recipient
  getCapturedEmailsForRecipient(email: string): CapturedEmail[] {
    return this.emailCapture.getByRecipient(email)
  }

  // Clear captured emails
  clearCapturedEmails(): void {
    this.emailCapture.clear()
  }

  // Get capture statistics
  getCaptureStats(): {
    total: number
    byRecipient: Record<string, number>
    bySubject: Record<string, number>
    recentCount: number
  } {
    const emails = this.emailCapture.getAll()
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    
    const byRecipient: Record<string, number> = {}
    const bySubject: Record<string, number> = {}
    let recentCount = 0

    emails.forEach(email => {
      // Count by recipient
      email.to.forEach(recipient => {
        byRecipient[recipient] = (byRecipient[recipient] || 0) + 1
      })

      // Count by subject
      bySubject[email.subject] = (bySubject[email.subject] || 0) + 1

      // Count recent emails
      if (email.timestamp > oneHourAgo) {
        recentCount++
      }
    })

    return {
      total: emails.length,
      byRecipient,
      bySubject,
      recentCount,
    }
  }

  // Generate test email data
  generateTestEmailData(templateType: string, recipientEmail?: string): any {
    const testEmail = recipientEmail || 'test@example.com'
    const testName = 'Test User'
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

    const commonData = {
      recipient: { name: testName, email: testEmail },
      sender: { name: 'PrintMarket', email: 'noreply@printmarket.com' },
    }

    switch (templateType) {
      case 'welcome':
        return {
          ...commonData,
          userRole: 'customer',
          loginUrl: `${baseUrl}/auth/signin`,
          profileUrl: `${baseUrl}/profile`,
          supportUrl: `${baseUrl}/support`,
        }

      case 'verification':
        return {
          ...commonData,
          verificationUrl: `${baseUrl}/auth/verify-email?token=test-token-123`,
          verificationCode: 'TEST123',
          expiresIn: '24 hours',
        }

      case 'password-reset':
        return {
          ...commonData,
          resetUrl: `${baseUrl}/auth/reset-password?token=test-reset-token`,
          resetCode: 'RESET123',
          expiresIn: '15 minutes',
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0 (Test Browser)',
          requestTime: new Date().toLocaleString(),
        }

      case 'profile-verification':
        return {
          ...commonData,
          businessName: 'Test Print Shop',
          verificationStatus: 'approved' as const,
          dashboardUrl: `${baseUrl}/dashboard`,
          supportUrl: `${baseUrl}/support`,
        }

      case 'maintenance':
        return {
          ...commonData,
          maintenanceType: 'scheduled' as const,
          startTime: 'March 15, 2024 at 2:00 AM UTC',
          endTime: 'March 15, 2024 at 4:00 AM UTC',
          duration: '2 hours',
          affectedServices: ['Email delivery', 'File uploads', 'Payment processing'],
          reason: 'Database maintenance and security updates',
          statusPageUrl: `${baseUrl}/status`,
          supportUrl: `${baseUrl}/support`,
        }

      case 'feature-announcement':
        return {
          ...commonData,
          userRole: 'customer',
          featureName: 'Advanced Order Tracking',
          featureDescription: 'Track your print orders in real-time with detailed status updates and estimated delivery times.',
          benefits: [
            'Real-time order status updates',
            'Estimated delivery times',
            'SMS and email notifications',
            'Direct communication with print shops'
          ],
          availabilityDate: 'March 1, 2024',
          learnMoreUrl: `${baseUrl}/features/order-tracking`,
        }

      case 'security-alert':
        return {
          ...commonData,
          alertType: 'suspicious_login' as const,
          timestamp: new Date().toLocaleString(),
          ipAddress: '203.0.113.1',
          location: 'New York, NY, US',
          device: 'Chrome on Windows',
          actionRequired: true,
          actionUrl: `${baseUrl}/security/review`,
          supportUrl: `${baseUrl}/support`,
        }

      default:
        return commonData
    }
  }

  // Preview email template with test data
  async previewTemplate(templateType: string, customData?: any): Promise<EmailTemplate> {
    const testData = { ...this.generateTestEmailData(templateType), ...customData }

    // Dynamically import the template generator
    let template: EmailTemplate

    switch (templateType) {
      case 'welcome': {
        const { generateWelcomeEmail } = await import('./templates/welcome')
        template = generateWelcomeEmail(testData)
        break
      }
      case 'verification': {
        const { generateEmailVerificationEmail } = await import('./templates/verification')
        template = generateEmailVerificationEmail(testData)
        break
      }
      case 'password-reset': {
        const { generatePasswordResetEmail } = await import('./templates/password-reset')
        template = generatePasswordResetEmail(testData)
        break
      }
      case 'profile-verification': {
        const { generateProfileVerificationEmail } = await import('./templates/verification')
        template = generateProfileVerificationEmail(testData)
        break
      }
      case 'maintenance': {
        const { generateSystemMaintenanceEmail } = await import('./templates/system-notifications')
        template = generateSystemMaintenanceEmail(testData)
        break
      }
      case 'feature-announcement': {
        const { generateFeatureAnnouncementEmail } = await import('./templates/system-notifications')
        template = generateFeatureAnnouncementEmail(testData)
        break
      }
      case 'security-alert': {
        const { generateSecurityAlertEmail } = await import('./templates/system-notifications')
        template = generateSecurityAlertEmail(testData)
        break
      }
      default:
        throw new Error(`Unknown template type: ${templateType}`)
    }

    return template
  }

  // Send test email
  async sendTestEmail(templateType: string, recipients: string[], customData?: any): Promise<EmailResult[]> {
    const template = await this.previewTemplate(templateType, customData)
    const results: EmailResult[] = []

    for (const recipient of recipients) {
      const emailOptions: EmailOptions = {
        to: recipient,
        subject: `[TEST] ${template.subject}`,
        html: template.html,
        text: template.text,
        priority: 'normal',
        tags: ['test', templateType],
      }

      if (this.getTestMode()) {
        // Capture instead of sending
        const result = this.captureEmail(emailOptions)
        results.push(result)
      } else {
        // Actually send the email
        const { sendEmail } = await import('./smtp2go')
        const result = await sendEmail(emailOptions)
        results.push(result)
      }
    }

    return results
  }

  // Validate email template
  validateTemplate(template: EmailTemplate): {
    valid: boolean
    errors: string[]
    warnings: string[]
  } {
    const errors: string[] = []
    const warnings: string[] = []

    // Check required fields
    if (!template.subject || template.subject.trim().length === 0) {
      errors.push('Subject is required')
    }

    if (!template.html || template.html.trim().length === 0) {
      errors.push('HTML content is required')
    }

    if (!template.text || template.text.trim().length === 0) {
      warnings.push('Text content is missing - this may cause issues with email clients that don\'t support HTML')
    }

    // Check for common issues
    if (template.subject.length > 100) {
      warnings.push('Subject line is very long and may be truncated by email clients')
    }

    if (template.html.includes('{{') && template.html.includes('}}')) {
      errors.push('Template contains unresolved variables ({{variable}})')
    }

    if (!template.html.includes('unsubscribe')) {
      warnings.push('Email does not contain unsubscribe link')
    }

    // Check for responsive design indicators
    if (!template.html.includes('viewport') && !template.html.includes('@media')) {
      warnings.push('Email may not be mobile-responsive')
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    }
  }
}

// Singleton instance
let emailTestingService: EmailTestingService | null = null

export function getEmailTestingService(): EmailTestingService {
  if (!emailTestingService) {
    emailTestingService = new EmailTestingService()
  }
  return emailTestingService
}

// Convenience functions for testing
export async function previewEmailTemplate(templateType: string, customData?: any): Promise<EmailTemplate> {
  const service = getEmailTestingService()
  return service.previewTemplate(templateType, customData)
}

export async function sendTestEmail(templateType: string, recipients: string[]): Promise<EmailResult[]> {
  const service = getEmailTestingService()
  return service.sendTestEmail(templateType, recipients)
}

export function getCapturedEmails(): CapturedEmail[] {
  const service = getEmailTestingService()
  return service.getCapturedEmails()
}

export function clearTestEmails(): void {
  const service = getEmailTestingService()
  service.clearCapturedEmails()
}