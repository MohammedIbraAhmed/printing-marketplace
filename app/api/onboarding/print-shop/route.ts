import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { printShopProfileSchema } from '@/lib/validations/print-shop'
import { User as UserModel } from '@/lib/models'
import connectToDatabase from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()

    // Verify user is a print shop
    const user = await UserModel.findById(session.user.id)
    if (!user || user.role !== 'printShop') {
      return NextResponse.json({ 
        error: 'Only print shops can complete this onboarding' 
      }, { status: 403 })
    }

    const body = await request.json()
    
    // Validate the profile data
    const validationResult = printShopProfileSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid profile data', 
          details: validationResult.error.flatten().fieldErrors 
        }, 
        { status: 400 }
      )
    }

    const profileData = validationResult.data

    // Geocode the address if coordinates aren't provided
    if (!profileData.location.coordinates && profileData.location.address) {
      try {
        const coordinates = await geocodeAddress(profileData.location.address)
        if (coordinates) {
          profileData.location.coordinates = coordinates
        }
      } catch (geocodeError) {
        console.warn('Geocoding failed:', geocodeError)
        // Continue without coordinates - can be added later
      }
    }

    // Update user profile with the complete print shop data
    const updatedUser = await UserModel.findByIdAndUpdate(
      session.user.id,
      {
        name: profileData.businessInfo.displayName,
        profile: profileData,
        'onboarding.completed': true,
        'onboarding.completedAt': new Date(),
        'onboarding.step': 'completed',
        updatedAt: new Date(),
      },
      { new: true, runValidators: true }
    )

    if (!updatedUser) {
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }

    // Send welcome email if onboarding is complete
    try {
      const { sendWelcomeEmail } = await import('@/lib/email/notifications')
      await sendWelcomeEmail(
        user.email,
        profileData.businessInfo.displayName,
        'printShop'
      )
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      message: 'Print shop profile created successfully',
      profile: {
        businessName: profileData.businessInfo.displayName,
        isActive: profileData.platformSettings.isActive,
        onboardingComplete: true,
      }
    })

  } catch (error) {
    console.error('Print shop onboarding error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

// Get current onboarding progress
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()

    const user = await UserModel.findById(session.user.id).select('profile onboarding role')
    
    if (!user || user.role !== 'printShop') {
      return NextResponse.json({ 
        error: 'Only print shops can access this endpoint' 
      }, { status: 403 })
    }

    return NextResponse.json({
      profile: user.profile || null,
      onboarding: user.onboarding || {
        completed: false,
        step: 'business-info',
        completedAt: null,
      },
      hasExistingProfile: !!user.profile
    })

  } catch (error) {
    console.error('Get onboarding progress error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

// Update specific onboarding step
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()

    const user = await UserModel.findById(session.user.id)
    if (!user || user.role !== 'printShop') {
      return NextResponse.json({ 
        error: 'Only print shops can update onboarding' 
      }, { status: 403 })
    }

    const body = await request.json()
    const { step, data } = body

    if (!step || !data) {
      return NextResponse.json({ 
        error: 'Step and data are required' 
      }, { status: 400 })
    }

    // Validate step data based on step number
    const { validateOnboardingStep } = await import('@/lib/validations/print-shop')
    const validationResult = validateOnboardingStep(parseInt(step), data)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid step data', 
          details: validationResult.error.flatten().fieldErrors 
        }, 
        { status: 400 }
      )
    }

    // Merge step data with existing profile
    const existingProfile = user.profile || {}
    const updatedProfile = {
      ...existingProfile,
      ...validationResult.data,
    }

    // Update user with step progress
    await UserModel.findByIdAndUpdate(
      session.user.id,
      {
        profile: updatedProfile,
        'onboarding.step': step,
        'onboarding.lastUpdated': new Date(),
        updatedAt: new Date(),
      },
      { new: true }
    )

    return NextResponse.json({
      message: 'Onboarding step saved successfully',
      step: parseInt(step),
      data: validationResult.data
    })

  } catch (error) {
    console.error('Update onboarding step error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

// Geocoding helper function
async function geocodeAddress(address: {
  streetAddress: string
  city: string
  state: string
  zipCode: string
  country: string
}): Promise<{ latitude: number; longitude: number } | null> {
  try {
    const addressString = `${address.streetAddress}, ${address.city}, ${address.state} ${address.zipCode}, ${address.country}`
    
    // In a real implementation, you would use Google Maps Geocoding API or similar
    // For now, return null to indicate coordinates should be added manually
    console.log('Geocoding address:', addressString)
    
    // Example using Google Maps Geocoding API (requires API key)
    // const apiKey = process.env.GOOGLE_MAPS_API_KEY
    // if (!apiKey) return null
    
    // const response = await fetch(
    //   `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(addressString)}&key=${apiKey}`
    // )
    // const data = await response.json()
    
    // if (data.status === 'OK' && data.results.length > 0) {
    //   const location = data.results[0].geometry.location
    //   return {
    //     latitude: location.lat,
    //     longitude: location.lng
    //   }
    // }
    
    return null
  } catch (error) {
    console.error('Geocoding error:', error)
    return null
  }
}