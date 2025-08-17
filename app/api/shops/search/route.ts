import { NextRequest, NextResponse } from 'next/server'
import { shopSearchFiltersSchema, type ShopSearchFilters } from '@/lib/validations/print-shop'
import { User as UserModel } from '@/lib/models'
import connectToDatabase from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse and validate search parameters
    const filters: Partial<ShopSearchFilters> = {
      query: searchParams.get('query') || undefined,
      location: searchParams.get('lat') && searchParams.get('lng') ? {
        latitude: parseFloat(searchParams.get('lat')!),
        longitude: parseFloat(searchParams.get('lng')!),
        radius: searchParams.get('radius') ? parseInt(searchParams.get('radius')!) : 25,
      } : undefined,
      services: searchParams.get('services') ? searchParams.get('services')!.split(',') : undefined,
      printerTypes: searchParams.get('printerTypes') ? searchParams.get('printerTypes')!.split(',') : undefined,
      capabilities: searchParams.get('capabilities') ? searchParams.get('capabilities')!.split(',') : undefined,
      priceRange: searchParams.get('minPrice') && searchParams.get('maxPrice') ? {
        min: parseFloat(searchParams.get('minPrice')!),
        max: parseFloat(searchParams.get('maxPrice')!),
      } : undefined,
      rating: searchParams.get('rating') ? parseFloat(searchParams.get('rating')!) : undefined,
      isOpen: searchParams.get('isOpen') ? searchParams.get('isOpen') === 'true' : undefined,
      acceptingOrders: searchParams.get('acceptingOrders') ? searchParams.get('acceptingOrders') === 'true' : undefined,
      sortBy: (searchParams.get('sortBy') as ShopSearchFilters['sortBy']) || 'distance',
      sortOrder: (searchParams.get('sortOrder') as ShopSearchFilters['sortOrder']) || 'asc',
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0,
    }
    
    // Validate filters
    const validationResult = shopSearchFiltersSchema.safeParse(filters)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid search parameters', 
          details: validationResult.error.flatten().fieldErrors 
        }, 
        { status: 400 }
      )
    }
    
    const validFilters = validationResult.data
    
    await connectToDatabase()
    
    // Build MongoDB query
    const query: Record<string, unknown> = {
      role: 'printShop',
      'onboarding.completed': true,
      'platformSettings.isActive': true,
      'platformSettings.searchable': true,
    }
    
    // Text search across business name and description
    if (validFilters.query) {
      query.$or = [
        { 'profile.businessInfo.displayName': { $regex: validFilters.query, $options: 'i' } },
        { 'profile.businessInfo.description': { $regex: validFilters.query, $options: 'i' } },
        { 'profile.location.address.city': { $regex: validFilters.query, $options: 'i' } },
        { 'profile.location.address.state': { $regex: validFilters.query, $options: 'i' } },
      ]
    }
    
    // Service filters
    if (validFilters.services && validFilters.services.length > 0) {
      query['profile.services.coreServices'] = { $in: validFilters.services }
    }
    
    // Printer type filters
    if (validFilters.printerTypes && validFilters.printerTypes.length > 0) {
      query['profile.equipment.printerTypes'] = { $in: validFilters.printerTypes }
    }
    
    // Capability filters
    if (validFilters.capabilities && validFilters.capabilities.length > 0) {
      query['profile.equipment.capabilities'] = { $in: validFilters.capabilities }
    }
    
    // Price range filter (based on black & white single-sided rate)
    if (validFilters.priceRange) {
      query['profile.pricing.baseRates.blackWhite.singleSided'] = {
        $gte: validFilters.priceRange.min,
        $lte: validFilters.priceRange.max,
      }
    }
    
    // Currently open filter (simplified - could be enhanced with actual schedule checking)
    if (validFilters.isOpen !== undefined) {
      // For now, just check if they have business hours set
      if (validFilters.isOpen) {
        query['profile.businessHours.schedule'] = { $exists: true }
      }
    }
    
    // Accepting orders filter
    if (validFilters.acceptingOrders !== undefined) {
      query['profile.capacity.acceptingOrders'] = validFilters.acceptingOrders
    }
    
    // Location-based search with geospatial query
    const aggregationPipeline: Record<string, unknown>[] = [
      { $match: query }
    ]
    
    if (validFilters.location) {
      // Add distance calculation if coordinates exist
      aggregationPipeline.push({
        $addFields: {
          distance: {
            $cond: {
              if: { $and: [
                { $ne: ['$profile.location.coordinates.latitude', null] },
                { $ne: ['$profile.location.coordinates.longitude', null] }
              ]},
              then: {
                $sqrt: {
                  $add: [
                    { $pow: [{ $subtract: ['$profile.location.coordinates.latitude', validFilters.location.latitude] }, 2] },
                    { $pow: [{ $subtract: ['$profile.location.coordinates.longitude', validFilters.location.longitude] }, 2] }
                  ]
                }
              },
              else: 999999 // Large number for shops without coordinates
            }
          }
        }
      })
      
      // Filter by radius (approximate calculation)
      const radiusInDegrees = validFilters.location.radius / 69 // Rough conversion: 1 degree ≈ 69 miles
      aggregationPipeline.push({
        $match: {
          distance: { $lte: radiusInDegrees }
        }
      })
    }
    
    // Sorting
    let sortStage: Record<string, unknown> = {}
    switch (validFilters.sortBy) {
      case 'distance':
        if (validFilters.location) {
          sortStage = { distance: validFilters.sortOrder === 'asc' ? 1 : -1 }
        } else {
          // Fallback to name if no location provided
          sortStage = { 'profile.businessInfo.displayName': 1 }
        }
        break
      case 'name':
        sortStage = { 'profile.businessInfo.displayName': validFilters.sortOrder === 'asc' ? 1 : -1 }
        break
      case 'price':
        sortStage = { 'profile.pricing.baseRates.blackWhite.singleSided': validFilters.sortOrder === 'asc' ? 1 : -1 }
        break
      case 'newest':
        sortStage = { 'onboarding.completedAt': -1 }
        break
      case 'rating':
        // TODO: Implement when review system is added
        sortStage = { 'profile.businessInfo.displayName': 1 }
        break
      default:
        sortStage = { 'profile.businessInfo.displayName': 1 }
    }
    
    aggregationPipeline.push({ $sort: sortStage })
    
    // Get total count for pagination
    const countPipeline = [...aggregationPipeline, { $count: 'total' }]
    const countResult = await UserModel.aggregate(countPipeline)
    const total = countResult[0]?.total || 0
    
    // Add pagination
    aggregationPipeline.push(
      { $skip: validFilters.offset },
      { $limit: validFilters.limit }
    )
    
    // Project only necessary fields
    aggregationPipeline.push({
      $project: {
        _id: 1,
        name: 1,
        email: 1,
        'profile.businessInfo.displayName': 1,
        'profile.businessInfo.description': 1,
        'profile.businessInfo.logo': 1,
        'profile.location.address': 1,
        'profile.location.coordinates': 1,
        'profile.location.serviceRadius': 1,
        'profile.location.pickupAvailable': 1,
        'profile.location.deliveryAvailable': 1,
        'profile.location.shippingAvailable': 1,
        'profile.businessHours.timezone': 1,
        'profile.businessHours.schedule': 1,
        'profile.equipment.printerTypes': 1,
        'profile.equipment.capabilities': 1,
        'profile.services.coreServices': 1,
        'profile.services.turnaroundTimes': 1,
        'profile.pricing.baseRates': 1,
        'profile.pricing.pricingModel': 1,
        'profile.capacity.acceptingOrders': 1,
        'profile.capacity.currentWorkload': 1,
        'profile.platformSettings.isFeatured': 1,
        'onboarding.completedAt': 1,
        distance: 1,
      }
    })
    
    // Execute query
    const shops = await UserModel.aggregate(aggregationPipeline)
    
    // Transform results for frontend
    const transformedShops = shops.map(shop => ({
      id: shop._id.toString(),
      name: shop.profile?.businessInfo?.displayName || 'Unnamed Shop',
      description: shop.profile?.businessInfo?.description || '',
      logo: shop.profile?.businessInfo?.logo || null,
      location: {
        address: shop.profile?.location?.address || {},
        coordinates: shop.profile?.location?.coordinates || undefined,
        serviceRadius: shop.profile?.location?.serviceRadius || 25,
        pickupAvailable: shop.profile?.location?.pickupAvailable || true,
        deliveryAvailable: shop.profile?.location?.deliveryAvailable || false,
        shippingAvailable: shop.profile?.location?.shippingAvailable || true,
      },
      businessHours: {
        timezone: shop.profile?.businessHours?.timezone || 'America/New_York',
        schedule: shop.profile?.businessHours?.schedule || {},
      },
      equipment: {
        printerTypes: shop.profile?.equipment?.printerTypes || [],
        capabilities: shop.profile?.equipment?.capabilities || [],
      },
      services: {
        coreServices: shop.profile?.services?.coreServices || [],
        turnaroundTimes: shop.profile?.services?.turnaroundTimes || {},
      },
      pricing: {
        baseRates: shop.profile?.pricing?.baseRates || {},
        pricingModel: shop.profile?.pricing?.pricingModel || 'per_page',
      },
      capacity: {
        acceptingOrders: shop.profile?.capacity?.acceptingOrders ?? true,
        currentWorkload: shop.profile?.capacity?.currentWorkload || 0,
      },
      isFeatured: shop.profile?.platformSettings?.isFeatured || false,
      completedAt: shop.onboarding?.completedAt || null,
      distance: shop.distance ? Math.round(shop.distance * 69 * 100) / 100 : null, // Convert to miles and round
    }))
    
    return NextResponse.json({
      shops: transformedShops,
      pagination: {
        total,
        limit: validFilters.limit,
        offset: validFilters.offset,
        hasNext: validFilters.offset + validFilters.limit < total,
        hasPrev: validFilters.offset > 0,
      },
      filters: validFilters,
    })
    
  } catch (error) {
    console.error('Shop search error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

// POST endpoint for more complex searches with body data
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate search filters
    const validationResult = shopSearchFiltersSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid search parameters', 
          details: validationResult.error.flatten().fieldErrors 
        }, 
        { status: 400 }
      )
    }
    
    // Convert to query string and use GET logic
    const filters = validationResult.data
    const searchParams = new URLSearchParams()
    
    if (filters.query) searchParams.set('query', filters.query)
    if (filters.location) {
      searchParams.set('lat', filters.location.latitude.toString())
      searchParams.set('lng', filters.location.longitude.toString())
      searchParams.set('radius', filters.location.radius.toString())
    }
    if (filters.services) searchParams.set('services', filters.services.join(','))
    if (filters.printerTypes) searchParams.set('printerTypes', filters.printerTypes.join(','))
    if (filters.capabilities) searchParams.set('capabilities', filters.capabilities.join(','))
    if (filters.priceRange) {
      searchParams.set('minPrice', filters.priceRange.min.toString())
      searchParams.set('maxPrice', filters.priceRange.max.toString())
    }
    if (filters.rating) searchParams.set('rating', filters.rating.toString())
    if (filters.isOpen !== undefined) searchParams.set('isOpen', filters.isOpen.toString())
    if (filters.acceptingOrders !== undefined) searchParams.set('acceptingOrders', filters.acceptingOrders.toString())
    searchParams.set('sortBy', filters.sortBy)
    searchParams.set('sortOrder', filters.sortOrder)
    searchParams.set('limit', filters.limit.toString())
    searchParams.set('offset', filters.offset.toString())
    
    // Create new request with query parameters
    const newUrl = new URL(request.url)
    newUrl.search = searchParams.toString()
    const newRequest = new NextRequest(newUrl, request)
    
    // Use GET logic
    return GET(newRequest)
    
  } catch (error) {
    console.error('Shop search POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}