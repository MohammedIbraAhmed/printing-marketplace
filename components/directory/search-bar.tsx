'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Search, 
  MapPin, 
  Loader2,
  X,
  Navigation
} from 'lucide-react'

interface SearchBarProps {
  onSearch: (query: string, location?: { latitude: number; longitude: number; address: string }) => void
  initialQuery?: string
  initialLocation?: { latitude: number; longitude: number; address: string }
  isLoading?: boolean
}

interface LocationSuggestion {
  address: string
  latitude: number
  longitude: number
}

export function SearchBar({ onSearch, initialQuery = '', initialLocation, isLoading = false }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery)
  const [locationQuery, setLocationQuery] = useState(initialLocation?.address || '')
  const [selectedLocation, setSelectedLocation] = useState<{ latitude: number; longitude: number; address: string } | undefined>(initialLocation)
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([])
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false)
  const [gettingCurrentLocation, setGettingCurrentLocation] = useState(false)

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

  // Get current location using browser geolocation
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.')
      return
    }

    setGettingCurrentLocation(true)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        
        try {
          // In a real implementation, you would use a reverse geocoding service
          // For now, we'll create a placeholder address
          const address = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
          
          setSelectedLocation({ latitude, longitude, address })
          setLocationQuery(address)
          setShowLocationSuggestions(false)
        } catch (error) {
          console.error('Error getting address:', error)
          // Still set the coordinates even if address lookup fails
          const address = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
          setSelectedLocation({ latitude, longitude, address })
          setLocationQuery(address)
          setShowLocationSuggestions(false)
        } finally {
          setGettingCurrentLocation(false)
        }
      },
      (error) => {
        console.error('Error getting location:', error)
        setGettingCurrentLocation(false)
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            alert('Location access denied by user.')
            break
          case error.POSITION_UNAVAILABLE:
            alert('Location information is unavailable.')
            break
          case error.TIMEOUT:
            alert('Location request timed out.')
            break
          default:
            alert('An unknown error occurred while getting location.')
            break
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    )
  }

  // Handle location input change
  const handleLocationChange = (value: string) => {
    setLocationQuery(value)
    
    if (value.length > 2) {
      // In a real implementation, you would call a geocoding service
      // For now, we'll create mock suggestions
      const mockSuggestions: LocationSuggestion[] = [
        {
          address: `${value}, New York, NY`,
          latitude: 40.7128,
          longitude: -74.0060,
        },
        {
          address: `${value}, Los Angeles, CA`,
          latitude: 34.0522,
          longitude: -118.2437,
        },
        {
          address: `${value}, Chicago, IL`,
          latitude: 41.8781,
          longitude: -87.6298,
        },
      ]
      
      setLocationSuggestions(mockSuggestions)
      setShowLocationSuggestions(true)
    } else {
      setShowLocationSuggestions(false)
      setLocationSuggestions([])
    }
  }

  // Handle location selection
  const handleLocationSelect = (location: LocationSuggestion) => {
    setSelectedLocation(location)
    setLocationQuery(location.address)
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
                    onClick={getCurrentLocation}
                    disabled={gettingCurrentLocation}
                    className="h-8 w-8 p-0"
                    title="Use current location"
                  >
                    {gettingCurrentLocation ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Navigation className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Location Suggestions */}
              {showLocationSuggestions && locationSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                  {locationSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleLocationSelect(suggestion)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{suggestion.address}</span>
                    </button>
                  ))}
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