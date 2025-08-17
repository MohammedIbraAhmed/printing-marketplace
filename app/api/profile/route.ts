import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { User } from '@/lib/models'
import connectToDatabase from '@/lib/database'
import { getProfileSchemaByRole } from '@/lib/validations/profile'

// Get user profile
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()
    const user = await User.findById(session.user.id).select('-password')
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Update user profile
export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    await connectToDatabase()

    // Get current user to determine role
    const currentUser = await User.findById(session.user.id)
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Validate data based on user role
    const schema = getProfileSchemaByRole(currentUser.role)
    const validationResult = schema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          errors: validationResult.error.flatten().fieldErrors 
        }, 
        { status: 400 }
      )
    }

    const validatedData = validationResult.data

    // Update user with validated data
    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      {
        name: validatedData.name,
        profile: validatedData.profile,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    ).select('-password')

    if (!updatedUser) {
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'Profile updated successfully',
      user: updatedUser 
    })
  } catch (error) {
    console.error('Profile update error:', error)
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          errors: error.errors 
        }, 
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Delete user profile (soft delete/deactivation)
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()

    // Mark user as inactive instead of deleting
    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      {
        isActive: false,
        deactivatedAt: new Date(),
        updatedAt: new Date()
      },
      { new: true }
    ).select('-password')

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      message: 'Account deactivated successfully',
      user: updatedUser 
    })
  } catch (error) {
    console.error('Profile deletion error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}