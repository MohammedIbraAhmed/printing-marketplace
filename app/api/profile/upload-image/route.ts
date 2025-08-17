import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { profileImageSchema } from '@/lib/validations/profile'
import { generatePresignedUploadUrl, getCDNUrl } from '@/lib/storage/r2'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Validate the upload request
    const validationResult = profileImageSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid file data', 
          details: validationResult.error.flatten().fieldErrors 
        }, 
        { status: 400 }
      )
    }

    const { fileName, fileType, fileSize } = validationResult.data

    // Generate unique key for the profile image
    const timestamp = Date.now()
    const fileExtension = fileName.split('.').pop()
    const key = `profiles/${session.user.id}/avatar-${timestamp}.${fileExtension}`
    
    try {
      // Generate presigned upload URL
      const uploadUrl = await generatePresignedUploadUrl(key, fileType, 3600) // 1 hour expiry
      const cdnUrl = getCDNUrl(key)

      return NextResponse.json({
        uploadUrl,
        key,
        cdnUrl,
        expiresIn: 3600
      })
    } catch (storageError) {
      console.error('Storage error:', storageError)
      return NextResponse.json(
        { error: 'Failed to generate upload URL' }, 
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Profile image upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

// Get current profile image info
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Return current image URL if exists
    const currentImageUrl = session.user.image
    
    return NextResponse.json({
      currentImageUrl: currentImageUrl || null,
      userId: session.user.id
    })
  } catch (error) {
    console.error('Get profile image error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}