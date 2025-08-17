import { EmailOptions, EmailResult, getSMTP2GOService } from './smtp2go'

// Email queue job types
export interface EmailJob {
  id: string
  type: EmailJobType
  payload: EmailOptions
  priority: JobPriority
  attempts: number
  maxAttempts: number
  createdAt: Date
  scheduledFor?: Date
  processedAt?: Date
  completedAt?: Date
  failedAt?: Date
  error?: string
  result?: EmailResult
}

export enum EmailJobType {
  WELCOME = 'welcome',
  EMAIL_VERIFICATION = 'email_verification',
  PASSWORD_RESET = 'password_reset',
  PROFILE_VERIFICATION = 'profile_verification',
  ORDER_NOTIFICATION = 'order_notification',
  SYSTEM_NOTIFICATION = 'system_notification',
  MARKETING = 'marketing',
  TRANSACTIONAL = 'transactional',
}

export enum JobPriority {
  LOW = 0,
  NORMAL = 1,
  HIGH = 2,
  URGENT = 3,
}

export enum JobStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  RETRYING = 'retrying',
  CANCELLED = 'cancelled',
}

// In-memory queue implementation (for development)
// In production, this should be replaced with Redis or a proper queue system
class InMemoryEmailQueue {
  private jobs: Map<string, EmailJob> = new Map()
  private processingJobs: Set<string> = new Set()
  private isProcessing = false
  private processInterval: NodeJS.Timeout | null = null

  constructor() {
    this.startProcessing()
  }

