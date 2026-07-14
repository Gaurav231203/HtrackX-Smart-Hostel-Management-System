"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import FloatingBubbles from '@/components/FloatingBubbles'
import GlassCard from '@/components/ui/GlassCard'
import PremiumButton from '@/components/ui/PremiumButton'
import PremiumInput from '@/components/ui/PremiumInput'
import { ArrowLeft, Plus, Edit2, Save, X, Loader2, AlertCircle } from 'lucide-react'

interface MenuItem {
  id: string
  day: string
  meal_type: 'breakfast' | 'lunch' | 'snacks' | 'dinner'
  items: string[]
  description?: string
  image_url?: string
  created_at: string
  updated_at: string
}

interface MenuData {
  breakfast: MenuItem | null
  lunch: MenuItem | null
  snacks: MenuItem | null
  dinner: MenuItem | null
}

export default function MessMenuEditorPage() {
  const router = useRouter()
  const { user, profile, isConfigured } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [editingMeal, setEditingMeal] = useState<keyof MenuData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [menuData, setMenuData] = useState<MenuData>({
    breakfast: null,
    lunch: null,
    snacks: null,
    dinner: null
  })
  const [tempItems, setTempItems] = useState<string[]>([])
  const [selectedDay, setSelectedDay] = useState<string>('')

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  const mealConfig = [
    { key: 'breakfast' as keyof MenuData, icon: '🌅', title: 'Breakfast', time: '7:00 AM - 9:00 AM' },
    { key: 'lunch' as keyof MenuData, icon: '☀️', title: 'Lunch', time: '12:00 PM - 2:00 PM' },
    { key: 'snacks' as keyof MenuData, icon: '🍪', title: 'Snacks', time: '4:00 PM - 5:00 PM' },
    { key: 'dinner' as keyof MenuData, icon: '🌙', title: 'Dinner', time: '7:00 PM - 9:00 PM' }
  ]

  useEffect(() => {
    if (profile?.user_type !== 'admin') {
      router.push('/auth/login')
      return
    }

    // Set today's day by default
    const todayIndex = new Date().getDay()
    setSelectedDay(days[todayIndex])
  }, [profile, router])

  useEffect(() => {
    if (selectedDay && isConfigured) {
      fetchMenu(selectedDay)
    }
  }, [selectedDay, isConfigured])

  const fetchMenu = async (day: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/mess-menu?day=${day}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch menu')
      }

      const data = result.data || []
      const newMenuData: MenuData = {
        breakfast: data.find((m: MenuItem) => m.meal_type === 'breakfast') || null,
        lunch: data.find((m: MenuItem) => m.meal_type === 'lunch') || null,
        snacks: data.find((m: MenuItem) => m.meal_type === 'snacks') || null,
        dinner: data.find((m: MenuItem) => m.meal_type === 'dinner') || null
      }

      setMenuData(newMenuData)
    } catch (err: any) {
      console.error('Error fetching menu:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (mealKey: keyof MenuData) => {
    setEditingMeal(mealKey)
    const meal = menuData[mealKey]
    setTempItems(meal?.items ? [...meal.items] : [])
    setIsEditing(true)
  }

  const handleSave = async () => {
    if (!editingMeal || !selectedDay || !isConfigured) return

    setSaving(true)
    setError(null)

    try {
      const response = await fetch('/api/mess-menu/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          day: selectedDay,
          meal_type: editingMeal,
          items: tempItems.filter(item => item.trim() !== '')
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update menu')
      }

      // Update local state
      setMenuData({
        ...menuData,
        [editingMeal]: result.data
      })

      setIsEditing(false)
      setEditingMeal(null)
      setTempItems([])
      alert('✅ Menu updated successfully!')
    } catch (err: any) {
      console.error('Error updating menu:', err)
      alert(err.message || 'Failed to update menu')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditingMeal(null)
    setTempItems([])
  }

  const addItem = () => {
    setTempItems([...tempItems, ''])
  }

  const updateItem = (index: number, value: string) => {
    const newItems = [...tempItems]
    newItems[index] = value
    setTempItems(newItems)
  }

  const removeItem = (index: number) => {
    setTempItems(tempItems.filter((_, i) => i !== index))
  }

  if (!user || profile?.user_type !== 'admin') {
    return null
  }

  return (
    <div className="min-h-screen">
      <FloatingBubbles />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <button
          onClick={() => router.push('/dashboard/admin')}
          className="flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Dashboard
        </button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">🍽️ Mess Menu Editor</h1>
          <p className="text-muted-foreground">Update daily mess menu for all meals</p>
        </div>

        {!isConfigured && (
          <div className="mb-8 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
            <p className="text-sm text-yellow-600 dark:text-yellow-500">
              <strong>Demo Mode:</strong> Supabase is not configured. Add your credentials to .env.local to enable full functionality.
            </p>
          </div>
        )}

        {/* Day Selector */}
        <GlassCard className="p-6 mb-6">
          <label className="block text-sm font-medium mb-3">Select Day</label>
          <div className="grid grid-cols-7 gap-2">
            {days.map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                disabled={isEditing}
                className={`px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                  selectedDay === day
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'bg-secondary hover:bg-accent'
                } ${isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {day.substring(0, 3)}
              </button>
            ))}
          </div>
        </GlassCard>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <GlassCard className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <PremiumButton onClick={() => fetchMenu(selectedDay)} variant="outline" size="sm">
              Retry
            </PremiumButton>
          </GlassCard>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {mealConfig.map((meal) => {
              const mealData = menuData[meal.key]
              const items = mealData?.items || []

              return (
                <GlassCard key={meal.key} hover className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-3xl">{meal.icon}</span>
                        <h3 className="font-semibold text-xl">{meal.title}</h3>
                      </div>
                      <p className="text-xs text-muted-foreground">{meal.time}</p>
                    </div>
                    {!isEditing && (
                      <PremiumButton
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(meal.key)}
                        disabled={!isConfigured}
                      >
                        <Edit2 className="w-4 h-4" />
                      </PremiumButton>
                    )}
                  </div>

                  {editingMeal === meal.key ? (
                    <div className="space-y-3">
                      {tempItems.map((item, index) => (
                        <div key={index} className="flex gap-2">
                          <PremiumInput
                            value={item}
                            onChange={(e) => updateItem(index, e.target.value)}
                            placeholder="Menu item"
                          />
                          <button
                            onClick={() => removeItem(index)}
                            className="p-3 rounded-xl hover:bg-destructive/10 text-destructive transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                      <PremiumButton
                        variant="outline"
                        size="sm"
                        onClick={addItem}
                        className="w-full"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Item
                      </PremiumButton>
                    </div>
                  ) : items.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground">No menu items yet</p>
                      <PremiumButton
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(meal.key)}
                        disabled={!isConfigured}
                        className="mt-2"
                      >
                        Add Items
                      </PremiumButton>
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {items.map((item, index) => (
                        <li key={index} className="flex items-center text-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary mr-3" />
                          <span className="text-muted-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </GlassCard>
              )
            })}
          </div>
        )}

        {isEditing && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
            <GlassCard className="p-4 flex items-center gap-4 shadow-premium-lg">
              <PremiumButton 
                variant="gradient" 
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    Save Changes
                  </>
                )}
              </PremiumButton>
              <PremiumButton 
                variant="outline" 
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </PremiumButton>
            </GlassCard>
          </div>
        )}
      </div>
    </div>
  )
}