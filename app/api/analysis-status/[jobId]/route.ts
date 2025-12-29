import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> } // 1. Update Type to Promise
) {
  try {
    const { jobId } = await params; // 2. Await the params

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }

    // Get job status
    const { data: job, error } = await supabaseAdmin
      .from('analysis_jobs')
      .select(`
        *,
        channels (
          channel_id,
          channel_name,
          thumbnail_url,
          subscriber_count
        )
      `)
      .eq('id', jobId)
      .single();

    if (error || !job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      jobId: job.id,
      status: job.status,
      progress: job.progress,
      errorMessage: job.error_message,
      pdfUrl: job.pdf_url,
      channel: job.channels,
      createdAt: job.created_at,
      startedAt: job.started_at,
      completedAt: job.completed_at,
    });

  } catch (error) {
    console.error('Error fetching analysis status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}