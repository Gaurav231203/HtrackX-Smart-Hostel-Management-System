"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import FloatingBubbles from '@/components/FloatingBubbles'
import GlassCard from '@/components/ui/GlassCard'
import PremiumButton from '@/components/ui/PremiumButton'
import { ArrowLeft, Bell, CheckCircle, AlertCircle, Info, Megaphone, Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { getUserNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '@/lib/api/data'
import { toast } from 'sonner'

interface Notification {
  id: string
  user_id: string
  type: 'attendance' | 'ticket' | 'leave' | 'announcement' | 'alert'
  title: string
  message: string
  read: boolean
  created_at: string
}

export default function NotificationsPage() {
  const router = useRouter()
  const { user, isConfigured } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [markingAll, setMarkingAll] = useState(false)

  useEffect(() => {
    if (user && isConfigured) {
      fetchNotifications()
    } else if (!isConfigured) {
      setLoading(false)
    }
  }, [user, isConfigured])

  const fetchNotifications = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const data = await getUserNotifications(user.id, 50)
      setNotifications(data || [])
    } catch (error) {
      console.error('Error fetching notifications:', error)
      toast.error('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId)
      setNotifications(notifications.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      ))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    if (!user) return
    
    setMarkingAll(true)
    try {
      await markAllNotificationsAsRead(user.id)
      setNotifications(notifications.map(n => ({ ...n, read: true })))
      toast.success('All notifications marked as read')
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      toast.error('Failed to mark all as read')
    } finally {
      setMarkingAll(false)
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'attendance':
        return <CheckCircle className="w-5 h-5" />
      case 'ticket':
        return <AlertCircle className="w-5 h-5" />
      case 'leave':
        return <CheckCircle className="w-5 h-5" />
      case 'announcement':
        return <Megaphone className="w-5 h-5" />
      case 'alert':
        return <AlertCircle className="w-5 h-5" />
      default:
        return <Info className="w-5 h-5" />
    }
  }

  const getColor = (type: string) => {
    switch (type) {
      case 'attendance':
        return 'bg-green-500'
      case 'ticket':
        return 'bg-yellow-500'
      case 'leave':
        return 'bg-blue-500'
      case 'announcement':
        return 'bg-purple-500'
      case 'alert':
        return 'bg-red-500'
      default:
        return 'bg-blue-500'
    }
  }

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (seconds < 60) return 'Just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const unreadCount = notifications.filter(n => !n.read).length

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <FloatingBubbles />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={() => router.push('/dashboard/student')}
          className="flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Dashboard
        </button>

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">🔔 Notifications</h1>
            <p className="text-muted-foreground">
              Stay updated with all alerts and announcements
              {unreadCount > 0 && ` • ${unreadCount} unread`}
            </p>
          </div>
          {unreadCount > 0 && (
            <PremiumButton
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={markingAll}
            >
              {markingAll ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Mark all as read'
              )}
            </PremiumButton>
          )}
        </div>

        {!isConfigured && (
          <div className="mb-8 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
            <p className="text-sm text-yellow-600 dark:text-yellow-500">
              <strong>Demo Mode:</strong> Supabase is not configured. Add your credentials to .env.local to enable full functionality.
            </p>
          </div>
        )}

        {notifications.length === 0 ? (
          <GlassCard className="p-12 text-center">
            <Bell className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No notifications yet</p>
          </GlassCard>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <GlassCard 
                key={notification.id} 
                hover 
                className={`p-5 animate-slide-up cursor-pointer ${notification.read ? 'opacity-70' : ''}`}
                onClick={() => !notification.read && handleMarkAsRead(notification.id)}
              >
                <div className="flex items-start space-x-4">
                  <div className={`p-2 rounded-xl ${getColor(notification.type)} text-white flex-shrink-0`}>
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-semibold text-base">{notification.title}</h3>
                      {!notification.read && (
                        <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2 ml-2" />
                      )}
                    </div>
                    <p className="text-muted-foreground text-sm mb-2">{notification.message}</p>
                    <span className="text-xs text-muted-foreground">{getTimeAgo(notification.created_at)}</span>
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