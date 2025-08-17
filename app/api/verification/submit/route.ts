import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { printShopVerificationSchema } from '@/lib/validations/verification'
import { User as UserModel } from '@/lib/models'
import connectToDatabase from '@/lib/database'
import mongoose from 'mongoose'

// Verification submission schema for database
const VerificationSubmissionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  status: { 
    type: String, 
    enum: ['pending', 'under_review', 'approved', 'rejected', 'expired'],
    default: 'pending' 
  },
  submittedAt: { type: Date, default: Date.now },
  reviewedAt: { type: Date },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewNotes: { type: String },
  expiresAt: { type: Date }, // For approved verifications
  
  // Business Information
  businessInfo: {
    legalName: { type: String, required: true },
    dbaName: { type: String },
    businessType: { 
      type: String, 
      enum: ['sole_proprietorship', 'partnership', 'llc', 'corporation', 'other'],
      required: true 
    },
    taxId: { type: String, required: true },
    yearEstablished: { type: Number, required: true },
    description: { type: String, required: true },
  },
  
  // Contact Information
  contactInfo: {
    businessPhone: { type: String, required: true },
    businessEmail: { type: String, required: true },
    website: { type: String },
  },

  // Address
  address: {
    streetAddress: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true },
  },

  // Equipment & Capabilities
  equipment: {
    printerTypes: [{ 
      type: String, 
      enum: ['digital', 'offset', 'wide_format', 'screen_printing', '3d_printing', 'letterpress', 'other']
    }],
    capabilities: [{ 
      type: String, 
      enum: ['color', 'black_white', 'large_format', 'binding', 'lamination', 'cutting', 'folding', 'stapling', 'other']
    }],
    maxPrintSize: { type: String, required: true },
    paperTypes: [{ type: String }],
  },

  // Services
  services: {
    turnaroundTimes: {
      rush: { type: String, required: true },
      standard: { type: String, required: true },
      extended: { type: String, required: true },
    },
    deliveryOptions: [{ 
      type: String, 
      enum: ['pickup', 'local_delivery', 'shipping', 'mail']
    }],
    specialties: [{ type: String }],
  },

  // Uploaded Documents
  documents: [{
    type: { 
      type: String, 
      enum: ['business_license', 'tax_id', 'insurance', 'certifications', 'other'],
      required: true 
    },
    fileName: { type: String, required: true },
    fileKey: { type: String, required: true }, // S3/R2 key
    fileUrl: { type: String, required: true }, // CDN URL
    uploadedAt: { type: Date, default: Date.now },
    description: { type: String },
  }],
  
  // Certifications
  certifications: [{
    name: { type: String, required: true },
    issuingBody: { type: String, required: true },
    expirationDate: { type: String },
    certificateNumber: { type: String },
  }],

  // Additional Information
  additionalInfo: {
    yearsExperience: { type: Number },
    employeeCount: { type: Number },
    preferredCustomerTypes: [{ 
      type: String, 
      enum: ['students', 'small_business', 'enterprise', 'non_profit', 'government', 'other']
    }],
    notes: { type: String },
  },
}, {
  timestamps: true
})

// Create model
const VerificationSubmission = mongoose.models.VerificationSubmission || 
  mongoose.model('VerificationSubmission', VerificationSubmissionSchema)

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()

    // Check if user is a print shop
    const user = await UserModel.findById(session.user.id)
    if (!user || user.role !== 'printShop') {
      return NextResponse.json({ 
        error: 'Only print shops can submit verification requests' 
      }, { status: 403 })
    }

    // Check if verification already exists
    const existingVerification = await VerificationSubmission.findOne({ 
      userId: session.user.id 
    })
    
    if (existingVerification && ['pending', 'under_review', 'approved'].includes(existingVerification.status)) {
      return NextResponse.json({ 
        error: 'Verification request already exists',
        status: existingVerification.status
      }, { status: 409 })
    }

    const body = await request.json()
    
    // Validate the verification data
    const validationResult = printShopVerificationSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid verification data', 
          details: validationResult.error.flatten().fieldErrors 
        }, 
        { status: 400 }
      )
    }

    const verificationData = validationResult.data

    // Create or update verification submission
    const verificationSubmission = await VerificationSubmission.findOneAndUpdate(
      { userId: session.user.id },
      {
        ...verificationData,
        userId: session.user.id,
        status: 'pending',
        submittedAt: new Date(),
        reviewedAt: null,
        reviewedBy: null,
        reviewNotes: null,
      },
      { 
        upsert: true, 
        new: true,
        runValidators: true 
      }
    )

    // Update user verification status
    await UserModel.findByIdAndUpdate(session.user.id, {
      'verification.status': 'pending',
      'verification.submittedAt': new Date(),
    })

    return NextResponse.json({
      message: 'Verification request submitted successfully',
      submissionId: verificationSubmission._id,
      status: 'pending'
    })

  } catch (error) {
    console.error('Verification submission error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

// Get verification status
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()

    const verification = await VerificationSubmission.findOne({ 
      userId: session.user.id 
    }).select('-documents.fileKey') // Don't expose internal file keys

    if (!verification) {
      return NextResponse.json({ 
        status: 'not_submitted',
        message: 'No verification request found'
      })
    }

    return NextResponse.json({
      status: verification.status,
      submittedAt: verification.submittedAt,
      reviewedAt: verification.reviewedAt,
      reviewNotes: verification.reviewNotes,
      expiresAt: verification.expiresAt,
      businessInfo: verification.businessInfo,
      contactInfo: verification.contactInfo,
      address: verification.address,
      equipment: verification.equipment,
      services: verification.services,
      certifications: verification.certifications,
      additionalInfo: verification.additionalInfo,
      documents: verification.documents.map(doc => ({
        type: doc.type,
        fileName: doc.fileName,
        uploadedAt: doc.uploadedAt,
        description: doc.description
      }))
    })

  } catch (error) {
    console.error('Get verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}