"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import FloatingBubbles from '@/components/FloatingBubbles'
import GlassCard from '@/components/ui/GlassCard'
import PremiumButton from '@/components/ui/PremiumButton'
import ThemeToggle from '@/components/ThemeToggle'
import { useAuth } from '@/contexts/AuthContext'
import { useGeolocation, useNightMonitoring } from '@/hooks/useGeolocation'
import { CAMPUS_COORDINATES, formatDistance } from '@/lib/geolocation'
import {
  Clock,
  MapPin,
  Utensils,
  AlertCircle,
  FileText,
  Bell,
  Home,
  DollarSign,
  Brain,
  Users,
  LogOut,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar,
  Send,
  Loader2,
  Navigation,
  RefreshCw,
  User,
  Shield,
  Moon,
  Sun
} from 'lucide-react'
import {
  markAttendance,
  getTodayAttendance,
  getTodayMessMenu,
  getUserNotifications,
  subscribeToNotifications
} from '@/lib/api/data'

export default function StudentDashboard() {
  const router = useRouter()
  const { user, profile, loading: authLoading, signOut, isConfigured } = useAuth()
  
  // Geolocation hooks
  const {
    latitude,
    longitude,
    accuracy,
    isInsideCampus,
    distance,
    isLoading: locationLoading,
    error: locationError,
    permissionState,
    requestLocation,
    refreshLocation,
    isSupported: isGeolocationSupported
  } = useGeolocation(false) // Don't auto-request on mount
  
  const { nightStatus, isMonitoring, lastCheckTime, checkNow } = useNightMonitoring(true)
  
  const [currentTime, setCurrentTime] = useState(new Date())
  const [attendanceMarked, setAttendanceMarked] = useState(false)
  const [attendanceLoading, setAttendanceLoading] = useState(false)
  const [showComingSoon, setShowComingSoon] = useState(false)
  const [showLocationHelp, setShowLocationHelp] = useState(false)
  
  const [messMenu, setMessMenu] = useState<any[]>([])
  const [messMenuLoading, setMessMenuLoading] = useState(true)
  const [notifications, setNotifications] = useState<any[]>([])
  const [notificationsLoading, setNotificationsLoading] = useState(true)

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [authLoading, user, router])

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Fetch today's attendance
  useEffect(() => {
    if (user && isConfigured) {
      fetchTodayAttendance()
    }
  }, [user, isConfigured])

  // Fetch mess menu
  useEffect(() => {
    if (isConfigured) {
      fetchMessMenu()
    }
  }, [isConfigured])

  // Fetch notifications
  useEffect(() => {
    if (user && isConfigured) {
      fetchNotifications()
      
      // Subscribe to real-time notifications
      const channel = subscribeToNotifications(user.id, (payload) => {
        if (payload.eventType === 'INSERT') {
          setNotifications((prev) => [payload.new, ...prev])
        }
      })

      return () => {
        channel.unsubscribe()
      }
    }
  }, [user, isConfigured])

  const fetchTodayAttendance = async () => {
    if (!user) return
    
    try {
      const attendance = await getTodayAttendance(user.id)
      if (attendance) {
        setAttendanceMarked(true)
      }
    } catch (error) {
      console.error('Error fetching attendance:', error)
    }
  }

  const fetchMessMenu = async () => {
    setMessMenuLoading(true)
    try {
      const menu = await getTodayMessMenu()
      setMessMenu(menu || [])
    } catch (error) {
      console.error('Error fetching mess menu:', error)
    } finally {
      setMessMenuLoading(false)
    }
  }

  const fetchNotifications = async () => {
    if (!user) return
    
    setNotificationsLoading(true)
    try {
      const notifs = await getUserNotifications(user.id, 10)
      setNotifications(notifs || [])
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setNotificationsLoading(false)
    }
  }

  const canMarkAttendance = () => {
    const hour = currentTime.getHours()
    const minute = currentTime.getMinutes()
    return (hour === 17 && minute >= 30) || (hour === 18 && minute < 30)
  }

  const handleMarkAttendance = async () => {
    if (!canMarkAttendance()) {
      alert('Attendance can only be marked between 5:30 PM - 6:30 PM')
      return
    }

    if (!user || !isConfigured) {
      alert('Authentication required or Supabase not configured')
      return
    }

    // Request location if not already available
    if (latitude === null || longitude === null) {
      try {
        await requestLocation()
      } catch (error: any) {
        alert(error.message || 'Failed to get your location')
        return
      }
    }

    // Wait for location to be available
    if (latitude === null || longitude === null) {
      alert('Unable to determine your location. Please allow location access.')
      return
    }

    // Check geofence
    if (!isInsideCampus) {
      alert(`You are ${distance}m away from hostel. You must be within ${CAMPUS_COORDINATES.radiusInMeters}m to mark attendance.`)
      return
    }

    setAttendanceLoading(true)
    try {
      const today = new Date().toISOString().split('T')[0]
      await markAttendance(user.id, today, latitude, longitude)
      setAttendanceMarked(true)
      alert('Attendance marked successfully!')
    } catch (error: any) {
      alert(error.message || 'Failed to mark attendance')
    } finally {
      setAttendanceLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const getMessMenuItems = (mealType: string) => {
    const meal = messMenu.find(m => m.meal_type === mealType)
    return meal?.items || []
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user || !profile) {
    return null
  }

  const defaultMessMenus = {
    breakfast: ['Idli', 'Vada', 'Sambhar', 'Chutney', 'Tea/Coffee'],
    lunch: ['Rice', 'Dal', 'Vegetable Curry', 'Roti', 'Salad'],
    snacks: ['Samosa', 'Tea', 'Biscuits'],
    dinner: ['Chapati', 'Paneer Curry', 'Rice', 'Dal', 'Curd']
  }

  const mealTimes = [
    { name: 'Breakfast', icon: Sun, type: 'breakfast', items: getMessMenuItems('breakfast') || defaultMessMenus.breakfast, time: '7:00 AM - 9:00 AM', gradient: 'gradient-warning' },
    { name: 'Lunch', icon: Sun, type: 'lunch', items: getMessMenuItems('lunch') || defaultMessMenus.lunch, time: '12:00 PM - 2:00 PM', gradient: 'gradient-primary' },
    { name: 'Snacks', icon: Clock, type: 'snacks', items: getMessMenuItems('snacks') || defaultMessMenus.snacks, time: '4:00 PM - 5:00 PM', gradient: 'gradient-accent' },
    { name: 'Dinner', icon: Moon, type: 'dinner', items: getMessMenuItems('dinner') || defaultMessMenus.dinner, time: '7:00 PM - 9:00 PM', gradient: 'gradient-secondary' }
  ]

  return (
    <div className="min-h-screen pb-20">
      <FloatingBubbles />

      {/* Header */}
      <div className="sticky top-0 z-50 glass-card border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Welcome back, {profile.name}</h1>
                  <p className="text-sm text-muted-foreground">Student Dashboard</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <ThemeToggle />
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl hover:bg-secondary transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Supabase Not Configured Warning */}
        {!isConfigured && (
          <div className="mb-8 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl animate-slide-up">
            <p className="text-sm text-yellow-600 dark:text-yellow-500">
              <strong>Demo Mode:</strong> Supabase is not configured. Add your credentials to .env.local to enable full functionality.
            </p>
          </div>
        )}

        {/* Geolocation Not Supported Warning */}
        {!isGeolocationSupported && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl animate-slide-up">
            <p className="text-sm text-red-600 dark:text-red-500">
              <strong>Geolocation Not Supported:</strong> Your browser does not support location services. Attendance marking requires location access.
            </p>
          </div>
        )}

        {/* Attendance Section */}
        <section className="mb-8 animate-fade-in">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">Attendance Tracking</h2>
          </div>
          <GlassCard hover className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Time Window Status */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center">
                    <Clock className="w-5 h-5 mr-2" />
                    Attendance Window
                  </h3>
                  {canMarkAttendance() ? (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Active
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 flex items-center gap-1">
                      <XCircle className="w-3 h-3" />
                      Closed
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground mb-2">
                  Attendance can be marked between:
                </p>
                <p className="text-2xl font-bold mb-4">5:30 PM - 6:30 PM</p>
                <p className="text-sm text-muted-foreground">
                  Current Time: {currentTime.toLocaleTimeString()}
                </p>
              </div>

              {/* Geofence Status */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    Location Status
                  </h3>
                  {latitude !== null && longitude !== null ? (
                    isInsideCampus ? (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Inside Hostel
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 flex items-center gap-1">
                        <XCircle className="w-3 h-3" />
                        Outside Hostel
                      </span>
                    )
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400">
                      Unknown
                    </span>
                  )}
                </div>
                
                {locationError && (
                  <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
                    <p className="text-sm text-red-700 dark:text-red-400 mb-2">
                      {locationError}
                    </p>
                    <button
                      onClick={() => setShowLocationHelp(true)}
                      className="text-xs text-red-600 dark:text-red-400 hover:underline"
                    >
                      How to enable location?
                    </button>
                  </div>
                )}

                {latitude !== null && longitude !== null ? (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      {isInsideCampus ? (
                        <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          You are inside the hostel premises
                        </span>
                      ) : (
                        <span className="text-red-600 dark:text-red-400 flex items-center gap-1">
                          <XCircle className="w-4 h-4" />
                          You are outside the hostel premises
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Distance from center: {formatDistance(distance || 0)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Accuracy: ±{accuracy?.toFixed(0) || 0}m
                    </p>
                    <button
                      onClick={refreshLocation}
                      disabled={locationLoading}
                      className="flex items-center gap-1 text-sm text-primary hover:underline disabled:opacity-50"
                    >
                      <RefreshCw className={`w-4 h-4 ${locationLoading ? 'animate-spin' : ''}`} />
                      Refresh Location
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-muted-foreground text-sm">
                      Location not detected. Click below to enable location tracking.
                    </p>
                    <PremiumButton
                      onClick={requestLocation}
                      disabled={locationLoading || !isGeolocationSupported}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      {locationLoading ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Getting Location...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Navigation className="w-4 h-4" />
                          Enable Location
                        </span>
                      )}
                    </PremiumButton>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 pt-6 border-t">
              <PremiumButton
                onClick={handleMarkAttendance}
                variant="gradient"
                size="lg"
                className="w-full md:w-auto"
                disabled={attendanceLoading || attendanceMarked || !isConfigured || !isGeolocationSupported}
              >
                {attendanceLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Marking...
                  </span>
                ) : attendanceMarked ? (
                  <span className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Attendance Marked
                  </span>
                ) : (
                  'Mark Attendance'
                )}
              </PremiumButton>
              {attendanceMarked && (
                <p className="text-sm text-green-600 dark:text-green-400 mt-2 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  Your attendance has been marked successfully!
                </p>
              )}
            </div>
          </GlassCard>
        </section>

        {/* Night Campus Check */}
        <section className="mb-8 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">Night Campus Monitor</h2>
          </div>
          <GlassCard hover className="p-6">
            <div className="flex items-start space-x-4">
              <div className={`p-3 rounded-xl ${
                nightStatus === 'safe' ? 'gradient-success' : 
                nightStatus === 'outside' ? 'gradient-warning' : 
                'bg-gray-500'
              } text-white shadow-lg`}>
                {nightStatus === 'safe' ? <CheckCircle className="w-6 h-6" /> : 
                 nightStatus === 'outside' ? <AlertTriangle className="w-6 h-6" /> :
                 <Clock className="w-6 h-6" />}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">
                  Status: {
                    nightStatus === 'safe' ? 'Safe in Campus' : 
                    nightStatus === 'outside' ? 'Out of Campus' : 
                    'Monitoring Inactive'
                  }
                </h3>
                <p className="text-muted-foreground mb-3">
                  {nightStatus === 'safe' ? (
                    'You are safely inside the campus. Active monitoring: 9:00 PM - 5:00 AM'
                  ) : nightStatus === 'outside' ? (
                    'You are outside campus during curfew hours. Warden has been notified.'
                  ) : (
                    'Night monitoring is active between 9:00 PM and 5:00 AM'
                  )}
                </p>
                {isMonitoring && lastCheckTime && (
                  <p className="text-xs text-muted-foreground mb-2">
                    Last checked: {lastCheckTime.toLocaleTimeString()}
                  </p>
                )}
                {nightStatus === 'outside' && (
                  <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <p className="text-sm text-red-700 dark:text-red-400 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      <strong>Safety Alert:</strong> Please return to campus or contact the warden immediately.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </GlassCard>
        </section>

        {/* Mess Menu */}
        <section className="mb-8 animate-fade-in" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center gap-2 mb-4">
            <Utensils className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">Today's Mess Menu</h2>
          </div>
          {messMenuLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {mealTimes.map((meal, index) => {
                const Icon = meal.icon
                return (
                  <GlassCard key={index} hover className="p-5 group">
                    <div className="flex flex-col items-center mb-4">
                      <div className={`w-12 h-12 rounded-xl ${meal.gradient} flex items-center justify-center text-white mb-3 shadow-lg transition-transform group-hover:scale-110`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <h3 className="font-semibold text-lg">{meal.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{meal.time}</p>
                    </div>
                    <ul className="space-y-2">
                      {meal.items.map((item, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary mr-2" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </GlassCard>
                )
              })}
            </div>
          )}
        </section>

        {/* Quick Actions */}
        <section className="mb-8 animate-fade-in" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center gap-2 mb-4">
            <Send className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">Quick Actions</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={() => router.push('/dashboard/student/tickets')}
              className="text-left"
            >
              <GlassCard hover className="p-6 group">
                <div className="w-12 h-12 rounded-xl gradient-secondary flex items-center justify-center text-white mb-4 shadow-lg transition-transform group-hover:scale-110">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-lg mb-2 transition-colors group-hover:text-primary">Raise Ticket</h3>
                <p className="text-sm text-muted-foreground">Report hostel issues</p>
              </GlassCard>
            </button>

            <button
              onClick={() => router.push('/dashboard/student/leave')}
              className="text-left"
            >
              <GlassCard hover className="p-6 group">
                <div className="w-12 h-12 rounded-xl gradient-warning flex items-center justify-center text-white mb-4 shadow-lg transition-transform group-hover:scale-110">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-lg mb-2 transition-colors group-hover:text-primary">Leave Application</h3>
                <p className="text-sm text-muted-foreground">Apply for leave</p>
              </GlassCard>
            </button>

            <button
              onClick={() => router.push('/dashboard/student/notifications')}
              className="text-left"
            >
              <GlassCard hover className="p-6 group">
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center text-white mb-4 relative shadow-lg transition-transform group-hover:scale-110">
                  <Bell className="w-6 h-6" />
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {notifications.filter(n => !n.read).length}
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-lg mb-2 transition-colors group-hover:text-primary">Notifications</h3>
                <p className="text-sm text-muted-foreground">View all alerts</p>
              </GlassCard>
            </button>
          </div>
        </section>

        {/* Coming Soon Features */}
        <section className="animate-fade-in" style={{ animationDelay: '400ms' }}>
          <div className="flex items-center gap-2 mb-4">
            <Brain className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">Coming Soon</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: <Home className="w-6 h-6" />, title: 'Room Info', desc: 'Room details & maintenance', gradient: 'gradient-accent' },
              { icon: <DollarSign className="w-6 h-6" />, title: 'Fee Management', desc: 'Pay fees online', gradient: 'gradient-success' },
              { icon: <Brain className="w-6 h-6" />, title: 'AI Suggestions', desc: 'Personalized recommendations', gradient: 'gradient-primary' },
              { icon: <Users className="w-6 h-6" />, title: 'Visitor Log', desc: 'Track visitor entries', gradient: 'gradient-secondary' }
            ].map((feature, index) => (
              <button
                key={index}
                onClick={() => setShowComingSoon(true)}
                className="text-left"
              >
                <GlassCard hover className="p-4 opacity-70 hover:opacity-100 transition-opacity group">
                  <div className={`w-10 h-10 rounded-lg ${feature.gradient} flex items-center justify-center text-white mb-3 shadow-lg transition-transform group-hover:scale-110`}>
                    {feature.icon}
                  </div>
                  <h3 className="font-semibold mb-1">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground">{feature.desc}</p>
                  <span className="text-xs text-primary mt-2 block">Coming Soon</span>
                </GlassCard>
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* Location Help Modal */}
      {showLocationHelp && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <GlassCard className="max-w-md w-full p-8 animate-slide-up">
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="w-8 h-8 text-primary" />
              <h3 className="text-2xl font-bold">Enable Location Access</h3>
            </div>
            <div className="space-y-4 text-sm text-muted-foreground">
              <p>To mark attendance, you need to enable location access:</p>
              <ol className="list-decimal list-inside space-y-2">
                <li>Click the location icon in your browser's address bar</li>
                <li>Select "Allow" for location permissions</li>
                <li>If you previously blocked it, go to browser settings → Site settings → Permissions → Location</li>
                <li>Refresh this page and try again</li>
              </ol>
              <p className="text-xs">
                Your location is only used to verify you're within the hostel premises. We respect your privacy.
              </p>
            </div>
            <PremiumButton onClick={() => setShowLocationHelp(false)} variant="primary" className="w-full mt-6">
              Got it
            </PremiumButton>
          </GlassCard>
        </div>
      )}

      {/* Coming Soon Modal */}
      {showComingSoon && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <GlassCard className="max-w-md w-full p-8 text-center animate-slide-up">
            <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center text-white text-3xl mx-auto mb-4 shadow-lg">
              <Brain className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Coming Soon!</h3>
            <p className="text-muted-foreground mb-6">
              This feature is under development and will be available soon.
            </p>
            <PremiumButton onClick={() => setShowComingSoon(false)} variant="primary" className="w-full">
              Got it
            </PremiumButton>
          </GlassCard>
        </div>
      )}
    </div>
  )
}