import { z } from 'zod'
import mongoose from 'mongoose'
import { createHash, randomBytes } from 'crypto'

// Email preference types
export const EmailPreferenceTypes = {
  WELCOME: 'welcome',
  VERIFICATION: 'verification',
  PASSWORD_RESET: 'password_reset',
  PROFILE_VERIFICATION: 'profile_verification',
  ORDER_NOTIFICATIONS: 'order_notifications',
  SYSTEM_MAINTENANCE: 'system_maintenance',
  FEATURE_ANNOUNCEMENTS: 'feature_announcements',
  SECURITY_ALERTS: 'security_alerts',
  MARKETING: 'marketing',
  NEWSLETTERS: 'newsletters',
  PROMOTIONAL: 'promotional',
} as const

export type EmailPreferenceType = typeof EmailPreferenceTypes[keyof typeof EmailPreferenceTypes]

// Email preferences schema
const EmailPreferencesSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  email: { type: String, required: true },
  
  // Subscription preferences (true = subscribed, false = unsubscribed)
  preferences: {
    // Critical emails (cannot be unsubscribed)
    welcome: { type: Boolean, default: true, immutable: true },
    verification: { type: Boolean, default: true, immutable: true },
    password_reset: { type: Boolean, default: true, immutable: true },
    security_alerts: { type: Boolean, default: true, immutable: true },
    
    // Business/functional emails
    profile_verification: { type: Boolean, default: true },
    order_notifications: { type: Boolean, default: true },
    system_maintenance: { type: Boolean, default: true },
    
    // Optional emails
    feature_announcements: { type: Boolean, default: true },
    marketing: { type: Boolean, default: false },
    newsletters: { type: Boolean, default: false },
    promotional: { type: Boolean, default: false },
  },
  
  // Global unsubscribe (except critical emails)
  globalUnsubscribe: { type: Boolean, default: false },
  
  // Unsubscribe tokens for one-click unsubscribe
  unsubscribeToken: { type: String, unique: true, sparse: true },
  
  // Metadata
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  lastUnsubscribeDate: { type: Date },
  unsubscribeSource: { type: String }, // 'email_link', 'settings_page', 'admin'
  
  // Tracking
  emailsSent: { type: Number, default: 0 },
  emailsOpened: { type: Number, default: 0 },
  lastEmailSent: { type: Date },
  lastEmailOpened: { type: Date },
}, {
  timestamps: true
})

// Create model
const EmailPreferences = mongoose.models.EmailPreferences || 
  mongoose.model('EmailPreferences', EmailPreferencesSchema)

// Validation schemas
const updatePreferencesSchema = z.object({
  preferences: z.object({
    profile_verification: z.boolean().optional(),
    order_notifications: z.boolean().optional(),
    system_maintenance: z.boolean().optional(),
    feature_announcements: z.boolean().optional(),
    marketing: z.boolean().optional(),
    newsletters: z.boolean().optional(),
    promotional: z.boolean().optional(),
  }).optional(),
  globalUnsubscribe: z.boolean().optional(),
})

export type UpdatePreferencesData = z.infer<typeof updatePreferencesSchema>

// Email preferences service
export class EmailPreferencesService {
  
  // Generate secure unsubscribe token
  private generateUnsubscribeToken(userId: string, email: string): string {
    const secret = process.env.NEXTAUTH_SECRET || 'default-secret'
    const data = `${userId}:${email}:${Date.now()}`
    const hash = createHash('sha256').update(data + secret).digest('hex')
    return `${Buffer.from(data).toString('base64')}.${hash.substring(0, 16)}`
  }

  // Verify unsubscribe token
  private verifyUnsubscribeToken(token: string): { userId: string; email: string } | null {
    try {
      const [dataBase64, hash] = token.split('.')
      if (!dataBase64 || !hash) return null
      
      const data = Buffer.from(dataBase64, 'base64').toString('utf8')
      const [userId, email, timestamp] = data.split(':')
      
      if (!userId || !email || !timestamp) return null
      
      // Verify hash
      const secret = process.env.NEXTAUTH_SECRET || 'default-secret'
      const expectedHash = createHash('sha256').update(data + secret).digest('hex').substring(0, 16)
      
      if (hash !== expectedHash) return null
      
      return { userId, email }
    } catch (error) {
      console.error('Error verifying unsubscribe token:', error)
      return null
    }
  }

