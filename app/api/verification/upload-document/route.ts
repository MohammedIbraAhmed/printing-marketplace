import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { verificationDocumentSchema } from '@/lib/validations/verification'
import { generatePresignedUploadUrl, getCDNUrl } from '@/lib/storage/r2'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Validate the document upload request
    const validationResult = verificationDocumentSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid document data', 
          details: validationResult.error.flatten().fieldErrors 
        }, 
        { status: 400 }
      )
    }

    const { fileName, fileType, fileSize, type, description } = validationResult.data

    // Generate unique key for the verification document
    const timestamp = Date.now()
    const fileExtension = fileName.split('.').pop()
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_')
    const key = `verification/${session.user.id}/${type}/${timestamp}-${sanitizedFileName}`
    
    try {
      // Generate presigned upload URL (2 hour expiry for large documents)
      const uploadUrl = await generatePresignedUploadUrl(key, fileType, 7200)
      const cdnUrl = getCDNUrl(key)

      return NextResponse.json({
        uploadUrl,
        key,
        cdnUrl,
        expiresIn: 7200,
        documentInfo: {
          type,
          fileName,
          fileType,
          fileSize,
          description
        }
      })
    } catch (storageError) {
      console.error('Storage error:', storageError)
      return NextResponse.json(
        { error: 'Failed to generate upload URL' }, 
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Document upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}