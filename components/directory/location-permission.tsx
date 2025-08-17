'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  MapPin, 
  Navigation, 
  Shield, 
  Info,
  CheckCircle,
  X
} from 'lucide-react'
import { useGeolocation } from '@/lib/hooks/use-geolocation'

interface LocationPermissionProps {
  onLocationSet?: (location: { latitude: number; longitude: number; address: string }) => void
  showCard?: boolean
}

export function LocationPermission({ onLocationSet, showCard = true }: LocationPermissionProps) {
  const [dismissed, setDismissed] = useState(false)
  
  const {
    latitude,
    longitude,
    loading,
    error,
    permission,
    isSupported,
    requestPermission,
  } = useGeolocation()

  // Don't show if dismissed or location already obtained
  if (dismissed || (latitude && longitude)) {
    return null
  }

  const handleRequestLocation = () => {
    requestPermission()
  }

  const handleDismiss = () => {
    setDismissed(true)
  }

  if (!showCard && permission === 'granted') {
    return null
  }

  const content = (
    <>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Navigation className="h-5 w-5 text-blue-500" />
            <CardTitle className="text-lg">Find Nearby Print Shops</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>
          Allow location access to discover print shops near you and get accurate distance estimates.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!isSupported ? (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Location services are not supported by your browser. You can still search by entering an address manually.
            </AlertDescription>
          </Alert>
        ) : permission === 'denied' ? (
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Location access was denied. To enable location-based search:
              <br />
              1. Click the location icon in your browser&apos;s address bar
              <br />
              2. Select &quot;Allow&quot; for location access
              <br />
              3. Refresh the page
            </AlertDescription>
          </Alert>
        ) : error ? (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              {error}. You can still search by entering an address manually.
            </AlertDescription>
          </Alert>
        ) : permission === 'granted' && latitude && longitude ? (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription className="text-green-700">
              Location access enabled! Showing print shops near your location.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-3">
            <div className="flex items-start gap-3 text-sm text-gray-600">
              <MapPin className="h-4 w-4 mt-0.5 text-gray-400" />
              <div>
                <p className="font-medium">Benefits of location access:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Find the closest print shops to you</li>
                  <li>Get accurate distance estimates</li>
                  <li>See shops on an interactive map</li>
                  <li>Get better search results</li>
                </ul>
              </div>
            </div>
            
            <Button 
              onClick={handleRequestLocation}
              disabled={loading}
              className="w-full"
            >
              <Navigation className="h-4 w-4 mr-2" />
              {loading ? 'Getting Location...' : 'Enable Location Access'}
            </Button>
            
            <p className="text-xs text-gray-500 text-center">
              Your location is only used to find nearby print shops and is not stored or shared.
            </p>
          </div>
        )}
      </CardContent>
    </>
  )

  if (showCard) {
    return (
      <Card className="bg-blue-50 border-blue-200">
        {content}
      </Card>
    )
  }

  return <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">{content}</div>
}