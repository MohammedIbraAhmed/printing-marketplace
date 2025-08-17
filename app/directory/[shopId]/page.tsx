import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  MapPin, 
  Clock, 
  Phone,
  Mail,
  Globe,
  Truck,
  Package,
  Printer,
  DollarSign,
  Users,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  ExternalLink
} from 'lucide-react'
import connectToDatabase from '@/lib/database'
import { User as UserModel } from '@/lib/models'

interface ShopDetailPageProps {
  params: {
    shopId: string
  }
}

async function getShopDetails(shopId: string) {
  try {
    await connectToDatabase()
    
    const shop = await UserModel.findOne({
      _id: shopId,
      role: 'printShop',
      'onboarding.completed': true,
      'platformSettings.isActive': true,
      'platformSettings.publicProfile': true,
    }).lean()
    
    if (!shop) {
      return null
    }
    
    return {
      id: shop._id.toString(),
      name: shop.name,
      email: shop.email,
      profile: shop.profile,
      onboarding: shop.onboarding,
    }
  } catch (error) {
    console.error('Error fetching shop details:', error)
    return null
  }
}

const formatPrinterType = (type: string) => {
  const types: Record<string, string> = {
    'digital': 'Digital Printing',
    'offset': 'Offset Printing',
    'wide_format': 'Wide Format',
    'screen_printing': 'Screen Printing',
    '3d_printing': '3D Printing',
    'letterpress': 'Letterpress',
    'inkjet': 'Inkjet',
    'laser': 'Laser Printing',
    'other': 'Other',
  }
  return types[type] || type
}

const formatService = (service: string) => {
  const services: Record<string, string> = {
    'document_printing': 'Document Printing',
    'poster_printing': 'Poster Printing',
    'banner_printing': 'Banner Printing',
    'business_cards': 'Business Cards',
    'flyers': 'Flyers',
    'brochures': 'Brochures',
    'booklets': 'Booklets',
    'binding': 'Binding Services',
    'lamination': 'Lamination Services',
    'custom_printing': 'Custom Printing',
  }
  return services[service] || service
}

