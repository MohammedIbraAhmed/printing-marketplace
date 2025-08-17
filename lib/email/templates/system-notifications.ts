import { EmailTemplate, EmailTemplateData, createEmailTemplate } from './base'

export interface SystemMaintenanceData extends EmailTemplateData {
  recipient: {
    name: string
    email: string
  }
  maintenanceType: 'scheduled' | 'emergency' | 'completed'
  startTime: string
  endTime: string
  duration: string
  affectedServices: string[]
  reason: string
  statusPageUrl: string
  supportUrl: string
}

export const generateSystemMaintenanceEmail = (data: SystemMaintenanceData): EmailTemplate => {
  const getMaintenanceContent = (type: string) => {
    switch (type) {
      case 'scheduled':
        return {
          title: 'Scheduled Maintenance Notice',
          icon: '🔧',
          alertClass: 'alert-info',
          message: 'We have scheduled maintenance that may affect some PrintMarket services.',
          actionText: 'Prepare for maintenance'
        }
      case 'emergency':
        return {
          title: 'Emergency Maintenance in Progress',
          icon: '🚨',
          alertClass: 'alert-warning',
          message: 'We are performing emergency maintenance to resolve a critical issue.',
          actionText: 'Check current status'
        }
      case 'completed':
        return {
          title: 'Maintenance Completed',
          icon: '✅',
          alertClass: 'alert-success',
          message: 'Our scheduled maintenance has been completed successfully.',
          actionText: 'Resume normal operations'
        }
      default:
        return {
          title: 'System Maintenance Update',
          icon: '📋',
          alertClass: 'alert-info',
          message: 'There is an update regarding PrintMarket system maintenance.',
          actionText: 'View details'
        }
    }
  }

  const maintenanceContent = getMaintenanceContent(data.maintenanceType)

  const content = `
    <div class="text-center">
      <h1>${maintenanceContent.title}</h1>
      <p style="font-size: 18px; color: #64748b; margin-bottom: 32px;">
        Important information about PrintMarket services
      </p>
    </div>

    <div class="alert ${maintenanceContent.alertClass}">
      <strong>${maintenanceContent.icon} Service Notice</strong><br>
      Hi ${data.recipient.name}, ${maintenanceContent.message}
    </div>

    <h3>Maintenance Details:</h3>
    <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 16px 0;">
      <ul style="margin: 0; list-style: none; padding: 0;">
        <li style="margin: 8px 0;"><strong>Start Time:</strong> ${data.startTime}</li>
        <li style="margin: 8px 0;"><strong>End Time:</strong> ${data.endTime}</li>
        <li style="margin: 8px 0;"><strong>Duration:</strong> ${data.duration}</li>
        <li style="margin: 8px 0;"><strong>Reason:</strong> ${data.reason}</li>
      </ul>
    </div>

    <h3>Affected Services:</h3>
    <ul style="margin: 16px 0; padding-left: 20px;">
      ${data.affectedServices.map(service => `<li style="margin: 8px 0;">${service}</li>`).join('')}
    </ul>

    ${data.maintenanceType === 'scheduled' ? `
    <div style="background-color: #dbeafe; border: 1px solid #93c5fd; padding: 16px; border-radius: 6px; margin: 24px 0;">
      <h3 style="margin-top: 0; color: #1e40af;">📅 What to Expect</h3>
      <ul style="margin: 8px 0; color: #1e40af;">
        <li>Some features may be temporarily unavailable</li>
        <li>Active uploads or orders may be interrupted</li>
        <li>You may experience slower response times</li>
        <li>Please save your work before the maintenance window</li>
      </ul>
    </div>
    ` : ''}

    ${data.maintenanceType === 'emergency' ? `
    <div style="background-color: #fef3c7; border: 1px solid #fcd34d; padding: 16px; border-radius: 6px; margin: 24px 0;">
      <h3 style="margin-top: 0; color: #92400e;">⚠️ Emergency Maintenance</h3>
      <p style="color: #92400e; margin: 8px 0;">
        We discovered a critical issue that requires immediate attention. We apologize for any inconvenience and are working to restore full service as quickly as possible.
      </p>
    </div>
    ` : ''}

    ${data.maintenanceType === 'completed' ? `
    <div style="background-color: #dcfce7; border: 1px solid #86efac; padding: 16px; border-radius: 6px; margin: 24px 0;">
      <h3 style="margin-top: 0; color: #166534;">🎉 All Systems Operational</h3>
      <p style="color: #166534; margin: 8px 0;">
        All PrintMarket services are now fully operational. Thank you for your patience during the maintenance window.
      </p>
    </div>
    ` : ''}

    <div class="text-center" style="margin: 32px 0;">
      <a href="${data.statusPageUrl}" class="button">
        ${maintenanceContent.actionText}
      </a>
    </div>

    <div class="divider"></div>

    <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 24px 0;">
      <h3 style="margin-top: 0;">Stay Updated</h3>
      <p>For real-time updates on this maintenance and all system status information:</p>
      <p>
        <a href="${data.statusPageUrl}" style="color: #2563eb;">System Status Page</a> | 
        <a href="${data.supportUrl}" style="color: #2563eb;">Contact Support</a>
      </p>
    </div>

    <div class="text-center text-muted">
      <p>Thank you for your patience and understanding.</p>
      <p><strong>The PrintMarket Operations Team</strong></p>
    </div>
  `

  const subject = `${maintenanceContent.title} - PrintMarket`

  return createEmailTemplate(content, subject, data)
}

