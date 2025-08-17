'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  MapPin, 
  Clock, 
  Star,
  Truck,
  Package,
  Printer,
  Phone,
  Mail,
  ExternalLink,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

interface ShopCardProps {
  shop: {
    id: string
    name: string
    description: string
    logo?: string | null
    location: {
      address: {
        streetAddress?: string
        city?: string
        state?: string
        zipCode?: string
      }
      serviceRadius?: number
      pickupAvailable?: boolean
      deliveryAvailable?: boolean
      shippingAvailable?: boolean
    }
    businessHours: {
      timezone?: string
      schedule?: Record<string, { isOpen: boolean; openTime?: string; closeTime?: string }>
    }
    equipment: {
      printerTypes?: string[]
      capabilities?: string[]
    }
    services: {
      coreServices?: string[]
      turnaroundTimes?: {
        rush?: { time: string }
        standard?: { time: string }
      }
    }
    pricing: {
      baseRates?: {
        blackWhite?: { singleSided?: number }
        color?: { singleSided?: number }
      }
      pricingModel?: string
    }
    capacity: {
      acceptingOrders?: boolean
      currentWorkload?: number
    }
    isFeatured?: boolean
    distance?: number | null
  }
  view?: 'grid' | 'list'
  showDistance?: boolean
}

const formatPrinterType = (type: string) => {
  const types: Record<string, string> = {
    'digital': 'Digital',
    'offset': 'Offset',
    'wide_format': 'Wide Format',
    'screen_printing': 'Screen Print',
    '3d_printing': '3D Print',
    'letterpress': 'Letterpress',
    'inkjet': 'Inkjet',
    'laser': 'Laser',
    'other': 'Other',
  }
  return types[type] || type
}

const formatService = (service: string) => {
  const services: Record<string, string> = {
    'document_printing': 'Documents',
    'poster_printing': 'Posters',
    'banner_printing': 'Banners',
    'business_cards': 'Business Cards',
    'flyers': 'Flyers',
    'brochures': 'Brochures',
    'booklets': 'Booklets',
    'binding': 'Binding',
    'lamination': 'Lamination',
    'custom_printing': 'Custom',
  }
  return services[service] || service
}

const formatCapability = (capability: string) => {
  const capabilities: Record<string, string> = {
    'color': 'Color',
    'black_white': 'B&W',
    'large_format': 'Large Format',
    'binding': 'Binding',
    'lamination': 'Lamination',
    'cutting': 'Cutting',
    'folding': 'Folding',
    'stapling': 'Stapling',
    'drilling': 'Drilling',
    'embossing': 'Embossing',
    'foil_stamping': 'Foil Stamp',
    'die_cutting': 'Die Cut',
    'other': 'Other',
  }
  return capabilities[capability] || capability
}

const getCurrentDaySchedule = (schedule: Record<string, { isOpen: boolean; openTime?: string; closeTime?: string }>) => {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const today = days[new Date().getDay()]
  return schedule[today]
}

const formatTime = (time: string) => {
  try {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    return `${displayHour}:${minutes} ${ampm}`
  } catch {
    return time
  }
}

