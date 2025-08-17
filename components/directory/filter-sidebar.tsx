'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  Filter, 
  X, 
  RotateCcw,
  DollarSign,
  Clock,
  Printer,
  Settings,
  Star
} from 'lucide-react'
import { type ShopSearchFilters } from '@/lib/validations/print-shop'

interface FilterSidebarProps {
  filters: Partial<ShopSearchFilters>
  onFiltersChange: (filters: Partial<ShopSearchFilters>) => void
  onClearFilters: () => void
  isLoading?: boolean
}

const SERVICES = [
  { value: 'document_printing', label: 'Document Printing' },
  { value: 'poster_printing', label: 'Poster Printing' },
  { value: 'banner_printing', label: 'Banner Printing' },
  { value: 'business_cards', label: 'Business Cards' },
  { value: 'flyers', label: 'Flyers' },
  { value: 'brochures', label: 'Brochures' },
  { value: 'booklets', label: 'Booklets' },
  { value: 'binding', label: 'Binding Services' },
  { value: 'lamination', label: 'Lamination Services' },
  { value: 'custom_printing', label: 'Custom Printing' },
]

const PRINTER_TYPES = [
  { value: 'digital', label: 'Digital Printing' },
  { value: 'offset', label: 'Offset Printing' },
  { value: 'wide_format', label: 'Wide Format' },
  { value: 'screen_printing', label: 'Screen Printing' },
  { value: '3d_printing', label: '3D Printing' },
  { value: 'letterpress', label: 'Letterpress' },
  { value: 'inkjet', label: 'Inkjet' },
  { value: 'laser', label: 'Laser Printing' },
  { value: 'other', label: 'Other' },
]

const CAPABILITIES = [
  { value: 'color', label: 'Color Printing' },
  { value: 'black_white', label: 'Black & White' },
  { value: 'large_format', label: 'Large Format' },
  { value: 'binding', label: 'Binding' },
  { value: 'lamination', label: 'Lamination' },
  { value: 'cutting', label: 'Cutting' },
  { value: 'folding', label: 'Folding' },
  { value: 'stapling', label: 'Stapling' },
  { value: 'drilling', label: 'Drilling' },
  { value: 'embossing', label: 'Embossing' },
  { value: 'foil_stamping', label: 'Foil Stamping' },
  { value: 'die_cutting', label: 'Die Cutting' },
  { value: 'other', label: 'Other' },
]

const SORT_OPTIONS = [
  { value: 'distance', label: 'Distance' },
  { value: 'rating', label: 'Rating' },
  { value: 'price', label: 'Price' },
  { value: 'name', label: 'Name' },
  { value: 'newest', label: 'Newest' },
]

