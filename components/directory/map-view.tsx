'use client'

import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import L from 'leaflet'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  MapPin, 
  Printer, 
  Phone, 
  Mail, 
  ExternalLink,
  Navigation,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'

// Fix for default markers in React Leaflet
import 'leaflet/dist/leaflet.css'

// Custom shop marker icon
const createShopIcon = (isFeatured: boolean = false) => {
  return L.divIcon({
    html: `
      <div class="relative">
        <div class="w-8 h-8 ${isFeatured ? 'bg-blue-600' : 'bg-green-600'} rounded-full border-2 border-white shadow-lg flex items-center justify-center">
          <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        ${isFeatured ? '<div class="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border border-white"></div>' : ''}
      </div>
    `,
    className: 'custom-shop-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  })
}

// User location marker icon
const userLocationIcon = L.divIcon({
  html: `
    <div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg"></div>
    <div class="w-8 h-8 border-2 border-blue-500 rounded-full absolute -top-2 -left-2 animate-ping opacity-75"></div>
  `,
  className: 'user-location-marker',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
})

interface Shop {
  id: string
  name: string
  description: string
  location: {
    address: {
      city?: string
      state?: string
    }
    coordinates?: {
      latitude: number
      longitude: number
    }
  }
  services: {
    coreServices?: string[]
  }
  pricing: {
    baseRates?: {
      blackWhite?: { singleSided?: number }
    }
  }
  capacity: {
    acceptingOrders?: boolean
  }
  isFeatured?: boolean
  distance?: number | null
}

interface MapViewProps {
  shops: Shop[]
  userLocation?: { latitude: number; longitude: number; address: string }
  searchRadius?: number
  onShopSelect?: (shopId: string) => void
  className?: string
}

// Component to handle map centering and search area
function MapController({ 
  shops, 
  userLocation, 
  searchRadius 
}: { 
  shops: Shop[]
  userLocation?: { latitude: number; longitude: number; address: string }
  searchRadius?: number 
}) {
  const map = useMap()

  useEffect(() => {
    if (userLocation) {
      // Center on user location with search radius
      map.setView([userLocation.latitude, userLocation.longitude], 12)
    } else if (shops.length > 0) {
      // Fit map to show all shops
      const bounds = L.latLngBounds(
        shops
          .filter(shop => shop.location.coordinates)
          .map(shop => [
            shop.location.coordinates!.latitude,
            shop.location.coordinates!.longitude
          ])
      )
      
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [20, 20] })
      }
    }
  }, [map, shops, userLocation])

  return null
}