export interface FeatureAnnouncementData extends EmailTemplateData {
  recipient: {
    name: string
    email: string
  }
  featureName: string
  featureDescription: string
  benefits: string[]
  availabilityDate: string
  learnMoreUrl: string
  userRole: 'customer' | 'creator' | 'printShop' | 'admin'
}

export const generateFeatureAnnouncementEmail = (data: FeatureAnnouncementData): EmailTemplate => {
  const content = `
    <div class="text-center">
      <h1>🚀 New Feature: ${data.featureName}</h1>
      <p style="font-size: 18px; color: #64748b; margin-bottom: 32px;">
        We're excited to share what's new on PrintMarket!
      </p>
    </div>

    <div class="alert alert-success">
      <strong>✨ Something New for You</strong><br>
      Hi ${data.recipient.name}, we've just released a new feature that we think you'll love!
    </div>

    <div style="background-color: #dbeafe; border: 1px solid #3b82f6; padding: 24px; border-radius: 8px; margin: 24px 0;">
      <h3 style="margin-top: 0; color: #1e40af;">${data.featureName}</h3>
      <p style="color: #1e40af; margin: 0; font-size: 16px; line-height: 1.6;">
        ${data.featureDescription}
      </p>
    </div>

    <h3>What this means for you:</h3>
    <ul style="margin: 16px 0; padding-left: 20px;">
      ${data.benefits.map(benefit => `<li style="margin: 8px 0;">${benefit}</li>`).join('')}
    </ul>

    <div class="text-center" style="margin: 32px 0;">
      <a href="${data.learnMoreUrl}" class="button">
        Learn More & Try It Now
      </a>
    </div>

    <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 24px 0;">
      <h3 style="margin-top: 0;">📅 Availability</h3>
      <p style="margin: 8px 0;">
        <strong>Available:</strong> ${data.availabilityDate}
      </p>
      <p style="margin: 8px 0; color: #64748b; font-size: 14px;">
        This feature is now live for all ${data.userRole} accounts. No action required on your part!
      </p>
    </div>

    <div class="divider"></div>

    <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 24px 0;">
      <h3 style="margin-top: 0;">Need Help?</h3>
      <p>If you have questions about this new feature or need assistance:</p>
      <p>
        <a href="{{help_url}}" style="color: #2563eb;">View Documentation</a> | 
        <a href="{{support_url}}" style="color: #2563eb;">Contact Support</a> | 
        <a href="{{feedback_url}}" style="color: #2563eb;">Send Feedback</a>
      </p>
    </div>

    <div class="text-center text-muted">
      <p>Thanks for being part of the PrintMarket community!</p>
      <p><strong>The PrintMarket Product Team</strong></p>
    </div>
  `

  const subject = `🚀 New Feature: ${data.featureName} is now available!`

  return createEmailTemplate(content, subject, data)
}

export interface SecurityAlertData extends EmailTemplateData {
  recipient: {
    name: string
    email: string
  }
  alertType: 'suspicious_login' | 'password_change' | 'email_change' | 'account_locked' | 'unusual_activity'
  timestamp: string
  ipAddress?: string
  location?: string
  device?: string
  actionRequired: boolean
  actionUrl?: string
  supportUrl: string
}

