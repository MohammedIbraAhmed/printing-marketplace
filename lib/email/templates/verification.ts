import { EmailTemplate, EmailTemplateData, createEmailTemplate } from './base'

export interface EmailVerificationData extends EmailTemplateData {
  recipient: {
    name: string
    email: string
  }
  verificationUrl: string
  verificationCode: string
  expiresIn: string // e.g., "24 hours"
}

export const generateEmailVerificationEmail = (data: EmailVerificationData): EmailTemplate => {
  const content = `
    <div class="text-center">
      <h1>Verify Your Email Address</h1>
      <p style="font-size: 18px; color: #64748b; margin-bottom: 32px;">
        Please confirm your email address to complete your PrintMarket registration.
      </p>
    </div>

    <div class="alert alert-info">
      <strong>📧 Email Verification Required</strong><br>
      Hi ${data.recipient.name}, we need to verify your email address to activate your PrintMarket account.
    </div>

    <p>To verify your email address and activate your account, please click the button below:</p>

    <div class="text-center" style="margin: 32px 0;">
      <a href="${data.verificationUrl}" class="button">
        Verify Email Address
      </a>
    </div>

    <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
    <p style="word-break: break-all; background-color: #f8fafc; padding: 12px; border-radius: 4px; font-family: monospace; font-size: 14px;">
      ${data.verificationUrl}
    </p>

    <div class="divider"></div>

    <div style="background-color: #fef3c7; border: 1px solid #fcd34d; padding: 16px; border-radius: 6px; margin: 24px 0;">
      <h3 style="margin-top: 0; color: #92400e;">⏰ Important Information</h3>
      <ul style="margin: 8px 0; color: #92400e;">
        <li>This verification link will expire in ${data.expiresIn}</li>
        <li>You can only use this link once</li>
        <li>If you didn't create a PrintMarket account, you can safely ignore this email</li>
      </ul>
    </div>

    <h3>Alternative Verification Method:</h3>
    <p>If you're having trouble with the link above, you can also verify your email by entering this code on the verification page:</p>
    
    <div class="text-center" style="margin: 24px 0;">
      <div style="background-color: #dbeafe; border: 2px solid #3b82f6; padding: 16px; border-radius: 8px; display: inline-block;">
        <span style="font-family: monospace; font-size: 24px; font-weight: bold; color: #1e40af; letter-spacing: 2px;">
          ${data.verificationCode}
        </span>
      </div>
    </div>

    <div class="divider"></div>

    <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 24px 0;">
      <h3 style="margin-top: 0;">Need Help?</h3>
      <p>If you're having trouble verifying your email or have questions about your account:</p>
      <ul style="margin: 8px 0;">
        <li><a href="mailto:support@printmarket.com" style="color: #2563eb;">Contact our support team</a></li>
        <li><a href="{{support_url}}" style="color: #2563eb;">Visit our help center</a></li>
        <li><a href="{{faq_url}}" style="color: #2563eb;">Check our FAQ</a></li>
      </ul>
    </div>

    <div class="text-center text-muted">
      <p>Thanks for joining PrintMarket!</p>
      <p><strong>The PrintMarket Team</strong></p>
    </div>
  `

  const subject = `Verify your email address for PrintMarket`

  return createEmailTemplate(content, subject, data)
}

export interface ProfileVerificationData extends EmailTemplateData {
  recipient: {
    name: string
    email: string
  }
  businessName: string
  verificationStatus: 'submitted' | 'under_review' | 'approved' | 'rejected'
  reviewNotes?: string
  dashboardUrl: string
  supportUrl: string
}