export function ShopCard({ shop, view = 'grid', showDistance = false }: ShopCardProps) {
  const todaySchedule = getCurrentDaySchedule(shop.businessHours.schedule || {})
  const isOpenToday = todaySchedule?.isOpen || false
  const openTime = todaySchedule?.openTime
  const closeTime = todaySchedule?.closeTime

  const displayAddress = shop.location.address
  const addressString = [
    displayAddress.city,
    displayAddress.state
  ].filter(Boolean).join(', ')

  // Delivery options
  const deliveryOptions = []
  if (shop.location.pickupAvailable) deliveryOptions.push('Pickup')
  if (shop.location.deliveryAvailable) deliveryOptions.push('Delivery')
  if (shop.location.shippingAvailable) deliveryOptions.push('Shipping')

  if (view === 'list') {
    return (
      <Card className={`hover:shadow-md transition-shadow ${shop.isFeatured ? 'ring-2 ring-blue-200 bg-blue-50/30' : ''}`}>
        <CardContent className="p-6">
          <div className="flex gap-6">
            {/* Logo/Image */}
            <div className="flex-shrink-0">
              <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                {shop.logo ? (
                  <Image
                    src={shop.logo}
                    alt={`${shop.name} logo`}
                    width={80}
                    height={80}
                    className="object-cover"
                  />
                ) : (
                  <Printer className="h-8 w-8 text-gray-400" />
                )}
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {shop.name}
                    </h3>
                    {shop.isFeatured && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                        Featured
                      </Badge>
                    )}
                    {showDistance && shop.distance && (
                      <Badge variant="outline" className="text-xs">
                        {shop.distance} mi
                      </Badge>
                    )}
                  </div>
                  
                  {addressString && (
                    <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                      <MapPin className="h-4 w-4" />
                      <span>{addressString}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {shop.capacity.acceptingOrders ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Open for Orders
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Not Accepting
                    </Badge>
                  )}
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {shop.description}
              </p>

              {/* Business Hours */}
              {isOpenToday && openTime && closeTime && (
                <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
                  <Clock className="h-4 w-4" />
                  <span>Today: {formatTime(openTime)} - {formatTime(closeTime)}</span>
                </div>
              )}

              {/* Services and Equipment */}
              <div className="flex flex-wrap gap-2 mb-3">
                {shop.services.coreServices?.slice(0, 4).map((service) => (
                  <Badge key={service} variant="secondary" className="text-xs">
                    {formatService(service)}
                  </Badge>
                ))}
                {shop.services.coreServices && shop.services.coreServices.length > 4 && (
                  <Badge variant="outline" className="text-xs">
                    +{shop.services.coreServices.length - 4} more
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {shop.equipment.printerTypes?.slice(0, 3).map((type) => (
                  <Badge key={type} variant="outline" className="text-xs">
                    {formatPrinterType(type)}
                  </Badge>
                ))}
              </div>

              {/* Footer Info */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  {/* Pricing */}
                  {shop.pricing.baseRates?.blackWhite?.singleSided && (
                    <span>
                      From ${shop.pricing.baseRates.blackWhite.singleSided.toFixed(2)}/page
                    </span>
                  )}
                  
                  {/* Turnaround */}
                  {shop.services.turnaroundTimes?.standard?.time && (
                    <span>
                      {shop.services.turnaroundTimes.standard.time}
                    </span>
                  )}

                  {/* Delivery */}
                  {deliveryOptions.length > 0 && (
                    <span className="flex items-center gap-1">
                      <Truck className="h-4 w-4" />
                      {deliveryOptions.join(', ')}
                    </span>
                  )}
                </div>

                <Link href={`/directory/${shop.id}`}>
                  <Button size="sm">
                    View Details
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Grid view
  return (
    <Card className={`hover:shadow-lg transition-shadow ${shop.isFeatured ? 'ring-2 ring-blue-200 bg-blue-50/30' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* Logo */}
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
              {shop.logo ? (
                <Image
                  src={shop.logo}
                  alt={`${shop.name} logo`}
                  width={48}
                  height={48}
                  className="object-cover"
                />
              ) : (
                <Printer className="h-6 w-6 text-gray-400" />
              )}
            </div>
            
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <CardTitle className="text-base truncate">{shop.name}</CardTitle>
                {shop.isFeatured && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs">
                    Featured
                  </Badge>
                )}
              </div>
              
              {addressString && (
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate">{addressString}</span>
                </div>
              )}
            </div>
          </div>

          {showDistance && shop.distance && (
            <Badge variant="outline" className="text-xs">
              {shop.distance} mi
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <CardDescription className="text-sm mb-3 line-clamp-2">
          {shop.description}
        </CardDescription>

        {/* Status */}
        <div className="mb-3">
          {shop.capacity.acceptingOrders ? (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
              <CheckCircle className="h-3 w-3 mr-1" />
              Open for Orders
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs">
              <AlertCircle className="h-3 w-3 mr-1" />
              Not Accepting
            </Badge>
          )}
        </div>

        {/* Business Hours */}
        {isOpenToday && openTime && closeTime && (
          <div className="flex items-center gap-1 text-xs text-gray-600 mb-3">
            <Clock className="h-3 w-3" />
            <span>Today: {formatTime(openTime)} - {formatTime(closeTime)}</span>
          </div>
        )}

        {/* Services */}
        <div className="flex flex-wrap gap-1 mb-3">
          {shop.services.coreServices?.slice(0, 3).map((service) => (
            <Badge key={service} variant="secondary" className="text-xs">
              {formatService(service)}
            </Badge>
          ))}
          {shop.services.coreServices && shop.services.coreServices.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{shop.services.coreServices.length - 3}
            </Badge>
          )}
        </div>

        {/* Equipment Types */}
        <div className="flex flex-wrap gap-1 mb-4">
          {shop.equipment.printerTypes?.slice(0, 2).map((type) => (
            <Badge key={type} variant="outline" className="text-xs">
              {formatPrinterType(type)}
            </Badge>
          ))}
          {shop.equipment.printerTypes && shop.equipment.printerTypes.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{shop.equipment.printerTypes.length - 2}
            </Badge>
          )}
        </div>

        {/* Pricing */}
        {shop.pricing.baseRates?.blackWhite?.singleSided && (
          <div className="text-sm font-medium text-gray-900 mb-2">
            From ${shop.pricing.baseRates.blackWhite.singleSided.toFixed(2)}/page
          </div>
        )}

        {/* Turnaround */}
        {shop.services.turnaroundTimes?.standard?.time && (
          <div className="text-xs text-gray-600 mb-3">
            Standard: {shop.services.turnaroundTimes.standard.time}
          </div>
        )}

        {/* Delivery Options */}
        {deliveryOptions.length > 0 && (
          <div className="flex items-center gap-1 text-xs text-gray-600 mb-4">
            <Truck className="h-3 w-3" />
            <span>{deliveryOptions.join(', ')}</span>
          </div>
        )}

        <Link href={`/directory/${shop.id}`} className="block">
          <Button size="sm" className="w-full">
            View Details
            <ExternalLink className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}