export const generateSecurityAlertEmail = (data: SecurityAlertData): EmailTemplate => {
  const getAlertContent = (type: string) => {
    switch (type) {
      case 'suspicious_login':
        return {
          title: 'Suspicious Login Attempt',
          icon: '🔐',
          alertClass: 'alert-warning',
          message: 'We detected a login attempt from an unusual location or device.',
          severity: 'Medium'
        }
      case 'password_change':
        return {
          title: 'Password Changed',
          icon: '🔑',
          alertClass: 'alert-info',
          message: 'Your account password was recently changed.',
          severity: 'Info'
        }
      case 'email_change':
        return {
          title: 'Email Address Changed',
          icon: '📧',
          alertClass: 'alert-warning',
          message: 'Your account email address was recently updated.',
          severity: 'Medium'
        }
      case 'account_locked':
        return {
          title: 'Account Temporarily Locked',
          icon: '🚨',
          alertClass: 'alert-danger',
          message: 'Your account has been temporarily locked due to security concerns.',
          severity: 'High'
        }
      case 'unusual_activity':
        return {
          title: 'Unusual Account Activity',
          icon: '⚠️',
          alertClass: 'alert-warning',
          message: 'We detected unusual activity on your account.',
          severity: 'Medium'
        }
      default:
        return {
          title: 'Security Alert',
          icon: '🛡️',
          alertClass: 'alert-info',
          message: 'There is a security-related update for your account.',
          severity: 'Info'
        }
    }
  }

  const alertContent = getAlertContent(data.alertType)

  const content = `
    <div class="text-center">
      <h1>${alertContent.title}</h1>
      <p style="font-size: 18px; color: #64748b; margin-bottom: 32px;">
        Security notification for your PrintMarket account
      </p>
    </div>

    <div class="alert ${alertContent.alertClass}">
      <strong>${alertContent.icon} Security Alert - ${alertContent.severity} Priority</strong><br>
      Hi ${data.recipient.name}, ${alertContent.message}
    </div>

    <h3>Event Details:</h3>
    <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 16px 0;">
      <ul style="margin: 0; list-style: none; padding: 0;">
        <li style="margin: 8px 0;"><strong>Time:</strong> ${data.timestamp}</li>
        ${data.ipAddress ? `<li style="margin: 8px 0;"><strong>IP Address:</strong> ${data.ipAddress}</li>` : ''}
        ${data.location ? `<li style="margin: 8px 0;"><strong>Location:</strong> ${data.location}</li>` : ''}
        ${data.device ? `<li style="margin: 8px 0;"><strong>Device:</strong> ${data.device}</li>` : ''}
      </ul>
    </div>

    ${data.actionRequired ? `
    <div style="background-color: #fee2e2; border: 1px solid #fca5a5; padding: 16px; border-radius: 6px; margin: 24px 0;">
      <h3 style="margin-top: 0; color: #991b1b;">🚨 Action Required</h3>
      <p style="color: #991b1b; margin: 8px 0;">
        Please review this activity and take appropriate action to secure your account.
      </p>
      ${data.actionUrl ? `
      <div class="text-center" style="margin: 16px 0;">
        <a href="${data.actionUrl}" class="button button-danger">
          Secure My Account
        </a>
      </div>
      ` : ''}
    </div>
    ` : `
    <div style="background-color: #dbeafe; border: 1px solid #93c5fd; padding: 16px; border-radius: 6px; margin: 24px 0;">
      <h3 style="margin-top: 0; color: #1e40af;">ℹ️ No Action Required</h3>
      <p style="color: #1e40af; margin: 8px 0;">
        This is an informational alert. No immediate action is required, but we recommend reviewing your account activity.
      </p>
    </div>
    `}

    <h3>Security Recommendations:</h3>
    <ul style="margin: 16px 0; padding-left: 20px;">
      <li>Review your recent account activity</li>
      <li>Ensure your password is strong and unique</li>
      <li>Check that your email and contact information are correct</li>
      <li>Log out from any shared or public computers</li>
      <li>Contact us immediately if you notice anything suspicious</li>
    </ul>

    <div class="divider"></div>

    <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 24px 0;">
      <h3 style="margin-top: 0;">🆘 Need Immediate Help?</h3>
      <p>If you believe your account has been compromised or need urgent assistance:</p>
      <p>
        <a href="mailto:security@printmarket.com" style="color: #dc2626; font-weight: bold;">Contact Security Team</a> | 
        <a href="${data.supportUrl}" style="color: #2563eb;">Help Center</a>
      </p>
    </div>

    <div class="text-center text-muted">
      <p>Your security is our priority.</p>
      <p><strong>The PrintMarket Security Team</strong></p>
    </div>
  `

  const subject = `🛡️ Security Alert: ${alertContent.title} - PrintMarket`

  return createEmailTemplate(content, subject, data)
}