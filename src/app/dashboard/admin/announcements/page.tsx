"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import FloatingBubbles from '@/components/FloatingBubbles'
import GlassCard from '@/components/ui/GlassCard'
import PremiumButton from '@/components/ui/PremiumButton'
import PremiumInput from '@/components/ui/PremiumInput'
import { ArrowLeft, Send, Megaphone, Calendar } from 'lucide-react'

interface Announcement {
  id: string
  title: string
  message: string
  date: string
  sentBy: string
}

export default function AnnouncementsPage() {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    message: ''
  })
  const [announcements, setAnnouncements] = useState<Announcement[]>([
    {
      id: '1',
      title: 'Hostel Meeting - Tomorrow 6 PM',
      message: 'All students are requested to attend the hostel meeting in the common room tomorrow at 6 PM. Important updates will be shared.',
      date: '2025-01-18',
      sentBy: 'Admin'
    },
    {
      id: '2',
      title: 'Mess Menu Special',
      message: 'This weekend, we are serving special biryani for dinner on Saturday. Don\'t miss it!',
      date: '2025-01-17',
      sentBy: 'Admin'
    },
    {
      id: '3',
      title: 'Maintenance Schedule',
      message: 'Water supply will be interrupted for 2 hours (2 PM - 4 PM) on Sunday for maintenance work.',
      date: '2025-01-16',
      sentBy: 'Admin'
    }
  ])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    setTimeout(() => {
      const newAnnouncement: Announcement = {
        id: Date.now().toString(),
        ...formData,
        date: new Date().toISOString().split('T')[0],
        sentBy: 'Admin'
      }
      setAnnouncements([newAnnouncement, ...announcements])
      setFormData({ title: '', message: '' })
      setShowForm(false)
      setLoading(false)
      alert('✅ Announcement sent to all students!')
    }, 1000)
  }

  return (
    <div className="min-h-screen">
      <FloatingBubbles />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={() => router.push('/dashboard/admin')}
          className="flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Dashboard
        </button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">📢 Announcements</h1>
          <p className="text-muted-foreground">Broadcast messages to all students</p>
        </div>

        {!showForm ? (
          <>
            <PremiumButton
              onClick={() => setShowForm(true)}
              variant="gradient"
              size="lg"
              className="mb-8 w-full md:w-auto"
            >
              <Megaphone className="w-5 h-5 mr-2" />
              New Announcement
            </PremiumButton>

            <div className="space-y-4">
              {announcements.map((announcement) => (
                <GlassCard key={announcement.id} hover className="p-6 animate-slide-up">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 rounded-xl gradient-primary text-white flex-shrink-0">
                      <Megaphone className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg mb-2">{announcement.title}</h3>
                      <p className="text-muted-foreground mb-3">{announcement.message}</p>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(announcement.date).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </span>
                        <span>•</span>
                        <span>Sent by {announcement.sentBy}</span>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </>
        ) : (
          <GlassCard className="p-8 animate-fade-in">
            <h2 className="text-2xl font-bold mb-6">Create New Announcement</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <PremiumInput
                label="Announcement Title"
                placeholder="e.g., Hostel Meeting Tomorrow"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />

              <div>
                <label className="block text-sm font-medium mb-2">Message</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Type your announcement message here..."
                  rows={6}
                  className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all resize-none"
                  required
                />
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  📱 This announcement will be sent as a notification to all {248} students instantly.
                </p>
              </div>

              <div className="flex gap-4">
                <PremiumButton
                  type="submit"
                  variant="gradient"
                  size="lg"
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? 'Sending...' : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Send to All Students
                    </>
                  )}
                </PremiumButton>
                <PremiumButton
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => setShowForm(false)}
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
