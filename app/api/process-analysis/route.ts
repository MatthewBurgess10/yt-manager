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
  try {
    const body = await request.json();
    const { jobId, channelId } = body;

    if (!jobId || !channelId) {
      return NextResponse.json(
        { error: 'Job ID and Channel ID are required' },
        { status: 400 }
      );
    }

    // Update job status to processing
    await updateJobStatus(jobId, 'processing', 5);

    // Get channel info
    const { data: channel } = await supabaseAdmin
      .from('channels')
      .select('*')
      .eq('id', channelId)
      .single();

    if (!channel) {
      await updateJobStatus(jobId, 'failed', 0, 'Channel not found');
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
    }

    // Step 1: Fetch videos
    console.log(`Fetching videos for channel: ${channel.channel_name}`);
    const videos = await fetchChannelVideos(channel.channel_id, MAX_VIDEOS);
    await updateJobStatus(jobId, 'processing', 15);

    if (videos.length === 0) {
      await updateJobStatus(jobId, 'failed', 0, 'No videos found');
      return NextResponse.json({ error: 'No videos found' }, { status: 404 });
    }

    // Store videos in database
    for (const video of videos) {
      await supabaseAdmin.from('videos').upsert({
        channel_id: channelId,
        video_id: video.id,
        title: video.title,
        published_at: video.publishedAt,
        view_count: video.viewCount,
        comment_count: video.commentCount,
      }, {
        onConflict: 'video_id',
        ignoreDuplicates: false,
      });
    }

    // Step 2: Fetch comments from all videos
    console.log(`Fetching comments from ${videos.length} videos`);
    const allComments: Array<{ videoId: string; text: string; author: string; likes: number; replies: number; publishedAt: string; commentId: string }> = [];
    
    for (let i = 0; i < videos.length; i++) {
      const video = videos[i];
      const comments = await fetchVideoComments(video.id, MAX_COMMENTS_PER_VIDEO);
      
      for (const comment of comments) {
        allComments.push({
          videoId: video.id,
          text: comment.text,
          author: comment.authorName,
          likes: comment.likeCount,
          replies: comment.replyCount,
          publishedAt: comment.publishedAt,
          commentId: comment.id,
        });
      }

      // Update progress
      const progress = 15 + Math.floor((i / videos.length) * 30);
      await updateJobStatus(jobId, 'processing', progress);
    }

    console.log(`Fetched ${allComments.length} total comments`);

    if (allComments.length === 0) {
      await updateJobStatus(jobId, 'failed', 0, 'No comments found');
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
    await updateJobStatus(jobId, 'processing', 50);

    if (filteredComments.length === 0) {
      await updateJobStatus(jobId, 'failed', 0, 'No relevant comments found after filtering');
      return NextResponse.json({ error: 'No relevant comments found' }, { status: 404 });
    }

    // Step 4: Generate embeddings
    console.log('Generating embeddings...');
    const texts = filteredComments.map(c => c.text);
    const embeddings = await generateEmbeddingsBatched(texts);
    await updateJobStatus(jobId, 'processing', 65);

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
    await updateJobStatus(jobId, 'processing', 75);

    // Step 6: Generate AI insights
    console.log('Generating insights...');
    const insights = await generateClusterInsights(topClusters, channel.channel_name);
    await updateJobStatus(jobId, 'processing', 85);

    // Step 7: Store clusters
    for (const cluster of topClusters) {
      const clusterInsight = insights.get(cluster.id);
      
      const { data: clusterRecord } = await supabaseAdmin
        .from('clusters')
        .insert({
          analysis_job_id: jobId,
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
      channel.channel_name
    );

    // Store reply opportunities
    for (let i = 0; i < replyOpportunities.length; i++) {
      const opportunity = replyOpportunities[i];
      const comment = highPriorityComments[i];

      if (comment) {
        await supabaseAdmin.from('reply_opportunities').insert({
          analysis_job_id: jobId,
          cluster_id: comment.clusterId,
          comment_id: comment.commentId,
          reason: opportunity.reason,
          suggested_reply: opportunity.suggestedReply,
          priority_score: opportunity.priorityScore,
        });
      }
    }

    await updateJobStatus(jobId, 'processing', 95);

    // Step 9: Generate PDF (placeholder for now)
    console.log('Generating PDF...');
    // TODO: Implement PDF generation
    const pdfUrl = await generatePDF(jobId, channelId);
    
    // Mark job as complete
    await supabaseAdmin
      .from('analysis_jobs')
      .update({
        status: 'complete',
        progress: 100,
        completed_at: new Date().toISOString(),
        pdf_url: pdfUrl,
      })
      .eq('id', jobId);

    console.log('Analysis complete!');

    return NextResponse.json({
      success: true,
      jobId,
      message: 'Analysis completed successfully',
    });

  } catch (error) {
    console.error('Error in process-analysis:', error);
    
    const body = await request.json();
    await updateJobStatus(
      body.jobId,
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