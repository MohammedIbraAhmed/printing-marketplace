import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import dbConnect from '@/lib/database'
import User from '@/lib/models/User'
import { dataUsageConsentSchema } from '@/lib/validations/profile'

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

    const user = await User.findById(session.user.id).select('dataUsageConsent')
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Return default data usage consent if none exists
    const defaultDataUsage = {
      profileData: true, // Required for basic functionality
      activityTracking: false,
      communicationHistory: true, // Needed for support
      fileUploads: true, // Required for functionality
      behavioralAnalytics: false,
      thirdPartySharing: false,
      marketingAnalytics: false
    }

    return NextResponse.json({
      dataUsage: user.dataUsageConsent || defaultDataUsage
    })
  } catch (error) {
    console.error('Failed to fetch data usage preferences:', error)
    return NextResponse.json(
      { error: 'Failed to fetch data usage preferences' },
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
    
    // Validate data usage consent
    const validatedData = dataUsageConsentSchema.parse(body)

    // Ensure essential data processing is always enabled
    const essentialDataUsage = {
      ...validatedData,
      profileData: true, // Always required
      fileUploads: true  // Always required for functionality
    }

    await dbConnect()

    const user = await User.findByIdAndUpdate(
      session.user.id,
      {
        dataUsageConsent: essentialDataUsage,
        updatedAt: new Date()
      },
      { new: true }
    ).select('dataUsageConsent')

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Log data usage consent changes for audit purposes
    console.log(`User ${session.user.email} updated data usage preferences:`, {
      userId: session.user.id,
      timestamp: new Date().toISOString(),
      changes: essentialDataUsage
    })

    return NextResponse.json({
      success: true,
      dataUsage: user.dataUsageConsent
    })
  } catch (error) {
    console.error('Failed to update data usage preferences:', error)
    
    if (error instanceof Error && 'issues' in error) {
      return NextResponse.json(
        { error: 'Invalid data usage preferences', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update data usage preferences' },
      { status: 500 }
    )
  }
}