  private generateJobId(): string {
    return `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  async addJob(
    type: EmailJobType,
    payload: EmailOptions,
    options: {
      priority?: JobPriority
      maxAttempts?: number
      delay?: number // delay in milliseconds
    } = {}
  ): Promise<string> {
    const jobId = this.generateJobId()
    const now = new Date()
    const scheduledFor = options.delay ? new Date(now.getTime() + options.delay) : now

    const job: EmailJob = {
      id: jobId,
      type,
      payload,
      priority: options.priority ?? JobPriority.NORMAL,
      attempts: 0,
      maxAttempts: options.maxAttempts ?? 3,
      createdAt: now,
      scheduledFor,
    }

    this.jobs.set(jobId, job)
    console.log(`Email job ${jobId} added to queue (type: ${type}, priority: ${job.priority})`)
    
    return jobId
  }

  async getJob(jobId: string): Promise<EmailJob | null> {
    return this.jobs.get(jobId) || null
  }

  async getJobsByStatus(status: JobStatus): Promise<EmailJob[]> {
    const jobs: EmailJob[] = []
    
    for (const job of this.jobs.values()) {
      const jobStatus = this.getJobStatus(job)
      if (jobStatus === status) {
        jobs.push(job)
      }
    }

    return jobs.sort((a, b) => {
      // Sort by priority (higher first), then by creation time
      if (a.priority !== b.priority) {
        return b.priority - a.priority
      }
      return a.createdAt.getTime() - b.createdAt.getTime()
    })
  }

  private getJobStatus(job: EmailJob): JobStatus {
    if (job.completedAt) return JobStatus.COMPLETED
    if (job.failedAt && job.attempts >= job.maxAttempts) return JobStatus.FAILED
    if (job.failedAt && job.attempts < job.maxAttempts) return JobStatus.RETRYING
    if (this.processingJobs.has(job.id)) return JobStatus.PROCESSING
    return JobStatus.PENDING
  }

  async cancelJob(jobId: string): Promise<boolean> {
    const job = this.jobs.get(jobId)
    if (!job || job.completedAt || job.failedAt) {
      return false
    }

    job.failedAt = new Date()
    job.error = 'Job cancelled'
    return true
  }

  private async processNextJob(): Promise<void> {
    if (this.processingJobs.size >= 5) { // Max concurrent jobs
      return
    }

    const pendingJobs = await this.getJobsByStatus(JobStatus.PENDING)
    const retryingJobs = await this.getJobsByStatus(JobStatus.RETRYING)
    
    // Combine and sort by priority and schedule time
    const availableJobs = [...pendingJobs, ...retryingJobs]
      .filter(job => {
        const now = new Date()
        return !job.scheduledFor || job.scheduledFor <= now
      })
      .sort((a, b) => {
        if (a.priority !== b.priority) {
          return b.priority - a.priority
        }
        return a.createdAt.getTime() - b.createdAt.getTime()
      })

    const job = availableJobs[0]
    if (!job) {
      return
    }

    this.processingJobs.add(job.id)
    job.processedAt = new Date()
    job.attempts++

    console.log(`Processing email job ${job.id} (attempt ${job.attempts}/${job.maxAttempts})`)

    try {
      const emailService = getSMTP2GOService()
      const result = await emailService.sendEmail(job.payload)

      if (result.success) {
        job.completedAt = new Date()
        job.result = result
        console.log(`Email job ${job.id} completed successfully`)
      } else {
        throw new Error(result.error || 'Email sending failed')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      job.error = errorMessage
      
      if (job.attempts >= job.maxAttempts) {
        job.failedAt = new Date()
        console.error(`Email job ${job.id} failed permanently: ${errorMessage}`)
      } else {
        // Schedule retry with exponential backoff
        const backoffMs = Math.min(1000 * Math.pow(2, job.attempts - 1), 30000) // Max 30 seconds
        job.scheduledFor = new Date(Date.now() + backoffMs)
        console.warn(`Email job ${job.id} failed, retrying in ${backoffMs}ms: ${errorMessage}`)
      }
    } finally {
      this.processingJobs.delete(job.id)
    }
  }

  private startProcessing(): void {
    if (this.processInterval) {
      return
    }

    this.processInterval = setInterval(async () => {
      if (!this.isProcessing) {
        this.isProcessing = true
        try {
          await this.processNextJob()
        } catch (error) {
          console.error('Queue processing error:', error)
        } finally {
          this.isProcessing = false
        }
      }
    }, 1000) // Process every second
  }

  stopProcessing(): void {
    if (this.processInterval) {
      clearInterval(this.processInterval)
      this.processInterval = null
    }
  }

  async getStats(): Promise<{
    total: number
    pending: number
    processing: number
    completed: number
    failed: number
    retrying: number
  }> {
    const stats = {
      total: this.jobs.size,
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0,
      retrying: 0,
    }

    for (const job of this.jobs.values()) {
      const status = this.getJobStatus(job)
      switch (status) {
        case JobStatus.PENDING:
          stats.pending++
          break
        case JobStatus.PROCESSING:
          stats.processing++
          break
        case JobStatus.COMPLETED:
          stats.completed++
          break
        case JobStatus.FAILED:
          stats.failed++
          break
        case JobStatus.RETRYING:
          stats.retrying++
          break
      }
    }

    return stats
  }

  // Cleanup old jobs (older than 24 hours)
  async cleanup(): Promise<number> {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 hours ago
    let deletedCount = 0

    for (const [jobId, job] of this.jobs.entries()) {
      if (job.createdAt < cutoff && (job.completedAt || job.failedAt)) {
        this.jobs.delete(jobId)
        deletedCount++
      }
    }

    console.log(`Cleaned up ${deletedCount} old email jobs`)
    return deletedCount
  }
}

// Email Queue Service
export class EmailQueueService {
  private queue: InMemoryEmailQueue

  constructor() {
    this.queue = new InMemoryEmailQueue()
    
    // Run cleanup every hour
    setInterval(() => {
      this.queue.cleanup()
    }, 60 * 60 * 1000)
  }

  async queueEmail(
    type: EmailJobType,
    emailOptions: EmailOptions,
    options: {
      priority?: JobPriority
      maxAttempts?: number
      delay?: number
    } = {}
  ): Promise<string> {
    return this.queue.addJob(type, emailOptions, options)
  }

  async getJobStatus(jobId: string): Promise<{
    job: EmailJob | null
    status: JobStatus | null
  }> {
    const job = await this.queue.getJob(jobId)
    if (!job) {
      return { job: null, status: null }
    }

    let status: JobStatus
    if (job.completedAt) status = JobStatus.COMPLETED
    else if (job.failedAt && job.attempts >= job.maxAttempts) status = JobStatus.FAILED
    else if (job.failedAt && job.attempts < job.maxAttempts) status = JobStatus.RETRYING
    else if (job.processedAt && !job.completedAt && !job.failedAt) status = JobStatus.PROCESSING
    else status = JobStatus.PENDING

    return { job, status }
  }

  async cancelJob(jobId: string): Promise<boolean> {
    return this.queue.cancelJob(jobId)
  }

  async getQueueStats() {
    return this.queue.getStats()
  }

  stopQueue(): void {
    this.queue.stopProcessing()
  }
}

// Singleton instance
let emailQueueService: EmailQueueService | null = null

export function getEmailQueueService(): EmailQueueService {
  if (!emailQueueService) {
    emailQueueService = new EmailQueueService()
  }
  return emailQueueService
}

// Convenience functions for queueing different types of emails
export async function queueWelcomeEmail(emailOptions: EmailOptions): Promise<string> {
  const service = getEmailQueueService()
  return service.queueEmail(EmailJobType.WELCOME, emailOptions, {
    priority: JobPriority.HIGH,
  })
}

export async function queueVerificationEmail(emailOptions: EmailOptions): Promise<string> {
  const service = getEmailQueueService()
  return service.queueEmail(EmailJobType.EMAIL_VERIFICATION, emailOptions, {
    priority: JobPriority.HIGH,
  })
}

export async function queuePasswordResetEmail(emailOptions: EmailOptions): Promise<string> {
  const service = getEmailQueueService()
  return service.queueEmail(EmailJobType.PASSWORD_RESET, emailOptions, {
    priority: JobPriority.URGENT,
  })
}

export async function queueSystemNotification(emailOptions: EmailOptions): Promise<string> {
  const service = getEmailQueueService()
  return service.queueEmail(EmailJobType.SYSTEM_NOTIFICATION, emailOptions, {
    priority: JobPriority.NORMAL,
  })
}