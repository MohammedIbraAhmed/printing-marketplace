import { z } from 'zod'

// Environment validation
const emailConfigSchema = z.object({
  SMTP2GO_API_KEY: z.string().min(1, 'SMTP2GO API key is required'),
  SMTP2GO_SENDER_EMAIL: z.string().email('Valid sender email is required'),
  SMTP2GO_SENDER_NAME: z.string().min(1, 'Sender name is required'),
})

const emailConfig = emailConfigSchema.parse({
  SMTP2GO_API_KEY: process.env.SMTP2GO_API_KEY,
  SMTP2GO_SENDER_EMAIL: process.env.SMTP2GO_SENDER_EMAIL || 'noreply@printmarket.com',
  SMTP2GO_SENDER_NAME: process.env.SMTP2GO_SENDER_NAME || 'PrintMarket',
})

// SMTP2GO API types
interface SMTP2GORecipient {
  email: string
  name?: string
  type: 'to' | 'cc' | 'bcc'
}

interface SMTP2GOAttachment {
  filename: string
  fileblob: string // base64 encoded
  mimetype: string
}

interface SMTP2GOEmailRequest {
  api_key: string
  to: string[]
  cc?: string[]
  bcc?: string[]
  sender: string
  subject: string
  text_body?: string
  html_body?: string
  custom_headers?: Record<string, string>
  attachments?: SMTP2GOAttachment[]
  template_id?: string
  template_data?: Record<string, any>
}

interface SMTP2GOResponse {
  request_id: string
  data: {
    succeeded: number
    failed: number
    failures?: Array<{
      email: string
      error: string
    }>
  }
}

interface SMTP2GODeliveryStatus {
  request_id: string
  status: 'pending' | 'sent' | 'delivered' | 'bounced' | 'rejected' | 'failed'
  timestamp: string
  recipient: string
  reason?: string
}

// Email sending options
export interface EmailOptions {
  to: string | string[]
  cc?: string | string[]
  bcc?: string | string[]
  subject: string
  text?: string
  html?: string
  attachments?: Array<{
    filename: string
    content: Buffer | string
    contentType: string
  }>
  customHeaders?: Record<string, string>
  templateId?: string
  templateData?: Record<string, any>
  priority?: 'low' | 'normal' | 'high'
  tags?: string[]
}

export interface EmailResult {
  success: boolean
  requestId?: string
  messageId?: string
  error?: string
  failedRecipients?: Array<{
    email: string
    error: string
  }>
}

// Rate limiting
class EmailRateLimit {
  private requests: number[] = []
  private readonly maxRequests: number
  private readonly windowMs: number

  constructor(maxRequests = 100, windowMs = 60000) { // 100 emails per minute
    this.maxRequests = maxRequests
    this.windowMs = windowMs
  }

  canSend(): boolean {
    const now = Date.now()
    // Remove old requests outside the window
    this.requests = this.requests.filter(time => now - time < this.windowMs)
    
    if (this.requests.length >= this.maxRequests) {
      return false
    }
    
    this.requests.push(now)
    return true
  }

  getWaitTime(): number {
    if (this.requests.length === 0) return 0
    const now = Date.now()
    const oldestRequest = Math.min(...this.requests)
    return Math.max(0, this.windowMs - (now - oldestRequest))
  }
}

// SMTP2GO Email Service
export class SMTP2GOService {
  private readonly apiKey: string
  private readonly senderEmail: string
  private readonly senderName: string
  private readonly baseUrl = 'https://api.smtp2go.com/v3'
  private readonly rateLimit: EmailRateLimit

  constructor() {
    this.apiKey = emailConfig.SMTP2GO_API_KEY
    this.senderEmail = emailConfig.SMTP2GO_SENDER_EMAIL
    this.senderName = emailConfig.SMTP2GO_SENDER_NAME
    this.rateLimit = new EmailRateLimit()
  }

  private normalizeRecipients(recipients: string | string[]): string[] {
    return Array.isArray(recipients) ? recipients : [recipients]
  }

  private formatSender(): string {
    return `${this.senderName} <${this.senderEmail}>`
  }

