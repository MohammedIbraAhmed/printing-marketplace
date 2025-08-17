import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import dbConnect from '@/lib/database'
import User from '@/lib/models/User'
import { consentPreferencesSchema } from '@/lib/validations/profile'

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

    const user = await User.findById(session.user.id).select('consent')
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Return default consent preferences if none exist
    const defaultConsent = {
      essential: true,
      analytics: false,
      marketing: false,
      thirdParty: false,
      communications: false,
      updatedAt: new Date()
    }

    return NextResponse.json({
      consent: user.consent || defaultConsent
    })
  } catch (error) {
    console.error('Failed to fetch consent preferences:', error)
    return NextResponse.json(
      { error: 'Failed to fetch consent preferences' },
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
    
    // Validate consent preferences
    const validatedData = consentPreferencesSchema.parse({
      ...body,
      updatedAt: new Date()
    })

    await dbConnect()

    const user = await User.findByIdAndUpdate(
      session.user.id,
      {
        consent: validatedData,
        updatedAt: new Date()
      },
      { new: true }
    ).select('consent')

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Log consent changes for audit purposes
    console.log(`User ${session.user.email} updated consent preferences:`, {
      userId: session.user.id,
      timestamp: new Date().toISOString(),
      changes: validatedData
    })

    return NextResponse.json({
      success: true,
      consent: user.consent
    })
  } catch (error) {
    console.error('Failed to update consent preferences:', error)
    
    if (error instanceof Error && 'issues' in error) {
      return NextResponse.json(
        { error: 'Invalid consent data', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update consent preferences' },
      { status: 500 }
    )
  }
}