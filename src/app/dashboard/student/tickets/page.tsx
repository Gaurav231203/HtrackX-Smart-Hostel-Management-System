"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import FloatingBubbles from '@/components/FloatingBubbles'
import GlassCard from '@/components/ui/GlassCard'
import PremiumButton from '@/components/ui/PremiumButton'
import PremiumInput from '@/components/ui/PremiumInput'
import { ArrowLeft, Send, CheckCircle, Clock, AlertCircle, Loader2 } from 'lucide-react'

interface Ticket {
  id: string
  user_id: string
  room_no: string
  category: string
  description: string
  status: 'pending' | 'in_progress' | 'resolved'
  created_at: string
  updated_at: string
}

export default function TicketsPage() {
  const router = useRouter()
  const { user, isConfigured } = useAuth()
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [ticketsLoading, setTicketsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    roomNo: '',
    category: 'electrical',
    description: ''
  })
  const [tickets, setTickets] = useState<Ticket[]>([])

  useEffect(() => {
    if (user && isConfigured) {
      fetchTickets()
    }
  }, [user, isConfigured])

  const fetchTickets = async () => {
    if (!user) return
    
    setTicketsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/tickets?userId=${user.id}`)
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch tickets')
      }
      
      setTickets(result.data || [])
    } catch (err: any) {
      console.error('Error fetching tickets:', err)
      setError(err.message)
    } finally {
      setTicketsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user || !isConfigured) {
      alert('Authentication required or Supabase not configured')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/tickets/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: user.id,
          room_no: formData.roomNo,
          category: formData.category,
          description: formData.description
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create ticket')
      }

      setTickets([result.data, ...tickets])
      setFormData({ roomNo: '', category: 'electrical', description: '' })
      setShowForm(false)
      alert('✅ Ticket raised successfully!')
    } catch (err: any) {
      console.error('Error creating ticket:', err)
      alert(err.message || 'Failed to create ticket')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'in_progress':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'resolved':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      default:
        return ''
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />
      case 'in_progress':
        return <AlertCircle className="w-4 h-4" />
      case 'resolved':
        return <CheckCircle className="w-4 h-4" />
      default:
        return null
    }
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
          <h1 className="text-4xl font-bold mb-2">🎫 Issue Tickets</h1>
          <p className="text-muted-foreground">Report and track hostel issues</p>
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
              Raise New Ticket
            </PremiumButton>

            {ticketsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <GlassCard className="p-8 text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                <p className="text-red-600 dark:text-red-400">{error}</p>
                <PremiumButton onClick={fetchTickets} variant="outline" size="sm" className="mt-4">
                  Retry
                </PremiumButton>
              </GlassCard>
            ) : tickets.length === 0 ? (
              <GlassCard className="p-8 text-center">
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No tickets found. Raise your first ticket!</p>
              </GlassCard>
            ) : (
              <div className="space-y-4">
                {tickets.map((ticket) => (
                  <GlassCard key={ticket.id} hover className="p-6 animate-slide-up">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold text-lg capitalize">{ticket.category}</h3>
                          <span className="text-sm text-muted-foreground">• Room {ticket.room_no}</span>
                        </div>
                        <p className="text-muted-foreground">{ticket.description}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(ticket.status)}`}>
                        {getStatusIcon(ticket.status)}
                        <span className="capitalize">{ticket.status.replace('_', ' ')}</span>
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Submitted on {new Date(ticket.created_at).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </div>
                  </GlassCard>
                ))}
              </div>
            )}
          </>
        ) : (
          <GlassCard className="p-8 animate-fade-in">
            <h2 className="text-2xl font-bold mb-6">Raise New Ticket</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <PremiumInput
                label="Room Number"
                placeholder="e.g., A-101"
                value={formData.roomNo}
                onChange={(e) => setFormData({ ...formData, roomNo: e.target.value })}
                required
              />

              <div>
                <label className="block text-sm font-medium mb-2">Issue Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                  required
                >
                  <option value="electrical">Electrical</option>
                  <option value="plumbing">Plumbing</option>
                  <option value="furniture">Furniture</option>
                  <option value="cleaning">Cleaning</option>
                  <option value="internet">Internet/WiFi</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Issue Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the issue in detail..."
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
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Ticket'
                  )}
                </PremiumButton>
                <PremiumButton
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => setShowForm(false)}
                  disabled={loading}
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