const formatCapability = (capability: string) => {
  const capabilities: Record<string, string> = {
    'color': 'Color Printing',
    'black_white': 'Black & White',
    'large_format': 'Large Format',
    'binding': 'Binding',
    'lamination': 'Lamination',
    'cutting': 'Cutting',
    'folding': 'Folding',
    'stapling': 'Stapling',
    'drilling': 'Drilling',
    'embossing': 'Embossing',
    'foil_stamping': 'Foil Stamping',
    'die_cutting': 'Die Cutting',
    'other': 'Other',
  }
  return capabilities[capability] || capability
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

const formatDay = (day: string) => {
  const days: Record<string, string> = {
    'monday': 'Monday',
    'tuesday': 'Tuesday',
    'wednesday': 'Wednesday',
    'thursday': 'Thursday',
    'friday': 'Friday',
    'saturday': 'Saturday',
    'sunday': 'Sunday',
  }
  return days[day] || day
}

export default async function ShopDetailPage({ params }: ShopDetailPageProps) {
  const shop = await getShopDetails(params.shopId)
  
  if (!shop || !shop.profile) {
    notFound()
  }
  
  const profile = shop.profile
  const businessInfo = profile.businessInfo || {}
  const location = profile.location || {}
  const businessHours = profile.businessHours || {}
  const equipment = profile.equipment || {}
  const services = profile.services || {}
  const pricing = profile.pricing || {}
  const capacity = profile.capacity || {}
  // Additional profile sections can be accessed if needed
  // const media = profile.media || {}
  // const customerSettings = profile.customerSettings || {}
  // const quality = profile.quality || {}
  
  const address = location.address || {}
  const fullAddress = [
    address.streetAddress,
    address.city,
    address.state,
    address.zipCode
  ].filter(Boolean).join(', ')

  // Delivery options
  const deliveryOptions = []
  if (location.pickupAvailable) deliveryOptions.push('Pickup Available')
  if (location.deliveryAvailable) deliveryOptions.push('Local Delivery')
  if (location.shippingAvailable) deliveryOptions.push('Shipping Available')

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/directory">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Directory
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8">
          <Card className={profile.platformSettings?.isFeatured ? 'ring-2 ring-blue-200 bg-blue-50/30' : ''}>
            <CardContent className="p-8">
              <div className="flex flex-col lg:flex-row gap-6">
                
                {/* Logo */}
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden">
                    {businessInfo.logo ? (
                      <Image
                        src={businessInfo.logo}
                        alt={`${businessInfo.displayName} logo`}
                        width={96}
                        height={96}
                        className="object-cover"
                      />
                    ) : (
                      <Printer className="h-12 w-12 text-gray-400" />
                    )}
                  </div>
                </div>

                {/* Main Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl font-bold text-gray-900">
                          {businessInfo.displayName || 'Print Shop'}
                        </h1>
                        {profile.platformSettings?.isFeatured && (
                          <Badge className="bg-blue-100 text-blue-700">
                            Featured
                          </Badge>
                        )}
                      </div>
                      
                      {fullAddress && (
                        <div className="flex items-center gap-2 text-gray-600 mb-2">
                          <MapPin className="h-4 w-4" />
                          <span>{fullAddress}</span>
                        </div>
                      )}

                      {businessInfo.website && (
                        <div className="flex items-center gap-2 text-blue-600 mb-2">
                          <Globe className="h-4 w-4" />
                          <a 
                            href={businessInfo.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                          >
                            Visit Website
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="text-right">
                      {capacity.acceptingOrders ? (
                        <Badge className="bg-green-100 text-green-700 border-green-200">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Accepting Orders
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Not Accepting Orders
                        </Badge>
                      )}
                    </div>
                  </div>

                  {businessInfo.description && (
                    <p className="text-gray-700 mb-4 leading-relaxed">
                      {businessInfo.description}
                    </p>
                  )}

                  {/* Contact Info */}
                  <div className="flex flex-wrap gap-4">
                    {businessInfo.businessPhone && (
                      <a 
                        href={`tel:${businessInfo.businessPhone}`}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                      >
                        <Phone className="h-4 w-4" />
                        {businessInfo.businessPhone}
                      </a>
                    )}
                    
                    {businessInfo.businessEmail && (
                      <a 
                        href={`mailto:${businessInfo.businessEmail}`}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                      >
                        <Mail className="h-4 w-4" />
                        {businessInfo.businessEmail}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Services */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Services Offered
                </CardTitle>
              </CardHeader>
              <CardContent>
                {services.coreServices && services.coreServices.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {services.coreServices.map((service) => (
                      <Badge key={service} variant="secondary" className="justify-center py-2">
                        {formatService(service)}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No services listed</p>
                )}
              </CardContent>
            </Card>

            {/* Equipment & Capabilities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Printer className="h-5 w-5" />
                  Equipment & Capabilities
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                
                {/* Printer Types */}
                {equipment.printerTypes && equipment.printerTypes.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Printer Types</h4>
                    <div className="flex flex-wrap gap-2">
                      {equipment.printerTypes.map((type) => (
                        <Badge key={type} variant="outline">
                          {formatPrinterType(type)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Capabilities */}
                {equipment.capabilities && equipment.capabilities.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Capabilities</h4>
                    <div className="flex flex-wrap gap-2">
                      {equipment.capabilities.map((capability) => (
                        <Badge key={capability} variant="outline">
                          {formatCapability(capability)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Max Print Size */}
                {equipment.maxPrintSize && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Maximum Print Size</h4>
                    <p className="text-gray-600">
                      {equipment.maxPrintSize.width}&rdquo; x {equipment.maxPrintSize.height}&rdquo; 
                      ({equipment.maxPrintSize.unit})
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pricing */}
            {pricing.baseRates && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Pricing
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  
                  {pricing.baseRates.blackWhite && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Black & White</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {pricing.baseRates.blackWhite.singleSided && (
                          <div>
                            <span className="text-gray-600">Single-sided:</span>
                            <span className="font-medium ml-2">
                              ${pricing.baseRates.blackWhite.singleSided.toFixed(2)}/page
                            </span>
                          </div>
                        )}
                        {pricing.baseRates.blackWhite.doubleSided && (
                          <div>
                            <span className="text-gray-600">Double-sided:</span>
                            <span className="font-medium ml-2">
                              ${pricing.baseRates.blackWhite.doubleSided.toFixed(2)}/page
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {pricing.baseRates.color && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Color</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {pricing.baseRates.color.singleSided && (
                          <div>
                            <span className="text-gray-600">Single-sided:</span>
                            <span className="font-medium ml-2">
                              ${pricing.baseRates.color.singleSided.toFixed(2)}/page
                            </span>
                          </div>
                        )}
                        {pricing.baseRates.color.doubleSided && (
                          <div>
                            <span className="text-gray-600">Double-sided:</span>
                            <span className="font-medium ml-2">
                              ${pricing.baseRates.color.doubleSided.toFixed(2)}/page
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {pricing.providesQuotes && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-blue-700 text-sm">
                        <strong>Custom Quotes Available</strong>
                        {pricing.quoteTurnaround && (
                          <span className="block">Turnaround: {pricing.quoteTurnaround}</span>
                        )}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Turnaround Times */}
            {services.turnaroundTimes && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Turnaround Times
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {services.turnaroundTimes.rush && (
                      <div className="text-center p-4 bg-red-50 rounded-lg">
                        <h4 className="font-medium text-red-700 mb-1">Rush</h4>
                        <p className="text-sm text-red-600">{services.turnaroundTimes.rush.time}</p>
                      </div>
                    )}
                    
                    {services.turnaroundTimes.standard && (
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-700 mb-1">Standard</h4>
                        <p className="text-sm text-blue-600">{services.turnaroundTimes.standard.time}</p>
                      </div>
                    )}
                    
                    {services.turnaroundTimes.extended && (
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <h4 className="font-medium text-green-700 mb-1">Extended</h4>
                        <p className="text-sm text-green-600">{services.turnaroundTimes.extended.time}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Business Hours */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Business Hours
                </CardTitle>
                {businessHours.timezone && (
                  <CardDescription>
                    {businessHours.timezone.replace('_', ' ')}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                {businessHours.schedule ? (
                  <div className="space-y-2">
                    {Object.entries(businessHours.schedule).map(([day, hours]) => (
                      <div key={day} className="flex justify-between text-sm">
                        <span className="font-medium">{formatDay(day)}</span>
                        {hours.isOpen && hours.openTime && hours.closeTime ? (
                          <span>{formatTime(hours.openTime)} - {formatTime(hours.closeTime)}</span>
                        ) : (
                          <span className="text-gray-500">Closed</span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">Hours not specified</p>
                )}
              </CardContent>
            </Card>

            {/* Delivery Options */}
            {deliveryOptions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Delivery Options
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {deliveryOptions.map((option) => (
                      <div key={option} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{option}</span>
                      </div>
                    ))}
                  </div>
                  
                  {location.serviceRadius && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs text-gray-600">
                        Service radius: {location.serviceRadius} miles
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Capacity Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Capacity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {capacity.currentWorkload !== undefined && (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Current Workload</span>
                        <span>{capacity.currentWorkload}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${capacity.currentWorkload}%` }}
                        />
                      </div>
                    </div>
                  )}
                  
                  {capacity.emergencyCapacity && (
                    <div className="bg-orange-50 p-3 rounded-lg">
                      <p className="text-orange-700 text-sm">
                        <strong>Emergency capacity available</strong> for urgent orders
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Contact Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Get in Touch</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {businessInfo.businessPhone && (
                  <Button className="w-full" asChild>
                    <a href={`tel:${businessInfo.businessPhone}`}>
                      <Phone className="h-4 w-4 mr-2" />
                      Call Now
                    </a>
                  </Button>
                )}
                
                {businessInfo.businessEmail && (
                  <Button variant="outline" className="w-full" asChild>
                    <a href={`mailto:${businessInfo.businessEmail}`}>
                      <Mail className="h-4 w-4 mr-2" />
                      Send Email
                    </a>
                  </Button>
                )}
                
                {businessInfo.website && (
                  <Button variant="outline" className="w-full" asChild>
                    <a href={businessInfo.website} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Visit Website
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}