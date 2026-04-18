import { createAdminClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// GET /api/admin/jobs — fetch semua loker beserta media
export async function GET() {
  try {
    const supabase = createAdminClient()
    const { data: jobs, error } = await supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    if (!jobs || jobs.length === 0) {
      return NextResponse.json({ jobs: [] })
    }

    // Fetch media untuk setiap job (skipped if media_jobs table doesn't exist)
    let jobsWithMedia = jobs.map(job => ({ ...job, media: [] }))
    try {
      jobsWithMedia = await Promise.all(
        jobs.map(async (job) => {
          const { data: mediaData, error: mediaErr } = await supabase
            .from('media_jobs')
            .select('id, type, url')
            .eq('job_id', job.id)
          return { ...job, media: mediaErr ? [] : (mediaData || []) }
        })
      )
    } catch {
      console.warn('media_jobs table not available, returning jobs without media')
    }

    return NextResponse.json({ jobs: jobsWithMedia })
  } catch (error: any) {
    console.error('GET /api/admin/jobs error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/admin/jobs — buat loker baru
export async function POST(request: Request) {
  try {
    const supabase = createAdminClient()
    const body = await request.json()
    const { media, ...jobData } = body

    let newJob = null;
    let insertError = null;

    const res = await supabase.from('jobs').insert(jobData).select().single();
    
    if (res.error && res.error.code === 'PGRST204' && res.error.message.includes('expiry_date')) {
      console.warn('Schema cache error for expiry_date, falling back without expiry_date.');
      const { expiry_date, ...safeJobData } = jobData;
      const retryRes = await supabase.from('jobs').insert(safeJobData).select().single();
      newJob = retryRes.data;
      insertError = retryRes.error;
    } else {
      newJob = res.data;
      insertError = res.error;
    }

    if (insertError) throw insertError
    if (!newJob) throw new Error('Gagal membuat loker')

    // Insert media jika ada (skipped if media_jobs table doesn't exist)
    if (media && media.length > 0) {
      try {
        const mediaToInsert = media.map((m: any) => ({
          job_id: newJob.id,
          type: m.type,
          url: m.url,
        }))
        const { error: mediaError } = await supabase.from('media_jobs').insert(mediaToInsert)
        if (mediaError) {
          if (mediaError.code === 'PGRST205') {
            console.warn('media_jobs table does not exist yet. Run migration to enable media upload.')
          } else {
            console.error('Error inserting media:', mediaError)
          }
        }
      } catch (e) {
        console.warn('Media insert skipped:', e)
      }
    }

    return NextResponse.json({ job: newJob, success: true })
  } catch (error: any) {
    console.error('POST /api/admin/jobs error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT /api/admin/jobs — update loker
export async function PUT(request: Request) {
  try {
    const supabase = createAdminClient()
    const body = await request.json()
    const { id, media, ...jobData } = body

    if (!id) return NextResponse.json({ error: 'ID diperlukan' }, { status: 400 })

    let updateError = null;
    const res = await supabase.from('jobs').update(jobData).eq('id', id);

    if (res.error && res.error.code === 'PGRST204' && res.error.message.includes('expiry_date')) {
      console.warn('Schema cache error for expiry_date on update, falling back without expiry_date.');
      const { expiry_date, ...safeJobData } = jobData;
      const retryRes = await supabase.from('jobs').update(safeJobData).eq('id', id);
      updateError = retryRes.error;
    } else {
      updateError = res.error;
    }

    if (updateError) throw updateError

    // Hapus media lama lalu insert baru
    try {
      await supabase.from('media_jobs').delete().eq('job_id', id)
      if (media && media.length > 0) {
        const mediaToInsert = media.map((m: any) => ({
          job_id: id,
          type: m.type,
          url: m.url,
        }))
        const { error: mediaError } = await supabase.from('media_jobs').insert(mediaToInsert)
        if (mediaError && mediaError.code !== 'PGRST205') {
          console.error('Error updating media:', mediaError)
        }
      }
    } catch {
      console.warn('media_jobs table not available, media not updated')
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('PUT /api/admin/jobs error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE /api/admin/jobs?id=xxx — hapus loker
export async function DELETE(request: Request) {
  try {
    const supabase = createAdminClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) return NextResponse.json({ error: 'ID diperlukan' }, { status: 400 })

    // Hapus media dulu (ignore error if table doesn't exist)
    try {
      await supabase.from('media_jobs').delete().eq('job_id', id)
    } catch { /* table may not exist */ }

    // Hapus loker
    const { error } = await supabase.from('jobs').delete().eq('id', id)
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('DELETE /api/admin/jobs error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
