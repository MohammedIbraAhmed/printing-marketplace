// Geocoding service using OpenStreetMap's Nominatim API (free, no API key required)

export interface Coordinates {
  latitude: number
  longitude: number
}

export interface Address {
  streetAddress?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
}

export interface GeocodeResult {
  coordinates: Coordinates
  address: Address
  displayName: string
  confidence: number
}

export interface ReverseGeocodeResult {
  address: Address
  displayName: string
}

// Forward geocoding: Address -> Coordinates
export async function geocodeAddress(query: string): Promise<GeocodeResult[]> {
  try {
    const encodedQuery = encodeURIComponent(query)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodedQuery}&countrycodes=us&limit=5&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'PrintMarket Directory (https://printmarket.app)',
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Geocoding request failed: ${response.status}`)
    }

    const data = await response.json()

    return data.map((result: Record<string, unknown>) => ({
      coordinates: {
        latitude: parseFloat(result.lat as string),
        longitude: parseFloat(result.lon as string),
      },
      address: {
        streetAddress: [
          (result.address as Record<string, unknown>)?.house_number,
          (result.address as Record<string, unknown>)?.road,
        ].filter(Boolean).join(' ') || undefined,
        city: (result.address as Record<string, unknown>)?.city as string || 
              (result.address as Record<string, unknown>)?.town as string || 
              (result.address as Record<string, unknown>)?.village as string || undefined,
        state: (result.address as Record<string, unknown>)?.state as string || undefined,
        zipCode: (result.address as Record<string, unknown>)?.postcode as string || undefined,
        country: (result.address as Record<string, unknown>)?.country as string || undefined,
      },
      displayName: result.display_name as string,
      confidence: parseFloat((result.importance as string) || '0'),
    }))
  } catch (error) {
    console.error('Geocoding error:', error)
    throw new Error('Failed to geocode address')
  }
}

// Reverse geocoding: Coordinates -> Address
export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<ReverseGeocodeResult | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'PrintMarket Directory (https://printmarket.app)',
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Reverse geocoding request failed: ${response.status}`)
    }

    const data = await response.json()

    if (!data || data.error) {
      return null
    }

    return {
      address: {
        streetAddress: [
          data.address?.house_number,
          data.address?.road,
        ].filter(Boolean).join(' ') || undefined,
        city: data.address?.city || data.address?.town || data.address?.village || undefined,
        state: data.address?.state || undefined,
        zipCode: data.address?.postcode || undefined,
        country: data.address?.country || undefined,
      },
      displayName: data.display_name,
    }
  } catch (error) {
    console.error('Reverse geocoding error:', error)
    return null
  }
}

// Calculate distance between two points using Haversine formula
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959 // Earth's radius in miles
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Format address for display
export function formatAddress(address: Address): string {
  const parts = [
    address.streetAddress,
    address.city,
    address.state,
    address.zipCode,
  ].filter(Boolean)

  return parts.join(', ')
}

// Validate coordinates
export function isValidCoordinates(lat: number, lon: number): boolean {
  return (
    typeof lat === 'number' &&
    typeof lon === 'number' &&
    lat >= -90 &&
    lat <= 90 &&
    lon >= -180 &&
    lon <= 180 &&
    !isNaN(lat) &&
    !isNaN(lon)
  )
}

// Get user's location with fallback to IP-based location
export async function getUserLocation(): Promise<{
  coordinates: Coordinates
  address: string
  method: 'gps' | 'ip' | 'fallback'
} | null> {
  // Try GPS first
  if ('geolocation' in navigator) {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        })
      })

      const reverseResult = await reverseGeocode(
        position.coords.latitude,
        position.coords.longitude
      )

      return {
        coordinates: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        },
        address: reverseResult?.displayName || 'Current Location',
        method: 'gps',
      }
    } catch {
      console.log('GPS location failed, trying IP-based location')
    }
  }

  // Fallback to IP-based location (using a free service)
  try {
    const response = await fetch('https://ipapi.co/json/')
    if (response.ok) {
      const data = await response.json()
      
      if (data.latitude && data.longitude) {
        return {
          coordinates: {
            latitude: data.latitude,
            longitude: data.longitude,
          },
          address: `${data.city}, ${data.region}`,
          method: 'ip',
        }
      }
    }
  } catch {
    console.log('IP-based location failed')
  }

  // Final fallback - center of US
  return {
    coordinates: {
      latitude: 39.8283,
      longitude: -98.5795,
    },
    address: 'United States',
    method: 'fallback',
  }
}