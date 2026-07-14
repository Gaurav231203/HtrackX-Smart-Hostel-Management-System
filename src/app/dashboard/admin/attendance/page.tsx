"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import FloatingBubbles from '@/components/FloatingBubbles'
import GlassCard from '@/components/ui/GlassCard'
import PremiumButton from '@/components/ui/PremiumButton'
import PremiumInput from '@/components/ui/PremiumInput'
import { ArrowLeft, Download, Search, CheckCircle, XCircle, Users, TrendingUp, Loader2 } from 'lucide-react'
import { getAllAttendance } from '@/lib/api/data'

interface AttendanceRecord {
  id: string
  user_id: string
  date: string
  status: string
  marked_at: string
  users: {
    id: string
    name: string
    room_no: string
  }
}

export default function AttendanceOverviewPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'present' | 'absent'>('all')
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [allStudents, setAllStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    fetchData()
  }, [selectedDate])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch attendance for selected date
      const attendanceData = await getAllAttendance(selectedDate)
      setAttendance(attendanceData || [])

      // Fetch all students
      const studentsResponse = await fetch('/api/users?type=student')
      const studentsData = await studentsResponse.json()
      setAllStudents(studentsData.data || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Create combined list of all students with attendance status
  const studentsWithAttendance = allStudents.map(student => {
    const studentAttendance = attendance.find(a => a.user_id === student.id)
    return {
      id: student.id,
      name: student.name,
      roomNo: student.room_no,
      attendance: studentAttendance ? 'present' : 'absent',
      time: studentAttendance ? new Date(studentAttendance.marked_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '-'
    }
  })

  const filteredStudents = studentsWithAttendance.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.roomNo.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterStatus === 'all' || student.attendance === filterStatus
    return matchesSearch && matchesFilter
  })

  const presentCount = studentsWithAttendance.filter(s => s.attendance === 'present').length
  const absentCount = studentsWithAttendance.filter(s => s.attendance === 'absent').length
  const totalStudents = studentsWithAttendance.length
  const attendanceRate = totalStudents > 0 ? ((presentCount / totalStudents) * 100).toFixed(1) : '0.0'

  const handleDownloadCSV = () => {
    const csvContent = [
      ['Name', 'Room No', 'Status', 'Time'],
      ...filteredStudents.map(s => [s.name, s.roomNo, s.attendance, s.time])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `attendance-${selectedDate}.csv`
    a.click()
  }

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

      <div className="max-w-7xl mx-auto px-4 py-8">
        <button
          onClick={() => router.push('/dashboard/admin')}
          className="flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Dashboard
        </button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">📋 Attendance Overview</h1>
          <p className="text-muted-foreground">Monitor and manage daily attendance</p>
        </div>

        {/* Date Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Select Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className="px-4 py-3 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
          />
        </div>

        {/* Stats Cards */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-blue-500" />
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-3xl font-bold mb-1">{totalStudents}</h3>
            <p className="text-sm text-muted-foreground">Total Students</p>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <span className="text-sm text-green-600 dark:text-green-400 font-medium">{attendanceRate}%</span>
            </div>
            <h3 className="text-3xl font-bold mb-1">{presentCount}</h3>
            <p className="text-sm text-muted-foreground">Present Today</p>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-2">
              <XCircle className="w-8 h-8 text-red-500" />
              <span className="text-sm text-red-600 dark:text-red-400 font-medium">{(100 - parseFloat(attendanceRate)).toFixed(1)}%</span>
            </div>
            <h3 className="text-3xl font-bold mb-1">{absentCount}</h3>
            <p className="text-sm text-muted-foreground">Absent Today</p>
          </GlassCard>
        </div>

        {/* Filters and Search */}
        <GlassCard className="p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <PremiumInput
                placeholder="Search by name or room number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-4 py-3 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
              >
                <option value="all">All Students</option>
                <option value="present">Present Only</option>
                <option value="absent">Absent Only</option>
              </select>
              <PremiumButton variant="primary" onClick={handleDownloadCSV}>
                <Download className="w-5 h-5 mr-2" />
                Export CSV
              </PremiumButton>
            </div>
          </div>
        </GlassCard>

        {/* Attendance Table */}
        <GlassCard className="p-6">
          {filteredStudents.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No students found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold">Student Name</th>
                    <th className="text-left py-3 px-4 font-semibold">Room No.</th>
                    <th className="text-left py-3 px-4 font-semibold">Status</th>
                    <th className="text-left py-3 px-4 font-semibold">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                      <td className="py-3 px-4">{student.name}</td>
                      <td className="py-3 px-4">{student.roomNo}</td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium inline-flex items-center space-x-1 ${
                          student.attendance === 'present'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {student.attendance === 'present' ? (
                            <CheckCircle className="w-3 h-3" />
                          ) : (
                            <XCircle className="w-3 h-3" />
                          )}
                          <span className="capitalize">{student.attendance}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{student.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  )
}