export function FilterSidebar({ filters, onFiltersChange, onClearFilters, isLoading = false }: FilterSidebarProps) {
  const [localFilters, setLocalFilters] = useState<Partial<ShopSearchFilters>>(filters)
  const [priceRange, setPriceRange] = useState([
    filters.priceRange?.min || 0,
    filters.priceRange?.max || 5
  ])

  // Update local filters when props change
  useEffect(() => {
    setLocalFilters(filters)
    setPriceRange([
      filters.priceRange?.min || 0,
      filters.priceRange?.max || 5
    ])
  }, [filters])

  // Handle checkbox changes for arrays
  const handleArrayFilter = (
    key: 'services' | 'printerTypes' | 'capabilities',
    value: string,
    checked: boolean
  ) => {
    const currentValues = localFilters[key] || []
    let newValues: string[]
    
    if (checked) {
      newValues = [...currentValues, value]
    } else {
      newValues = currentValues.filter(item => item !== value)
    }
    
    const updatedFilters = {
      ...localFilters,
      [key]: newValues.length > 0 ? newValues : undefined
    }
    
    setLocalFilters(updatedFilters)
    onFiltersChange(updatedFilters)
  }

  // Handle boolean filters
  const handleBooleanFilter = (key: 'isOpen' | 'acceptingOrders', value: boolean | undefined) => {
    const updatedFilters = {
      ...localFilters,
      [key]: value
    }
    
    setLocalFilters(updatedFilters)
    onFiltersChange(updatedFilters)
  }

  // Handle sort changes
  const handleSortChange = (sortBy: string) => {
    const updatedFilters = {
      ...localFilters,
      sortBy: sortBy as ShopSearchFilters['sortBy']
    }
    
    setLocalFilters(updatedFilters)
    onFiltersChange(updatedFilters)
  }

  // Handle sort order changes
  const handleSortOrderChange = (sortOrder: string) => {
    const updatedFilters = {
      ...localFilters,
      sortOrder: sortOrder as ShopSearchFilters['sortOrder']
    }
    
    setLocalFilters(updatedFilters)
    onFiltersChange(updatedFilters)
  }

  // Handle price range changes
  const handlePriceRangeChange = (values: number[]) => {
    setPriceRange(values)
    
    const updatedFilters = {
      ...localFilters,
      priceRange: {
        min: values[0],
        max: values[1]
      }
    }
    
    setLocalFilters(updatedFilters)
    onFiltersChange(updatedFilters)
  }

  // Handle rating filter
  const handleRatingChange = (rating: number | undefined) => {
    const updatedFilters = {
      ...localFilters,
      rating
    }
    
    setLocalFilters(updatedFilters)
    onFiltersChange(updatedFilters)
  }

  // Count active filters
  const activeFilterCount = [
    localFilters.services?.length || 0,
    localFilters.printerTypes?.length || 0,
    localFilters.capabilities?.length || 0,
    localFilters.priceRange ? 1 : 0,
    localFilters.rating ? 1 : 0,
    localFilters.isOpen ? 1 : 0,
    localFilters.acceptingOrders ? 1 : 0,
  ].reduce((sum, count) => sum + count, 0)

  return (
    <div className="space-y-6">
      {/* Filter Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              <CardTitle className="text-lg">Filters</CardTitle>
              {activeFilterCount > 0 && (
                <Badge variant="secondary">{activeFilterCount}</Badge>
              )}
            </div>
            
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="text-red-600 hover:text-red-700"
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Sort Options */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Sort By</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label className="text-sm font-medium">Order</Label>
            <Select value={localFilters.sortBy || 'distance'} onValueChange={handleSortChange}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label className="text-sm font-medium">Direction</Label>
            <Select value={localFilters.sortOrder || 'asc'} onValueChange={handleSortOrderChange}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Ascending</SelectItem>
                <SelectItem value="desc">Descending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Availability Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Availability
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="open-now"
              checked={localFilters.isOpen === true}
              onCheckedChange={(checked) => 
                handleBooleanFilter('isOpen', checked ? true : undefined)
              }
            />
            <Label htmlFor="open-now" className="text-sm font-normal">
              Open now
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="accepting-orders"
              checked={localFilters.acceptingOrders === true}
              onCheckedChange={(checked) => 
                handleBooleanFilter('acceptingOrders', checked ? true : undefined)
              }
            />
            <Label htmlFor="accepting-orders" className="text-sm font-normal">
              Accepting orders
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Price Range Filter */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Price Range (per page)
          </CardTitle>
          <CardDescription>
            ${priceRange[0].toFixed(2)} - ${priceRange[1].toFixed(2)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Slider
            value={priceRange}
            onValueChange={handlePriceRangeChange}
            min={0}
            max={5}
            step={0.05}
            className="w-full"
          />
        </CardContent>
      </Card>

      {/* Rating Filter */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Star className="h-4 w-4" />
            Minimum Rating
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <Button
                key={rating}
                variant={localFilters.rating === rating ? "default" : "outline"}
                size="sm"
                onClick={() => handleRatingChange(localFilters.rating === rating ? undefined : rating)}
                className="flex items-center gap-1"
              >
                {rating}
                <Star className="h-3 w-3" />
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Services Filter */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Services</CardTitle>
          {localFilters.services && localFilters.services.length > 0 && (
            <CardDescription>
              {localFilters.services.length} selected
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-2">
          {SERVICES.map((service) => (
            <div key={service.value} className="flex items-center space-x-2">
              <Checkbox
                id={`service-${service.value}`}
                checked={localFilters.services?.includes(service.value) || false}
                onCheckedChange={(checked) => 
                  handleArrayFilter('services', service.value, checked as boolean)
                }
              />
              <Label htmlFor={`service-${service.value}`} className="text-sm font-normal">
                {service.label}
              </Label>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Printer Types Filter */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Printer className="h-4 w-4" />
            Printer Types
          </CardTitle>
          {localFilters.printerTypes && localFilters.printerTypes.length > 0 && (
            <CardDescription>
              {localFilters.printerTypes.length} selected
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-2">
          {PRINTER_TYPES.map((type) => (
            <div key={type.value} className="flex items-center space-x-2">
              <Checkbox
                id={`printer-${type.value}`}
                checked={localFilters.printerTypes?.includes(type.value) || false}
                onCheckedChange={(checked) => 
                  handleArrayFilter('printerTypes', type.value, checked as boolean)
                }
              />
              <Label htmlFor={`printer-${type.value}`} className="text-sm font-normal">
                {type.label}
              </Label>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Capabilities Filter */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Capabilities
          </CardTitle>
          {localFilters.capabilities && localFilters.capabilities.length > 0 && (
            <CardDescription>
              {localFilters.capabilities.length} selected
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-2">
          {CAPABILITIES.map((capability) => (
            <div key={capability.value} className="flex items-center space-x-2">
              <Checkbox
                id={`capability-${capability.value}`}
                checked={localFilters.capabilities?.includes(capability.value) || false}
                onCheckedChange={(checked) => 
                  handleArrayFilter('capabilities', capability.value, checked as boolean)
                }
              />
              <Label htmlFor={`capability-${capability.value}`} className="text-sm font-normal">
                {capability.label}
              </Label>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}