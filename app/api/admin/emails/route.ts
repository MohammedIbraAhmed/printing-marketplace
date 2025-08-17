import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getEmailQueueService } from '@/lib/email/email-queue'
import { getEmailPreferencesService } from '@/lib/email/unsubscribe'
import { getSMTP2GOService } from '@/lib/email/smtp2go'
import { User as UserModel } from '@/lib/models'
import connectToDatabase from '@/lib/database'
import { z } from 'zod'

// Admin email endpoints
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    switch (action) {
      case 'queue-stats':
        return getQueueStats()
      
      case 'email-stats':
        return getEmailStats()
      
      case 'unsubscribe-stats':
        return getUnsubscribeStats()
      
      case 'test-connection':
        return testEmailConnection()
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Admin email API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function getQueueStats() {
  try {
    const queueService = getEmailQueueService()
    const stats = await queueService.getQueueStats()
    
    return NextResponse.json({
      queue: stats,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get queue stats' }, { status: 500 })
  }
}

async function getEmailStats() {
  try {
    await connectToDatabase()
    
    // Get email statistics from database
    const [totalUsers, activeUsers, recentUsers] = await Promise.all([
      UserModel.countDocuments({}),
      UserModel.countDocuments({ 
        lastLoginAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
      }),
      UserModel.countDocuments({ 
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
      })
    ])
    
    const userRoleStats = await UserModel.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ])
    
    const roleBreakdown: Record<string, number> = {}
    userRoleStats.forEach((stat: any) => {
      roleBreakdown[stat._id] = stat.count
    })
    
    return NextResponse.json({
      users: {
        total: totalUsers,
        active: activeUsers,
        recent: recentUsers,
        roleBreakdown
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get email stats' }, { status: 500 })
  }
}

async function getUnsubscribeStats() {
  try {
    const preferencesService = getEmailPreferencesService()
    const stats = await preferencesService.getUnsubscribeStats()
    
    return NextResponse.json({
      unsubscribes: stats,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get unsubscribe stats' }, { status: 500 })
  }
}

async function testEmailConnection() {
  try {
    const emailService = getSMTP2GOService()
    const result = await emailService.testConnection()
    
    return NextResponse.json({
      connection: result,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to test email connection' }, { status: 500 })
  }
}

// Send admin emails
const sendEmailSchema = z.object({
  type: z.enum(['announcement', 'maintenance', 'security', 'custom']),
  recipients: z.object({
    type: z.enum(['all', 'role', 'specific', 'active']),
    roles: z.array(z.enum(['customer', 'creator', 'printShop', 'admin'])).optional(),
    userIds: z.array(z.string()).optional(),
    activeDays: z.number().optional(), // For 'active' type
  }),
  subject: z.string().min(1, 'Subject is required'),
  content: z.object({
    html: z.string().min(1, 'HTML content is required'),
    text: z.string().min(1, 'Text content is required'),
  }),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  tags: z.array(z.string()).optional(),
  schedule: z.object({
    sendAt: z.string().datetime().optional(), // ISO string
    timezone: z.string().optional(),
  }).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = sendEmailSchema.parse(body)

    await connectToDatabase()

    // Get recipients based on criteria
    const recipients = await getRecipients(validatedData.recipients)
    
    if (recipients.length === 0) {
      return NextResponse.json({ error: 'No recipients found' }, { status: 400 })
    }

    // Check if this is a scheduled send
    if (validatedData.schedule?.sendAt) {
      return scheduleEmail(validatedData, recipients, session.user.id)
    }

    // Send immediately
    return sendBulkEmail(validatedData, recipients, session.user.id)

  } catch (error) {
    console.error('Admin send email error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid request data', 
        details: error.flatten().fieldErrors 
      }, { status: 400 })
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function getRecipients(criteria: any): Promise<Array<{ email: string; name: string; role: string; id: string }>> {
  let query: any = {}

  switch (criteria.type) {
    case 'all':
      // No additional filter
      break
    
    case 'role':
      if (criteria.roles && criteria.roles.length > 0) {
        query.role = { $in: criteria.roles }
      }
      break
    
    case 'specific':
      if (criteria.userIds && criteria.userIds.length > 0) {
        query._id = { $in: criteria.userIds }
      }
      break
    
    case 'active':
      const activeDays = criteria.activeDays || 30
      const cutoffDate = new Date(Date.now() - activeDays * 24 * 60 * 60 * 1000)
      query.lastLoginAt = { $gte: cutoffDate }
      break
  }

  const users = await UserModel.find(query)
    .select('email name role')
    .lean()

  return users.map(user => ({
    email: user.email,
    name: user.name || 'User',
    role: user.role,
    id: user._id.toString(),
  }))
}

async function sendBulkEmail(emailData: any, recipients: any[], adminUserId: string) {
  try {
    const { getEmailNotificationService } = await import('@/lib/email/notifications')
    const notificationService = getEmailNotificationService()

    // Send bulk notification
    const jobIds = await notificationService.sendBulkNotification({
      recipients: recipients.map(r => ({
        email: r.email,
        name: r.name,
        userRole: r.role,
      })),
      subject: emailData.subject,
      htmlContent: emailData.content.html,
      textContent: emailData.content.text,
      tags: ['admin', emailData.type, ...(emailData.tags || [])],
    })

    // Log the email send for audit
    console.log(`Admin ${adminUserId} sent bulk email to ${recipients.length} recipients`, {
      type: emailData.type,
      subject: emailData.subject,
      recipientCount: recipients.length,
      jobIds: jobIds.slice(0, 5), // Log first 5 job IDs
    })

    return NextResponse.json({
      success: true,
      recipientCount: recipients.length,
      jobIds: jobIds.length,
      message: `Email queued for ${recipients.length} recipients`
    })

  } catch (error) {
    console.error('Bulk email send error:', error)
    return NextResponse.json({ error: 'Failed to send bulk email' }, { status: 500 })
  }
}

async function scheduleEmail(emailData: any, recipients: any[], adminUserId: string) {
  // In a production environment, you would save this to a scheduled jobs table
  // and have a cron job or scheduler pick it up at the specified time
  
  const scheduledFor = new Date(emailData.schedule.sendAt)
  const now = new Date()
  
  if (scheduledFor <= now) {
    return NextResponse.json({ error: 'Scheduled time must be in the future' }, { status: 400 })
  }

  // For now, we'll just queue it with a delay
  const delayMs = scheduledFor.getTime() - now.getTime()
  
  if (delayMs > 24 * 60 * 60 * 1000) { // More than 24 hours
    return NextResponse.json({ 
      error: 'Cannot schedule emails more than 24 hours in advance with current implementation' 
    }, { status: 400 })
  }

  try {
    const { getEmailQueueService, EmailJobType, JobPriority } = await import('@/lib/email/email-queue')
    const queueService = getEmailQueueService()

    const jobIds: string[] = []
    for (const recipient of recipients) {
      const jobId = await queueService.queueEmail(
        EmailJobType.SYSTEM_NOTIFICATION,
        {
          to: recipient.email,
          subject: emailData.subject,
          html: emailData.content.html.replace('{{recipient.name}}', recipient.name),
          text: emailData.content.text.replace('{{recipient.name}}', recipient.name),
          priority: emailData.priority,
          tags: ['admin', 'scheduled', emailData.type],
        },
        {
          priority: JobPriority.NORMAL,
          delay: delayMs,
        }
      )
      jobIds.push(jobId)
    }

    console.log(`Admin ${adminUserId} scheduled bulk email for ${recipients.length} recipients`, {
      type: emailData.type,
      subject: emailData.subject,
      scheduledFor: scheduledFor.toISOString(),
      recipientCount: recipients.length,
    })

    return NextResponse.json({
      success: true,
      scheduled: true,
      scheduledFor: scheduledFor.toISOString(),
      recipientCount: recipients.length,
      jobIds: jobIds.length,
      message: `Email scheduled for ${recipients.length} recipients at ${scheduledFor.toLocaleString()}`
    })

  } catch (error) {
    console.error('Email scheduling error:', error)
    return NextResponse.json({ error: 'Failed to schedule email' }, { status: 500 })
  }
}