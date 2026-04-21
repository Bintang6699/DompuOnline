import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const envFile = fs.readFileSync('.env.local', 'utf-8')
const env = {}
envFile.split('\n').forEach(line => {
  const [key, ...vals] = line.split('=')
  if (key) env[key.trim()] = vals.join('=').trim()
})

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
async function go() {
  // Let's create a table 'platform_settings' using raw SQL REST API ?
  // Supabase anon key cannot create tables. So how did the user create 'vendors' etc?
  // They usually created it via Supabase GUI.
  // Wait, I can try to use a dummy vendor as settings? No.
  // Maybe I can just check if 'platform_settings' exists.
  const { data, error } = await supabase.from('platform_settings').select('*')
  console.log(error || data)
}
go()
