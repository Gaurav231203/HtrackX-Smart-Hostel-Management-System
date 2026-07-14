/**
 * Geolocation Utilities for HtracX
 * Handles GPS tracking, geofencing, and location validation
 */

// Campus/Hostel coordinates (Replace with your actual campus coordinates)
export const CAMPUS_COORDINATES = {
  // Example: Indian Institute of Technology, Delhi
  latitude: 28.5449,
  longitude: 77.1928,
  radiusInMeters: 500, // 500 meters geofence radius
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in meters
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3 // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lon2 - lon1) * Math.PI) / 180

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  const distance = R * c // Distance in meters
  return distance
}

/**
 * Check if coordinates are within campus geofence
 */
export function isWithinCampus(
  userLat: number,
  userLng: number,
  campusLat: number = CAMPUS_COORDINATES.latitude,
  campusLng: number = CAMPUS_COORDINATES.longitude,
  radius: number = CAMPUS_COORDINATES.radiusInMeters
): boolean {
  const distance = calculateDistance(userLat, userLng, campusLat, campusLng)
  return distance <= radius
}

/**
 * Get current user location using browser Geolocation API
 * Returns a promise with coordinates or throws error
 */
export function getCurrentLocation(): Promise<GeolocationCoordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve(position.coords)
      },
      (error) => {
        let errorMessage = 'Unable to retrieve your location'
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please enable location access in your browser settings.'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable. Please check your device settings.'
            break
          case error.TIMEOUT:
            errorMessage = 'Location request timed out. Please try again.'
            break
        }
        
        reject(new Error(errorMessage))
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )
  })
}

/**
 * Check if browser supports geolocation
 */
export function isGeolocationSupported(): boolean {
  return 'geolocation' in navigator
}

/**
 * Request location permission and check geofence status
 */
export async function validateLocationForAttendance(): Promise<{
  isValid: boolean
  latitude: number
  longitude: number
  distance: number
  message: string
}> {
  try {
    // Get current location
    const coords = await getCurrentLocation()
    const { latitude, longitude } = coords

    // Calculate distance from campus
    const distance = calculateDistance(
      latitude,
      longitude,
      CAMPUS_COORDINATES.latitude,
      CAMPUS_COORDINATES.longitude
    )

    // Check if within geofence
    const isValid = distance <= CAMPUS_COORDINATES.radiusInMeters

    return {
      isValid,
      latitude,
      longitude,
      distance: Math.round(distance),
      message: isValid
        ? `✅ You are inside the hostel premises (${Math.round(distance)}m from center)`
        : `❌ You are ${Math.round(distance)}m away from hostel. Must be within ${CAMPUS_COORDINATES.radiusInMeters}m`,
    }
  } catch (error: any) {
    throw new Error(error.message || 'Failed to validate location')
  }
}

/**
 * Watch user location in real-time (for night monitoring)
 */
export function watchUserLocation(
  onLocationChange: (coords: GeolocationCoordinates, isInsideCampus: boolean) => void,
  onError?: (error: GeolocationPositionError) => void
): number {
  if (!isGeolocationSupported()) {
    throw new Error('Geolocation is not supported by your browser')
  }

  return navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude } = position.coords
      const isInside = isWithinCampus(latitude, longitude)
      onLocationChange(position.coords, isInside)
    },
    (error) => {
      if (onError) {
        onError(error)
      }
    },
    {
      enableHighAccuracy: true,
      timeout: 30000,
      maximumAge: 0,
    }
  )
}

/**
 * Stop watching user location
 */
export function stopWatchingLocation(watchId: number): void {
  if (watchId && navigator.geolocation) {
    navigator.geolocation.clearWatch(watchId)
  }
}

/**
 * Format distance for display
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`
  }
  return `${(meters / 1000).toFixed(2)}km`
}

/**
 * Get location permission status (experimental API)
 */
export async function checkLocationPermission(): Promise<PermissionState | null> {
  if ('permissions' in navigator) {
    try {
      const result = await navigator.permissions.query({ name: 'geolocation' as PermissionName })
      return result.state
    } catch (error) {
      console.error('Error checking location permission:', error)
      return null
    }
  }
  return null
}
