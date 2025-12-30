import { extractVideoId, fetchVideoDetails } from '@/lib/youtube';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Support both naming conventions from frontend
    const url = body.channelUrl || body.videoUrl;

    if (!url) {
      return NextResponse.json({ error: 'No URL provided' }, { status: 400 });
    }

    const videoId = extractVideoId(url);
    if (!videoId) {
      return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 });
    }

    const videoDetails = await fetchVideoDetails(videoId);
    if (!videoDetails) {
      return NextResponse.json({ error: 'Could not find video details' }, { status: 404 });
    }

    // 1. Upsert Channel (Using String ID as Primary Key)
    const { data: channel, error: chanErr } = await supabaseAdmin
      .from('channels')
      .upsert({
        channel_id: videoDetails.channelId,
        channel_name: videoDetails.channelTitle,
      }, { onConflict: 'channel_id' })
      .select()
      .single();

    if (chanErr) throw new Error(`Channel Error: ${chanErr.message}`);

    // 2. Upsert Video (Essential for the analysis worker to find it)
    const { error: vidErr } = await supabaseAdmin
      .from('videos')
      .upsert({
        video_id: videoId,
        channel_id: videoDetails.channelId, // Now matching TEXT type
        title: videoDetails.title,
      }, { onConflict: 'video_id' });

    if (vidErr) throw new Error(`Video Error: ${vidErr.message}`);

    // 3. Create the Analysis Job
    const { data: job, error: jobErr } = await supabaseAdmin
      .from('analysis_jobs')
      .insert({
        channel_id: videoDetails.channelId,
        video_id: videoId,
        status: 'pending',
        progress: 0,
        metadata: { 
          videoTitle: videoDetails.title,
          type: 'single_video' 
        }
      })
      .select()
      .single();

    if (jobErr) throw new Error(`Job Error: ${jobErr.message}`);

    // 4. Trigger the background analysis worker
    // We 'await' this to ensure the trigger is sent before responding to the user
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    // Trigger and walk away - the worker handles the rest
    fetch(`${baseUrl}/api/process-analysis`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        jobId: job.id, 
        channelId: videoDetails.channelId 
      }),
    }).catch(err => console.error("Background trigger failed:", err));

    // Return the jobId so the frontend can start polling status
    return NextResponse.json({ 
      jobId: job.id, 
      status: 'pending' 
    });

  } catch (error: any) {
    console.error("CRITICAL ROUTE ERROR:", error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}