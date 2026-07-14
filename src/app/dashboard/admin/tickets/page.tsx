"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import FloatingBubbles from '@/components/FloatingBubbles'
import GlassCard from '@/components/ui/GlassCard'
import PremiumButton from '@/components/ui/PremiumButton'
import { ArrowLeft, CheckCircle, Clock, AlertCircle, Loader2, RefreshCw, XCircle } from 'lucide-react'
import { toast } from 'sonner'

interface Ticket {
  id: string
  user_id: string
  room_no: string
  category: string
  description: string
  status: 'pending' | 'in_progress' | 'resolved'
  created_at: string
  users: {
    id: string
    name: string
    email: string
  } | null
}

export default function TicketManagementPage() {
  const router = useRouter()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTickets()
  }, [])

  const fetchTickets = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/tickets')
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch tickets')
      }
      
      setTickets(result.data || [])
    } catch (error: any) {
      console.error('Error fetching tickets:', error)
      setError(error.message)
      toast.error('Failed to load tickets')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (ticketId: string, newStatus: 'pending' | 'in_progress' | 'resolved') => {
    setUpdating(ticketId)
    try {
      const response = await fetch('/api/tickets/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: ticketId, status: newStatus })
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update ticket')
      }
      
      setTickets(tickets.map(ticket =>
        ticket.id === ticketId ? { ...ticket, status: newStatus } : ticket
      ))
      toast.success(`Ticket ${newStatus === 'resolved' ? 'resolved' : 'updated'} successfully!`)
    } catch (error: any) {
      console.error('Error updating ticket:', error)
      toast.error(error.message || 'Failed to update ticket')
    } finally {
      setUpdating(null)
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

  const pendingCount = tickets.filter(t => t.status === 'pending').length
  const inProgressCount = tickets.filter(t => t.status === 'in_progress').length
  const resolvedCount = tickets.filter(t => t.status === 'resolved').length

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
        <div className="max-w-7xl mx-auto px-4 py-8">
          <button
            onClick={() => router.push('/dashboard/admin')}
            className="flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </button>
          
          <GlassCard className="p-12 text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Error Loading Tickets</h3>
            <p className="text-muted-foreground mb-6">{error}</p>
            <PremiumButton onClick={fetchTickets} variant="gradient">
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

      <div className="max-w-7xl mx-auto px-4 py-8">
        <button
          onClick={() => router.push('/dashboard/admin')}
          className="flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Dashboard
        </button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">🎫 Ticket Management</h1>
          <p className="text-muted-foreground">Manage and resolve student issues</p>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <GlassCard className="p-6">
            <div className="flex items-center space-x-3 mb-2">
              <Clock className="w-8 h-8 text-yellow-500" />
              <div>
                <h3 className="text-3xl font-bold">{pendingCount}</h3>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center space-x-3 mb-2">
              <AlertCircle className="w-8 h-8 text-blue-500" />
              <div>
                <h3 className="text-3xl font-bold">{inProgressCount}</h3>
                <p className="text-sm text-muted-foreground">In Progress</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center space-x-3 mb-2">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <div>
                <h3 className="text-3xl font-bold">{resolvedCount}</h3>
                <p className="text-sm text-muted-foreground">Resolved</p>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Tickets List */}
        {tickets.length === 0 ? (
          <GlassCard className="p-12 text-center">
            <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No tickets found</p>
          </GlassCard>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <GlassCard key={ticket.id} hover className="p-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-lg">{ticket.category}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(ticket.status)}`}>
                            {getStatusIcon(ticket.status)}
                            <span className="capitalize">{ticket.status.replace('_', ' ')}</span>
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
                          <span className="font-medium">{ticket.users?.name || 'Unknown User'}</span>
                          <span>•</span>
                          <span>Room {ticket.room_no}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-muted-foreground mb-3">{ticket.description}</p>
                    <div className="text-sm text-muted-foreground">
                      Submitted on {new Date(ticket.created_at).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex md:flex-col gap-2">
                    {ticket.status === 'pending' && (
                      <PremiumButton
                        size="sm"
                        variant="primary"
                        onClick={() => handleUpdateStatus(ticket.id, 'in_progress')}
                        disabled={updating === ticket.id}
                      >
                        {updating === ticket.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          'Start Work'
                        )}
                      </PremiumButton>
                    )}
                    {ticket.status === 'in_progress' && (
                      <PremiumButton
                        size="sm"
                        variant="gradient"
                        onClick={() => handleUpdateStatus(ticket.id, 'resolved')}
                        disabled={updating === ticket.id}
                      >
                        {updating === ticket.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          'Mark Resolved'
                        )}
                      </PremiumButton>
                    )}
                    {ticket.status === 'resolved' && (
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