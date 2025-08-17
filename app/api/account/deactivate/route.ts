import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import dbConnect from '@/lib/database'
import User from '@/lib/models/User'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { reason } = await request.json()

    if (!reason || typeof reason !== 'string' || reason.trim().length === 0) {
      return NextResponse.json(
        { error: 'Deactivation reason is required' },
        { status: 400 }
      )
    }

    await dbConnect()

    // Get user
    const user = await User.findById(session.user.id)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Log the deactivation reason (in a real app, you might want to store this separately)
    console.log(`User ${user.email} (${user._id}) deactivated account. Reason: ${reason}`)

    // In a real application, you might want to:
    // 1. Mark the account as deactivated rather than deleting immediately
    // 2. Send a confirmation email
    // 3. Schedule data deletion after a grace period
    // 4. Cancel any active subscriptions
    // 5. Remove personal data while keeping transaction records for legal compliance

    // For now, we'll mark the account as deactivated
    await User.findByIdAndUpdate(session.user.id, {
      status: 'deactivated',
      deactivatedAt: new Date(),
      deactivationReason: reason,
      updatedAt: new Date()
    })

    // TODO: In a real implementation:
    // - Send confirmation email
    // - Clear sessions
    // - Schedule data cleanup
    // - Update related records

    return NextResponse.json({
      success: true,
      message: 'Account has been deactivated successfully'
    })
  } catch (error) {
    console.error('Failed to deactivate account:', error)
    return NextResponse.json(
      { error: 'Failed to deactivate account' },
      { status: 500 }
    )
  }
}