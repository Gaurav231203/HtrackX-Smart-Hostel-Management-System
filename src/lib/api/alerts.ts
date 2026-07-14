/**
 * API functions for night alerts
 */

export interface NightAlert {
  id: number
  userId: string
  detectedAt: string
  locationLat: number
  locationLng: number
  distanceFromCampus: number
  status: 'active' | 'acknowledged' | 'resolved'
  acknowledgedBy?: string | null
  acknowledgedAt?: string | null
  resolvedAt?: string | null
  notes?: string | null
  createdAt: string
}

/**
 * Create a night alert when student is detected outside during curfew
 */
export async function createNightAlert(
  userId: string,
  locationLat: number,
  locationLng: number,
  distanceFromCampus: number
): Promise<NightAlert> {
  try {
    const response = await fetch('/api/alerts/night', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        locationLat,
        locationLng,
        distanceFromCampus,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create night alert')
    }

    return await response.json()
  } catch (error) {
    console.error('Error creating night alert:', error)
    throw error
  }
}

/**
 * Get all night alerts (admin)
 */
export async function getAllNightAlerts(status?: 'active' | 'acknowledged' | 'resolved'): Promise<NightAlert[]> {
  try {
    const url = status ? `/api/alerts/night?status=${status}` : '/api/alerts/night'
    const response = await fetch(url)

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch night alerts')
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching night alerts:', error)
    throw error
  }
}

/**
 * Get night alerts for a specific user
 */
export async function getUserNightAlerts(userId: string): Promise<NightAlert[]> {
  try {
    const response = await fetch(`/api/alerts/night/user/${userId}`)

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch user night alerts')
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching user night alerts:', error)
    throw error
  }
}

/**
 * Update night alert status (admin)
 */
export async function updateNightAlertStatus(
  alertId: number,
  status: 'acknowledged' | 'resolved',
  acknowledgedBy?: string,
  notes?: string
): Promise<NightAlert> {
  try {
    const response = await fetch(`/api/alerts/night/${alertId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status,
        acknowledgedBy,
        notes,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to update night alert')
    }

    return await response.json()
  } catch (error) {
    console.error('Error updating night alert:', error)
    throw error
  }
}
