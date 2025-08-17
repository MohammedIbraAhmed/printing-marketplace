import { EmailTemplate, EmailTemplateData, createEmailTemplate } from './base'

export interface PasswordResetData extends EmailTemplateData {
  recipient: {
    name: string
    email: string
  }
  resetUrl: string
  resetCode: string
  expiresIn: string // e.g., "15 minutes"
  ipAddress?: string
  userAgent?: string
  requestTime: string
}

export const generatePasswordResetEmail = (data: PasswordResetData): EmailTemplate => {
  const content = `
    <div class="text-center">
      <h1>Reset Your Password</h1>
      <p style="font-size: 18px; color: #64748b; margin-bottom: 32px;">
        Someone requested a password reset for your PrintMarket account.
      </p>
    </div>

    <div class="alert alert-warning">
      <strong>🔐 Password Reset Request</strong><br>
      Hi ${data.recipient.name}, we received a request to reset the password for your PrintMarket account.
    </div>

    <p>If you requested this password reset, click the button below to create a new password:</p>

    <div class="text-center" style="margin: 32px 0;">
      <a href="${data.resetUrl}" class="button">
        Reset My Password
      </a>
    </div>

    <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
    <p style="word-break: break-all; background-color: #f8fafc; padding: 12px; border-radius: 4px; font-family: monospace; font-size: 14px;">
      ${data.resetUrl}
    </p>

    <div class="divider"></div>

    <div style="background-color: #fee2e2; border: 1px solid #fca5a5; padding: 16px; border-radius: 6px; margin: 24px 0;">
      <h3 style="margin-top: 0; color: #991b1b;">⏰ Important Security Information</h3>
      <ul style="margin: 8px 0; color: #991b1b;">
        <li>This reset link will expire in ${data.expiresIn}</li>
        <li>You can only use this link once</li>
        <li>If you didn't request this reset, please ignore this email</li>
        <li>Your current password remains active until you set a new one</li>
      </ul>
    </div>

    <h3>Alternative Reset Method:</h3>
    <p>If you're having trouble with the link above, you can also reset your password by entering this code on the password reset page:</p>
    
    <div class="text-center" style="margin: 24px 0;">
      <div style="background-color: #fef3c7; border: 2px solid #f59e0b; padding: 16px; border-radius: 8px; display: inline-block;">
        <span style="font-family: monospace; font-size: 24px; font-weight: bold; color: #92400e; letter-spacing: 2px;">
          ${data.resetCode}
        </span>
      </div>
    </div>

    <div class="divider"></div>

    <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 24px 0;">
      <h3 style="margin-top: 0;">🛡️ Security Details</h3>
      <p style="font-size: 14px; color: #64748b;">This request was made on:</p>
      <ul style="margin: 8px 0; font-size: 14px; color: #64748b;">
        <li><strong>Time:</strong> ${data.requestTime}</li>
        ${data.ipAddress ? `<li><strong>IP Address:</strong> ${data.ipAddress}</li>` : ''}
        ${data.userAgent ? `<li><strong>Device:</strong> ${data.userAgent}</li>` : ''}
      </ul>
    </div>

    <div style="background-color: #fef3c7; border: 1px solid #fcd34d; padding: 16px; border-radius: 6px; margin: 24px 0;">
      <h3 style="margin-top: 0; color: #92400e;">🚨 Didn't Request This?</h3>
      <p style="color: #92400e; margin: 8px 0;">
        If you didn't request a password reset, someone else might be trying to access your account. Here's what you should do:
      </p>
      <ol style="margin: 8px 0; color: #92400e;">
        <li>Do not click the reset link or use the reset code</li>
        <li>Check if your account shows any unusual activity</li>
        <li>Consider changing your password as a precaution</li>
        <li>Contact our support team immediately</li>
      </ol>
    </div>

    <h3>Password Security Tips:</h3>
    <ul style="margin: 16px 0; padding-left: 20px;">
      <li>Use a strong, unique password that you don't use anywhere else</li>
      <li>Include a mix of uppercase, lowercase, numbers, and symbols</li>
      <li>Consider using a password manager</li>
      <li>Enable two-factor authentication when available</li>
    </ul>

    <div class="divider"></div>

    <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 24px 0;">
      <h3 style="margin-top: 0;">Need Help?</h3>
      <p>If you're having trouble resetting your password or have security concerns:</p>
      <p>
        <a href="mailto:security@printmarket.com" style="color: #dc2626; font-weight: bold;">Contact Security Team</a> | 
        <a href="{{support_url}}" style="color: #2563eb;">Visit Help Center</a>
      </p>
    </div>

    <div class="text-center text-muted">
      <p>Stay secure!</p>
      <p><strong>The PrintMarket Security Team</strong></p>
    </div>
  `

  const subject = `Reset your PrintMarket password`

  return createEmailTemplate(content, subject, data)
}

