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
    const format = searchParams.get('format') || 'csv'
    const role = searchParams.get('role')
    const status = searchParams.get('status')

    await dbConnect()

    // Build query filters
    const query: any = {}
    
    if (role && role !== 'all') {
      query.role = role
    }
    
    if (status && status !== 'all') {
      query.status = status
    }

    // Get all users matching criteria
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
        'profile.location.country': 1,
        'profile.businessInfo.businessName': 1,
        'profile.businessInfo.businessType': 1,
        'profile.verification.status': 1,
        'profile.contact.phone': 1
      })
      .sort({ createdAt: -1 })

    if (format === 'csv') {
      // Generate CSV
      const csvHeaders = [
        'ID',
        'Name',
        'Email',
        'Role',
        'Status',
        'Email Verified',
        'Created At',
        'Last Login',
        'City',
        'State',
        'Country',
        'Business Name',
        'Business Type',
        'Verification Status',
        'Phone'
      ]

      const csvRows = users.map(user => [
        user._id.toString(),
        user.name || '',
        user.email,
        user.role,
        user.status || 'active',
        user.emailVerified ? 'Yes' : 'No',
        user.createdAt.toISOString(),
        user.lastLogin?.toISOString() || '',
        user.profile?.location?.city || '',
        user.profile?.location?.state || '',
        user.profile?.location?.country || '',
        user.profile?.businessInfo?.businessName || '',
        user.profile?.businessInfo?.businessType || '',
        user.profile?.verification?.status || '',
        user.profile?.contact?.phone || ''
      ])

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => 
          row.map(field => 
            typeof field === 'string' && field.includes(',') 
              ? `"${field.replace(/"/g, '""')}"` 
              : field
          ).join(',')
        )
      ].join('\n')

      const response = new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="users-export-${new Date().toISOString().split('T')[0]}.csv"`
        }
      })

      return response
    } else if (format === 'json') {
      // Generate JSON
      const jsonData = users.map(user => ({
        id: user._id.toString(),
        name: user.name || '',
        email: user.email,
        role: user.role,
        status: user.status || 'active',
        emailVerified: user.emailVerified || false,
        createdAt: user.createdAt.toISOString(),
        lastLogin: user.lastLogin?.toISOString() || null,
        profile: {
          location: {
            city: user.profile?.location?.city || null,
            state: user.profile?.location?.state || null,
            country: user.profile?.location?.country || null
          },
          businessInfo: {
            businessName: user.profile?.businessInfo?.businessName || null,
            businessType: user.profile?.businessInfo?.businessType || null
          },
          verification: {
            status: user.profile?.verification?.status || null
          },
          contact: {
            phone: user.profile?.contact?.phone || null
          }
        }
      }))

      const response = new NextResponse(JSON.stringify(jsonData, null, 2), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="users-export-${new Date().toISOString().split('T')[0]}.json"`
        }
      })

      return response
    } else {
      return NextResponse.json(
        { error: 'Unsupported format. Use "csv" or "json"' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Failed to export users:', error)
    return NextResponse.json(
      { error: 'Failed to export users' },
      { status: 500 }
    )
  }
}