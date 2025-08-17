'use client'

import { useState, useEffect, useCallback } from 'react'
import { SearchBar } from '@/components/directory/search-bar'
import { FilterSidebar } from '@/components/directory/filter-sidebar'
import { ShopCard } from '@/components/directory/shop-card'
import { MapView } from '@/components/directory/map-view'
import { LocationPermission } from '@/components/directory/location-permission'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Grid3X3, 
  List, 
  Map,
  Loader2, 
  AlertCircle,
  MapPin,
  Filter,
  X
} from 'lucide-react'
import { type ShopSearchFilters } from '@/lib/validations/print-shop'

interface Shop {
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
    coordinates?: {
      latitude: number
      longitude: number
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

interface SearchResponse {
  shops: Shop[]
  pagination: {
    total: number
    limit: number
    offset: number
    hasNext: boolean
    hasPrev: boolean
  }
  filters: ShopSearchFilters
}

export default function DirectoryPage() {
  const [shops, setShops] = useState<Shop[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [view, setView] = useState<'grid' | 'list' | 'map'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 20,
    offset: 0,
    hasNext: false,
    hasPrev: false,
  })
  
  const [filters, setFilters] = useState<Partial<ShopSearchFilters>>({
    sortBy: 'distance',
    sortOrder: 'asc',
    limit: 20,
    offset: 0,
  })

  // Search function
  const searchShops = useCallback(async (
    query?: string, 
    location?: { latitude: number; longitude: number; address: string },
    newFilters?: Partial<ShopSearchFilters>
  ) => {
    setLoading(true)
    setError(null)

    try {
      // Merge filters
      const searchFilters: Partial<ShopSearchFilters> = {
        ...filters,
        ...newFilters,
        query: query || filters.query,
        location: location || filters.location,
        offset: newFilters?.offset ?? 0, // Reset to first page for new searches
      }

      // Build query string
      const params = new URLSearchParams()
      
      if (searchFilters.query) params.set('query', searchFilters.query)
      if (searchFilters.location) {
        params.set('lat', searchFilters.location.latitude.toString())
        params.set('lng', searchFilters.location.longitude.toString())
        params.set('radius', searchFilters.location.radius?.toString() || '25')
      }
      if (searchFilters.services?.length) params.set('services', searchFilters.services.join(','))
      if (searchFilters.printerTypes?.length) params.set('printerTypes', searchFilters.printerTypes.join(','))
      if (searchFilters.capabilities?.length) params.set('capabilities', searchFilters.capabilities.join(','))
      if (searchFilters.priceRange) {
        params.set('minPrice', searchFilters.priceRange.min.toString())
        params.set('maxPrice', searchFilters.priceRange.max.toString())
      }
      if (searchFilters.rating) params.set('rating', searchFilters.rating.toString())
      if (searchFilters.isOpen !== undefined) params.set('isOpen', searchFilters.isOpen.toString())
      if (searchFilters.acceptingOrders !== undefined) params.set('acceptingOrders', searchFilters.acceptingOrders.toString())
      params.set('sortBy', searchFilters.sortBy || 'distance')
      params.set('sortOrder', searchFilters.sortOrder || 'asc')
      params.set('limit', (searchFilters.limit || 20).toString())
      params.set('offset', (searchFilters.offset || 0).toString())

      const response = await fetch(`/api/shops/search?${params.toString()}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to search shops')
      }

      const data: SearchResponse = await response.json()
      
      setShops(data.shops)
      setPagination(data.pagination)
      setFilters(searchFilters)

    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred while searching')
    } finally {
      setLoading(false)
    }
  }, [filters])

  // Initial load
  useEffect(() => {
    searchShops()
  }, []) // Only run on mount

  // Handle search from search bar
  const handleSearch = (query: string, location?: { latitude: number; longitude: number; address: string }) => {
    searchShops(query, location, { offset: 0 })
  }

  // Handle filter changes
  const handleFiltersChange = (newFilters: Partial<ShopSearchFilters>) => {
    searchShops(undefined, undefined, { ...newFilters, offset: 0 })
  }

  // Clear all filters
  const handleClearFilters = () => {
    const clearedFilters: Partial<ShopSearchFilters> = {
      sortBy: 'distance',
      sortOrder: 'asc',
      limit: 20,
      offset: 0,
    }
    setFilters(clearedFilters)
    searchShops(undefined, undefined, clearedFilters)
  }

  // Handle pagination
  const handleLoadMore = () => {
    if (pagination.hasNext) {
      searchShops(undefined, undefined, { offset: pagination.offset + pagination.limit })
    }
  }

  // Toggle view function is handled inline in buttons

  // Count active filters
  const activeFilterCount = [
    filters.services?.length || 0,
    filters.printerTypes?.length || 0,
    filters.capabilities?.length || 0,
    filters.priceRange ? 1 : 0,
    filters.rating ? 1 : 0,
    filters.isOpen ? 1 : 0,
    filters.acceptingOrders ? 1 : 0,
  ].reduce((sum, count) => sum + count, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Find Print Shops Near You
          </h1>
          <p className="text-gray-600">
            Discover local printing services for all your needs
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <SearchBar 
            onSearch={handleSearch}
            initialQuery={filters.query}
            initialLocation={filters.location}
            isLoading={loading}
          />
        </div>

        {/* Location Permission Banner */}
        {!filters.location && (
          <div className="mb-8">
            <LocationPermission />
          </div>
        )}

        <div className="flex gap-8">
          
          {/* Filters Sidebar - Desktop */}
          <div className="hidden lg:block w-80">
            <FilterSidebar
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onClearFilters={handleClearFilters}
              isLoading={loading}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1">
            
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {loading ? 'Searching...' : `${pagination.total} Print Shops Found`}
                </h2>
                
                {filters.location && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    Within {filters.location.radius || 25} miles
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Mobile Filter Toggle */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                  {activeFilterCount > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>

                {/* View Toggle */}
                <div className="flex items-center border rounded-md">
                  <Button
                    variant={view === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setView('grid')}
                    className="rounded-r-none border-r"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={view === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setView('list')}
                    className="rounded-none border-r"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={view === 'map' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setView('map')}
                    className="rounded-l-none"
                  >
                    <Map className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Mobile Filters */}
            {showFilters && (
              <div className="lg:hidden mb-6">
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle>Filters</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowFilters(false)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <FilterSidebar
                      filters={filters}
                      onFiltersChange={handleFiltersChange}
                      onClearFilters={handleClearFilters}
                      isLoading={loading}
                    />
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Error State */}
            {error && (
              <Card className="mb-6">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 text-red-600">
                    <AlertCircle className="h-5 w-5" />
                    <div>
                      <h3 className="font-medium">Search Error</h3>
                      <p className="text-sm text-red-500">{error}</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => searchShops()}
                    className="mt-3"
                  >
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Loading State */}
            {loading && shops.length === 0 && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                <span className="ml-3 text-gray-600">Finding print shops...</span>
              </div>
            )}

            {/* No Results */}
            {!loading && shops.length === 0 && !error && (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="text-gray-400 mb-4">
                    <MapPin className="h-16 w-16 mx-auto" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">
                    No print shops found
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your search criteria or expanding your search area.
                  </p>
                  <Button variant="outline" onClick={handleClearFilters}>
                    Clear all filters
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Results Grid/List/Map */}
            {shops.length > 0 && (
              <>
                {view === 'map' ? (
                  <div className="h-[600px] rounded-lg overflow-hidden border">
                    <MapView
                      shops={shops}
                      userLocation={filters.location ? {
                        latitude: filters.location.latitude,
                        longitude: filters.location.longitude,
                        address: filters.location.address || 'Your Location'
                      } : undefined}
                      searchRadius={filters.location?.radius || 25}
                      onShopSelect={(shopId) => {
                        // Navigate to shop detail page
                        window.open(`/directory/${shopId}`, '_blank')
                      }}
                    />
                  </div>
                ) : (
                  <div className={
                    view === 'grid' 
                      ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' 
                      : 'space-y-4'
                  }>
                    {shops.map((shop) => (
                      <ShopCard
                        key={shop.id}
                        shop={shop}
                        view={view}
                        showDistance={!!filters.location}
                      />
                    ))}
                  </div>
                )}

                {/* Load More - Only show for grid/list views */}
                {view !== 'map' && pagination.hasNext && (
                  <div className="mt-8 text-center">
                    <Button 
                      onClick={handleLoadMore}
                      disabled={loading}
                      size="lg"
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      Load More Results
                    </Button>
                  </div>
                )}

                {/* Results Summary */}
                <div className="mt-8 text-center text-sm text-gray-600">
                  {view === 'map' ? (
                    `${shops.length} print shops shown on map`
                  ) : (
                    `Showing ${shops.length} of ${pagination.total} print shops`
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}