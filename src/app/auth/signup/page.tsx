"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import FloatingBubbles from '@/components/FloatingBubbles'
import GlassCard from '@/components/ui/GlassCard'
import PremiumButton from '@/components/ui/PremiumButton'
import PremiumInput from '@/components/ui/PremiumInput'
import ThemeToggle from '@/components/ThemeToggle'
import { User, Mail, Lock, Phone, Home, Key, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react'
import { signUpStudent, signUpAdmin } from '@/lib/api/auth'
import { useAuth } from '@/contexts/AuthContext'

export default function SignupPage() {
  const router = useRouter()
  const { isConfigured } = useAuth()
  const [userType, setUserType] = useState<'student' | 'admin'>('student')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [generalError, setGeneralError] = useState('')
  const [success, setSuccess] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    roomNo: '',
    adminPassKey: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' })
    }
    if (generalError) setGeneralError('')
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid'
    
    if (!formData.password) newErrors.password = 'Password is required'
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters'
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required'
    else if (!/^\d{10}$/.test(formData.phone)) newErrors.phone = 'Phone number must be 10 digits'

    if (userType === 'student' && !formData.roomNo.trim()) {
      newErrors.roomNo = 'Room number is required'
    }

    if (userType === 'admin' && !formData.adminPassKey.trim()) {
      newErrors.adminPassKey = 'Admin pass key is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    if (!isConfigured) {
      setGeneralError('Supabase is not configured. Please add your credentials to .env.local')
      return
    }

    setLoading(true)
    setGeneralError('')

    try {
      if (userType === 'student') {
        await signUpStudent(
          formData.email,
          formData.password,
          formData.name,
          formData.phone,
          formData.roomNo
        )
      } else {
        await signUpAdmin(
          formData.email,
          formData.password,
          formData.name,
          formData.phone,
          formData.adminPassKey
        )
      }

      setSuccess(true)
      
      setTimeout(() => {
        router.push('/auth/login?registered=true')
      }, 2000)
    } catch (error: any) {
      setLoading(false)
      
      if (error.message?.includes('User already registered')) {
        setGeneralError('An account with this email already exists.')
      } else if (error.message?.includes('Invalid admin pass key')) {
        setGeneralError('Invalid admin pass key. Please contact your administrator.')
      } else if (error.message?.includes('Password should be at least 6 characters')) {
        setGeneralError('Password must be at least 6 characters long.')
      } else if (error.message?.includes('Email rate limit exceeded')) {
        setGeneralError('Too many signup attempts. Please try again later.')
      } else {
        setGeneralError(error.message || 'Signup failed. Please try again.')
      }
      
      console.error('Signup error:', error)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <FloatingBubbles />
        <div className="max-w-md w-full animate-scale-in">
          <GlassCard className="text-center p-12">
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6 animate-pulse">
              <CheckCircle2 className="w-12 h-12 text-green-500" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Account Created!</h2>
            <p className="text-muted-foreground mb-6">
              Welcome to HtracX. Redirecting to login...
            </p>
            <div className="flex justify-center">
              <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          </GlassCard>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-12">
      <FloatingBubbles />

      {/* Theme Toggle - Fixed Position */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="max-w-md w-full animate-fade-in">
        <div className="text-center mb-8 animate-slide-up">
          <div className="inline-block mb-4">
            <Sparkles className="w-12 h-12 text-primary animate-pulse-slow mx-auto" />
          </div>
          <h1 className="text-4xl font-bold mb-2">Create Account</h1>
          <p className="text-muted-foreground">Join HtracX and start your journey</p>
        </div>

        <GlassCard className="animate-scale-in">
          {generalError && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 animate-slide-up">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-500">{generalError}</p>
            </div>
          )}

          {!isConfigured && (
            <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl animate-slide-up">
              <p className="text-sm text-yellow-600 dark:text-yellow-500">
                <strong>Demo Mode:</strong> Supabase is not configured. Add your credentials to .env.local to enable authentication.
              </p>
            </div>
          )}

          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setUserType('student')}
              className={`flex-1 py-3 rounded-xl font-medium transition-all duration-300 ${
                userType === 'student'
                  ? 'bg-primary text-primary-foreground shadow-lg scale-105'
                  : 'bg-secondary text-secondary-foreground hover:bg-accent hover:scale-105'
              }`}
            >
              Student
            </button>
            <button
              onClick={() => setUserType('admin')}
              className={`flex-1 py-3 rounded-xl font-medium transition-all duration-300 ${
                userType === 'admin'
                  ? 'bg-primary text-primary-foreground shadow-lg scale-105'
                  : 'bg-secondary text-secondary-foreground hover:bg-accent hover:scale-105'
              }`}
            >
              Admin
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative group">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground transition-colors group-hover:text-primary z-10" />
              <PremiumInput
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                className="pl-11"
              />
            </div>

            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground transition-colors group-hover:text-primary z-10" />
              <PremiumInput
                name="email"
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                className="pl-11"
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground transition-colors group-hover:text-primary z-10" />
              <PremiumInput
                name="password"
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                className="pl-11"
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground transition-colors group-hover:text-primary z-10" />
              <PremiumInput
                name="confirmPassword"
                type="password"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                className="pl-11"
              />
            </div>

            <div className="relative group">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground transition-colors group-hover:text-primary z-10" />
              <PremiumInput
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                error={errors.phone}
                className="pl-11"
              />
            </div>

            {userType === 'student' && (
              <div className="relative group animate-slide-up">
                <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground transition-colors group-hover:text-primary z-10" />
                <PremiumInput
                  name="roomNo"
                  placeholder="Room Number"
                  value={formData.roomNo}
                  onChange={handleChange}
                  error={errors.roomNo}
                  className="pl-11"
                />
              </div>
            )}

            {userType === 'admin' && (
              <div className="relative group animate-slide-up">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground transition-colors group-hover:text-primary z-10" />
                <PremiumInput
                  name="adminPassKey"
                  type="password"
                  placeholder="Admin Pass Key"
                  value={formData.adminPassKey}
                  onChange={handleChange}
                  error={errors.adminPassKey}
                  className="pl-11"
                />
                <p className="text-xs text-muted-foreground mt-2 ml-1">
                  Contact your administrator for the admin pass key
                </p>
              </div>
            )}

            <PremiumButton
              type="submit"
              variant="gradient"
              size="lg"
              className="w-full"
              disabled={loading || !isConfigured}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating Account...
                </span>
              ) : (
                'Sign Up'
              )}
            </PremiumButton>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/auth/login" className="font-medium text-primary hover:underline transition-all hover:scale-105 inline-block">
                Login
              </Link>
            </p>
          </div>
        </GlassCard>

        <div className="text-center mt-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-all hover:scale-105 inline-block">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}