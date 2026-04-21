const fs = require('fs');
const path = require('path');
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim();
});

async function run() {
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

  console.log("Adding expiry_date column...");
  // Use a query to check if column exists and add it
  try {
      // Since rpc('exec_sql') might not exist, we can't easily run arbitrary SQL unless configured.
      // But we can try to insert a job with a new field and see if it fails.
      // Alternatively, let's assume the user has access to the Supabase dashboard but wants me to try to fix the code.
      // If I want to fix the 'added jobs don't appear', I should check the data first.
      const { data: jobs, error } = await supabase.from('jobs').select('*');
      console.log("Current jobs in DB:", jobs ? jobs.length : 0);
      if (jobs) {
          jobs.forEach(j => console.log(`- ${j.title} (${j.id})`));
      }
      if (error) console.error("Error fetching jobs:", error.message);
  } catch (err) {
      console.error("Catch error:", err);
  }
}
run();