  private async makeRequest<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Smtp2go-Api-Key': this.apiKey,
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`SMTP2GO API error: ${response.status} ${errorText}`)
    }

    return response.json()
  }

  async sendEmail(options: EmailOptions): Promise<EmailResult> {
    try {
      // Rate limiting check
      if (!this.rateLimit.canSend()) {
        const waitTime = this.rateLimit.getWaitTime()
        throw new Error(`Rate limit exceeded. Wait ${Math.ceil(waitTime / 1000)} seconds.`)
      }

      // Validate required fields
      if (!options.to || (Array.isArray(options.to) && options.to.length === 0)) {
        throw new Error('At least one recipient is required')
      }

      if (!options.subject) {
        throw new Error('Subject is required')
      }

      if (!options.text && !options.html && !options.templateId) {
        throw new Error('Either text, html body, or template ID is required')
      }

      // Prepare request data
      const requestData: SMTP2GOEmailRequest = {
        api_key: this.apiKey,
        to: this.normalizeRecipients(options.to),
        sender: this.formatSender(),
        subject: options.subject,
      }

      // Optional recipients
      if (options.cc) {
        requestData.cc = this.normalizeRecipients(options.cc)
      }

      if (options.bcc) {
        requestData.bcc = this.normalizeRecipients(options.bcc)
      }

      // Email content
      if (options.text) {
        requestData.text_body = options.text
      }

      if (options.html) {
        requestData.html_body = options.html
      }

      // Template support
      if (options.templateId) {
        requestData.template_id = options.templateId
        if (options.templateData) {
          requestData.template_data = options.templateData
        }
      }

      // Custom headers
      if (options.customHeaders) {
        requestData.custom_headers = options.customHeaders
      }

      // Add priority and tags as custom headers
      if (options.priority) {
        requestData.custom_headers = {
          ...requestData.custom_headers,
          'X-Priority': options.priority === 'high' ? '1' : options.priority === 'low' ? '5' : '3'
        }
      }

      if (options.tags && options.tags.length > 0) {
        requestData.custom_headers = {
          ...requestData.custom_headers,
          'X-Tags': options.tags.join(',')
        }
      }

      // Attachments
      if (options.attachments && options.attachments.length > 0) {
        requestData.attachments = options.attachments.map(attachment => ({
          filename: attachment.filename,
          fileblob: Buffer.isBuffer(attachment.content) 
            ? attachment.content.toString('base64')
            : Buffer.from(attachment.content).toString('base64'),
          mimetype: attachment.contentType,
        }))
      }

      // Send email
      const response = await this.makeRequest<SMTP2GOResponse>('/email/send', requestData)

      // Process response
      if (response.data.succeeded > 0) {
        return {
          success: true,
          requestId: response.request_id,
          messageId: response.request_id, // SMTP2GO uses request_id as message identifier
          failedRecipients: response.data.failures,
        }
      } else {
        return {
          success: false,
          error: 'All recipients failed',
          failedRecipients: response.data.failures,
        }
      }

    } catch (error) {
      console.error('Email sending error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }
    }
  }

  async getDeliveryStatus(requestId: string): Promise<SMTP2GODeliveryStatus[]> {
    try {
      const response = await this.makeRequest<{
        data: SMTP2GODeliveryStatus[]
      }>('/email/status', {
        api_key: this.apiKey,
        request_id: requestId,
      })

      return response.data
    } catch (error) {
      console.error('Error fetching delivery status:', error)
      throw error
    }
  }

  async validateEmail(email: string): Promise<{ valid: boolean; reason?: string }> {
    try {
      const response = await this.makeRequest<{
        data: {
          valid: boolean
          reason?: string
        }
      }>('/email/validate', {
        api_key: this.apiKey,
        email: email,
      })

      return response.data
    } catch (error) {
      console.error('Email validation error:', error)
      return { valid: false, reason: 'Validation service error' }
    }
  }

  // Bulk email sending with batch processing
  async sendBulkEmails(emails: EmailOptions[], batchSize = 10): Promise<EmailResult[]> {
    const results: EmailResult[] = []
    
    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize)
      const batchPromises = batch.map(email => this.sendEmail(email))
      
      try {
        const batchResults = await Promise.allSettled(batchPromises)
        
        batchResults.forEach(result => {
          if (result.status === 'fulfilled') {
            results.push(result.value)
          } else {
            results.push({
              success: false,
              error: result.reason?.message || 'Batch processing error'
            })
          }
        })

        // Add delay between batches to respect rate limits
        if (i + batchSize < emails.length) {
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      } catch (error) {
        console.error('Bulk email batch error:', error)
        // Add failed results for the remaining emails in this batch
        batch.forEach(() => {
          results.push({
            success: false,
            error: 'Batch processing failed'
          })
        })
      }
    }

    return results
  }

  // Test email configuration
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      const testResult = await this.sendEmail({
        to: this.senderEmail,
        subject: 'SMTP2GO Test Email',
        text: 'This is a test email to verify SMTP2GO configuration.',
        html: '<p>This is a test email to verify SMTP2GO configuration.</p>',
      })

      return {
        success: testResult.success,
        error: testResult.error
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Connection test failed'
      }
    }
  }
}

// Singleton instance
let smtp2goService: SMTP2GOService | null = null

export function getSMTP2GOService(): SMTP2GOService {
  if (!smtp2goService) {
    smtp2goService = new SMTP2GOService()
  }
  return smtp2goService
}

// Convenience function for sending emails
export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  const service = getSMTP2GOService()
  return service.sendEmail(options)
}