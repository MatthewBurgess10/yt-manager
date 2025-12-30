import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { fetchChannelVideos, fetchVideoComments } from '@/lib/youtube';
import { shouldKeepComment } from '@/lib/filtering';
import { generateEmbeddingsBatched } from '@/lib/embeddings';
import { clusterComments, getTopClusters, getClusterExamples, CommentWithEmbedding } from '@/lib/clustering';
import { generateClusterInsights, generateReplySuggestions } from '@/lib/ai';

const MAX_VIDEOS = parseInt(process.env.MAX_VIDEOS_PER_CHANNEL || '100');
const MAX_COMMENTS_PER_VIDEO = parseInt(process.env.MAX_COMMENTS_PER_VIDEO || '100');

export const maxDuration = 300; // 5 minutes for Vercel Pro

export async function POST(request: NextRequest) {
  let activeJobId: string | null = null;
  try {
    const body = await request.json();
    activeJobId = body.jobId;
    const { channelId } = body;

    if (!activeJobId || !channelId) {
      return NextResponse.json(
        { error: 'Job ID and Channel ID are required' },
        { status: 400 }
      );
    }

    // Update job status to processing
    await updateJobStatus(activeJobId, 'processing', 5);

    // Get channel info
    const { data: job } = await supabaseAdmin
      .from('analysis_jobs')
      .select('*')
      .eq('id', activeJobId)
      .single();

    const targetVideoId = job.metadata.videoId || job.video_id;

    console.log(`DEBUG: Attempting to fetch comments for Video ID: "${targetVideoId}"`);
    
    if (!targetVideoId || targetVideoId.length !== 11) {
      await updateJobStatus(activeJobId, 'failed', 0, `Invalid Video ID: ${targetVideoId}`);
      return NextResponse.json({ error: 'Invalid Video ID' }, { status: 400 });
    }

    // Step 1: Skip fetching multiple videos, just use the one provided
    console.log(`Analyzing specific video: ${targetVideoId}`);
    await updateJobStatus(activeJobId, 'processing', 15);


    // Step 2: Fetch comments for this video
    const allComments: Array<{ videoId: string; text: string; author: string; likes: number; replies: number; publishedAt: string; commentId: string }> = [];


    const comments = await fetchVideoComments(targetVideoId, MAX_COMMENTS_PER_VIDEO);
    console.log(`DEBUG: YouTube API returned ${comments?.length || 0} comments`);

    if (!comments || comments.length === 0) {
        // Check if the API key is working or if comments are disabled on the video
        await updateJobStatus(activeJobId, 'failed', 0, 'No comments found. Please check if comments are disabled on this video.');
        return NextResponse.json({ error: 'No comments found' }, { status: 404 });
    }

    for (const comment of comments) {
      allComments.push({
        videoId: targetVideoId,
        text: comment.text,
        author: comment.authorName,
        likes: comment.likeCount,
        replies: comment.replyCount,
        publishedAt: comment.publishedAt,
        commentId: comment.id,
      });
    }

    // Update progress
    const progress = 15 
    await updateJobStatus(activeJobId, 'processing', progress);

    console.log(`Fetched ${allComments.length} total comments`);

    if (allComments.length === 0) {
      await updateJobStatus(activeJobId, 'failed', 0, 'No comments found');
      return NextResponse.json({ error: 'No comments found' }, { status: 404 });
    }

    // Step 3: Store raw comments and filter
    const filteredComments: Array<{ id: string; text: string; likes: number; replies: number }> = [];
    
    for (const comment of allComments) {
      // Get video UUID
      const { data: videoRecord } = await supabaseAdmin
        .from('videos')
        .select('id')
        .eq('video_id', comment.videoId)
        .single();

      if (!videoRecord) continue;

      const isFiltered = shouldKeepComment(comment.text);

      // Store comment
      const { data: commentRecord } = await supabaseAdmin
        .from('comments')
        .upsert({
          video_id: videoRecord.id,
          comment_id: comment.commentId,
          text: comment.text,
          author_name: comment.author,
          like_count: comment.likes,
          reply_count: comment.replies,
          published_at: comment.publishedAt,
          is_filtered: isFiltered,
        }, {
          onConflict: 'comment_id',
          ignoreDuplicates: false,
        })
        .select()
        .single();

      if (isFiltered && commentRecord) {
        filteredComments.push({
          id: commentRecord.id,
          text: comment.text,
          likes: comment.likes,
          replies: comment.replies,
        });
      }
    }

    console.log(`Filtered to ${filteredComments.length} relevant comments`);
    await updateJobStatus(activeJobId, 'processing', 50);

    if (filteredComments.length === 0) {
      await updateJobStatus(activeJobId, 'failed', 0, 'No relevant comments found after filtering');
      return NextResponse.json({ error: 'No relevant comments found' }, { status: 404 });
    }

    // Step 4: Generate embeddings
    console.log('Generating embeddings...');
    const texts = filteredComments.map(c => c.text);
    const embeddings = await generateEmbeddingsBatched(texts);
    await updateJobStatus(activeJobId, 'processing', 65);

    // Step 5: Cluster comments
    console.log('Clustering comments...');
    const commentsWithEmbeddings: CommentWithEmbedding[] = filteredComments.map((c, i) => ({
      id: c.id,
      text: c.text,
      embedding: embeddings[i],
      likeCount: c.likes,
      replyCount: c.replies,
    }));

    const clusters = clusterComments(commentsWithEmbeddings);
    const topClusters = getTopClusters(clusters, 15);
    
    console.log(`Created ${topClusters.length} clusters`);
    await updateJobStatus(activeJobId, 'processing', 75);

    // Step 6: Generate AI insights
    console.log('Generating insights...');
    let insights;
    try {
      insights = await generateClusterInsights(topClusters, job);
      if (!insights || insights.size === 0) {
        throw new Error("AI failed to generate topic labels for your comments.");
      }
    } catch (aiError: any) {
      console.error("AI Insight Error:", aiError);
      throw new Error(`Insight Generation Failed: ${aiError.message}`);
    }
    await updateJobStatus(activeJobId, 'processing', 85);

    // Step 7: Store clusters
    for (const cluster of topClusters) {
      const clusterInsight = insights.get(cluster.id);
      
      const { data: clusterRecord } = await supabaseAdmin
        .from('clusters')
        .insert({
          analysis_job_id: activeJobId,
          channel_id: channelId,
          label: clusterInsight?.label || 'Untitled Topic',
          comment_count: cluster.comments.length,
          total_likes: cluster.totalLikes,
          rank: cluster.rank,
          representative_comment: cluster.representativeComment,
          video_idea: clusterInsight?.videoIdea || '',
          suggested_pinned_reply: clusterInsight?.suggestedPinnedReply || '',
        })
        .select()
        .single();

      if (clusterRecord) {
        // Store cluster-comment relationships
        for (const comment of cluster.comments) {
          await supabaseAdmin.from('cluster_comments').insert({
            cluster_id: clusterRecord.id,
            comment_id: comment.id,
          });
        }
      }
    }

    // Step 8: Generate reply opportunities
    console.log('Generating reply opportunities...');
    const highPriorityComments = topClusters
      .flatMap(cluster => 
        cluster.comments
          .sort((a, b) => b.likeCount - a.likeCount)
          .slice(0, 2)
          .map(c => ({
            text: c.text,
            likeCount: c.likeCount,
            replyCount: c.replyCount,
            clusterLabel: insights.get(cluster.id)?.label,
            commentId: c.id,
            clusterId: cluster.id,
          }))
      )
      .slice(0, 15);

    const replyOpportunities = await generateReplySuggestions(
      highPriorityComments,
      channelId
    );

    // Store reply opportunities
    for (let i = 0; i < replyOpportunities.length; i++) {
      const opportunity = replyOpportunities[i];
      const comment = highPriorityComments[i];

      if (comment) {
        await supabaseAdmin.from('reply_opportunities').insert({
          analysis_job_id: activeJobId,
          cluster_id: comment.clusterId,
          comment_id: comment.commentId,
          reason: opportunity.reason,
          suggested_reply: opportunity.suggestedReply,
          priority_score: opportunity.priorityScore,
        });
      }
    }

    await updateJobStatus(activeJobId, 'processing', 95);

    // Step 9: Generate PDF (placeholder for now)
    console.log('Generating PDF...');
    // TODO: Implement PDF generation
    const pdfUrl = await generatePDF(activeJobId, channelId);
    
    // Mark job as complete
    await supabaseAdmin
      .from('analysis_jobs')
      .update({
        status: 'complete',
        progress: 100,
        completed_at: new Date().toISOString(),
        pdf_url: pdfUrl,
      })
      .eq('id', activeJobId);

    console.log('Analysis complete!');

    return NextResponse.json({
      success: true,
      activeJobId,
      message: 'Analysis completed successfully',
    });

  } catch (error) {
    console.error('Error in process-analysis:', error);
    
    if (activeJobId) {
      await updateJobStatus(
        activeJobId,
        'failed',
        0,
        error instanceof Error ? error.message : 'Unknown error'
      );

      return NextResponse.json(
        { error: 'Analysis processing failed' },
        { status: 500 }
      );
    }
  }
}

async function updateJobStatus(
  jobId: string,
  status: string,
  progress: number,
  errorMessage?: string
) {
  await supabaseAdmin
    .from('analysis_jobs')
    .update({
      status,
      progress,
      error_message: errorMessage,
      ...(status === 'processing' && !errorMessage ? { started_at: new Date().toISOString() } : {}),
    })
    .eq('id', jobId);
}

async function generatePDF(jobId: string, channelId: string): Promise<string> {
  const { generateAnalysisPDF } = await import('@/lib/pdf');
  return await generateAnalysisPDF(jobId, channelId);
}