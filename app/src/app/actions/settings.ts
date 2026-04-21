'use server'

import fs from 'fs'
import path from 'path'
import { verifyAdmin } from '@/lib/supabase-server'

const settingsPath = path.join(process.cwd(), 'data', 'settings.json')

export async function getSettings() {
  try {
    if (!fs.existsSync(settingsPath)) {
      return {
        whatsapp: '', instagram: '', email: '', tiktok: '', address: ''
      }
    }
    const data = fs.readFileSync(settingsPath, 'utf8')
    return JSON.parse(data)
  } catch (err) {
    return { whatsapp: '', instagram: '', email: '', tiktok: '', address: '' }
  }
}

export async function updateSettings(data: any) {
  // Verify admin before allowing settings update
  const { isAdmin } = await verifyAdmin()
  if (!isAdmin) {
    return { success: false, error: 'Unauthorized: Admin access required' }
  }

  try {
    const dir = path.dirname(settingsPath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(settingsPath, JSON.stringify(data, null, 2))
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}
