import { EmailOptions } from './smtp2go'
import { EmailJobType, queueWelcomeEmail, queueVerificationEmail, queuePasswordResetEmail, queueSystemNotification } from './email-queue'

// Import email templates
import { generateWelcomeEmail, generateCustomerWelcomeEmail, generateCreatorWelcomeEmail, generatePrintShopWelcomeEmail } from './templates/welcome'
import { generateEmailVerificationEmail, generateProfileVerificationEmail } from './templates/verification'
import { generatePasswordResetEmail, generatePasswordChangeConfirmationEmail } from './templates/password-reset'
import { generateSystemMaintenanceEmail, generateFeatureAnnouncementEmail, generateSecurityAlertEmail } from './templates/system-notifications'

// Base URLs for the application
const getBaseUrls = () => {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  return {
    base: baseUrl,
    login: `${baseUrl}/auth/signin`,
    profile: `${baseUrl}/profile`,
    verification: `${baseUrl}/auth/verify-email`,
    passwordReset: `${baseUrl}/auth/reset-password`,
    dashboard: `${baseUrl}/dashboard`,
    support: `${baseUrl}/support`,
    help: `${baseUrl}/help`,
    unsubscribe: `${baseUrl}/unsubscribe`,
    preferences: `${baseUrl}/email-preferences`,
    status: `${baseUrl}/status`,
  }
}

// Notification service class
export class EmailNotificationService {
  private baseUrls = getBaseUrls()

  // Welcome emails for new users
  async sendWelcomeEmail(data: {
    recipientEmail: string
    recipientName: string
    userRole: 'customer' | 'creator' | 'printShop' | 'admin'
  }): Promise<string> {
    const emailData = {
      recipient: {
        name: data.recipientName,
        email: data.recipientEmail,
      },
      sender: {
        name: 'PrintMarket',
        email: process.env.SMTP2GO_SENDER_EMAIL || 'noreply@printmarket.com',
      },
      userRole: data.userRole,
      loginUrl: this.baseUrls.login,
      profileUrl: this.baseUrls.profile,
      supportUrl: this.baseUrls.support,
    }

    const template = generateWelcomeEmail(emailData)
    
    const emailOptions: EmailOptions = {
      to: data.recipientEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
      priority: 'high',
      tags: ['welcome', data.userRole],
    }

    return queueWelcomeEmail(emailOptions)
  }

  // Email verification
  async sendEmailVerification(data: {
    recipientEmail: string
    recipientName: string
    verificationToken: string
    expiresInMinutes?: number
  }): Promise<string> {
    const expiresIn = data.expiresInMinutes || 1440 // 24 hours default
    const verificationUrl = `${this.baseUrls.verification}?token=${data.verificationToken}`
    const verificationCode = data.verificationToken.substring(0, 6).toUpperCase()

    const emailData = {
      recipient: {
        name: data.recipientName,
        email: data.recipientEmail,
      },
      sender: {
        name: 'PrintMarket',
        email: process.env.SMTP2GO_SENDER_EMAIL || 'noreply@printmarket.com',
      },
      verificationUrl,
      verificationCode,
      expiresIn: expiresIn > 60 ? `${Math.round(expiresIn / 60)} hours` : `${expiresIn} minutes`,
    }

    const template = generateEmailVerificationEmail(emailData)
    
    const emailOptions: EmailOptions = {
      to: data.recipientEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
      priority: 'high',
      tags: ['verification', 'authentication'],
    }

    return queueVerificationEmail(emailOptions)
  }

  // Password reset
  async sendPasswordReset(data: {
    recipientEmail: string
    recipientName: string
    resetToken: string
    ipAddress?: string
    userAgent?: string
    expiresInMinutes?: number
  }): Promise<string> {
    const expiresIn = data.expiresInMinutes || 15 // 15 minutes default
    const resetUrl = `${this.baseUrls.passwordReset}?token=${data.resetToken}`
    const resetCode = data.resetToken.substring(0, 8).toUpperCase()

    const emailData = {
      recipient: {
        name: data.recipientName,
        email: data.recipientEmail,
      },
      sender: {
        name: 'PrintMarket',
        email: process.env.SMTP2GO_SENDER_EMAIL || 'noreply@printmarket.com',
      },
      resetUrl,
      resetCode,
      expiresIn: `${expiresIn} minutes`,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      requestTime: new Date().toLocaleString(),
    }

    const template = generatePasswordResetEmail(emailData)
    
    const emailOptions: EmailOptions = {
      to: data.recipientEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
      priority: 'urgent',
      tags: ['password-reset', 'security'],
    }

    return queuePasswordResetEmail(emailOptions)
  }

