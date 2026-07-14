"use client"

import { useRouter } from 'next/navigation'
import FloatingBubbles from '@/components/FloatingBubbles'
import GlassCard from '@/components/ui/GlassCard'
import { ArrowLeft, TrendingUp, Users, CheckCircle, AlertCircle, Calendar } from 'lucide-react'

export default function AnalyticsPage() {
  const router = useRouter()

  const attendanceData = [
    { day: 'Mon', present: 235, absent: 13 },
    { day: 'Tue', present: 240, absent: 8 },
    { day: 'Wed', present: 238, absent: 10 },
    { day: 'Thu', present: 231, absent: 17 },
    { day: 'Fri', present: 245, absent: 3 },
    { day: 'Sat', present: 242, absent: 6 },
    { day: 'Sun', present: 230, absent: 18 }
  ]

  const maxValue = Math.max(...attendanceData.map(d => d.present))

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
          <h1 className="text-4xl font-bold mb-2">📊 Analytics Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive insights and statistics</p>
        </div>

        {/* Key Metrics */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-3">
              <Users className="w-8 h-8 text-blue-500" />
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-3xl font-bold mb-1">248</h3>
            <p className="text-sm text-muted-foreground">Total Students</p>
            <div className="mt-2 text-xs text-green-600 dark:text-green-400">
              +12 from last month
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-3">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <span className="text-sm font-medium text-green-600 dark:text-green-400">94.8%</span>
            </div>
            <h3 className="text-3xl font-bold mb-1">235</h3>
            <p className="text-sm text-muted-foreground">Avg. Attendance</p>
            <div className="mt-2 text-xs text-green-600 dark:text-green-400">
              +2.5% this week
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-3">
              <AlertCircle className="w-8 h-8 text-yellow-500" />
              <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">4.8%</span>
            </div>
            <h3 className="text-3xl font-bold mb-1">12</h3>
            <p className="text-sm text-muted-foreground">Active Tickets</p>
            <div className="mt-2 text-xs text-yellow-600 dark:text-yellow-400">
              -3 from yesterday
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-3">
              <Calendar className="w-8 h-8 text-purple-500" />
              <span className="text-sm font-medium text-purple-600 dark:text-purple-400">3.2%</span>
            </div>
            <h3 className="text-3xl font-bold mb-1">8</h3>
            <p className="text-sm text-muted-foreground">Pending Leaves</p>
            <div className="mt-2 text-xs text-purple-600 dark:text-purple-400">
              +2 new requests
            </div>
          </GlassCard>
        </div>

        {/* Weekly Attendance Chart */}
        <GlassCard className="p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6">Weekly Attendance Trends</h2>
          <div className="space-y-4">
            {attendanceData.map((data, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium w-12">{data.day}</span>
                  <div className="flex-1 mx-4">
                    <div className="relative h-8 bg-secondary rounded-lg overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 gradient-success rounded-lg transition-all duration-500"
                        style={{ width: `${(data.present / maxValue) * 100}%` }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-medium text-foreground">
                          {data.present} present
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground w-16 text-right">
                    {data.absent} absent
                  </span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Category-wise Tickets */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <GlassCard className="p-6">
            <h2 className="text-2xl font-bold mb-6">Tickets by Category</h2>
            <div className="space-y-4">
              {[
                { category: 'Electrical', count: 5, color: 'bg-yellow-500' },
                { category: 'Plumbing', count: 3, color: 'bg-blue-500' },
                { category: 'Furniture', count: 2, color: 'bg-purple-500' },
                { category: 'Cleaning', count: 1, color: 'bg-green-500' },
                { category: 'Other', count: 1, color: 'bg-gray-500' }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className={`w-3 h-3 rounded-full ${item.color}`} />
                    <span className="text-sm font-medium">{item.category}</span>
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className={`h-full ${item.color} transition-all duration-500`}
                        style={{ width: `${(item.count / 12) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground w-8 text-right">{item.count}</span>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h2 className="text-2xl font-bold mb-6">Monthly Overview</h2>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Attendance Rate</span>
                  <span className="text-2xl font-bold text-green-600 dark:text-green-400">94.8%</span>
                </div>
                <p className="text-xs text-muted-foreground">+2.3% from last month</p>
              </div>

              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Tickets Resolved</span>
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">45</span>
                </div>
                <p className="text-xs text-muted-foreground">Average time: 2.3 days</p>
              </div>

              <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Leave Approvals</span>
                  <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">28</span>
                </div>
                <p className="text-xs text-muted-foreground">72% approval rate</p>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Night Alert Statistics */}
        <GlassCard className="p-6">
          <h2 className="text-2xl font-bold mb-6">Night Campus Monitoring</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="text-center p-4 rounded-xl bg-green-500/10">
              <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">96%</div>
              <p className="text-sm text-muted-foreground">Inside Campus (9PM-6AM)</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-yellow-500/10">
              <div className="text-4xl font-bold text-yellow-600 dark:text-yellow-400 mb-2">4%</div>
              <p className="text-sm text-muted-foreground">Alerts Triggered</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-blue-500/10">
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">12</div>
              <p className="text-sm text-muted-foreground">Total Alerts This Month</p>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
