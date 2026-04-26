import { createAdminClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

/**
 * API endpoint untuk menghapus loker yang sudah expired
 * Dapat dipanggil secara manual atau via cron job
 *
 * Usage: POST /api/admin/jobs/cleanup
 */
export async function POST(request: Request) {
  try {
    const supabase = createAdminClient()

    // Fetch all jobs dengan expiry_date yang sudah lewat
    const now = new Date().toISOString().split('T')[0] // Format: YYYY-MM-DD

    const { data: expiredJobs, error: fetchError } = await supabase
      .from('jobs')
      .select('id')
      .not('expiry_date', 'is', null)
      .lte('expiry_date', now)

    if (fetchError) {
      if (fetchError.code === 'PGRST204' && fetchError.message.includes('expiry_date')) {
        console.warn('Schema cache error for expiry_date in cleanup, skipping cleanup.');
        return NextResponse.json({ success: true, message: 'Column expiry_date missing, skipped.', deletedCount: 0 }, { status: 200 })
      }
      console.error('Error fetching expired jobs:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch expired jobs' },
        { status: 500 }
      )
    }

    if (!expiredJobs || expiredJobs.length === 0) {
      return NextResponse.json(
        { success: true, message: 'No expired jobs found', deletedCount: 0 },
        { status: 200 }
      )
    }

    const jobIds = expiredJobs.map(job => job.id)
    let deletedCount = 0

    // Delete media and jobs for each expired job
    for (const jobId of jobIds) {
      try {
        // Delete media first
        await supabase.from('media_jobs').delete().eq('job_id', jobId)

        // Delete job
        const { error: deleteError } = await supabase
          .from('jobs')
          .delete()
          .eq('id', jobId)

        if (!deleteError) {
          deletedCount++
        } else {
          console.error(`Error deleting job ${jobId}:`, deleteError)
        }
      } catch (err) {
        console.error(`Error processing job ${jobId}:`, err)
      }
    }

    console.log(`✅ Cleaned up ${deletedCount} expired jobs`)

    return NextResponse.json(
      {
        success: true,
        message: `Successfully deleted ${deletedCount} expired jobs`,
        deletedCount
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Cleanup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
