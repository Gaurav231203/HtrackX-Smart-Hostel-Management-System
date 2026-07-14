"use client"

import Link from 'next/link'
import Image from 'next/image'
import ThemeToggle from './ThemeToggle'
import { Menu, X, LogOut } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

export default function Navigation() {
  const router = useRouter()
  const { user, profile, signOut } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogout = async () => {
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative w-10 h-10 transition-transform group-hover:scale-110 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg p-0.5 shadow-lg">
              <div className="w-full h-full bg-white dark:bg-gray-900 rounded-lg flex items-center justify-center overflow-hidden">
                <Image
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/ed113bff-e381-44df-87a7-426a8e91f794/generated_images/modern-minimalist-college-building-logo--eb88a32e-20251128113748.jpg"
                  alt="HtracX Logo"
                  width={40}
                  height={40}
                  className="object-cover rounded-md"
                  priority
                  unoptimized
                />
              </div>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent drop-shadow-sm">
              HtracX
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {!user ? (
              <>
                <Link href="/#features" className="text-sm font-medium hover:text-primary transition-colors">
                  Features
                </Link>
                <Link href="/#about" className="text-sm font-medium hover:text-primary transition-colors">
                  About
                </Link>
                <Link href="/onboarding" className="text-sm font-medium hover:text-primary transition-colors">
                  Get Started
                </Link>
                <Link href="/auth/login" className="text-sm font-medium hover:text-primary transition-colors">
                  Login
                </Link>
              </>
            ) : (
              <>
                <Link 
                  href={profile?.user_type === 'admin' ? '/dashboard/admin' : '/dashboard/student'}
                  className="text-sm font-medium hover:text-primary transition-colors"
                >
                  Dashboard
                </Link>
                <span className="text-sm text-muted-foreground">
                  {profile?.name || user.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            )}
            {mounted && <ThemeToggle />}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-2">
            {mounted && <ThemeToggle />}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl hover:bg-secondary transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-card border-t animate-slide-up">
          <div className="px-4 py-4 space-y-3">
            {!user ? (
              <>
                <Link
                  href="/#features"
                  className="block py-2 text-sm font-medium hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Features
                </Link>
                <Link
                  href="/#about"
                  className="block py-2 text-sm font-medium hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  About
                </Link>
                <Link
                  href="/onboarding"
                  className="block py-2 text-sm font-medium hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Get Started
                </Link>
                <Link
                  href="/auth/login"
                  className="block py-2 text-sm font-medium hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
              </>
            ) : (
              <>
                <Link
                  href={profile?.user_type === 'admin' ? '/dashboard/admin' : '/dashboard/student'}
                  className="block py-2 text-sm font-medium hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <div className="py-2 text-sm text-muted-foreground">
                  {profile?.name || user.email}
                </div>
                <button
                  onClick={() => {
                    handleLogout()
                    setMobileMenuOpen(false)
                  }}
                  className="block py-2 text-sm font-medium hover:text-primary transition-colors text-left w-full"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}