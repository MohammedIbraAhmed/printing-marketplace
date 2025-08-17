import { EmailTemplate, EmailTemplateData, createEmailTemplate } from './base'

export interface WelcomeEmailData extends EmailTemplateData {
  recipient: {
    name: string
    email: string
  }
  userRole: 'customer' | 'creator' | 'printShop' | 'admin'
  loginUrl: string
  profileUrl: string
  supportUrl: string
}

const getRoleSpecificContent = (role: string) => {
  switch (role) {
    case 'customer':
      return {
        title: 'Welcome to PrintMarket!',
        description: 'Start ordering high-quality prints from trusted print shops.',
        features: [
          'Browse thousands of educational content and materials',
          'Order professional prints with easy tracking',
          'Connect with verified print shops in your area',
          'Secure payment processing and order protection'
        ],
        nextSteps: [
          'Complete your profile to get personalized recommendations',
          'Browse content categories to find what you need',
          'Save your favorite print shops for quick reordering',
          'Set up delivery preferences for faster checkout'
        ]
      }
    
    case 'creator':
      return {
        title: 'Welcome to PrintMarket, Creator!',
        description: 'Start sharing your educational content and earning from print sales.',
        features: [
          'Upload and sell your educational materials',
          'Earn revenue from every print sold',
          'Build your creator profile and following',
          'Access detailed analytics and insights'
        ],
        nextSteps: [
          'Complete your creator profile and portfolio',
          'Upload your first educational content',
          'Set up your payment information for earnings',
          'Connect with your audience and build your brand'
        ]
      }
    
    case 'printShop':
      return {
        title: 'Welcome to PrintMarket, Print Shop!',
        description: 'Connect with customers and grow your printing business.',
        features: [
          'Receive orders from customers in your area',
          'Showcase your capabilities and equipment',
          'Build trust through our verification system',
          'Manage orders with our integrated tools'
        ],
        nextSteps: [
          'Complete your business verification process',
          'Set up your shop profile and capabilities',
          'Configure your pricing and delivery options',
          'Start receiving and fulfilling orders'
        ]
      }
    
    default:
      return {
        title: 'Welcome to PrintMarket!',
        description: 'Your account has been created successfully.',
        features: [
          'Access to the PrintMarket platform',
          'Secure account management',
          'Customer support when you need it',
          'Regular updates on new features'
        ],
        nextSteps: [
          'Complete your profile setup',
          'Explore the platform features',
          'Contact support if you need help',
          'Stay updated with our announcements'
        ]
      }
  }
}

export const generateWelcomeEmail = (data: WelcomeEmailData): EmailTemplate => {
  const roleContent = getRoleSpecificContent(data.userRole)
  
  const content = `
    <div class="text-center">
      <h1>${roleContent.title}</h1>
      <p style="font-size: 18px; color: #64748b; margin-bottom: 32px;">
        ${roleContent.description}
      </p>
    </div>

    <div class="alert alert-success">
      <strong>🎉 Your account is ready!</strong><br>
      Hi ${data.recipient.name}, welcome to the PrintMarket community. We're excited to have you on board!
    </div>

    <h2>What you can do with PrintMarket:</h2>
    <ul style="margin: 16px 0; padding-left: 20px;">
      ${roleContent.features.map(feature => `<li style="margin: 8px 0;">${feature}</li>`).join('')}
    </ul>

    <div class="text-center" style="margin: 32px 0;">
      <a href="${data.loginUrl}" class="button">
        Get Started Now
      </a>
    </div>

    <h3>Next Steps:</h3>
    <ol style="margin: 16px 0; padding-left: 20px;">
      ${roleContent.nextSteps.map(step => `<li style="margin: 8px 0;">${step}</li>`).join('')}
    </ol>

    <div class="divider"></div>

    <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 24px 0;">
      <h3 style="margin-top: 0;">Need Help Getting Started?</h3>
      <p>Our support team is here to help you make the most of PrintMarket:</p>
      <p>
        <a href="${data.supportUrl}" style="color: #2563eb;">Visit our Help Center</a> | 
        <a href="mailto:support@printmarket.com" style="color: #2563eb;">Email Support</a>
      </p>
    </div>

    <div class="text-center text-muted">
      <p>Thanks for joining PrintMarket!</p>
      <p><strong>The PrintMarket Team</strong></p>
    </div>
  `

  const subject = `Welcome to PrintMarket, ${data.recipient.name}! 🎉`

  return createEmailTemplate(content, subject, data)
}

// Convenience function for different user roles
export const generateCustomerWelcomeEmail = (data: Omit<WelcomeEmailData, 'userRole'>): EmailTemplate => {
  return generateWelcomeEmail({ ...data, userRole: 'customer' })
}

export const generateCreatorWelcomeEmail = (data: Omit<WelcomeEmailData, 'userRole'>): EmailTemplate => {
  return generateWelcomeEmail({ ...data, userRole: 'creator' })
}

export const generatePrintShopWelcomeEmail = (data: Omit<WelcomeEmailData, 'userRole'>): EmailTemplate => {
  return generateWelcomeEmail({ ...data, userRole: 'printShop' })
}