  // Initialize preferences for a new user
  async initializePreferences(userId: string, email: string): Promise<void> {
    try {
      const unsubscribeToken = this.generateUnsubscribeToken(userId, email)
      
      await EmailPreferences.findOneAndUpdate(
        { userId },
        {
          userId,
          email,
          unsubscribeToken,
          preferences: {
            welcome: true,
            verification: true,
            password_reset: true,
            security_alerts: true,
            profile_verification: true,
            order_notifications: true,
            system_maintenance: true,
            feature_announcements: true,
            marketing: false,
            newsletters: false,
            promotional: false,
          },
          globalUnsubscribe: false,
        },
        { upsert: true, new: true }
      )
    } catch (error) {
      console.error('Error initializing email preferences:', error)
      throw error
    }
  }

  // Get user preferences
  async getPreferences(userId: string): Promise<any> {
    try {
      const preferences = await EmailPreferences.findOne({ userId })
      
      if (!preferences) {
        throw new Error('Email preferences not found')
      }
      
      return {
        preferences: preferences.preferences,
        globalUnsubscribe: preferences.globalUnsubscribe,
        unsubscribeToken: preferences.unsubscribeToken,
        stats: {
          emailsSent: preferences.emailsSent,
          emailsOpened: preferences.emailsOpened,
          lastEmailSent: preferences.lastEmailSent,
          lastEmailOpened: preferences.lastEmailOpened,
        }
      }
    } catch (error) {
      console.error('Error getting email preferences:', error)
      throw error
    }
  }

  // Update user preferences
  async updatePreferences(
    userId: string, 
    updates: UpdatePreferencesData,
    source = 'settings_page'
  ): Promise<void> {
    try {
      const validatedUpdates = updatePreferencesSchema.parse(updates)
      const updateData: any = { updatedAt: new Date() }
      
      if (validatedUpdates.preferences) {
        Object.entries(validatedUpdates.preferences).forEach(([key, value]) => {
          updateData[`preferences.${key}`] = value
        })
      }
      
      if (validatedUpdates.globalUnsubscribe !== undefined) {
        updateData.globalUnsubscribe = validatedUpdates.globalUnsubscribe
        
        if (validatedUpdates.globalUnsubscribe) {
          updateData.lastUnsubscribeDate = new Date()
          updateData.unsubscribeSource = source
        }
      }
      
      await EmailPreferences.findOneAndUpdate(
        { userId },
        updateData,
        { new: true }
      )
    } catch (error) {
      console.error('Error updating email preferences:', error)
      throw error
    }
  }

  // Check if user can receive a specific type of email
  async canReceiveEmail(userId: string, emailType: EmailPreferenceType): Promise<boolean> {
    try {
      const preferences = await EmailPreferences.findOne({ userId })
      
      if (!preferences) {
        // If no preferences found, assume they can receive critical emails only
        const criticalEmails = [
          EmailPreferenceTypes.WELCOME,
          EmailPreferenceTypes.VERIFICATION,
          EmailPreferenceTypes.PASSWORD_RESET,
          EmailPreferenceTypes.SECURITY_ALERTS,
        ]
        return criticalEmails.includes(emailType)
      }
      
      // Check global unsubscribe first
      if (preferences.globalUnsubscribe) {
        // Critical emails bypass global unsubscribe
        const criticalEmails = [
          EmailPreferenceTypes.WELCOME,
          EmailPreferenceTypes.VERIFICATION,
          EmailPreferenceTypes.PASSWORD_RESET,
          EmailPreferenceTypes.SECURITY_ALERTS,
        ]
        return criticalEmails.includes(emailType)
      }
      
      // Check specific preference
      return preferences.preferences[emailType] !== false
    } catch (error) {
      console.error('Error checking email permission:', error)
      // Default to allowing critical emails only on error
      const criticalEmails = [
        EmailPreferenceTypes.WELCOME,
        EmailPreferenceTypes.VERIFICATION,
        EmailPreferenceTypes.PASSWORD_RESET,
        EmailPreferenceTypes.SECURITY_ALERTS,
      ]
      return criticalEmails.includes(emailType)
    }
  }

