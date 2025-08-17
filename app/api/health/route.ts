import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import connectToDatabase from '@/lib/database'

export async function GET() {
  try {
    const checks = await Promise.allSettled([
      checkDatabaseConnection(),
      // Additional service checks will be added in future stories
    ])

    const health = {
      status: checks.every(check => check.status === 'fulfilled')
        ? 'healthy'
        : 'unhealthy',
      timestamp: new Date().toISOString(),
      services: {
        database: checks[0].status === 'fulfilled',
        // Additional services will be added in future stories
      },
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    }

    return NextResponse.json(health, {
      status: health.status === 'healthy' ? 200 : 503,
    })
  } catch (error) {
    console.error('Health check error:', error)

    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        services: {
          database: false,
        },
        error: 'Health check failed',
      },
      {
        status: 503,
      }
    )
  }
}

async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await connectToDatabase()
    return mongoose.connection.readyState === 1
  } catch (error) {
    console.error('Database connection check failed:', error)
    return false
  }
}
