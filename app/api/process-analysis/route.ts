import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { fetchChannelVideos, fetchVideoComments } from '@/lib/youtube';
import { shouldKeepComment } from '@/lib/filtering';
import { generateEmbeddingsBatched } from '@/lib/embeddings';
import { clusterComments, getTopClusters, CommentWithEmbedding } from '@/lib/clustering';
import { generateClusterInsights, generateReplySuggestions } from '@/lib/ai';

const MAX_COMMENTS_PER_VIDEO = parseInt(process.env.MAX_COMMENTS_PER_VIDEO || '500');
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
    const channelName = job.channels?.channel_name || 'the creator';

    // 1. Fetch Comments & Context
    await updateJobStatus(activeJobId, 'processing', 15);
    const [comments, recentVideos] = await Promise.all([
      fetchVideoComments(targetVideoId, MAX_COMMENTS_PER_VIDEO),
      fetchChannelVideos(channelId, 20)
    ]);

    if (!comments?.length) throw new Error('No comments found.');

    // Log the total found for the user
    console.log(`Analyzing ${comments.length} total comments...`);

    // 2. Filter & Bulk Sync
    const { data: videoRecord } = await supabaseAdmin
      .from('videos')
      .select('id')
      .eq('video_id', targetVideoId)
      .single();

    if (!videoRecord) throw new Error('Video record missing');

    const commentsToUpsert = comments.map(c => ({
      video_id: videoRecord.id,
      comment_id: c.id,
      text: c.text,
      author_name: c.authorName,
      like_count: c.likeCount,
      reply_count: c.replyCount,
      published_at: c.publishedAt,
      is_filtered: shouldKeepComment(c.text),
    }));

    // Perform Upsert
    const { data: syncedComments, error: upsertError } = await supabaseAdmin
      .from('comments')
      .upsert(commentsToUpsert, { onConflict: 'comment_id' })
      .select();

    if (upsertError) throw upsertError;

    // Filter synced records for clustering
    const filteredComments = (syncedComments || []).filter(c => c.is_filtered);
    await updateJobStatus(activeJobId, 'processing', 40);

    if (filteredComments.length === 0) throw new Error('No relevant comments found after filtering.');

    // 3. Embeddings & Clustering
    const texts = filteredComments.map(c => c.text);
    const embeddings = await generateEmbeddingsBatched(texts);
    
    const commentsWithEmbeddings: CommentWithEmbedding[] = filteredComments.map((c, i) => ({
      id: c.id,
      text: c.text,
      embedding: embeddings[i],
      likeCount: c.like_count,
      replyCount: c.reply_count,
    }));

    const clusters = clusterComments(commentsWithEmbeddings);
    const topClusters = getTopClusters(clusters, 10);
    await updateJobStatus(activeJobId, 'processing', 70);

    // 4. AI Insights
    const recentTitles = recentVideos.map(v => v.title);
    const insights = await generateClusterInsights(topClusters, channelName, recentTitles);
    await updateJobStatus(activeJobId, 'processing', 85);

    // 5. Store Results
    for (const cluster of topClusters) {
      const clusterInsight = insights.get(cluster.id);
      
      const { data: clusterRecord } = await supabaseAdmin
        .from('clusters')
        .insert({
          analysis_job_id: activeJobId,
          channel_id: channelId,
          label: clusterInsight?.label || 'General Feedback',
          comment_count: cluster.comments.length,
          total_likes: cluster.totalLikes,
          rank: cluster.rank,
          representative_comment: cluster.representativeComment,
          video_idea: clusterInsight?.videoIdea || '',
          suggested_pinned_reply: clusterInsight?.suggestedPinnedReply || '',
        }).select().single();

      if (clusterRecord) {
        const links = cluster.comments.map(c => ({ cluster_id: clusterRecord.id, comment_id: c.id }));
        await supabaseAdmin.from('cluster_comments').insert(links);
      }
    }

    // 6. Reply Opportunities
    const highPriorityRaw = topClusters.flatMap(c => 
      c.comments.sort((a,b) => b.likeCount - a.likeCount).slice(0, 2).map(comm => ({
        ...comm, clusterLabel: insights.get(c.id)?.label, clusterId: c.id
      }))
    ).slice(0, 15);

    const replySuggestions = await generateReplySuggestions(highPriorityRaw, channelName);
    
    // Safety check on replySuggestions mapping
    const repliesToInsert = (replySuggestions || []).map((s: any) => {
      const original = highPriorityRaw[s.commentIndex];
      if (!original) return null;
      return {
        analysis_job_id: activeJobId,
        cluster_id: original.clusterId,
        comment_id: original.id,
        reason: s.reason,
        suggested_reply: s.suggestedReply,
        priority_score: s.priorityScore
      };
    }).filter(Boolean);

    if (repliesToInsert.length > 0) {
      await supabaseAdmin.from('reply_opportunities').insert(repliesToInsert);
    }

    // 7. PDF & Complete
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
      // Ensure metadata includes the final count for the UI
      metadata: { 
        ...job.metadata, 
        totalAnalyzed: comments.length,
        filteredCount: filteredComments.length 
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