  // One-click unsubscribe from email link
  async unsubscribeByToken(token: string, emailType?: EmailPreferenceType): Promise<{
    success: boolean
    email?: string
    error?: string
  }> {
    try {
      const tokenData = this.verifyUnsubscribeToken(token)
      
      if (!tokenData) {
        return { success: false, error: 'Invalid unsubscribe token' }
      }
      
      const preferences = await EmailPreferences.findOne({ 
        userId: tokenData.userId,
        unsubscribeToken: token 
      })
      
      if (!preferences) {
        return { success: false, error: 'Preferences not found' }
      }
      
      // If specific email type provided, unsubscribe from that only
      if (emailType) {
        const updateData: any = {
          updatedAt: new Date(),
          lastUnsubscribeDate: new Date(),
          unsubscribeSource: 'email_link'
        }
        
        // Don't allow unsubscribing from critical emails
        const criticalEmails = [
          EmailPreferenceTypes.WELCOME,
          EmailPreferenceTypes.VERIFICATION,
          EmailPreferenceTypes.PASSWORD_RESET,
          EmailPreferenceTypes.SECURITY_ALERTS,
        ]
        
        if (!criticalEmails.includes(emailType)) {
          updateData[`preferences.${emailType}`] = false
        }
        
        await EmailPreferences.findOneAndUpdate(
          { userId: tokenData.userId },
          updateData
        )
      } else {
        // Global unsubscribe
        await EmailPreferences.findOneAndUpdate(
          { userId: tokenData.userId },
          {
            globalUnsubscribe: true,
            lastUnsubscribeDate: new Date(),
            unsubscribeSource: 'email_link',
            updatedAt: new Date(),
          }
        )
      }
      
      return { success: true, email: tokenData.email }
    } catch (error) {
      console.error('Error processing unsubscribe:', error)
      return { success: false, error: 'Unsubscribe failed' }
    }
  }

  // Track email sent
  async trackEmailSent(userId: string): Promise<void> {
    try {
      await EmailPreferences.findOneAndUpdate(
        { userId },
        {
          $inc: { emailsSent: 1 },
          lastEmailSent: new Date(),
        }
      )
    } catch (error) {
      console.error('Error tracking email sent:', error)
    }
  }

  // Track email opened
  async trackEmailOpened(userId: string): Promise<void> {
    try {
      await EmailPreferences.findOneAndUpdate(
        { userId },
        {
          $inc: { emailsOpened: 1 },
          lastEmailOpened: new Date(),
        }
      )
    } catch (error) {
      console.error('Error tracking email opened:', error)
    }
  }

  // Get unsubscribe statistics for admin
  async getUnsubscribeStats(): Promise<{
    totalUsers: number
    globalUnsubscribes: number
    preferenceBreakdown: Record<string, number>
  }> {
    try {
      const [totalUsers, globalUnsubscribes, preferenceStats] = await Promise.all([
        EmailPreferences.countDocuments({}),
        EmailPreferences.countDocuments({ globalUnsubscribe: true }),
        EmailPreferences.aggregate([
          {
            $project: {
              preferences: { $objectToArray: '$preferences' }
            }
          },
          { $unwind: '$preferences' },
          {
            $group: {
              _id: '$preferences.k',
              unsubscribed: {
                $sum: { $cond: [{ $eq: ['$preferences.v', false] }, 1, 0] }
              }
            }
          }
        ])
      ])
      
      const preferenceBreakdown: Record<string, number> = {}
      preferenceStats.forEach((stat: any) => {
        preferenceBreakdown[stat._id] = stat.unsubscribed
      })
      
      return {
        totalUsers,
        globalUnsubscribes,
        preferenceBreakdown,
      }
    } catch (error) {
      console.error('Error getting unsubscribe stats:', error)
      throw error
    }
  }

  // Generate unsubscribe URL for emails
  generateUnsubscribeUrl(userId: string, emailType?: EmailPreferenceType): string {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    
    return EmailPreferences.findOne({ userId }).then(preferences => {
      if (!preferences?.unsubscribeToken) {
        throw new Error('Unsubscribe token not found')
      }
      
      const params = new URLSearchParams({
        token: preferences.unsubscribeToken
      })
      
      if (emailType) {
        params.set('type', emailType)
      }
      
      return `${baseUrl}/unsubscribe?${params.toString()}`
    }).catch(() => {
      // Fallback URL
      return `${baseUrl}/email-preferences`
    })
  }
}

// Singleton instance
let emailPreferencesService: EmailPreferencesService | null = null

export function getEmailPreferencesService(): EmailPreferencesService {
  if (!emailPreferencesService) {
    emailPreferencesService = new EmailPreferencesService()
  }
  return emailPreferencesService
}

// Convenience functions
export async function canSendEmail(
  userId: string, 
  emailType: EmailPreferenceType
): Promise<boolean> {
  const service = getEmailPreferencesService()
  return service.canReceiveEmail(userId, emailType)
}

export async function initializeUserEmailPreferences(
  userId: string, 
  email: string
): Promise<void> {
  const service = getEmailPreferencesService()
  return service.initializePreferences(userId, email)
}

export async function trackEmailDelivery(userId: string): Promise<void> {
  const service = getEmailPreferencesService()
  return service.trackEmailSent(userId)
}