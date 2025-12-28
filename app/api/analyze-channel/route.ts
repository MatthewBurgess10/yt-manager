import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { extractChannelId, resolveChannelId } from '@/lib/youtube';

const DUPLICATE_WINDOW_DAYS = parseInt(process.env.DUPLICATE_ANALYSIS_WINDOW_DAYS || '7');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { channelUrl } = body;

    if (!channelUrl) {
      return NextResponse.json(
        { error: 'Channel URL is required' },
        { status: 400 }
      );
    }

    // Extract channel identifier
    const identifier = extractChannelId(channelUrl);
    if (!identifier) {
      return NextResponse.json(
        { error: 'Invalid YouTube channel URL' },
        { status: 400 }
      );
    }

    // Resolve channel ID and get channel info
    const channelInfo = await resolveChannelId(identifier);
    if (!channelInfo) {
      return NextResponse.json(
        { error: 'Channel not found' },
        { status: 404 }
      );
    }

    // Check for recent analysis (within duplicate window)
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - DUPLICATE_WINDOW_DAYS);

    const { data: existingAnalysis } = await supabaseAdmin
      .from('analysis_jobs')
      .select('id, status, created_at, channel_id')
      .eq('channel_id', channelInfo.id)
      .gte('created_at', cutoffDate.toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (existingAnalysis) {
      // Return existing analysis if complete
      if (existingAnalysis.status === 'complete') {
        return NextResponse.json({
          message: 'Analysis already exists',
          jobId: existingAnalysis.id,
          status: existingAnalysis.status,
          channelId: channelInfo.id,
          isExisting: true,
        });
      }

      // Return existing job if still processing
      if (existingAnalysis.status === 'processing' || existingAnalysis.status === 'pending') {
        return NextResponse.json({
          message: 'Analysis already in progress',
          jobId: existingAnalysis.id,
          status: existingAnalysis.status,
          channelId: channelInfo.id,
          isExisting: true,
        });
      }
    }

    // Create or update channel record
    const { data: channel, error: channelError } = await supabaseAdmin
      .from('channels')
      .upsert({
        channel_id: channelInfo.id,
        channel_name: channelInfo.title,
        thumbnail_url: channelInfo.thumbnailUrl,
        subscriber_count: channelInfo.subscriberCount,
      }, {
        onConflict: 'channel_id',
        ignoreDuplicates: false,
      })
      .select()
      .single();

    if (channelError) {
      console.error('Error creating channel:', channelError);
      return NextResponse.json(
        { error: 'Failed to create channel record' },
        { status: 500 }
      );
    }

    // Create analysis job
    const { data: job, error: jobError } = await supabaseAdmin
      .from('analysis_jobs')
      .insert({
        channel_id: channel.id,
        status: 'pending',
        progress: 0,
      })
      .select()
      .single();

    if (jobError) {
      console.error('Error creating analysis job:', jobError);
      return NextResponse.json(
        { error: 'Failed to create analysis job' },
        { status: 500 }
      );
    }

    // Trigger async processing (fire and forget)
    fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/process-analysis`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId: job.id, channelId: channel.id }),
    }).catch(error => {
      console.error('Error triggering analysis processing:', error);
    });

    return NextResponse.json({
      message: 'Analysis started',
      jobId: job.id,
      status: 'pending',
      channelId: channelInfo.id,
      channelName: channelInfo.title,
      isExisting: false,
    });

  } catch (error) {
    console.error('Error in analyze-channel:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}