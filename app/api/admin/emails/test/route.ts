import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getEmailTestingService } from '@/lib/email/testing'
import { z } from 'zod'

// Test email API endpoints
const previewEmailSchema = z.object({
  templateType: z.enum([
    'welcome',
    'verification', 
    'password-reset',
    'profile-verification',
    'maintenance',
    'feature-announcement',
    'security-alert'
  ]),
  customData: z.record(z.any()).optional(),
})

const sendTestEmailSchema = z.object({
  templateType: z.enum([
    'welcome',
    'verification',
    'password-reset', 
    'profile-verification',
    'maintenance',
    'feature-announcement',
    'security-alert'
  ]),
  recipients: z.array(z.string().email()).min(1, 'At least one recipient is required'),
  customData: z.record(z.any()).optional(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    const testingService = getEmailTestingService()

    switch (action) {
      case 'captured-emails':
        return getCapturedEmails(testingService)
      
      case 'capture-stats':
        return getCaptureStats(testingService)
      
      case 'test-mode-status':
        return getTestModeStatus(testingService)
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Admin email test API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    const testingService = getEmailTestingService()

    switch (action) {
      case 'preview':
        return previewEmail(body, testingService)
      
      case 'send-test':
        return sendTestEmail(body, testingService, session.user.id)
      
      case 'toggle-test-mode':
        return toggleTestMode(body, testingService)
      
      case 'clear-captured':
        return clearCapturedEmails(testingService)
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Admin email test POST error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid request data', 
        details: error.flatten().fieldErrors 
      }, { status: 400 })
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function getCapturedEmails(testingService: any) {
  try {
    const emails = testingService.getCapturedEmails()
    
    return NextResponse.json({
      emails: emails.map(email => ({
        id: email.id,
        timestamp: email.timestamp,
        to: email.to,
        cc: email.cc,
        bcc: email.bcc,
        subject: email.subject,
        priority: email.priority,
        tags: email.tags,
        attachmentCount: email.attachments?.length || 0,
        htmlLength: email.html.length,
        textLength: email.text.length,
      })),
      total: emails.length,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get captured emails' }, { status: 500 })
  }
}

async function getCaptureStats(testingService: any) {
  try {
    const stats = testingService.getCaptureStats()
    
    return NextResponse.json({
      stats,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get capture stats' }, { status: 500 })
  }
}

async function getTestModeStatus(testingService: any) {
  try {
    return NextResponse.json({
      testMode: testingService.getTestMode(),
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get test mode status' }, { status: 500 })
  }
}

async function previewEmail(body: any, testingService: any) {
  try {
    const validatedData = previewEmailSchema.parse(body)
    
    const template = await testingService.previewTemplate(
      validatedData.templateType,
      validatedData.customData
    )
    
    const validation = testingService.validateTemplate(template)
    
    return NextResponse.json({
      template: {
        subject: template.subject,
        html: template.html,
        text: template.text,
      },
      validation,
      templateType: validatedData.templateType,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid preview request', 
        details: error.flatten().fieldErrors 
      }, { status: 400 })
    }
    
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to preview email' 
    }, { status: 500 })
  }
}

async function sendTestEmail(body: any, testingService: any, adminUserId: string) {
  try {
    const validatedData = sendTestEmailSchema.parse(body)
    
    const results = await testingService.sendTestEmail(
      validatedData.templateType,
      validatedData.recipients,
      validatedData.customData
    )
    
    // Log the test email send
    console.log(`Admin ${adminUserId} sent test email`, {
      templateType: validatedData.templateType,
      recipients: validatedData.recipients,
      testMode: testingService.getTestMode(),
    })
    
    const successCount = results.filter(r => r.success).length
    const failedCount = results.length - successCount
    
    return NextResponse.json({
      success: true,
      results: results.map(r => ({
        success: r.success,
        messageId: r.messageId,
        error: r.error,
      })),
      summary: {
        total: results.length,
        successful: successCount,
        failed: failedCount,
      },
      testMode: testingService.getTestMode(),
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid test email request', 
        details: error.flatten().fieldErrors 
      }, { status: 400 })
    }
    
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to send test email' 
    }, { status: 500 })
  }
}

async function toggleTestMode(body: any, testingService: any) {
  try {
    const { enabled } = body
    
    if (typeof enabled !== 'boolean') {
      return NextResponse.json({ error: 'enabled must be a boolean' }, { status: 400 })
    }
    
    testingService.setTestMode(enabled)
    
    return NextResponse.json({
      testMode: enabled,
      message: enabled ? 'Test mode enabled' : 'Test mode disabled',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to toggle test mode' }, { status: 500 })
  }
}

async function clearCapturedEmails(testingService: any) {
  try {
    const emailCount = testingService.getCapturedEmails().length
    testingService.clearCapturedEmails()
    
    return NextResponse.json({
      success: true,
      clearedCount: emailCount,
      message: `Cleared ${emailCount} captured emails`,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to clear captured emails' }, { status: 500 })
  }
}

// Get specific captured email content
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const emailId = searchParams.get('emailId')
    
    if (!emailId) {
      return NextResponse.json({ error: 'Email ID is required' }, { status: 400 })
    }

    const testingService = getEmailTestingService()
    const email = testingService.getCapturedEmail(emailId)
    
    if (!email) {
      return NextResponse.json({ error: 'Email not found' }, { status: 404 })
    }

    return NextResponse.json({
      email: {
        id: email.id,
        timestamp: email.timestamp,
        to: email.to,
        cc: email.cc,
        bcc: email.bcc,
        subject: email.subject,
        html: email.html,
        text: email.text,
        priority: email.priority,
        tags: email.tags,
        attachments: email.attachments,
      }
    })
  } catch (error) {
    console.error('Get captured email error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}