export const generateProfileVerificationEmail = (data: ProfileVerificationData): EmailTemplate => {
  const getStatusContent = (status: string) => {
    switch (status) {
      case 'submitted':
        return {
          title: 'Verification Submitted Successfully',
          alertClass: 'alert-info',
          icon: '📄',
          message: 'Your business verification documents have been submitted and are now in our review queue.',
          nextSteps: [
            'Our verification team will review your documents within 3-5 business days',
            'You\'ll receive an email notification once the review is complete',
            'You can check your verification status anytime in your dashboard',
            'Feel free to continue setting up your print shop profile'
          ]
        }
      
      case 'under_review':
        return {
          title: 'Verification Under Review',
          alertClass: 'alert-info',
          icon: '🔍',
          message: 'Our team is currently reviewing your business verification documents.',
          nextSteps: [
            'The review process typically takes 3-5 business days',
            'We may contact you if additional information is needed',
            'You can monitor the progress in your dashboard',
            'Continue setting up your shop profile while we review'
          ]
        }
      
      case 'approved':
        return {
          title: 'Verification Approved! 🎉',
          alertClass: 'alert-success',
          icon: '✅',
          message: 'Congratulations! Your business verification has been approved. You\'re now a verified print shop on PrintMarket.',
          nextSteps: [
            'Your shop profile now displays the verified badge',
            'You can start receiving orders from customers',
            'Complete your equipment and pricing setup',
            'Promote your verified status to attract more customers'
          ]
        }
      
      case 'rejected':
        return {
          title: 'Verification Requires Attention',
          alertClass: 'alert-warning',
          icon: '⚠️',
          message: 'We need additional information to complete your verification process.',
          nextSteps: [
            'Review the feedback provided below',
            'Update your documents or information as needed',
            'Resubmit your verification request',
            'Contact support if you need assistance'
          ]
        }
      
      default:
        return {
          title: 'Verification Status Update',
          alertClass: 'alert-info',
          icon: '📋',
          message: 'There\'s an update on your business verification status.',
          nextSteps: ['Check your dashboard for more details']
        }
    }
  }

  const statusContent = getStatusContent(data.verificationStatus)

  const content = `
    <div class="text-center">
      <h1>${statusContent.title}</h1>
      <p style="font-size: 18px; color: #64748b; margin-bottom: 32px;">
        Update on your PrintMarket business verification
      </p>
    </div>

    <div class="alert ${statusContent.alertClass}">
      <strong>${statusContent.icon} Business: ${data.businessName}</strong><br>
      Hi ${data.recipient.name}, ${statusContent.message}
    </div>

    ${data.reviewNotes ? `
    <div style="background-color: #fef3c7; border: 1px solid #fcd34d; padding: 16px; border-radius: 6px; margin: 24px 0;">
      <h3 style="margin-top: 0; color: #92400e;">📝 Review Notes</h3>
      <p style="color: #92400e; margin: 0;">${data.reviewNotes}</p>
    </div>
    ` : ''}

    <h3>What's Next:</h3>
    <ol style="margin: 16px 0; padding-left: 20px;">
      ${statusContent.nextSteps.map(step => `<li style="margin: 8px 0;">${step}</li>`).join('')}
    </ol>

    <div class="text-center" style="margin: 32px 0;">
      <a href="${data.dashboardUrl}" class="button">
        Go to Dashboard
      </a>
    </div>

    ${data.verificationStatus === 'approved' ? `
    <div style="background-color: #dcfce7; border: 1px solid #86efac; padding: 20px; border-radius: 8px; margin: 24px 0;">
      <h3 style="margin-top: 0; color: #166534;">🚀 You're All Set!</h3>
      <p style="color: #166534; margin: 8px 0;">
        As a verified print shop, you now have access to:
      </p>
      <ul style="margin: 8px 0; color: #166534;">
        <li>Higher visibility in search results</li>
        <li>Verified badge on your profile</li>
        <li>Priority customer support</li>
        <li>Access to premium features</li>
      </ul>
    </div>
    ` : ''}

    <div class="divider"></div>

    <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 24px 0;">
      <h3 style="margin-top: 0;">Questions About Verification?</h3>
      <p>Our team is here to help with any questions about the verification process:</p>
      <p>
        <a href="${data.supportUrl}" style="color: #2563eb;">Visit our Help Center</a> | 
        <a href="mailto:verification@printmarket.com" style="color: #2563eb;">Email Verification Team</a>
      </p>
    </div>

    <div class="text-center text-muted">
      <p>Thank you for choosing PrintMarket!</p>
      <p><strong>The PrintMarket Verification Team</strong></p>
    </div>
  `

  const subject = `${statusContent.title} - ${data.businessName}`

  return createEmailTemplate(content, subject, data)
}