export interface PasswordChangeConfirmationData extends EmailTemplateData {
  recipient: {
    name: string
    email: string
  }
  changeTime: string
  ipAddress?: string
  userAgent?: string
  supportUrl: string
}

export const generatePasswordChangeConfirmationEmail = (data: PasswordChangeConfirmationData): EmailTemplate => {
  const content = `
    <div class="text-center">
      <h1>Password Changed Successfully</h1>
      <p style="font-size: 18px; color: #64748b; margin-bottom: 32px;">
        Your PrintMarket account password has been updated.
      </p>
    </div>

    <div class="alert alert-success">
      <strong>✅ Password Updated</strong><br>
      Hi ${data.recipient.name}, your PrintMarket account password was successfully changed.
    </div>

    <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 24px 0;">
      <h3 style="margin-top: 0;">🛡️ Change Details</h3>
      <p style="font-size: 14px; color: #64748b;">Your password was changed on:</p>
      <ul style="margin: 8px 0; font-size: 14px; color: #64748b;">
        <li><strong>Time:</strong> ${data.changeTime}</li>
        ${data.ipAddress ? `<li><strong>IP Address:</strong> ${data.ipAddress}</li>` : ''}
        ${data.userAgent ? `<li><strong>Device:</strong> ${data.userAgent}</li>` : ''}
      </ul>
    </div>

    <div style="background-color: #fef3c7; border: 1px solid #fcd34d; padding: 16px; border-radius: 6px; margin: 24px 0;">
      <h3 style="margin-top: 0; color: #92400e;">🚨 Didn't Make This Change?</h3>
      <p style="color: #92400e; margin: 8px 0;">
        If you didn't change your password, your account may have been compromised. Take these steps immediately:
      </p>
      <ol style="margin: 8px 0; color: #92400e;">
        <li>Try to log in with your old password to confirm the change</li>
        <li>If you can't access your account, use account recovery</li>
        <li>Contact our security team immediately</li>
        <li>Check your account for any unauthorized activity</li>
      </ol>
      
      <div class="text-center" style="margin: 16px 0;">
        <a href="mailto:security@printmarket.com" class="button button-danger">
          Report Unauthorized Change
        </a>
      </div>
    </div>

    <h3>Keep Your Account Secure:</h3>
    <ul style="margin: 16px 0; padding-left: 20px;">
      <li>Use a unique password that you don't use on other sites</li>
      <li>Don't share your password with anyone</li>
      <li>Log out from shared or public computers</li>
      <li>Review your account activity regularly</li>
    </ul>

    <div class="divider"></div>

    <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 24px 0;">
      <h3 style="margin-top: 0;">Questions or Concerns?</h3>
      <p>If you have any questions about this password change or account security:</p>
      <p>
        <a href="mailto:security@printmarket.com" style="color: #dc2626; font-weight: bold;">Security Team</a> | 
        <a href="${data.supportUrl}" style="color: #2563eb;">Help Center</a> | 
        <a href="{{account_url}}" style="color: #2563eb;">Account Settings</a>
      </p>
    </div>

    <div class="text-center text-muted">
      <p>Thanks for keeping your account secure!</p>
      <p><strong>The PrintMarket Security Team</strong></p>
    </div>
  `

  const subject = `Your PrintMarket password was changed`

  return createEmailTemplate(content, subject, data)
}