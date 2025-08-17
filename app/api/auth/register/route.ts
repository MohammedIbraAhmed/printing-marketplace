import { NextRequest, NextResponse } from 'next/server'
import { User } from '@/lib/models'
import connectToDatabase from '@/lib/database'
import { hashPassword, validatePassword } from '@/lib/auth/password'
import { checkRateLimit, recordAttempt, getClientIdentifier, RATE_LIMIT_CONFIGS } from '@/lib/auth/rate-limit'

interface RegisterRequest {
  name: string
  email: string
  password: string
  role: 'customer' | 'creator' | 'printShop'
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientId = getClientIdentifier(request)
    const rateLimitResult = checkRateLimit(clientId, RATE_LIMIT_CONFIGS.register)
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many registration attempts. Please try again later.' },
        { 
          status: 429,
          headers: {
            'Retry-After': rateLimitResult.retryAfter?.toString() || '3600'
          }
        }
      )
    }

    const body: RegisterRequest = await request.json()
    const { name, email, password, role } = body

    // Validate input
    if (!name || !email || !password || !role) {
      recordAttempt(clientId, RATE_LIMIT_CONFIGS.register, false)
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      recordAttempt(clientId, RATE_LIMIT_CONFIGS.register, false)
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    // Validate password strength
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.isValid) {
      recordAttempt(clientId, RATE_LIMIT_CONFIGS.register, false)
      return NextResponse.json(
        { error: passwordValidation.errors[0] },
        { status: 400 }
      )
    }

    // Validate role
    const validRoles = ['customer', 'creator', 'printShop']
    if (!validRoles.includes(role)) {
      recordAttempt(clientId, RATE_LIMIT_CONFIGS.register, false)
      return NextResponse.json(
        { error: 'Invalid role specified' },
        { status: 400 }
      )
    }

    // Connect to database
    await connectToDatabase()

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      recordAttempt(clientId, RATE_LIMIT_CONFIGS.register, false)
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const newUser = new User({
      name: name.trim(),
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      preferences: {
        notifications: {
          email: true,
          orderUpdates: true,
          marketing: false,
        },
      },
    })

    await newUser.save()

    // Record successful registration
    recordAttempt(clientId, RATE_LIMIT_CONFIGS.register, true)

    // Return success (don't include sensitive data)
    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    })

  } catch (error: unknown) {
    console.error('Registration error:', error)
    
    // Record failed attempt for rate limiting
    const clientId = getClientIdentifier(request)
    recordAttempt(clientId, RATE_LIMIT_CONFIGS.register, false)

    if ((error as { code?: number })?.code === 11000) {
      // Duplicate key error (email already exists)
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}