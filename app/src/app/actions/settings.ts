'use server'

import { createAdminClient } from '@/lib/supabase'

const SETTINGS_SLUG = 'system-settings-kv'
const DEFAULT_SETTINGS = {
  whatsapp: '',
  instagram: '',
  email: '',
  tiktok: '',
  address: '',
  enableFreeTrial: false
}

export async function getSettings() {
  const supabase = createAdminClient()
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('description')
      .eq('slug', SETTINGS_SLUG)
      .single()

    if (error || !data || !data.description) {
      return DEFAULT_SETTINGS
    }
    
    return { ...DEFAULT_SETTINGS, ...JSON.parse(data.description) }
  } catch (err) {
    console.error('Error reading settings from Supabase:', err)
    return DEFAULT_SETTINGS
  }
}

export async function updateSettings(data: any) {
  const supabase = createAdminClient()
  const settingsJson = JSON.stringify(data)
  
  try {
    // Check if row exists
    const { data: existingData } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', SETTINGS_SLUG)
      .single()
    
    if (existingData && existingData.id) {
      const { error } = await supabase
        .from('categories')
        .update({ description: settingsJson })
        .eq('id', existingData.id)
      if (error) throw error
    } else {
      const { error } = await supabase
        .from('categories')
        .insert({
          name: 'System Settings',
          slug: SETTINGS_SLUG,
          description: settingsJson,
          image_url: 'system'
        })
      if (error) throw error
    }
    return { success: true }
  } catch (err: any) {
    console.error('Error writing settings to Supabase:', err)
    return { success: false, error: err.message }
  }
}
