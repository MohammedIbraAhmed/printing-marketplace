import nodemailer from 'nodemailer'

// Create SMTP transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST!,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER!,
    pass: process.env.SMTP_PASS!,
  },
})

export interface EmailTemplate {
  to: string
  subject: string
  htmlBody: string
  textBody?: string
}

export interface EmailVerificationData {
  name: string
  email: string
  verificationUrl: string
}

export interface PasswordResetData {
  name: string
  resetUrl: string
}

/**
 * Send an email using SMTP
 */
export async function sendEmail(template: EmailTemplate): Promise<void> {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM!,
      to: template.to,
      subject: template.subject,
      text: template.textBody,
      html: template.htmlBody,
    })

    console.log('Email sent successfully:', info.messageId)
  } catch (error) {
    console.error('Email sending failed:', error)
    throw new Error('Failed to send email')
  }
}

/**
 * Generate email verification template
 */
export function generateEmailVerificationTemplate(data: EmailVerificationData): EmailTemplate {
  const { name, email, verificationUrl } = data

  const subject = 'Verify your email address'
  
  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Email Verification</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #fff; padding: 30px; border: 1px solid #ddd; }
        .button { display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666; border-radius: 0 0 8px 8px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to Printing Marketplace!</h1>
        </div>
        <div class="content">
          <p>Hello ${name || 'there'},</p>
          <p>Thank you for signing up for Printing Marketplace. To complete your registration, please verify your email address by clicking the button below:</p>
          <a href="${verificationUrl}" class="button">Verify Email Address</a>
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p><a href="${verificationUrl}">${verificationUrl}</a></p>
          <p>This verification link will expire in 24 hours for security reasons.</p>
          <p>If you didn't create an account with us, please ignore this email.</p>
          <p>Best regards,<br>The Printing Marketplace Team</p>
        </div>
        <div class="footer">
          <p>© 2025 Printing Marketplace. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `

  const textBody = `
    Welcome to Printing Marketplace!
    
    Hello ${name || 'there'},
    
    Thank you for signing up for Printing Marketplace. To complete your registration, please verify your email address by visiting this link:
    
    ${verificationUrl}
    
    This verification link will expire in 24 hours for security reasons.
    
    If you didn't create an account with us, please ignore this email.
    
    Best regards,
    The Printing Marketplace Team
  `

  return {
    to: email,
    subject,
    htmlBody,
    textBody,
  }
}

/**
 * Generate password reset template
 */
export function generatePasswordResetTemplate(data: PasswordResetData): EmailTemplate {
  const { name, resetUrl } = data

  const subject = 'Reset your password'
  
  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Password Reset</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #fff; padding: 30px; border: 1px solid #ddd; }
        .button { display: inline-block; padding: 12px 24px; background: #dc3545; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666; border-radius: 0 0 8px 8px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset Request</h1>
        </div>
        <div class="content">
          <p>Hello ${name || 'there'},</p>
          <p>We received a request to reset your password for your Printing Marketplace account. Click the button below to create a new password:</p>
          <a href="${resetUrl}" class="button">Reset Password</a>
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p><a href="${resetUrl}">${resetUrl}</a></p>
          <p>This reset link will expire in 1 hour for security reasons.</p>
          <p>If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
          <p>Best regards,<br>The Printing Marketplace Team</p>
        </div>
        <div class="footer">
          <p>© 2025 Printing Marketplace. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `

  const textBody = `
    Password Reset Request
    
    Hello ${name || 'there'},
    
    We received a request to reset your password for your Printing Marketplace account. Visit this link to create a new password:
    
    ${resetUrl}
    
    This reset link will expire in 1 hour for security reasons.
    
    If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
    
    Best regards,
    The Printing Marketplace Team
  `

  return {
    to: '', // Will be set by the caller
    subject,
    htmlBody,
    textBody,
  }
}

/**
 * Test email connection
 */
export async function testEmailConnection(): Promise<boolean> {
  try {
    await transporter.verify()
    return true
  } catch (error) {
    console.error('Email connection test failed:', error)
    return false
  }
}