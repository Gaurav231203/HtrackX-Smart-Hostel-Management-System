"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import FloatingBubbles from '@/components/FloatingBubbles'
import GlassCard from '@/components/ui/GlassCard'
import PremiumButton from '@/components/ui/PremiumButton'
import PremiumInput from '@/components/ui/PremiumInput'
import { ArrowLeft, Send, CheckCircle, Clock, XCircle, Loader2, RefreshCw } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { getUserLeaveApplications, createLeaveApplication } from '@/lib/api/data'
import { toast } from 'sonner'

interface LeaveApplication {
  id: string
  user_id: string
  from_date: string
  to_date: string
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

export default function LeavePage() {
  const router = useRouter()
  const { user, isConfigured } = useAuth()
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    fromDate: '',
    toDate: '',
    reason: ''
  })
  const [applications, setApplications] = useState<LeaveApplication[]>([])

  useEffect(() => {
    if (user && isConfigured) {
      fetchApplications()
    } else if (!isConfigured) {
      setLoading(false)
    }
  }, [user, isConfigured])

  const fetchApplications = async () => {
    if (!user) return
    
    setLoading(true)
    setError(null)
    try {
      const data = await getUserLeaveApplications(user.id)
      setApplications(data || [])
    } catch (error: any) {
      console.error('Error fetching leave applications:', error)
      setError(error.message)
      toast.error('Failed to load leave applications')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user || !isConfigured) {
      toast.error('Authentication required or Supabase not configured')
      return
    }

    setSubmitting(true)
    try {
      await createLeaveApplication(
        user.id,
        formData.fromDate,
        formData.toDate,
        formData.reason
      )
      
      toast.success('Leave application submitted successfully!')
      setFormData({ fromDate: '', toDate: '', reason: '' })
      setShowForm(false)
      await fetchApplications()
    } catch (error: any) {
      console.error('Error submitting leave application:', error)
      toast.error(error.message || 'Failed to submit leave application')
    } finally {
      setSubmitting(false)
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
        <div className="max-w-4xl mx-auto px-4 py-8">
          <button
            onClick={() => router.push('/dashboard/student')}
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

      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={() => router.push('/dashboard/student')}
          className="flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Dashboard
        </button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">📝 Leave Applications</h1>
          <p className="text-muted-foreground">Apply for leave and track your applications</p>
        </div>

        {!isConfigured && (
          <div className="mb-8 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
            <p className="text-sm text-yellow-600 dark:text-yellow-500">
              <strong>Demo Mode:</strong> Supabase is not configured. Add your credentials to .env.local to enable full functionality.
            </p>
          </div>
        )}

        {!showForm ? (
          <>
            <PremiumButton
              onClick={() => setShowForm(true)}
              variant="gradient"
              size="lg"
              className="mb-8 w-full md:w-auto"
              disabled={!isConfigured}
            >
              <Send className="w-5 h-5 mr-2" />
              Apply for Leave
            </PremiumButton>

            {applications.length === 0 ? (
              <GlassCard className="p-12 text-center">
                <Send className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No leave applications yet</p>
              </GlassCard>
            ) : (
              <div className="space-y-4">
                {applications.map((app) => (
                  <GlassCard key={app.id} hover className="p-6 animate-slide-up">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold text-lg">
                            {new Date(app.from_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} 
                            {' - '}
                            {new Date(app.to_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </h3>
                        </div>
                        <p className="text-muted-foreground mb-2">{app.reason}</p>
                        <div className="text-sm text-muted-foreground">
                          Applied on {new Date(app.created_at).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(app.status)}`}>
                        {getStatusIcon(app.status)}
                        <span className="capitalize">{app.status}</span>
                      </span>
                    </div>
                  </GlassCard>
                ))}
              </div>
            )}
          </>
        ) : (
          <GlassCard className="p-8 animate-fade-in">
            <h2 className="text-2xl font-bold mb-6">New Leave Application</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <PremiumInput
                  label="From Date"
                  type="date"
                  value={formData.fromDate}
                  onChange={(e) => setFormData({ ...formData, fromDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
                <PremiumInput
                  label="To Date"
                  type="date"
                  value={formData.toDate}
                  onChange={(e) => setFormData({ ...formData, toDate: e.target.value })}
                  min={formData.fromDate || new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Reason for Leave</label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Please provide a detailed reason for your leave..."
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all resize-none"
                  required
                />
              </div>

              <div className="flex gap-4">
                <PremiumButton
                  type="submit"
                  variant="gradient"
                  size="lg"
                  disabled={submitting}
                  className="flex-1"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </span>
                  ) : (
                    'Submit Application'
                  )}
                </PremiumButton>
                <PremiumButton
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => setShowForm(false)}
                  disabled={submitting}
                >
                  Cancel
                </PremiumButton>
              </div>
            </form>
          </GlassCard>
        )}
      </div>
    </div>
  )
}