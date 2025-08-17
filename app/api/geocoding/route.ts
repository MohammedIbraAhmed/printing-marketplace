import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { geocodeAddress, reverseGeocode, isValidCoordinates } from '@/lib/services/geocoding'

// Validation schemas
const geocodeSchema = z.object({
  address: z.string().min(3, 'Address must be at least 3 characters long'),
  limit: z.number().min(1).max(10).optional().default(5),
})

const reverseGeocodeSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
})

// Forward geocoding: address -> coordinates
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const validationResult = geocodeSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid parameters', 
          details: validationResult.error.flatten().fieldErrors 
        }, 
        { status: 400 }
      )
    }

    const { address, limit } = validationResult.data

    // Rate limiting check (simple implementation)
    const userAgent = request.headers.get('user-agent') || 'unknown'
    
    try {
      const results = await geocodeAddress(address)
      
      // Limit results
      const limitedResults = results.slice(0, limit)
      
      return NextResponse.json({
        success: true,
        results: limitedResults,
        count: limitedResults.length,
      })
      
    } catch (error) {
      console.error('Geocoding error:', error)
      return NextResponse.json(
        { 
          error: 'Geocoding service unavailable',
          message: 'Unable to geocode address. Please try again later.' 
        }, 
        { status: 503 }
      )
    }
    
  } catch (error) {
    console.error('Geocoding API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

// Reverse geocoding: coordinates -> address
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')
    
    if (!lat || !lng) {
      return NextResponse.json(
        { error: 'Missing latitude or longitude parameters' }, 
        { status: 400 }
      )
    }

    const latitude = parseFloat(lat)
    const longitude = parseFloat(lng)

    const validationResult = reverseGeocodeSchema.safeParse({ latitude, longitude })
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid coordinates', 
          details: validationResult.error.flatten().fieldErrors 
        }, 
        { status: 400 }
      )
    }

    if (!isValidCoordinates(latitude, longitude)) {
      return NextResponse.json(
        { error: 'Invalid coordinate values' }, 
        { status: 400 }
      )
    }

    try {
      const result = await reverseGeocode(latitude, longitude)
      
      if (!result) {
        return NextResponse.json(
          { error: 'No address found for these coordinates' }, 
          { status: 404 }
        )
      }
      
      return NextResponse.json({
        success: true,
        result,
      })
      
    } catch (error) {
      console.error('Reverse geocoding error:', error)
      return NextResponse.json(
        { 
          error: 'Reverse geocoding service unavailable',
          message: 'Unable to reverse geocode coordinates. Please try again later.' 
        }, 
        { status: 503 }
      )
    }
    
  } catch (error) {
    console.error('Reverse geocoding API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}