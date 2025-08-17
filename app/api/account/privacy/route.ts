import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import dbConnect from '@/lib/database'
import User from '@/lib/models/User'
import { privacySettingsSchema } from '@/lib/validations/profile'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await dbConnect()

    const user = await User.findById(session.user.id).select('privacy')
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      privacy: user.privacy || {
        profileVisibility: 'public',
        showEmail: false,
        showPhone: false,
        allowDataSharing: true,
        allowMarketingEmails: false,
        allowAnalytics: true
      }
    })
  } catch (error) {
    console.error('Failed to fetch privacy settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch privacy settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = privacySettingsSchema.parse(body)

    await dbConnect()

    // Update user privacy settings
    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      {
        $set: {
          privacy: validatedData,
          updatedAt: new Date()
        }
      },
      { new: true }
    ).select('privacy')

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Privacy settings updated successfully',
      privacy: updatedUser.privacy
    })
  } catch (error) {
    console.error('Failed to update privacy settings:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update privacy settings' },
      { status: 500 }
    )
  }
}