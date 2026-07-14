"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import FloatingBubbles from '@/components/FloatingBubbles'
import GlassCard from '@/components/ui/GlassCard'
import PremiumButton from '@/components/ui/PremiumButton'
import { 
  Clock, 
  MapPin, 
  Utensils, 
  AlertCircle, 
  FileText, 
  Bell,
  Home,
  DollarSign,
  Brain,
  Users,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

export default function OnboardingPage() {
  const router = useRouter()
  const [currentCard, setCurrentCard] = useState(0)

  const flashcards = [
    {
      icon: <Clock className="w-16 h-16" />,
      title: "Smart Attendance System",
      description: "Mark your attendance effortlessly between 5:30 PM - 6:30 PM using geofencing technology. Automatic validation ensures you're inside the hostel premises.",
      gradient: "gradient-primary"
    },
    {
      icon: <MapPin className="w-16 h-16" />,
      title: "Geofencing Security",
      description: "Your safety is our priority. If you're outside campus after 9 PM, wardens are automatically alerted to ensure your well-being.",
      gradient: "gradient-accent"
    },
    {
      icon: <Utensils className="w-16 h-16" />,
      title: "Mess Menu Viewer",
      description: "Check today's delicious menu for breakfast, lunch, snacks, and dinner. Plan your meals with beautiful visuals and detailed information.",
      gradient: "gradient-success"
    },
    {
      icon: <AlertCircle className="w-16 h-16" />,
      title: "Ticket & Issue System",
      description: "Report any hostel issues instantly. Track your complaints from submission to resolution with real-time status updates.",
      gradient: "gradient-secondary"
    },
    {
      icon: <FileText className="w-16 h-16" />,
      title: "Leave Application",
      description: "Apply for leave digitally and get instant approvals. No more paperwork - everything is streamlined and transparent.",
      gradient: "gradient-warning"
    },
    {
      icon: <Bell className="w-16 h-16" />,
      title: "Auto Alerts & Notifications",
      description: "Stay updated with real-time notifications for attendance, mess menu changes, ticket updates, and warden announcements.",
      gradient: "gradient-primary"
    },
    {
      icon: <Home className="w-16 h-16" />,
      title: "Room Information (Coming Soon)",
      description: "Access your room details, roommate information, and maintenance schedules - all in one place.",
      gradient: "gradient-accent"
    },
    {
      icon: <DollarSign className="w-16 h-16" />,
      title: "Fee Management (Coming Soon)",
      description: "View pending fees, payment history, and make online payments securely without any hassle.",
      gradient: "gradient-success"
    },
    {
      icon: <Brain className="w-16 h-16" />,
      title: "AI Suggestions (Coming Soon)",
      description: "Get personalized recommendations for mess meals, room maintenance, and hostel activities using AI technology.",
      gradient: "gradient-secondary"
    },
    {
      icon: <Users className="w-16 h-16" />,
      title: "Ready to Get Started?",
      description: "Experience the future of hostel management. Create your account now and join the HtracX community!",
      gradient: "gradient-warning"
    }
  ]

  const nextCard = () => {
    if (currentCard < flashcards.length - 1) {
      setCurrentCard(currentCard + 1)
    } else {
      router.push('/auth/signup')
    }
  }

  const prevCard = () => {
    if (currentCard > 0) {
      setCurrentCard(currentCard - 1)
    }
  }

  const skipToSignup = () => {
    router.push('/auth/signup')
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextCard()
      if (e.key === 'ArrowLeft') prevCard()
      if (e.key === 'Enter' && currentCard === flashcards.length - 1) {
        router.push('/auth/signup')
      }
    }
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [currentCard])

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <FloatingBubbles />

      <div className="max-w-2xl w-full">
        {/* Progress Indicator */}
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <button
            onClick={() => router.push('/')}
            className="text-sm text-muted-foreground hover:text-foreground transition-all hover:scale-105"
          >
            ← Back to Home
          </button>
          <div className="flex items-center space-x-2">
            {flashcards.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentCard
                    ? 'w-8 bg-primary'
                    : index < currentCard
                    ? 'w-2 bg-primary/50'
                    : 'w-2 bg-border'
                }`}
              />
            ))}
          </div>
          <button
            onClick={skipToSignup}
            className="text-sm text-muted-foreground hover:text-foreground transition-all hover:scale-105"
          >
            Skip →
          </button>
        </div>

        {/* Flashcard */}
        <GlassCard 
          key={currentCard}
          className="relative overflow-hidden animate-scale-in min-h-[500px] flex flex-col"
        >
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 sm:p-12">
            <div className={`w-24 h-24 rounded-2xl ${flashcards[currentCard].gradient} flex items-center justify-center text-white mb-8 shadow-premium-lg animate-float`}>
              {flashcards[currentCard].icon}
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 animate-slide-in-left">
              {flashcards[currentCard].title}
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl animate-fade-in" style={{ animationDelay: '0.1s' }}>
              {flashcards[currentCard].description}
            </p>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between px-8 pb-8 pt-4">
            <PremiumButton
              variant="ghost"
              onClick={prevCard}
              disabled={currentCard === 0}
              className="flex items-center space-x-2 transition-all hover:scale-105"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Previous</span>
            </PremiumButton>

            <span className="text-sm text-muted-foreground font-medium">
              {currentCard + 1} / {flashcards.length}
            </span>

            <PremiumButton
              variant={currentCard === flashcards.length - 1 ? 'gradient' : 'primary'}
              onClick={nextCard}
              className="flex items-center space-x-2 transition-all hover:scale-105"
            >
              <span>{currentCard === flashcards.length - 1 ? 'Get Started' : 'Next'}</span>
              <ChevronRight className="w-5 h-5" />
            </PremiumButton>
          </div>
        </GlassCard>

        {/* Swipe Hint */}
        <div className="text-center mt-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <p className="text-sm text-muted-foreground">
            Use arrow keys or buttons to navigate • Press Enter to continue
          </p>
        </div>
      </div>
    </div>
  )
}