  // Password change confirmation
  async sendPasswordChangeConfirmation(data: {
    recipientEmail: string
    recipientName: string
    ipAddress?: string
    userAgent?: string
  }): Promise<string> {
    const emailData = {
      recipient: {
        name: data.recipientName,
        email: data.recipientEmail,
      },
      sender: {
        name: 'PrintMarket',
        email: process.env.SMTP2GO_SENDER_EMAIL || 'noreply@printmarket.com',
      },
      changeTime: new Date().toLocaleString(),
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      supportUrl: this.baseUrls.support,
    }

    const template = generatePasswordChangeConfirmationEmail(emailData)
    
    const emailOptions: EmailOptions = {
      to: data.recipientEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
      priority: 'high',
      tags: ['password-change', 'security'],
    }

    return queueSystemNotification(emailOptions)
  }

  // Print shop verification updates
  async sendPrintShopVerificationUpdate(data: {
    recipientEmail: string
    recipientName: string
    businessName: string
    verificationStatus: 'submitted' | 'under_review' | 'approved' | 'rejected'
    reviewNotes?: string
  }): Promise<string> {
    const emailData = {
      recipient: {
        name: data.recipientName,
        email: data.recipientEmail,
      },
      sender: {
        name: 'PrintMarket',
        email: process.env.SMTP2GO_SENDER_EMAIL || 'noreply@printmarket.com',
      },
      businessName: data.businessName,
      verificationStatus: data.verificationStatus,
      reviewNotes: data.reviewNotes,
      dashboardUrl: this.baseUrls.dashboard,
      supportUrl: this.baseUrls.support,
    }

    const template = generateProfileVerificationEmail(emailData)
    
    const emailOptions: EmailOptions = {
      to: data.recipientEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
      priority: data.verificationStatus === 'approved' ? 'high' : 'normal',
      tags: ['verification', 'print-shop', data.verificationStatus],
    }

    return queueSystemNotification(emailOptions)
  }

  // System maintenance notifications
  async sendMaintenanceNotification(data: {
    recipientEmail: string
    recipientName: string
    maintenanceType: 'scheduled' | 'emergency' | 'completed'
    startTime: string
    endTime: string
    duration: string
    affectedServices: string[]
    reason: string
  }): Promise<string> {
    const emailData = {
      recipient: {
        name: data.recipientName,
        email: data.recipientEmail,
      },
      sender: {
        name: 'PrintMarket',
        email: process.env.SMTP2GO_SENDER_EMAIL || 'noreply@printmarket.com',
      },
      maintenanceType: data.maintenanceType,
      startTime: data.startTime,
      endTime: data.endTime,
      duration: data.duration,
      affectedServices: data.affectedServices,
      reason: data.reason,
      statusPageUrl: this.baseUrls.status,
      supportUrl: this.baseUrls.support,
    }

    const template = generateSystemMaintenanceEmail(emailData)
    
    const emailOptions: EmailOptions = {
      to: data.recipientEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
      priority: data.maintenanceType === 'emergency' ? 'urgent' : 'normal',
      tags: ['maintenance', data.maintenanceType],
    }

    return queueSystemNotification(emailOptions)
  }

  // Feature announcements
  async sendFeatureAnnouncement(data: {
    recipientEmail: string
    recipientName: string
    userRole: 'customer' | 'creator' | 'printShop' | 'admin'
    featureName: string
    featureDescription: string
    benefits: string[]
    availabilityDate: string
    learnMoreUrl: string
  }): Promise<string> {
    const emailData = {
      recipient: {
        name: data.recipientName,
        email: data.recipientEmail,
      },
      sender: {
        name: 'PrintMarket',
        email: process.env.SMTP2GO_SENDER_EMAIL || 'noreply@printmarket.com',
      },
      featureName: data.featureName,
      featureDescription: data.featureDescription,
      benefits: data.benefits,
      availabilityDate: data.availabilityDate,
      learnMoreUrl: data.learnMoreUrl,
      userRole: data.userRole,
    }

    const template = generateFeatureAnnouncementEmail(emailData)
    
    const emailOptions: EmailOptions = {
      to: data.recipientEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
      priority: 'normal',
      tags: ['feature-announcement', data.userRole],
    }

    return queueSystemNotification(emailOptions)
  }

