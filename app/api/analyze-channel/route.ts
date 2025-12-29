import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { extractVideoId, fetchVideoDetails } from '@/lib/youtube';

const DUPLICATE_WINDOW_DAYS = parseInt(process.env.DUPLICATE_ANALYSIS_WINDOW_DAYS || '7');

export async function POST(request: NextRequest) {
  try {
    const { videoUrl } = await request.json(); // Input is now videoUrl

    const videoId = extractVideoId(videoUrl);
    if (!videoId) {
      return NextResponse.json({ error: 'Invalid YouTube Video URL' }, { status: 400 });
    }

    const videoDetails = await fetchVideoDetails(videoId);
    if (!videoDetails) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    // 1. Ensure the parent channel exists in our DB
    const { data: channel } = await supabaseAdmin.from('channels').upsert({
      channel_id: videoDetails.channelId,
      channel_name: videoDetails.channelTitle,
    }, { onConflict: 'channel_id' }).select().single();

    // 2. Create the Job with the video ID in metadata
    const { data: job } = await supabaseAdmin.from('analysis_jobs').insert({
      channel_id: channel.id,
      video_id: videoId,
      status: 'pending',
      metadata: { videoId: videoDetails.id, type: 'single_video' } 
    }).select().single();

    // 3. Trigger processing
    fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/process-analysis`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId: job.id, channelId: channel.id }),
    });

    return NextResponse.json({ jobId: job.id, status: 'pending' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to start analysis' }, { status: 500 });
  }
}