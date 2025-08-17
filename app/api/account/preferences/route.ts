import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import dbConnect from '@/lib/database'
import User from '@/lib/models/User'
import { notificationPreferencesSchema } from '@/lib/validations/profile'

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

    const user = await User.findById(session.user.id).select('preferences')
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      preferences: user.preferences || {
        notifications: {
          email: true,
          orderUpdates: true,
          marketing: false,
          weeklyDigest: false,
          pushNotifications: false,
          smsNotifications: false
        }
      }
    })
  } catch (error) {
    console.error('Failed to fetch preferences:', error)
    return NextResponse.json(
      { error: 'Failed to fetch preferences' },
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
    const validatedData = notificationPreferencesSchema.parse(body)

    await dbConnect()

    // Update user preferences
    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      {
        $set: {
          'preferences.notifications': validatedData,
          updatedAt: new Date()
        }
      },
      { new: true }
    ).select('preferences')

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Notification preferences updated successfully',
      preferences: updatedUser.preferences
    })
  } catch (error) {
    console.error('Failed to update preferences:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    )
  }
}