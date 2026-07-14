"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import FloatingBubbles from '@/components/FloatingBubbles'
import GlassCard from '@/components/ui/GlassCard'
import PremiumButton from '@/components/ui/PremiumButton'
import { ArrowLeft, AlertTriangle, MapPin, Clock, CheckCircle, Loader2, AlertCircle as AlertCircleIcon, Shield } from 'lucide-react'

interface NightAlert {
  id: number
  user_id: string
  detected_at: string
  location_lat: number
  location_lng: number
  distance_from_campus: number
  status: 'active' | 'acknowledged' | 'resolved'
  acknowledged_by?: string | null
  acknowledged_at?: string | null
  resolved_at?: string | null
  notes?: string | null
  created_at: string
}

export default function AlertsPage() {
  const router = useRouter()
  const { user, profile, isConfigured } = useAuth()
  const [filter, setFilter] = useState<'all' | 'active' | 'resolved'>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [alerts, setAlerts] = useState<NightAlert[]>([])
  const [updating, setUpdating] = useState<number | null>(null)

  useEffect(() => {
    if (profile?.user_type !== 'admin') {
      router.push('/auth/login')
      return
    }

    if (isConfigured) {
      fetchAlerts()
    }
  }, [profile, router, isConfigured])

  const fetchAlerts = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/alerts/night')
      const result = await response.json()

      if (!response.ok) {
        throw new Error('Failed to fetch alerts')
      }

      setAlerts(result || [])
    } catch (err: any) {
      console.error('Error fetching alerts:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const updateAlertStatus = async (alertId: number, newStatus: 'acknowledged' | 'resolved') => {
    if (!user || !isConfigured) return

    setUpdating(alertId)

    try {
      const response = await fetch(`/api/alerts/night/${alertId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: newStatus,
          acknowledgedBy: user.id
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update alert')
      }

      // Update local state
      setAlerts(alerts.map(alert =>
        alert.id === alertId ? result : alert
      ))
    } catch (err: any) {
      console.error('Error updating alert:', err)
      alert(err.message || 'Failed to update alert')
    } finally {
      setUpdating(null)
    }
  }

  const filteredAlerts = filter === 'all' 
    ? alerts 
    : alerts.filter(alert => alert.status === filter)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      case 'acknowledged':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'resolved':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      default:
        return ''
    }
  }

  const activeCount = alerts.filter(a => a.status === 'active').length
  const acknowledgedCount = alerts.filter(a => a.status === 'acknowledged').length
  const resolvedCount = alerts.filter(a => a.status === 'resolved').length

  if (!user || profile?.user_type !== 'admin') {
    return null
  }

  return (
    <div className="min-h-screen">
      <FloatingBubbles />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <button
          onClick={() => router.push('/dashboard/admin')}
          className="flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Dashboard
        </button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">🚨 Night Curfew Alerts</h1>
          <p className="text-muted-foreground">Monitor and respond to students outside campus during curfew hours (9 PM - 6 AM)</p>
        </div>

        {!isConfigured && (
          <div className="mb-8 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
            <p className="text-sm text-yellow-600 dark:text-yellow-500">
              <strong>Demo Mode:</strong> Supabase is not configured. Add your credentials to .env.local to enable full functionality.
            </p>
          </div>
        )}

        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <GlassCard className="p-6">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-8 h-8 text-red-500" />
              <div>
                <h3 className="text-3xl font-bold">{activeCount}</h3>
                <p className="text-sm text-muted-foreground">Active Alerts</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center space-x-3">
              <Clock className="w-8 h-8 text-yellow-500" />
              <div>
                <h3 className="text-3xl font-bold">{acknowledgedCount}</h3>
                <p className="text-sm text-muted-foreground">Acknowledged</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <div>
                <h3 className="text-3xl font-bold">{resolvedCount}</h3>
                <p className="text-sm text-muted-foreground">Resolved</p>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Filters */}
        <GlassCard className="p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                filter === 'all'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary hover:bg-accent'
              }`}
            >
              All Alerts
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                filter === 'active'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary hover:bg-accent'
              }`}
            >
              Active Only
            </button>
            <button
              onClick={() => setFilter('resolved')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                filter === 'resolved'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary hover:bg-accent'
              }`}
            >
              Resolved
            </button>
          </div>
        </GlassCard>

        {/* Alerts List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <GlassCard className="p-8 text-center">
            <AlertCircleIcon className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <PremiumButton onClick={fetchAlerts} variant="outline" size="sm">
              Retry
            </PremiumButton>
          </GlassCard>
        ) : filteredAlerts.length === 0 ? (
          <GlassCard className="p-8 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <p className="text-muted-foreground">
              {filter === 'all' 
                ? 'No alerts found. All students are safe!' 
                : `No ${filter} alerts`}
            </p>
          </GlassCard>
        ) : (
          <div className="space-y-4">
            {filteredAlerts.map((alert) => (
              <GlassCard key={alert.id} hover className="p-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="p-3 rounded-xl bg-red-500 text-white flex-shrink-0">
                      <Shield className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-lg mb-1">Curfew Violation Detected</h3>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
                            <span>Student ID: {alert.user_id}</span>
                            <span>•</span>
                            <span>{new Date(alert.detected_at).toLocaleTimeString()}</span>
                            <span>•</span>
                            <span>{new Date(alert.detected_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize whitespace-nowrap ${getStatusBadge(alert.status)}`}>
                          {alert.status}
                        </span>
                      </div>
                      <div className="space-y-2 mb-3">
                        <p className="text-muted-foreground flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          Distance from campus: <strong>{alert.distance_from_campus}m away</strong>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Location: {alert.location_lat.toFixed(6)}, {alert.location_lng.toFixed(6)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                        <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                        <span className="text-sm text-red-600 dark:text-red-400 font-medium">
                          Student detected outside campus during curfew hours (9 PM - 6 AM)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex md:flex-col gap-2">
                    {alert.status === 'active' && (
                      <>
                        <PremiumButton
                          size="sm"
                          variant="primary"
                          onClick={() => updateAlertStatus(alert.id, 'acknowledged')}
                          disabled={updating === alert.id || !isConfigured}
                          className="flex-1 md:flex-none"
                        >
                          {updating === alert.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            'Acknowledge'
                          )}
                        </PremiumButton>
                        <PremiumButton
                          size="sm"
                          variant="gradient"
                          onClick={() => updateAlertStatus(alert.id, 'resolved')}
                          disabled={updating === alert.id || !isConfigured}
                          className="flex-1 md:flex-none"
                        >
                          {updating === alert.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            'Resolve'
                          )}
                        </PremiumButton>
                      </>
                    )}
                    {alert.status === 'acknowledged' && (
                      <PremiumButton
                        size="sm"
                        variant="gradient"
                        onClick={() => updateAlertStatus(alert.id, 'resolved')}
                        disabled={updating === alert.id || !isConfigured}
                      >
                        {updating === alert.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          'Mark Resolved'
                        )}
                      </PremiumButton>
                    )}
                    {alert.status === 'resolved' && (
                      <div className="flex items-center space-x-2 text-green-600 dark:text-green-400 text-sm font-medium">
                        <CheckCircle className="w-4 h-4" />
                        <span>Resolved</span>
                      </div>
                    )}
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}