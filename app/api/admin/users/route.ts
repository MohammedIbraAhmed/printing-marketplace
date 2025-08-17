import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import dbConnect from '@/lib/database'
import User from '@/lib/models/User'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const role = searchParams.get('role')
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    await dbConnect()

    // Build query filters
    const query: any = {}
    
    if (role && role !== 'all') {
      query.role = role
    }
    
    if (status && status !== 'all') {
      query.status = status
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { 'profile.businessInfo.businessName': { $regex: search, $options: 'i' } }
      ]
    }

    // Get users with pagination
    const users = await User.find(query)
      .select({
        name: 1,
        email: 1,
        role: 1,
        status: 1,
        emailVerified: 1,
        createdAt: 1,
        lastLogin: 1,
        'profile.location.city': 1,
        'profile.location.state': 1,
        'profile.businessInfo.businessName': 1,
        'profile.businessInfo.businessType': 1,
        'profile.verification.status': 1
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)

    // Get total count for pagination
    const totalUsers = await User.countDocuments(query)

    const formattedUsers = users.map(user => ({
      id: user._id.toString(),
      name: user.name || 'Unknown',
      email: user.email,
      role: user.role,
      status: user.status || 'active',
      emailVerified: user.emailVerified || false,
      createdAt: user.createdAt.toISOString(),
      lastLogin: user.lastLogin?.toISOString(),
      profile: {
        location: user.profile?.location ? {
          city: user.profile.location.city,
          state: user.profile.location.state
        } : undefined,
        businessInfo: user.profile?.businessInfo ? {
          businessName: user.profile.businessInfo.businessName,
          businessType: user.profile.businessInfo.businessType
        } : undefined,
        verification: user.profile?.verification ? {
          status: user.profile.verification.status
        } : undefined
      }
    }))

    return NextResponse.json({
      users: formattedUsers,
      pagination: {
        page,
        limit,
        total: totalUsers,
        pages: Math.ceil(totalUsers / limit)
      }
    })
  } catch (error) {
    console.error('Failed to fetch users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    const { userId, action, value, reason } = await request.json()

    if (!userId || !action || !value || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!['role', 'status'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "role" or "status"' },
        { status: 400 }
      )
    }

    await dbConnect()

    const updateData: any = {
      updatedAt: new Date()
    }

    if (action === 'role') {
      if (!['customer', 'creator', 'printShop', 'admin'].includes(value)) {
        return NextResponse.json(
          { error: 'Invalid role' },
          { status: 400 }
        )
      }
      updateData.role = value
    } else if (action === 'status') {
      if (!['active', 'suspended', 'pending'].includes(value)) {
        return NextResponse.json(
          { error: 'Invalid status' },
          { status: 400 }
        )
      }
      updateData.status = value
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    )

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Log the admin action (in a real app, this would go to an audit log)
    console.log(`Admin ${session.user.id} changed user ${userId} ${action} to ${value}. Reason: ${reason}`)

    // TODO: Send notification email to user about the change
    // TODO: Add audit log entry

    return NextResponse.json({
      success: true,
      message: `User ${action} updated successfully`,
      user: {
        id: user._id,
        [action]: user[action as keyof typeof user]
      }
    })
  } catch (error) {
    console.error('Failed to update user:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}