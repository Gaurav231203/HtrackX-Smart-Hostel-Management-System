import { useState, useEffect, useCallback } from 'react'
import {
  getCurrentLocation,
  isGeolocationSupported,
  isWithinCampus,
  CAMPUS_COORDINATES,
  calculateDistance,
} from '@/lib/geolocation'
import { createNightAlert } from '@/lib/api/alerts'

interface GeolocationState {
  latitude: number | null
  longitude: number | null
  accuracy: number | null
  isInsideCampus: boolean
  distance: number | null
  isLoading: boolean
  error: string | null
  permissionState: 'prompt' | 'granted' | 'denied' | null
}

interface UseGeolocationReturn extends GeolocationState {
  requestLocation: () => Promise<void>
  checkGeofence: () => Promise<boolean>
  refreshLocation: () => Promise<void>
  isSupported: boolean
}

/**
 * Custom hook for managing geolocation state and operations
 */
export function useGeolocation(autoRequest: boolean = false): UseGeolocationReturn {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    isInsideCampus: false,
    distance: null,
    isLoading: false,
    error: null,
    permissionState: null,
  })

  const isSupported = isGeolocationSupported()

  // Check permission status
  useEffect(() => {
    if ('permissions' in navigator) {
      navigator.permissions
        .query({ name: 'geolocation' as PermissionName })
        .then((result) => {
          setState((prev) => ({ ...prev, permissionState: result.state as any }))
          
          // Listen for permission changes
          result.addEventListener('change', () => {
            setState((prev) => ({ ...prev, permissionState: result.state as any }))
          })
        })
        .catch(() => {
          // Permission API not supported, ignore
        })
    }
  }, [])

  const requestLocation = useCallback(async () => {
    if (!isSupported) {
      setState((prev) => ({
        ...prev,
        error: 'Geolocation is not supported by your browser',
      }))
      return
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const coords = await getCurrentLocation()
      const { latitude, longitude, accuracy } = coords

      // Calculate distance from campus
      const distance = calculateDistance(
        latitude,
        longitude,
        CAMPUS_COORDINATES.latitude,
        CAMPUS_COORDINATES.longitude
      )

      // Check if within campus
      const isInside = isWithinCampus(latitude, longitude)

      setState({
        latitude,
        longitude,
        accuracy,
        isInsideCampus: isInside,
        distance: Math.round(distance),
        isLoading: false,
        error: null,
        permissionState: 'granted',
      })
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to get location',
        permissionState: error.message.includes('denied') ? 'denied' : prev.permissionState,
      }))
    }
  }, [isSupported])

  const checkGeofence = useCallback(async (): Promise<boolean> => {
    await requestLocation()
    return state.isInsideCampus
  }, [requestLocation, state.isInsideCampus])

  const refreshLocation = useCallback(async () => {
    await requestLocation()
  }, [requestLocation])

  // Auto-request location on mount if enabled
  useEffect(() => {
    if (autoRequest) {
      requestLocation()
    }
  }, [autoRequest, requestLocation])

  return {
    ...state,
    requestLocation,
    checkGeofence,
    refreshLocation,
    isSupported,
  }
}

/**
 * Hook for monitoring night-time location (9 PM - 5 AM)
 */
export function useNightMonitoring(enabled: boolean = true) {
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [nightStatus, setNightStatus] = useState<'safe' | 'outside' | 'inactive'>('inactive')
  const [lastCheckTime, setLastCheckTime] = useState<Date | null>(null)
  const [lastAlertSent, setLastAlertSent] = useState<Date | null>(null)

  const checkNightStatus = useCallback(async () => {
    const hour = new Date().getHours()
    
    // Only monitor between 9 PM and 5 AM (changed from 6 AM)
    if (hour < 21 && hour >= 5) {
      setNightStatus('inactive')
      setIsMonitoring(false)
      return
    }

    setIsMonitoring(true)

    try {
      const coords = await getCurrentLocation()
      const isInside = isWithinCampus(coords.latitude, coords.longitude)
      const distance = calculateDistance(
        coords.latitude,
        coords.longitude,
        CAMPUS_COORDINATES.latitude,
        CAMPUS_COORDINATES.longitude
      )
      
      setNightStatus(isInside ? 'safe' : 'outside')
      setLastCheckTime(new Date())

      // If outside, trigger warden alert (only if we haven't sent one in the last hour)
      if (!isInside) {
        const now = new Date()
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
        
        if (!lastAlertSent || lastAlertSent < oneHourAgo) {
          console.warn('⚠️ Student outside campus during night hours!')
          
          // Send alert to admins via Supabase notifications
          try {
            // Get user info from localStorage or context (you'll need to pass this)
            const userStr = localStorage.getItem('user')
            if (userStr) {
              const user = JSON.parse(userStr)
              await createNightAlert(
                user.id,
                coords.latitude,
                coords.longitude,
                Math.round(distance)
              )
              setLastAlertSent(now)
              console.log('✅ Night curfew alert sent to admins')
            }
          } catch (error) {
            console.error('Failed to send night alert:', error)
          }
        }
      }
    } catch (error) {
      console.error('Night monitoring error:', error)
    }
  }, [lastAlertSent])

  useEffect(() => {
    if (!enabled) return

    // Check immediately
    checkNightStatus()

    // Check every 10 minutes during night hours (changed from 5 minutes for less frequent checks)
    const interval = setInterval(() => {
      checkNightStatus()
    }, 10 * 60 * 1000) // 10 minutes

    return () => clearInterval(interval)
  }, [enabled, checkNightStatus])

  return {
    isMonitoring,
    nightStatus,
    lastCheckTime,
    checkNow: checkNightStatus,
  }
}