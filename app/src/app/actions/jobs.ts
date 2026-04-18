'use server'

import { createAdminClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

/**
 * Server Action to delete a job.
 * Uses the admin client to bypass potential RLS issues for authenticated admins.
 */
export async function deleteJob(id: string) {
  const supabase = createAdminClient()
  
  // First delete associated media
  await supabase.from('media').delete().eq('job_id', id)
  
  // Then delete the job
  const { error } = await supabase.from('jobs').delete().eq('id', id)
  
  if (error) {
    console.error('Delete Job Error:', error.message)
    return { success: false, error: error.message }
  }
  
  revalidatePath('/admin/jobs')
  revalidatePath('/jobs')
  return { success: true }
}

/**
 * Server Action to save/update a job.
 */
export async function saveJob(data: any, id?: string | null) {
  const supabase = createAdminClient()
  
  const { media, ...jobData } = data
  
  let jobId = id
  
  if (id) {
    // Update
    const { error } = await supabase.from('jobs').update(jobData).eq('id', id)
    if (error) return { success: false, error: error.message }
    
    // Refresh media
    await supabase.from('media').delete().eq('job_id', id)
  } else {
    // Insert
    const { data: inserted, error } = await supabase.from('jobs').insert(jobData).select().single()
    if (error) return { success: false, error: error.message }
    jobId = inserted.id
  }
  
  // Handle media
  if (jobId && media && media.length > 0) {
    const mediaToInsert = media.map((m: any) => ({
      job_id: jobId,
      type: m.type,
      url: m.url
    }))
    await supabase.from('media').insert(mediaToInsert)
  }
  
  revalidatePath('/admin/jobs')
  revalidatePath('/jobs')
  return { success: true, id: jobId }
}
