import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import dbConnect from '@/lib/database'
import User from '@/lib/models/User'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'json'

    await dbConnect()

    // Get complete user data
    const user = await User.findById(session.user.id).select('-password')
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // TODO: In a real application, you would also fetch:
    // - Order history
    // - Content uploads
    // - Messages/communications
    // - Activity logs
    // For now, we'll just export the user profile data

    const exportData = {
      exportDate: new Date().toISOString(),
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastLogin: user.lastLogin,
        profile: user.profile,
        preferences: user.preferences,
        privacy: user.privacy
      },
      // TODO: Add these sections when implemented
      orders: [],
      content: [],
      messages: [],
      activityLog: []
    }

    if (format === 'json') {
      const response = new NextResponse(JSON.stringify(exportData, null, 2), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="account-data-${user._id}-${new Date().toISOString().split('T')[0]}.json"`
        }
      })
      return response
    } else if (format === 'csv') {
      // Convert to CSV format (simplified)
      const csvData = [
        ['Field', 'Value'],
        ['ID', user._id.toString()],
        ['Name', user.name || ''],
        ['Email', user.email],
        ['Role', user.role],
        ['Email Verified', user.emailVerified ? 'Yes' : 'No'],
        ['Created At', user.createdAt.toISOString()],
        ['Updated At', user.updatedAt?.toISOString() || ''],
        ['Last Login', user.lastLogin?.toISOString() || ''],
        // Add more fields as needed
      ]

      const csvContent = csvData.map(row => 
        row.map(field => 
          typeof field === 'string' && field.includes(',') 
            ? `"${field.replace(/"/g, '""')}"` 
            : field
        ).join(',')
      ).join('\n')

      const response = new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="account-data-${user._id}-${new Date().toISOString().split('T')[0]}.csv"`
        }
      })
      return response
    } else {
      return NextResponse.json(
        { error: 'Unsupported format. Use "json" or "csv"' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Failed to export user data:', error)
    return NextResponse.json(
      { error: 'Failed to export user data' },
      { status: 500 }
    )
  }
}