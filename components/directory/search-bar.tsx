'use client'

import { useState, useEffect, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Search, 
  MapPin, 
  Loader2,
  X,
  Navigation,
  AlertCircle
} from 'lucide-react'
import { useGeolocation } from '@/lib/hooks/use-geolocation'
import { geocodeAddress, reverseGeocode, type GeocodeResult } from '@/lib/services/geocoding'
import { useToast } from '@/hooks/use-toast'

interface SearchBarProps {
  onSearch: (query: string, location?: { latitude: number; longitude: number; address: string }) => void
  initialQuery?: string
  initialLocation?: { latitude: number; longitude: number; address: string }
  isLoading?: boolean
}

export function SearchBar({ onSearch, initialQuery = '', initialLocation, isLoading = false }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery)
  const [locationQuery, setLocationQuery] = useState(initialLocation?.address || '')
  const [selectedLocation, setSelectedLocation] = useState<{ latitude: number; longitude: number; address: string } | undefined>(initialLocation)
  const [locationSuggestions, setLocationSuggestions] = useState<GeocodeResult[]>([])
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false)
  const [geocodingLoading, setGeocodingLoading] = useState(false)
  
  const { toast } = useToast()
  const {
    latitude,
    longitude,
    loading: geoLoading,
    error: geoError,
    requestPermission,
  } = useGeolocation()

  // Handle search submission
  const handleSearch = () => {
    onSearch(query, selectedLocation)
  }

  // Handle enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  // Effect to handle successful geolocation
  useEffect(() => {
    if (latitude && longitude) {
      // Reverse geocode the coordinates to get address
      reverseGeocode(latitude, longitude)
        .then(result => {
          if (result) {
            const location = {
              latitude,
              longitude,
              address: result.displayName,
            }
            setSelectedLocation(location)
            setLocationQuery(result.displayName)
            setShowLocationSuggestions(false)
            
            toast({
              title: 'Location detected',
              description: 'Your current location has been set',
            })
          }
        })
        .catch(error => {
          console.error('Reverse geocoding error:', error)
          // Fallback to coordinates
          const address = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
          setSelectedLocation({ latitude, longitude, address })
          setLocationQuery(address)
          setShowLocationSuggestions(false)
        })
    }
  }, [latitude, longitude, toast])

  // Effect to handle geolocation errors
  useEffect(() => {
    if (geoError) {
      toast({
        title: 'Location Error',
        description: geoError,
        variant: 'destructive',
      })
    }
  }, [geoError, toast])

  // Handle current location request
  const handleCurrentLocation = () => {
    requestPermission()
  }

  // Debounced geocoding search
  const debouncedGeocoding = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout
      return (query: string) => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(async () => {
          if (query.length > 2) {
            setGeocodingLoading(true)
            try {
              const results = await geocodeAddress(query)
              setLocationSuggestions(results.slice(0, 5)) // Limit to 5 suggestions
              setShowLocationSuggestions(true)
            } catch (error) {
              console.error('Geocoding error:', error)
              toast({
                title: 'Address Search Error',
                description: 'Unable to search addresses. Please try again.',
                variant: 'destructive',
              })
              setLocationSuggestions([])
              setShowLocationSuggestions(false)
            } finally {
              setGeocodingLoading(false)
            }
          } else {
            setLocationSuggestions([])
            setShowLocationSuggestions(false)
          }
        }, 500) // 500ms debounce
      }
    })(),
    [toast]
  )

  // Handle location input change
  const handleLocationChange = (value: string) => {
    setLocationQuery(value)
    
    // Clear selected location if user is typing
    if (selectedLocation && value !== selectedLocation.address) {
      setSelectedLocation(undefined)
    }
    
    // Trigger debounced geocoding
    debouncedGeocoding(value)
  }

  // Handle location selection
  const handleLocationSelect = (result: GeocodeResult) => {
    const location = {
      latitude: result.coordinates.latitude,
      longitude: result.coordinates.longitude,
      address: result.displayName,
    }
    setSelectedLocation(location)
    setLocationQuery(result.displayName)
    setShowLocationSuggestions(false)
  }

  // Clear location
  const clearLocation = () => {
    setSelectedLocation(undefined)
    setLocationQuery('')
    setShowLocationSuggestions(false)
  }

  return (
    <div className="space-y-4">
      <Card className="bg-white shadow-lg">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Search Query Input */}
            <div className="md:col-span-5">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search for services, business names..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-10 h-12"
                />
              </div>
            </div>

            {/* Location Input */}
            <div className="md:col-span-5 relative">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Enter city, state, or ZIP code..."
                  value={locationQuery}
                  onChange={(e) => handleLocationChange(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-10 pr-20 h-12"
                />
                
                {/* Current Location and Clear buttons */}
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                  {selectedLocation && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={clearLocation}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                  
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleCurrentLocation}
                    disabled={geoLoading}
                    className="h-8 w-8 p-0"
                    title="Use current location"
                  >
                    {geoLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Navigation className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Location Suggestions */}
              {(showLocationSuggestions || geocodingLoading) && (
                <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                  {geocodingLoading ? (
                    <div className="px-4 py-3 flex items-center gap-2 text-gray-500">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Searching locations...</span>
                    </div>
                  ) : locationSuggestions.length > 0 ? (
                    locationSuggestions.map((result, index) => (
                      <button
                        key={index}
                        onClick={() => handleLocationSelect(result)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-start gap-2 border-b border-gray-100 last:border-b-0"
                      >
                        <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {result.address.city ? (
                              `${result.address.city}${result.address.state ? `, ${result.address.state}` : ''}`
                            ) : (
                              result.displayName.split(',').slice(0, 2).join(', ')
                            )}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {result.displayName}
                          </div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 flex items-center gap-2 text-gray-500">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm">No locations found</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Search Button */}
            <div className="md:col-span-2">
              <Button 
                onClick={handleSearch}
                disabled={isLoading}
                className="w-full h-12"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                Search
              </Button>
            </div>
          </div>

          {/* Current Search Info */}
          {(query || selectedLocation) && (
            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-gray-600">
              <span>Searching for:</span>
              {query && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                  &quot;{query}&quot;
                </span>
              )}
              {selectedLocation && (
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {selectedLocation.address}
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}