import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const envPath = path.resolve(__dirname, '../.env.local')
const envContent = fs.readFileSync(envPath, 'utf8')
const env = Object.fromEntries(
  envContent.split('\n')
    .filter(line => line.trim() && !line.startsWith('#'))
    .map(line => {
      const parts = line.split('=')
      return [parts[0].trim(), parts.slice(1).join('=').trim()]
    })
)

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

async function run() {
  // Fetch all vendors ordered by creation time (oldest first)
  const { data: vendors } = await supabase
    .from('vendors')
    .select('id, phone, name')
    .order('created_at', { ascending: true })

  if (!vendors) return

  const seenPhones = new Set<string>()
  const idsToDelete: string[] = []

  for (const v of vendors) {
    if (seenPhones.has(v.phone)) {
      idsToDelete.push(v.id)
    } else {
      seenPhones.add(v.phone)
    }
  }

  console.log(`Found ${idsToDelete.length} duplicate spam entries to delete.`)

  if (idsToDelete.length > 0) {
    // Delete in chunks of 50
    for (let i = 0; i < idsToDelete.length; i += 50) {
      const chunk = idsToDelete.slice(i, i + 50)
      const { error } = await supabase.from('vendors').delete().in('id', chunk)
      if (error) {
        console.error('Error deleting:', error)
      } else {
        console.log(`Deleted chunk of ${chunk.length} vendors.`)
      }
    }
    console.log('Cleanup complete!')
  }
}

run()
