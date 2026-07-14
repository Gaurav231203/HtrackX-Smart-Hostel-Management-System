"use client"

import Navigation from '@/components/Navigation'
import FloatingBubbles from '@/components/FloatingBubbles'
import GlassCard from '@/components/ui/GlassCard'
import PremiumButton from '@/components/ui/PremiumButton'
import Link from 'next/link'
import { 
  MapPin, 
  Clock, 
  Utensils, 
  AlertCircle, 
  FileText, 
  Bell,
  Shield,
  Smartphone,
  Zap,
  BarChart3,
  Users,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Star,
  TrendingUp,
  Award,
  Target,
  Layers,
  Globe,
  Lock,
  RefreshCw,
  MessageCircle,
  Heart
} from 'lucide-react'

export default function Home() {
  const features = [
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Smart Attendance",
      description: "AI-powered attendance marking with time-window validation and geofencing. Automated tracking ensures 100% accuracy.",
      gradient: "gradient-primary",
      stats: "99.9% accuracy"
    },
    {
      icon: <MapPin className="w-8 h-8" />,
      title: "Geofencing Security",
      description: "Real-time location monitoring with automatic warden alerts. GPS-based verification keeps students safe 24/7.",
      gradient: "gradient-accent",
      stats: "24/7 monitoring"
    },
    {
      icon: <Utensils className="w-8 h-8" />,
      title: "Digital Mess Menu",
      description: "Daily menu updates with nutritional information. Beautiful presentation for breakfast, lunch, snacks, and dinner.",
      gradient: "gradient-success",
      stats: "4 meals daily"
    },
    {
      icon: <AlertCircle className="w-8 h-8" />,
      title: "Smart Ticket System",
      description: "Raise and track hostel issues instantly. Real-time status updates from submission to resolution.",
      gradient: "gradient-secondary",
      stats: "< 24h response"
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: "Leave Management",
      description: "Digital leave requests with instant approval workflow. Email notifications keep everyone informed.",
      gradient: "gradient-warning",
      stats: "Instant approvals"
    },
    {
      icon: <Bell className="w-8 h-8" />,
      title: "Real-time Alerts",
      description: "Instant push notifications for attendance, announcements, and emergency situations.",
      gradient: "gradient-primary",
      stats: "< 1s delivery"
    },
  ]

  const stats = [
    { number: "10,000+", label: "Active Students", icon: <Users className="w-6 h-6" /> },
    { number: "500+", label: "Hostels", icon: <Globe className="w-6 h-6" /> },
    { number: "99.9%", label: "Uptime", icon: <TrendingUp className="w-6 h-6" /> },
    { number: "4.9/5", label: "User Rating", icon: <Star className="w-6 h-6" /> }
  ]

  const testimonials = [
    {
      name: "Rahul Kumar",
      role: "Computer Science Student",
      college: "IIT Delhi",
      avatar: "👨‍🎓",
      quote: "HtracX transformed our hostel management completely. The attendance system is incredibly accurate and saves us so much time. No more manual registers!",
      rating: 5
    },
    {
      name: "Dr. Priya Sharma",
      role: "Chief Warden",
      college: "NIT Trichy",
      avatar: "👩‍🏫",
      quote: "As a warden, the real-time alert system gives me peace of mind. I can monitor student safety 24/7 and respond to emergencies instantly. Highly recommended!",
      rating: 5
    },
    {
      name: "Amit Patel",
      role: "MBA Student",
      college: "XLRI Jamshedpur",
      avatar: "👨‍💼",
      quote: "The mess menu feature and ticket system are game-changers. I can see what's for dinner and raise maintenance issues from my phone. Simple and effective!",
      rating: 5
    }
  ]

  const benefits = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Military-Grade Security",
      description: "End-to-end encryption with role-based access control"
    },
    {
      icon: <Smartphone className="w-6 h-6" />,
      title: "Mobile-First Design",
      description: "Optimized for smartphones with offline support"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Lightning Performance",
      description: "Sub-second load times with edge caching"
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Advanced Analytics",
      description: "Comprehensive dashboards with actionable insights"
    },
    {
      icon: <RefreshCw className="w-6 h-6" />,
      title: "Auto-Sync Technology",
      description: "Real-time data synchronization across all devices"
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: "Privacy First",
      description: "GDPR compliant with complete data control"
    },
  ]

  const process = [
    {
      step: "01",
      title: "Quick Onboarding",
      description: "Sign up in under 2 minutes. Admin verification ensures security.",
      icon: <Users className="w-8 h-8" />
    },
    {
      step: "02",
      title: "Smart Setup",
      description: "Configure geofencing, set attendance windows, and customize features.",
      icon: <Target className="w-8 h-8" />
    },
    {
      step: "03",
      title: "Go Live",
      description: "Students and wardens start using the system immediately.",
      icon: <Zap className="w-8 h-8" />
    },
    {
      step: "04",
      title: "Track & Optimize",
      description: "Monitor analytics and continuously improve hostel operations.",
      icon: <TrendingUp className="w-8 h-8" />
    }
  ]

  return (
    <div className="min-h-screen">
      <FloatingBubbles />
      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center animate-fade-in">
            <div className="inline-block mb-6 group">
              <span className="px-4 py-2 rounded-full text-sm font-medium glass-card flex items-center gap-2 transition-transform hover:scale-105">
                <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                Trusted by 500+ Hostels Across India
              </span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 transition-all">
              Modern Hostel Management,{' '}
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient">
                Simplified
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed">
              The complete smart hostel management system with AI-powered attendance, 
              GPS-based security, and real-time communication. Trusted by thousands of students and administrators.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link href="/onboarding">
                <PremiumButton variant="gradient" size="lg" className="group">
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                </PremiumButton>
              </Link>
              <Link href="/auth/login">
                <PremiumButton variant="outline" size="lg" className="group hover:bg-foreground hover:text-background">
                  Sign In
                </PremiumButton>
              </Link>
            </div>
            
            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>No Credit Card Required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>14-Day Free Trial</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>Cancel Anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-secondary/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary mb-4">
                  {stat.icon}
                </div>
                <h3 className="text-4xl font-bold mb-2">{stat.number}</h3>
                <p className="text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block mb-4">
              <span className="px-4 py-2 rounded-full text-sm font-medium bg-primary/10 text-primary">
                Features
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              Everything You Need, In One Place
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From attendance tracking to emergency alerts, HtracX covers every aspect of modern hostel management
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <GlassCard
                key={index}
                hover
                className="animate-slide-up group cursor-pointer p-6"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`w-16 h-16 rounded-xl ${feature.gradient} flex items-center justify-center text-white mb-4 shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                  {feature.icon}
                </div>
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-semibold transition-colors group-hover:text-primary">{feature.title}</h3>
                  <span className="text-xs font-semibold px-2 py-1 rounded-full bg-primary/10 text-primary">
                    {feature.stats}
                  </span>
                </div>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block mb-4">
              <span className="px-4 py-2 rounded-full text-sm font-medium bg-primary/10 text-primary">
                Simple Process
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              Get Started in Minutes
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our streamlined onboarding process gets your hostel up and running in no time
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {process.map((item, index) => (
              <div
                key={index}
                className="relative animate-fade-in"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <GlassCard hover className="p-6 text-center h-full">
                  <div className="text-6xl font-bold text-primary/20 mb-4">{item.step}</div>
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary text-white mb-4 shadow-lg">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </GlassCard>
                {index < process.length - 1 && (
                  <div className="hidden md:block absolute top-1/3 -right-4 w-8 h-8 text-primary">
                    <ArrowRight className="w-8 h-8" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block mb-4">
              <span className="px-4 py-2 rounded-full text-sm font-medium bg-primary/10 text-primary flex items-center gap-2">
                <Heart className="w-4 h-4" />
                Testimonials
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              Loved by Students & Wardens
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Don't just take our word for it. Here's what our users have to say about HtracX
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <GlassCard
                key={index}
                hover
                className="p-8 animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                  ))}
                </div>
                <p className="text-muted-foreground italic mb-6 leading-relaxed">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.college}</p>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block mb-4">
              <span className="px-4 py-2 rounded-full text-sm font-medium bg-primary/10 text-primary">
                Why HtracX?
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              Built with Cutting-Edge Technology
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Enterprise-grade infrastructure powering the future of hostel management
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="flex items-start space-x-4 animate-fade-in group cursor-pointer"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center transition-all group-hover:scale-110 group-hover:shadow-lg">
                  {benefit.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1 transition-colors group-hover:text-primary">{benefit.title}</h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="about" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <GlassCard className="text-center p-8 sm:p-12 hover:scale-[1.02] transition-transform relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
                <Award className="w-5 h-5" />
                <span className="font-medium">Join 10,000+ Happy Users</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Ready to Transform Your Hostel?
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Start your 14-day free trial today. No credit card required. Cancel anytime.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/onboarding">
                  <PremiumButton variant="gradient" size="lg" className="group">
                    Get Started Free
                    <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                  </PremiumButton>
                </Link>
                <Link href="/auth/login">
                  <PremiumButton variant="outline" size="lg" className="group">
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Contact Sales
                  </PremiumButton>
                </Link>
              </div>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-lg mb-4">HtracX</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Next-generation hostel management system trusted by institutions nationwide.
              </p>
              <div className="flex gap-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">4.9/5 from 1,200+ reviews</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#about" className="hover:text-foreground transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Cookie Policy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">GDPR</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t text-center">
            <p className="text-muted-foreground mb-2">
              &copy; 2025 HtracX. All rights reserved.
            </p>
            <p className="text-sm text-muted-foreground">
              Made with <Heart className="w-4 h-4 inline text-red-500" /> for the future of campus living
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}