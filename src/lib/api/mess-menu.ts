import { supabase } from '@/lib/supabase'
import { Database } from '@/lib/supabase'

type MessMenuInsert = Database['public']['Tables']['mess_menu']['Insert']
type MessMenuUpdate = Database['public']['Tables']['mess_menu']['Update']
type MessMenuRow = Database['public']['Tables']['mess_menu']['Row']

/**
 * Create or update mess menu for a specific day and meal type
 */
export async function setMessMenu(
  day: string,
  mealType: 'breakfast' | 'lunch' | 'snacks' | 'dinner',
  items: string[],
  description?: string,
  imageUrl?: string
): Promise<MessMenuRow> {
  try {
    // Check if menu already exists
    const { data: existingMenu } = await supabase
      .from('mess_menu')
      .select('*')
      .eq('day', day)
      .eq('meal_type', mealType)
      .single()

    if (existingMenu) {
      // Update existing menu
      const { data, error } = await supabase
        .from('mess_menu')
        .update({ items, description, image_url: imageUrl })
        .eq('id', existingMenu.id)
        .select()
        .single()

      if (error) throw error
      return data
    } else {
      // Create new menu
      const menuData: MessMenuInsert = {
        day,
        meal_type: mealType,
        items,
        description: description || null,
        image_url: imageUrl || null,
      }

      const { data, error } = await supabase
        .from('mess_menu')
        .insert(menuData)
        .select()
        .single()

      if (error) throw error
      return data
    }
  } catch (error) {
    console.error('Error setting mess menu:', error)
    throw error
  }
}

/**
 * Get mess menu for a specific day
 */
export async function getMessMenuByDay(day: string): Promise<MessMenuRow[]> {
  try {
    const { data, error } = await supabase
      .from('mess_menu')
      .select('*')
      .eq('day', day)
      .order('meal_type')

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching mess menu:', error)
    throw error
  }
}

/**
 * Get mess menu for a specific day and meal type
 */
export async function getMessMenu(
  day: string,
  mealType: 'breakfast' | 'lunch' | 'snacks' | 'dinner'
): Promise<MessMenuRow | null> {
  try {
    const { data, error } = await supabase
      .from('mess_menu')
      .select('*')
      .eq('day', day)
      .eq('meal_type', mealType)
      .single()

    if (error && error.code !== 'PGRST116') throw error // Ignore "not found" error
    return data || null
  } catch (error) {
    console.error('Error fetching mess menu:', error)
    throw error
  }
}

/**
 * Get all mess menus
 */
export async function getAllMessMenus(): Promise<MessMenuRow[]> {
  try {
    const { data, error } = await supabase
      .from('mess_menu')
      .select('*')
      .order('day')
      .order('meal_type')

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching all mess menus:', error)
    throw error
  }
}

/**
 * Delete a mess menu item
 */
export async function deleteMessMenu(menuId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('mess_menu')
      .delete()
      .eq('id', menuId)

    if (error) throw error
  } catch (error) {
    console.error('Error deleting mess menu:', error)
    throw error
  }
}

/**
 * Upload mess menu image to Supabase Storage
 */
export async function uploadMessMenuImage(file: File, menuId: string): Promise<string> {
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${menuId}-${Date.now()}.${fileExt}`
    const filePath = `mess-menu/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, file)

    if (uploadError) throw uploadError

    // Get public URL
    const { data } = supabase.storage
      .from('images')
      .getPublicUrl(filePath)

    return data.publicUrl
  } catch (error) {
    console.error('Error uploading mess menu image:', error)
    throw error
  }
}
