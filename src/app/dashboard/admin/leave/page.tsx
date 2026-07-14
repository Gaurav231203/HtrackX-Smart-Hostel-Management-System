"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import FloatingBubbles from '@/components/FloatingBubbles'
import GlassCard from '@/components/ui/GlassCard'
import PremiumButton from '@/components/ui/PremiumButton'
import { ArrowLeft, CheckCircle, XCircle, Clock, Loader2, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

interface LeaveApplication {
  id: string
  user_id: string
  from_date: string
  to_date: string
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  users: {
    id: string
    name: string
    email: string
    room_no: string
  }
}

export default function LeaveApprovalsPage() {
  const router = useRouter()
  const [applications, setApplications] = useState<LeaveApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/leave')
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch leave applications')
      }
      
      setApplications(result.data || [])
    } catch (error: any) {
      console.error('Error fetching leave applications:', error)
      setError(error.message)
      toast.error('Failed to load leave applications')
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id: string, status: 'approved' | 'rejected') => {
    setUpdating(id)
    try {
      const response = await fetch('/api/leave/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update leave application')
      }
      
      setApplications(applications.map(app =>
        app.id === id ? { ...app, status } : app
      ))
      toast.success(`Leave application ${status}!`)
    } catch (error: any) {
      console.error('Error updating leave status:', error)
      toast.error(error.message || 'Failed to update leave application')
    } finally {
      setUpdating(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'approved':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'rejected':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      default:
        return ''
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />
      case 'approved':
        return <CheckCircle className="w-4 h-4" />
      case 'rejected':
        return <XCircle className="w-4 h-4" />
      default:
        return null
    }
  }

  const pendingCount = applications.filter(a => a.status === 'pending').length
  const approvedCount = applications.filter(a => a.status === 'approved').length
  const rejectedCount = applications.filter(a => a.status === 'rejected').length

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
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
          
          <GlassCard className="p-12 text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Error Loading Leave Applications</h3>
            <p className="text-muted-foreground mb-6">{error}</p>
            <PremiumButton onClick={fetchApplications} variant="gradient">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </PremiumButton>
          </GlassCard>
        </div>
      </div>
    )
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
          <h1 className="text-4xl font-bold mb-2">📝 Leave Approvals</h1>
          <p className="text-muted-foreground">Review and approve student leave applications</p>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <GlassCard className="p-6">
            <div className="flex items-center space-x-3">
              <Clock className="w-8 h-8 text-yellow-500" />
              <div>
                <h3 className="text-3xl font-bold">{pendingCount}</h3>
                <p className="text-sm text-muted-foreground">Pending Review</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <div>
                <h3 className="text-3xl font-bold">{approvedCount}</h3>
                <p className="text-sm text-muted-foreground">Approved</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center space-x-3">
              <XCircle className="w-8 h-8 text-red-500" />
              <div>
                <h3 className="text-3xl font-bold">{rejectedCount}</h3>
                <p className="text-sm text-muted-foreground">Rejected</p>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Applications List */}
        {applications.length === 0 ? (
          <GlassCard className="p-12 text-center">
            <CheckCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No leave applications found</p>
          </GlassCard>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <GlassCard key={app.id} hover className="p-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-lg">{app.users?.name || 'Unknown User'}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(app.status)}`}>
                            {getStatusIcon(app.status)}
                            <span className="capitalize">{app.status}</span>
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground mb-3">
                          Room {app.users?.room_no || 'N/A'} • {new Date(app.from_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          {' - '}
                          {new Date(app.to_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      </div>
                    </div>
                    <p className="text-muted-foreground mb-3"><strong>Reason:</strong> {app.reason}</p>
                    <div className="text-sm text-muted-foreground">
                      Applied on {new Date(app.created_at).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {app.status === 'pending' && (
                    <div className="flex md:flex-col gap-2">
                      <PremiumButton
                        size="sm"
                        variant="gradient"
                        onClick={() => updateStatus(app.id, 'approved')}
                        className="flex-1 md:flex-none"
                        disabled={updating === app.id}
                      >
                        {updating === app.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve
                          </>
                        )}
                      </PremiumButton>
                      <PremiumButton
                        size="sm"
                        variant="outline"
                        onClick={() => updateStatus(app.id, 'rejected')}
                        className="flex-1 md:flex-none border-destructive text-destructive hover:bg-destructive/10"
                        disabled={updating === app.id}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </PremiumButton>
                    </div>
                  )}
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}