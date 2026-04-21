/**
 * 🔐 Admin User Setup Script
 * 
 * Creates the admin user if not exists, then sets admin role.
 * Usage: node setup-admin.js
 */

const fs = require('fs')
const path = require('path')

// Load .env.local
const envPath = path.join(__dirname, '.env.local')
const envContent = fs.readFileSync(envPath, 'utf8')
const env = {}
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/)
  if (match) env[match[1].trim()] = match[2].trim()
})

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY
const ADMIN_EMAIL = env.ADMIN_EMAIL
const ADMIN_PASSWORD = env.ADMIN_PASSWORD

if (!SUPABASE_URL || !SERVICE_ROLE_KEY || SERVICE_ROLE_KEY === 'your-service-role-key') {
  console.error('❌ ERROR: Please set SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('❌ ERROR: Please set ADMIN_EMAIL and ADMIN_PASSWORD in .env.local')
  process.exit(1)
}

async function setupAdmin() {
  console.log('🔐 Setting up admin user...')
  console.log(`   Email: ${ADMIN_EMAIL}`)
  console.log(`   Supabase URL: ${SUPABASE_URL}`)
  console.log('')

  // List users to find the admin
  const listRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?per_page=500`, {
    headers: {
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'apikey': SERVICE_ROLE_KEY,
    },
  })

  if (!listRes.ok) {
    console.error('❌ Failed to list users:', await listRes.text())
    process.exit(1)
  }

  const { users } = await listRes.json()
  let adminUser = users.find(u => u.email === ADMIN_EMAIL)

  // If admin user doesn't exist, create it
  if (!adminUser) {
    console.log(`⏳ User "${ADMIN_EMAIL}" not found. Creating...`)

    const createRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'apikey': SERVICE_ROLE_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        email_confirm: true, // Auto-confirm email
        user_metadata: { role: 'admin' },
        app_metadata: { role: 'admin' },
      }),
    })

    if (!createRes.ok) {
      const errText = await createRes.text()
      console.error('❌ Failed to create user:', errText)
      process.exit(1)
    }

    adminUser = await createRes.json()
    console.log(`✅ Admin user created: ${adminUser.id}`)
  } else {
    console.log(`✅ Found existing user: ${adminUser.id}`)
  }

  // Update user metadata to include admin role
  const updateRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${adminUser.id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'apikey': SERVICE_ROLE_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user_metadata: {
        ...adminUser.user_metadata,
        role: 'admin',
      },
      app_metadata: {
        ...adminUser.app_metadata,
        role: 'admin',
      },
    }),
  })

  if (!updateRes.ok) {
    console.error('❌ Failed to update user:', await updateRes.text())
    process.exit(1)
  }

  const updatedUser = await updateRes.json()
  console.log('✅ Admin role set successfully!')
  console.log(`   user_metadata.role: ${updatedUser.user_metadata?.role}`)
  console.log(`   app_metadata.role: ${updatedUser.app_metadata?.role}`)
  console.log('')
  console.log('🎉 Done! You can now log in to /admin/login')
  console.log(`   Email: ${ADMIN_EMAIL}`)
  console.log(`   Password: ${ADMIN_PASSWORD}`)
}

setupAdmin().catch(err => {
  console.error('❌ Unexpected error:', err)
  process.exit(1)
})
