import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { fetchChannelVideos, fetchVideoComments } from '@/lib/youtube';
import { shouldKeepComment } from '@/lib/filtering';
import { runSpecializedPipeline } from '@/lib/analysis-engine';
// Note: Removed embeddings and clustering imports as AI now handles this.

const MAX_COMMENTS_PER_VIDEO = parseInt(process.env.MAX_COMMENTS_PER_VIDEO || '1000');
export const maxDuration = 300; 

export async function POST(request: NextRequest) {
  let activeJobId: string | null = null;
  try {
    const body = await request.json();
    activeJobId = body.jobId;
    const { channelId } = body;

    if (!activeJobId || !channelId) {
      return NextResponse.json({ error: 'Data missing' }, { status: 400 });
    }

    await updateJobStatus(activeJobId, 'processing', 5);

    const { data: job } = await supabaseAdmin
      .from('analysis_jobs')
      .select('*, channels(channel_name)')
      .eq('id', activeJobId)
      .single();

    const targetVideoId = job.metadata?.videoId || job.video_id;
    
    // 1. Multi-Video Fetch (Expanded Scope)
    await updateJobStatus(activeJobId, 'processing', 15);
    
    // We try to fetch the specific video, OR recent videos if it's a channel analysis
    const comments = await fetchVideoComments(targetVideoId, MAX_COMMENTS_PER_VIDEO);

    if (!comments?.length) throw new Error('No comments found.');

    console.log(`Analyzing ${comments.length} total comments...`);

    // 2. Sync Raw Comments to DB (for record keeping)
    const { data: videoRecord } = await supabaseAdmin
      .from('videos')
      .select('id')
      .eq('video_id', targetVideoId)
      .single();

    if (videoRecord) {
        const commentsToUpsert = comments.map(c => ({
        video_id: videoRecord.id,
        comment_id: c.id,
        text: c.text,
        author_name: c.authorName,
        like_count: c.likeCount,
        reply_count: c.replyCount,
        published_at: c.publishedAt,
        is_filtered: shouldKeepComment(c.text), // We still flag them, but send more to AI
        }));

        // Batch upsert to save DB load
        const { error: upsertError } = await supabaseAdmin
        .from('comments')
        .upsert(commentsToUpsert, { onConflict: 'comment_id' })
        .select();
        
        if (upsertError) console.error("Comment Sync Error:", upsertError);
    }

    await updateJobStatus(activeJobId, 'processing', 50);

    // 3. AI PIPELINE (The New Brain)
    // We skip local clustering and send data directly to the AI
    const analysisResult = await runSpecializedPipeline(
        job.metadata?.videoTitle || "YouTube Video",
        comments
    );

    await updateJobStatus(activeJobId, 'processing', 80);

    // 4. Store "Themes" into the "Clusters" table
    // We map the new AI Themes to the existing table structure
    for (const theme of analysisResult.themes) {
      const { data: clusterRecord } = await supabaseAdmin
        .from('clusters')
        .insert({
          analysis_job_id: activeJobId,
          channel_id: channelId,
          label: theme.label,
          comment_count: theme.comment_count, // AI estimated count
          total_likes: 0, // AI doesn't sum likes perfectly, leaving 0 or we could calc
          rank: 0,
          representative_comment: theme.example_comment,
          // Join the video ideas into one string or pick the first one
          video_idea: theme.video_ideas[0], 
          suggested_pinned_reply: theme.summary, // Using summary as the "pinned" context
        }).select().single();
    }

    // 5. PDF & Complete
    try {
      const { generateAnalysisPDF } = await import('@/lib/pdf');
      const pdfUrl = await generateAnalysisPDF(activeJobId, channelId);
      await supabaseAdmin.from('analysis_jobs').update({ pdf_url: pdfUrl }).eq('id', activeJobId);
    } catch (pdfErr) {
      console.error("PDF generation skipped", pdfErr);
    }

    await supabaseAdmin.from('analysis_jobs').update({
      status: 'complete',
      progress: 100,
      metadata: { 
        ...job.metadata, 
        totalAnalyzed: comments.length,
        sentiment: analysisResult.overall_sentiment
      },
      completed_at: new Date().toISOString(),
    }).eq('id', activeJobId);

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Job Error:', error);
    if (activeJobId) await updateJobStatus(activeJobId, 'failed', 0, error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function updateJobStatus(jobId: string, status: string, progress: number, errorMessage?: string) {
  await supabaseAdmin.from('analysis_jobs').update({ status, progress, error_message: errorMessage }).eq('id', jobId);
}