export function MapView({ 
  shops, 
  userLocation, 
  searchRadius = 25, 
  onShopSelect,
  className = ''
}: MapViewProps) {
  const [mapReady, setMapReady] = useState(false)
  
  // Filter shops with valid coordinates
  const validShops = shops.filter(shop => 
    shop.location.coordinates && 
    shop.location.coordinates.latitude && 
    shop.location.coordinates.longitude
  )

  // Default center (USA center if no location provided)
  const defaultCenter: [number, number] = userLocation 
    ? [userLocation.latitude, userLocation.longitude]
    : [39.8283, -98.5795] // Geographic center of USA

  const formatServices = (services: string[] = []) => {
    const serviceMap: Record<string, string> = {
      'document_printing': 'Documents',
      'business_cards': 'Business Cards',
      'poster_printing': 'Posters',
      'banner_printing': 'Banners',
      'flyers': 'Flyers',
      'brochures': 'Brochures',
    }
    
    return services.slice(0, 3).map(service => serviceMap[service] || service)
  }

  return (
    <div className={`relative ${className}`}>
      <MapContainer
        center={defaultCenter}
        zoom={userLocation ? 12 : 4}
        className="w-full h-full min-h-[500px] rounded-lg z-0"
        whenReady={() => setMapReady(true)}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {mapReady && (
          <MapController 
            shops={validShops}
            userLocation={userLocation}
            searchRadius={searchRadius}
          />
        )}

        {/* User location marker */}
        {userLocation && (
          <Marker
            position={[userLocation.latitude, userLocation.longitude]}
            icon={userLocationIcon}
          >
            <Popup>
              <div className="text-center">
                <div className="flex items-center gap-2 mb-2">
                  <Navigation className="h-4 w-4 text-blue-500" />
                  <span className="font-medium">Your Location</span>
                </div>
                <p className="text-sm text-gray-600">{userLocation.address}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Search radius circle */}
        {userLocation && (
          <Circle
            center={[userLocation.latitude, userLocation.longitude]}
            radius={searchRadius * 1609.34} // Convert miles to meters
            pathOptions={{
              fillColor: 'blue',
              fillOpacity: 0.1,
              color: 'blue',
              weight: 2,
              opacity: 0.5,
            }}
          />
        )}

        {/* Shop markers with clustering */}
        <MarkerClusterGroup
          chunkedLoading
          iconCreateFunction={(cluster) => {
            const childCount = cluster.getChildCount()
            return L.divIcon({
              html: `<div class="w-10 h-10 bg-green-600 text-white rounded-full border-2 border-white shadow-lg flex items-center justify-center font-bold">${childCount}</div>`,
              className: 'marker-cluster',
              iconSize: [40, 40],
            })
          }}
        >
          {validShops.map((shop) => (
            <Marker
              key={shop.id}
              position={[
                shop.location.coordinates!.latitude,
                shop.location.coordinates!.longitude
              ]}
              icon={createShopIcon(shop.isFeatured)}
              eventHandlers={{
                click: () => {
                  if (onShopSelect) {
                    onShopSelect(shop.id)
                  }
                }
              }}
            >
              <Popup>
                <Card className="border-0 shadow-none">
                  <CardContent className="p-0 w-64">
                    <div className="space-y-3">
                      {/* Header */}
                      <div>
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-gray-900 text-base leading-tight">
                            {shop.name}
                          </h3>
                          {shop.isFeatured && (
                            <Badge className="bg-blue-100 text-blue-700 text-xs ml-2">
                              Featured
                            </Badge>
                          )}
                        </div>
                        
                        {shop.location.address.city && shop.location.address.state && (
                          <div className="flex items-center gap-1 text-gray-600 text-sm">
                            <MapPin className="h-3 w-3" />
                            <span>
                              {shop.location.address.city}, {shop.location.address.state}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Status */}
                      <div>
                        {shop.capacity.acceptingOrders ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Accepting Orders
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Not Accepting
                          </Badge>
                        )}
                      </div>

                      {/* Services */}
                      {shop.services.coreServices && shop.services.coreServices.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-gray-700 mb-1">Services:</p>
                          <div className="flex flex-wrap gap-1">
                            {formatServices(shop.services.coreServices).map((service) => (
                              <Badge key={service} variant="secondary" className="text-xs">
                                {service}
                              </Badge>
                            ))}
                            {shop.services.coreServices.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{shop.services.coreServices.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Pricing */}
                      {shop.pricing.baseRates?.blackWhite?.singleSided && (
                        <div className="text-sm">
                          <span className="text-gray-600">From </span>
                          <span className="font-medium text-gray-900">
                            ${shop.pricing.baseRates.blackWhite.singleSided.toFixed(2)}/page
                          </span>
                        </div>
                      )}

                      {/* Distance */}
                      {shop.distance && (
                        <div className="text-xs text-gray-600">
                          {shop.distance} miles away
                        </div>
                      )}

                      {/* Action Button */}
                      <div className="pt-2 border-t">
                        <Link href={`/directory/${shop.id}`}>
                          <Button size="sm" className="w-full text-xs">
                            View Details
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>

      {/* Map Legend */}
      <div className="absolute top-4 right-4 z-[1000]">
        <Card className="bg-white/90 backdrop-blur-sm">
          <CardContent className="p-3">
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-600 rounded-full border border-white"></div>
                <span>Print Shop</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="w-4 h-4 bg-blue-600 rounded-full border border-white"></div>
                  <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-yellow-400 rounded-full border border-white"></div>
                </div>
                <span>Featured Shop</span>
              </div>
              {userLocation && (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded-full border border-white"></div>
                  <span>Your Location</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Shop Count */}
      {validShops.length > 0 && (
        <div className="absolute bottom-4 left-4 z-[1000]">
          <Card className="bg-white/90 backdrop-blur-sm">
            <CardContent className="p-2 px-3">
              <div className="flex items-center gap-2 text-sm">
                <Printer className="h-4 w-4 text-gray-600" />
                <span className="font-medium">
                  {validShops.length} shop{validShops.length !== 1 ? 's' : ''} shown
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}