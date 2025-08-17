'use client'

import { useState, useEffect } from 'react'

interface GeolocationState {
  latitude: number | null
  longitude: number | null
  accuracy: number | null
  loading: boolean
  error: string | null
  permission: PermissionState | null
}

interface UseGeolocationOptions {
  enableHighAccuracy?: boolean
  timeout?: number
  maximumAge?: number
  watch?: boolean
}

export function useGeolocation(options: UseGeolocationOptions = {}) {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    loading: false,
    error: null,
    permission: null,
  })

  const {
    enableHighAccuracy = false,
    timeout = 10000,
    maximumAge = 600000, // 10 minutes
    watch = false,
  } = options

  useEffect(() => {
    let watchId: number | null = null

    const updatePosition = (position: GeolocationPosition) => {
      setState(prev => ({
        ...prev,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        loading: false,
        error: null,
      }))
    }

    const updateError = (error: GeolocationPositionError) => {
      let errorMessage: string
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = 'Location access denied by user'
          break
        case error.POSITION_UNAVAILABLE:
          errorMessage = 'Location information unavailable'
          break
        case error.TIMEOUT:
          errorMessage = 'Location request timed out'
          break
        default:
          errorMessage = 'An unknown error occurred'
          break
      }

      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }))
    }

    const requestLocation = () => {
      if (!navigator.geolocation) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: 'Geolocation is not supported by this browser',
        }))
        return
      }

      setState(prev => ({ ...prev, loading: true, error: null }))

      const positionOptions: PositionOptions = {
        enableHighAccuracy,
        timeout,
        maximumAge,
      }

      if (watch) {
        watchId = navigator.geolocation.watchPosition(
          updatePosition,
          updateError,
          positionOptions
        )
      } else {
        navigator.geolocation.getCurrentPosition(
          updatePosition,
          updateError,
          positionOptions
        )
      }
    }

    // Check permission status first
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then(result => {
        setState(prev => ({ ...prev, permission: result.state }))
        
        if (result.state === 'granted') {
          requestLocation()
        } else if (result.state === 'prompt') {
          // Don't auto-request, let user trigger it
        } else {
          setState(prev => ({
            ...prev,
            error: 'Location access denied',
          }))
        }

        // Listen for permission changes
        result.addEventListener('change', () => {
          setState(prev => ({ ...prev, permission: result.state }))
        })
      }).catch(() => {
        // Fallback for browsers that don't support permissions API
        requestLocation()
      })
    } else {
      // Fallback for browsers that don't support permissions API
      requestLocation()
    }

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId)
      }
    }
  }, [enableHighAccuracy, timeout, maximumAge, watch])

  const requestPermission = () => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: 'Geolocation is not supported by this browser',
      }))
      return
    }

    setState(prev => ({ ...prev, loading: true, error: null }))

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState(prev => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          loading: false,
          error: null,
          permission: 'granted',
        }))
      },
      (error) => {
        let errorMessage: string
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable'
            break
          case error.TIMEOUT:
            errorMessage = 'Location request timed out'
            break
          default:
            errorMessage = 'An unknown error occurred'
            break
        }

        setState(prev => ({
          ...prev,
          loading: false,
          error: errorMessage,
          permission: error.code === error.PERMISSION_DENIED ? 'denied' : prev.permission,
        }))
      },
      {
        enableHighAccuracy,
        timeout,
        maximumAge,
      }
    )
  }

  return {
    ...state,
    isSupported: 'geolocation' in navigator,
    requestPermission,
  }
}