  // Security alerts
  async sendSecurityAlert(data: {
    recipientEmail: string
    recipientName: string
    alertType: 'suspicious_login' | 'password_change' | 'email_change' | 'account_locked' | 'unusual_activity'
    ipAddress?: string
    location?: string
    device?: string
    actionRequired: boolean
    actionUrl?: string
  }): Promise<string> {
    const emailData = {
      recipient: {
        name: data.recipientName,
        email: data.recipientEmail,
      },
      sender: {
        name: 'PrintMarket',
        email: process.env.SMTP2GO_SENDER_EMAIL || 'noreply@printmarket.com',
      },
      alertType: data.alertType,
      timestamp: new Date().toLocaleString(),
      ipAddress: data.ipAddress,
      location: data.location,
      device: data.device,
      actionRequired: data.actionRequired,
      actionUrl: data.actionUrl,
      supportUrl: this.baseUrls.support,
    }

    const template = generateSecurityAlertEmail(emailData)
    
    const emailOptions: EmailOptions = {
      to: data.recipientEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
      priority: data.actionRequired ? 'urgent' : 'high',
      tags: ['security', data.alertType],
    }

    return queueSystemNotification(emailOptions)
  }

  // Bulk notifications (for announcements, etc.)
  async sendBulkNotification(data: {
    recipients: Array<{
      email: string
      name: string
      userRole?: string
    }>
    subject: string
    htmlContent: string
    textContent: string
    tags?: string[]
  }): Promise<string[]> {
    const jobIds: string[] = []

    for (const recipient of data.recipients) {
      const emailOptions: EmailOptions = {
        to: recipient.email,
        subject: data.subject,
        html: data.htmlContent.replace('{{recipient.name}}', recipient.name),
        text: data.textContent.replace('{{recipient.name}}', recipient.name),
        priority: 'normal',
        tags: data.tags || ['bulk', 'announcement'],
      }

      const jobId = await queueSystemNotification(emailOptions)
      jobIds.push(jobId)
    }

    return jobIds
  }
}

// Singleton instance
let emailNotificationService: EmailNotificationService | null = null

export function getEmailNotificationService(): EmailNotificationService {
  if (!emailNotificationService) {
    emailNotificationService = new EmailNotificationService()
  }
  return emailNotificationService
}

// Convenience functions for common notifications
export async function sendWelcomeEmail(
  email: string,
  name: string,
  role: 'customer' | 'creator' | 'printShop' | 'admin'
): Promise<string> {
  const service = getEmailNotificationService()
  return service.sendWelcomeEmail({
    recipientEmail: email,
    recipientName: name,
    userRole: role,
  })
}

export async function sendEmailVerification(
  email: string,
  name: string,
  token: string
): Promise<string> {
  const service = getEmailNotificationService()
  return service.sendEmailVerification({
    recipientEmail: email,
    recipientName: name,
    verificationToken: token,
  })
}

export async function sendPasswordReset(
  email: string,
  name: string,
  token: string,
  ipAddress?: string,
  userAgent?: string
): Promise<string> {
  const service = getEmailNotificationService()
  return service.sendPasswordReset({
    recipientEmail: email,
    recipientName: name,
    resetToken: token,
    ipAddress,
    userAgent,
  })
}

export async function sendPrintShopVerificationUpdate(
  email: string,
  name: string,
  businessName: string,
  status: 'submitted' | 'under_review' | 'approved' | 'rejected',
  notes?: string
): Promise<string> {
  const service = getEmailNotificationService()
  return service.sendPrintShopVerificationUpdate({
    recipientEmail: email,
    recipientName: name,
    businessName,
    verificationStatus: status,
    reviewNotes: notes,
  })
}