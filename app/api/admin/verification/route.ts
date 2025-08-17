import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { connectToDatabase } from '@/lib/database'
import { User } from '@/lib/models/User'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    await connectToDatabase()

    // Get all print shops with verification requests
    const printShops = await User.find({ 
      role: 'printShop',
      'profile.verification.status': { $in: ['pending', 'rejected'] }
    }).select({
      _id: 1,
      name: 1,
      email: 1,
      'profile.businessInfo.businessName': 1,
      'profile.businessInfo.businessType': 1,
      'profile.location': 1,
      'profile.contact.phone': 1,
      'profile.verification': 1,
      createdAt: 1
    }).sort({ 'profile.verification.submittedAt': -1 })

    const verifications = printShops.map(shop => ({
      id: shop._id.toString(),
      userId: shop._id.toString(),
      businessName: shop.profile?.businessInfo?.businessName || 'Unknown Business',
      contactName: shop.name || 'Unknown Contact',
      email: shop.email,
      phone: shop.profile?.contact?.phone,
      address: {
        street: shop.profile?.location?.address || '',
        city: shop.profile?.location?.city || '',
        state: shop.profile?.location?.state || '',
        zipCode: shop.profile?.location?.zipCode || ''
      },
      businessType: shop.profile?.businessInfo?.businessType || 'independent',
      submittedAt: shop.profile?.verification?.submittedAt || shop.createdAt,
      documents: shop.profile?.verification?.documents || [],
      status: shop.profile?.verification?.status || 'pending',
      notes: shop.profile?.verification?.notes,
      rejectionReason: shop.profile?.verification?.rejectionReason
    }))

    return NextResponse.json({ verifications })
  } catch (error) {
    console.error('Failed to fetch verification requests:', error)
    return NextResponse.json(
      { error: 'Failed to fetch verification requests' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }

    const { userId, action, notes, rejectionReason } = await request.json()

    if (!userId || !action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      )
    }

    await connectToDatabase()

    const updateData: any = {
      'profile.verification.reviewedAt': new Date(),
      'profile.verification.reviewedBy': session.user.id
    }

    if (action === 'approve') {
      updateData['profile.verification.status'] = 'verified'
      updateData['profile.verification.verifiedAt'] = new Date()
      if (notes) {
        updateData['profile.verification.notes'] = notes
      }
    } else {
      updateData['profile.verification.status'] = 'rejected'
      updateData['profile.verification.rejectionReason'] = rejectionReason
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

    // TODO: Send email notification to the print shop
    // This would be implemented in a real application
    console.log(`Verification ${action} for user ${userId}`)

    return NextResponse.json({ 
      success: true,
      message: `Verification ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
      user: {
        id: user._id,
        verificationStatus: user.profile?.verification?.status
      }
    })
  } catch (error) {
    console.error('Failed to process verification action:', error)
    return NextResponse.json(
      { error: 'Failed to process verification action' },
      { status: 500 }
    )
  }
}