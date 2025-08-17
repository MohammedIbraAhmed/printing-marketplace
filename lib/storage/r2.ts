import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// Initialize R2 client
const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

export interface UploadUrlRequest {
  key: string
  contentType: string
  expiresIn?: number
}

export interface UploadUrlResponse {
  uploadUrl: string
  key: string
  cdnUrl: string
}

/**
 * Generate a presigned URL for uploading files to R2
 */
export async function generatePresignedUploadUrl({
  key,
  contentType,
  expiresIn = 3600
}: UploadUrlRequest): Promise<UploadUrlResponse> {
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
    Metadata: {
      uploadedAt: new Date().toISOString(),
    },
  })

  const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn })
  const cdnUrl = getCDNUrl(key)

  return {
    uploadUrl,
    key,
    cdnUrl,
  }
}

/**
 * Generate a presigned URL for downloading files from R2
 */
export async function generatePresignedDownloadUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
  })

  return await getSignedUrl(r2Client, command, { expiresIn })
}

/**
 * Delete a file from R2
 */
export async function deleteFile(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
  })

  await r2Client.send(command)
}

/**
 * Get the public CDN URL for a file
 */
export function getCDNUrl(key: string): string {
  const publicUrl = process.env.R2_PUBLIC_URL_PREFIX
  if (!publicUrl) {
    throw new Error('R2_PUBLIC_URL_PREFIX environment variable is not set')
  }
  return `${publicUrl}/${key}`
}

/**
 * Generate a unique file key with user ID and timestamp
 */
export function generateFileKey(
  userId: string,
  fileName: string,
  prefix: string = 'content'
): string {
  const timestamp = Date.now()
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_')
  return `${prefix}/${userId}/${timestamp}-${sanitizedFileName}`
}

/**
 * Validate file type against allowed types
 */
export function validateFileType(fileType: string): boolean {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
  ]
  
  return allowedTypes.includes(fileType.toLowerCase())
}

/**
 * Validate file size against maximum allowed size
 */
export function validateFileSize(fileSize: number, maxSizeMB: number = 50): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  return fileSize <= maxSizeBytes
}

/**
 * Get file type category for organizing uploads
 */
export function getFileCategory(fileType: string): string {
  if (fileType.startsWith('image/')) {
    return 'images'
  }
  if (fileType.includes('pdf')) {
    return 'documents'
  }
  if (fileType.includes('word') || fileType.includes('document')) {
    return 'documents'
  }
  return 'files'
}