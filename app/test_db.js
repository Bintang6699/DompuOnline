const fs = require('fs');
const path = require('path');
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim();
});

async function check() {
  const { createClient } = require('@supabase/supabase-js');
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
  const supabase = createClient(supabaseUrl, SERVICE_ROLE_KEY);

  console.log("Checking Jobs Table...");
  const { data: jobs, error: err1 } = await supabase.from('jobs').select('*').limit(1);
  if (err1) console.error("Jobs error:", err1.message);
  else console.log("Jobs columns:", Object.keys(jobs[0] || {}).join(", "));
  
  // try inserting a test job and check what is missing
  const jobData = {
      title: "Test Job",
      company_name: "Test Co",
      description: "Test Desc",
      requirements: "Test Req",
      contact_info: "Test Info",
      salary_min: 1000,
      salary_max: 2000,
      location: "Dompu, NTB",
      type: "Full-time"
  };
  const { data: insData, error: insErr } = await supabase.from('jobs').insert(jobData).select();
  if (insErr) console.log("Insert Error:", insErr.message);
  else {
      console.log("Inserted job id:", insData[0].id);
      
      // Let's check why they don't show on user page. Wait, do we need vendor_id to be non-null?
      // Wait, let's delete it
      await supabase.from('jobs').delete().eq('id', insData[0].id);
  }
}
check();
