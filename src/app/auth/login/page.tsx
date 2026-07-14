"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import FloatingBubbles from '@/components/FloatingBubbles'
import GlassCard from '@/components/ui/GlassCard'
import PremiumButton from '@/components/ui/PremiumButton'
import PremiumInput from '@/components/ui/PremiumInput'
import ThemeToggle from '@/components/ThemeToggle'
import { Mail, Lock, Sparkles, AlertCircle } from 'lucide-react'
import { signIn } from '@/lib/api/auth'
import { useAuth } from '@/contexts/AuthContext'

export default function LoginPage() {
  const router = useRouter()
  const { isConfigured } = useAuth()
  const [userType, setUserType] = useState<'student' | 'admin'>('student')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [generalError, setGeneralError] = useState('')
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
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

    if (!formData.email.trim()) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid'
    
    if (!formData.password) newErrors.password = 'Password is required'

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
      const { user, profile } = await signIn(formData.email, formData.password)

      if (profile.user_type !== userType) {
        setGeneralError(`This account is registered as a ${profile.user_type}. Please select the correct user type.`)
        setLoading(false)
        return
      }

      if (profile.user_type === 'student') {
        router.push('/dashboard/student')
      } else {
        router.push('/dashboard/admin')
      }
    } catch (error: any) {
      setLoading(false)
      
      if (error.message?.includes('Invalid login credentials')) {
        setGeneralError('Invalid email or password. Please try again.')
      } else if (error.message?.includes('Email not confirmed')) {
        setGeneralError('Please verify your email before logging in.')
      } else if (error.message?.includes('User not found')) {
        setGeneralError('No account found with this email.')
      } else {
        setGeneralError(error.message || 'Login failed. Please try again.')
      }
      
      console.error('Login error:', error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
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
          <h1 className="text-4xl font-bold mb-2">Welcome Back</h1>
          <p className="text-muted-foreground">Login to access your dashboard</p>
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
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground transition-colors group-hover:text-primary" />
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
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground transition-colors group-hover:text-primary" />
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

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center space-x-2 cursor-pointer group">
                <input 
                  type="checkbox" 
                  className="rounded transition-all group-hover:scale-110" 
                />
                <span className="text-muted-foreground group-hover:text-foreground transition-colors">Remember me</span>
              </label>
            </div>

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
                  Logging in...
                </span>
              ) : (
                'Login'
              )}
            </PremiumButton>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link href="/auth/signup" className="font-medium text-primary hover:underline transition-all hover:scale-105 inline-block">
                Sign Up
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