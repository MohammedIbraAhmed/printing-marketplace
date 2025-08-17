import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import {
  generatePresignedUploadUrl,
  generateFileKey,
  validateFileType,
  validateFileSize,
  getFileCategory,
} from '@/lib/storage/r2'

interface UploadRequest {
  fileName: string
  fileType: string
  fileSize: number
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check user role (only creators and admins can upload content)
    if (session.user.role !== 'creator' && session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only content creators can upload files' },
        { status: 403 }
      )
    }

    // Parse request body
    const body: UploadRequest = await request.json()
    const { fileName, fileType, fileSize } = body

    // Validate required fields
    if (!fileName || !fileType || !fileSize) {
      return NextResponse.json(
        { error: 'Missing required fields: fileName, fileType, fileSize' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!validateFileType(fileType)) {
      return NextResponse.json(
        {
          error: 'Invalid file type. Allowed types: PDF, Word documents, images (JPEG, PNG, GIF, WebP)',
        },
        { status: 400 }
      )
    }

    // Validate file size (50MB limit)
    if (!validateFileSize(fileSize, 50)) {
      return NextResponse.json(
        { error: 'File size exceeds 50MB limit' },
        { status: 400 }
      )
    }

    // Generate unique file key
    const category = getFileCategory(fileType)
    const key = generateFileKey(session.user.id, fileName, category)

    // Generate presigned upload URL
    const uploadResponse = await generatePresignedUploadUrl({
      key,
      contentType: fileType,
      expiresIn: 3600, // 1 hour
    })

    // Return upload URL and metadata
    return NextResponse.json({
      success: true,
      data: {
        uploadUrl: uploadResponse.uploadUrl,
        key: uploadResponse.key,
        cdnUrl: uploadResponse.cdnUrl,
        fileName,
        fileType,
        fileSize,
        category,
        expiresIn: 3600,
      },
    })
  } catch (error) {
    console.error('File upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}