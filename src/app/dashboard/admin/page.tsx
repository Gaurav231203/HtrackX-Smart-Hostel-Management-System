"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import FloatingBubbles from '@/components/FloatingBubbles'
import GlassCard from '@/components/ui/GlassCard'
import PremiumButton from '@/components/ui/PremiumButton'
import ThemeToggle from '@/components/ThemeToggle'
import { useAuth } from '@/contexts/AuthContext'
import {
  Users,
  CheckCircle,
  AlertCircle,
  FileText,
  Bell,
  LogOut,
  TrendingUp,
  TrendingDown,
  Clock,
  MapPin,
  Utensils,
  BarChart3,
  AlertTriangle,
  Loader2,
  Shield
} from 'lucide-react'
import {
  getAllAttendance,
  getAllTickets,
  getAllLeaveApplications
} from '@/lib/api/data'
import { getAllNightAlerts } from '@/lib/api/alerts'

export default function AdminDashboard() {
  const router = useRouter()
  const { user, profile, loading: authLoading, signOut, isConfigured } = useAuth()
  
  const [stats, setStats] = useState({
    totalStudents: 0,
    presentToday: 0,
    pendingTickets: 0,
    leaveRequests: 0,
    activeNightAlerts: 0
  })
  const [statsLoading, setStatsLoading] = useState(true)
  const [recentAlerts, setRecentAlerts] = useState<any[]>([])
  const [alertsLoading, setAlertsLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && (!user || profile?.user_type !== 'admin')) {
      router.push('/auth/login')
    }
  }, [authLoading, user, profile, router])

  useEffect(() => {
    if (user && profile?.user_type === 'admin' && isConfigured) {
      fetchStats()
      fetchRecentAlerts()
    }
  }, [user, profile, isConfigured])

  const fetchStats = async () => {
    setStatsLoading(true)
    try {
      const today = new Date().toISOString().split('T')[0]
      
      // Fetch total students count
      const studentsResponse = await fetch('/api/users/count?type=student')
      const studentsData = await studentsResponse.json()
      const totalStudents = studentsData.count || 0
      
      const attendance = await getAllAttendance(today)
      const presentToday = attendance?.length || 0
      
      const tickets = await getAllTickets('pending')
      const pendingTickets = tickets?.length || 0
      
      const leaves = await getAllLeaveApplications('pending')
      const leaveRequests = leaves?.length || 0

      const nightAlerts = await getAllNightAlerts('active')
      const activeNightAlerts = nightAlerts?.length || 0
      
      setStats({
        totalStudents,
        presentToday,
        pendingTickets,
        leaveRequests,
        activeNightAlerts
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setStatsLoading(false)
    }
  }

  const fetchRecentAlerts = async () => {
    setAlertsLoading(true)
    try {
      const nightAlerts = await getAllNightAlerts('active')
      const tickets = await getAllTickets()
      const leaves = await getAllLeaveApplications()
      
      const alerts: any[] = []
      
      // Add night alerts (highest priority)
      nightAlerts?.slice(0, 2).forEach(alert => {
        alerts.push({
          id: `night-${alert.id}`,
          type: 'critical',
          student: `Student (${alert.userId})`,
          message: `Detected outside campus during curfew - ${alert.distanceFromCampus}m away`,
          time: new Date(alert.detectedAt).toLocaleTimeString(),
          status: alert.status,
          icon: <Shield className="w-4 h-4" />
        })
      })
      
      // Add urgent tickets
      tickets?.slice(0, 2).forEach(ticket => {
        alerts.push({
          id: ticket.id,
          type: ticket.status === 'pending' ? 'warning' : 'info',
          student: `${(ticket as any).users?.name} (${ticket.room_no})`,
          message: `Ticket: ${ticket.description.substring(0, 50)}...`,
          time: new Date(ticket.created_at).toLocaleTimeString(),
          status: ticket.status,
          icon: <AlertCircle className="w-4 h-4" />
        })
      })
      
      // Add recent leave requests
      leaves?.slice(0, 1).forEach(leave => {
        alerts.push({
          id: leave.id,
          type: leave.status === 'pending' ? 'warning' : 'info',
          student: `${(leave as any).users?.name} (${(leave as any).users?.room_no})`,
          message: `Leave: ${leave.from_date} to ${leave.to_date}`,
          time: new Date(leave.created_at).toLocaleTimeString(),
          status: leave.status,
          icon: <FileText className="w-4 h-4" />
        })
      })
      
      setRecentAlerts(alerts)
    } catch (error) {
      console.error('Error fetching alerts:', error)
    } finally {
      setAlertsLoading(false)
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

  if (authLoading || statsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user || !profile || profile.user_type !== 'admin') {
    return null
  }

  const quickActions = [
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Attendance Overview',
      description: 'View and manage daily attendance',
      href: '/dashboard/admin/attendance',
      gradient: 'gradient-primary'
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Night Alerts',
      description: 'Monitor curfew violations',
      href: '/dashboard/admin/alerts',
      gradient: 'gradient-secondary',
      badge: stats.activeNightAlerts > 0 ? stats.activeNightAlerts : null
    },
    {
      icon: <AlertCircle className="w-6 h-6" />,
      title: 'Ticket Management',
      description: 'Handle student issues',
      href: '/dashboard/admin/tickets',
      gradient: 'gradient-warning'
    },
    {
      icon: <Utensils className="w-6 h-6" />,
      title: 'Mess Menu Editor',
      description: 'Update daily menu',
      href: '/dashboard/admin/mess-menu',
      gradient: 'gradient-success'
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: 'Leave Approvals',
      description: 'Review leave applications',
      href: '/dashboard/admin/leave',
      gradient: 'gradient-accent'
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: 'Analytics',
      description: 'View comprehensive insights',
      href: '/dashboard/admin/analytics',
      gradient: 'gradient-primary'
    }
  ]

  const attendancePercentage = stats.totalStudents > 0 
    ? Math.round((stats.presentToday / stats.totalStudents) * 100) 
    : 0

  return (
    <div className="min-h-screen pb-20">
      <FloatingBubbles />

      {/* Header */}
      <div className="sticky top-0 z-50 glass-card border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Welcome, {profile.name}</h1>
              <p className="text-sm text-muted-foreground">Admin Dashboard</p>
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
        {!isConfigured && (
          <div className="mb-8 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl animate-slide-up">
            <p className="text-sm text-yellow-600 dark:text-yellow-500">
              <strong>Demo Mode:</strong> Supabase is not configured. Add your credentials to .env.local to enable full functionality.
            </p>
          </div>
        )}

        {/* Stats Grid */}
        <section className="mb-8 animate-fade-in">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary" />
            Overview
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <GlassCard hover className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center text-white">
                  <Users className="w-6 h-6" />
                </div>
                <div className="flex items-center space-x-1 text-sm font-medium text-green-600 dark:text-green-400">
                  <TrendingUp className="w-4 h-4" />
                  <span>+12</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-1">{stats.totalStudents}</h3>
              <p className="text-sm text-muted-foreground">Total Students</p>
            </GlassCard>

            <GlassCard hover className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl gradient-success flex items-center justify-center text-white">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div className="flex items-center space-x-1 text-sm font-medium text-green-600 dark:text-green-400">
                  <TrendingUp className="w-4 h-4" />
                  <span>{attendancePercentage}%</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-1">{stats.presentToday}</h3>
              <p className="text-sm text-muted-foreground">Present Today</p>
            </GlassCard>

            <GlassCard hover className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl gradient-warning flex items-center justify-center text-white">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div className="flex items-center space-x-1 text-sm font-medium text-red-600 dark:text-red-400">
                  <TrendingDown className="w-4 h-4" />
                  <span>-3</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-1">{stats.pendingTickets}</h3>
              <p className="text-sm text-muted-foreground">Pending Tickets</p>
            </GlassCard>

            <GlassCard hover className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl gradient-accent flex items-center justify-center text-white">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="flex items-center space-x-1 text-sm font-medium text-green-600 dark:text-green-400">
                  <TrendingUp className="w-4 h-4" />
                  <span>+2</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-1">{stats.leaveRequests}</h3>
              <p className="text-sm text-muted-foreground">Leave Requests</p>
            </GlassCard>

            <GlassCard hover className="p-6 border-2 border-red-500/20">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-red-500 flex items-center justify-center text-white">
                  <Shield className="w-6 h-6" />
                </div>
                {stats.activeNightAlerts > 0 && (
                  <div className="flex items-center space-x-1 text-sm font-medium text-red-600 dark:text-red-400">
                    <AlertTriangle className="w-4 h-4 animate-pulse" />
                    <span>Active</span>
                  </div>
                )}
              </div>
              <h3 className="text-2xl font-bold mb-1">{stats.activeNightAlerts}</h3>
              <p className="text-sm text-muted-foreground">Night Alerts</p>
            </GlassCard>
          </div>
        </section>

        {/* Recent Alerts */}
        <section className="mb-8 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Bell className="w-6 h-6 text-primary" />
              Recent Alerts
            </h2>
            <PremiumButton variant="ghost" size="sm" onClick={() => router.push('/dashboard/admin/alerts')}>
              View All
            </PremiumButton>
          </div>
          
          {alertsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : recentAlerts.length === 0 ? (
            <GlassCard className="p-8 text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <p className="text-muted-foreground">No active alerts</p>
            </GlassCard>
          ) : (
            <div className="space-y-3">
              {recentAlerts.map((alert) => (
                <GlassCard key={alert.id} hover className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className={`p-2 rounded-lg ${
                        alert.type === 'critical' ? 'bg-red-500' :
                        alert.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                      } text-white`}>
                        {alert.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm mb-1">{alert.student}</h4>
                        <p className="text-sm text-muted-foreground">{alert.message}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <span className="text-xs text-muted-foreground">{alert.time}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        alert.status === 'pending' || alert.status === 'active' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                        alert.status === 'in_progress' || alert.status === 'acknowledged' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      }`}>
                        {alert.status}
                      </span>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </section>

        {/* Quick Actions */}
        <section className="animate-fade-in" style={{ animationDelay: '200ms' }}>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" />
            Quick Actions
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => router.push(action.href)}
                className="text-left relative"
              >
                <GlassCard hover className="p-6">
                  {action.badge && (
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-red-500 text-white text-sm font-bold flex items-center justify-center animate-pulse shadow-lg">
                      {action.badge}
                    </div>
                  )}
                  <div className={`w-12 h-12 rounded-xl ${action.gradient} flex items-center justify-center text-white mb-4`}>
                    {action.icon}
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{action.title}</h3>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </GlassCard>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}