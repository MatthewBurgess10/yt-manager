import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const { jobId } = params;

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }

    // Get job and verify it's complete
    const { data: job, error: jobError } = await supabaseAdmin
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

    if (jobError || !job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    if (job.status !== 'complete') {
      return NextResponse.json(
        { error: 'Analysis not yet complete', status: job.status },
        { status: 400 }
      );
    }

    // Get clusters with examples
    const { data: clusters } = await supabaseAdmin
      .from('clusters')
      .select(`
        *,
        cluster_comments (
          comments (
            id,
            text,
            like_count,
            reply_count,
            author_name
          )
        )
      `)
      .eq('analysis_job_id', jobId)
      .order('rank', { ascending: true });

    // Get reply opportunities
    const { data: replyOpportunities } = await supabaseAdmin
      .from('reply_opportunities')
      .select(`
        *,
        comments (
          text,
          like_count,
          reply_count,
          author_name
        ),
        clusters (
          label
        )
      `)
      .eq('analysis_job_id', jobId)
      .order('priority_score', { ascending: false })
      .limit(10);

    // Format clusters for frontend
    const topQuestions = clusters?.map(cluster => ({
      id: cluster.id,
      label: cluster.label,
      commentCount: cluster.comment_count,
      totalLikes: cluster.total_likes,
      rank: cluster.rank,
      examples: cluster.cluster_comments
        ?.slice(0, 3)
        .map((cc: any) => cc.comments.text)
        .filter(Boolean) || [],
      representativeComment: cluster.representative_comment,
    })) || [];

    // Format video ideas
    const videoIdeas = clusters
      ?.filter(c => c.video_idea)
      .map(cluster => ({
        title: cluster.video_idea,
        relatedTopic: cluster.label,
        commentCount: cluster.comment_count,
      })) || [];

    // Format reply opportunities
    const formattedReplyOpportunities = replyOpportunities?.map(opp => ({
      id: opp.id,
      commentText: opp.comments?.text || '',
      commentLikes: opp.comments?.like_count || 0,
      commentReplies: opp.comments?.reply_count || 0,
      commentAuthor: opp.comments?.author_name || '',
      clusterLabel: opp.clusters?.label,
      reason: opp.reason,
      suggestedReply: opp.suggested_reply,
      priorityScore: opp.priority_score,
    })) || [];

    // Get the top suggested pinned comment
    const pinnedComment = clusters?.[0]?.suggested_pinned_reply || null;

    return NextResponse.json({
      jobId: job.id,
      channel: {
        id: job.channels.channel_id,
        name: job.channels.channel_name,
        thumbnailUrl: job.channels.thumbnail_url,
        subscriberCount: job.channels.subscriber_count,
      },
      topQuestions,
      videoIdeas,
      replyOpportunities: formattedReplyOpportunities,
      pinnedComment,
      pdfUrl: job.pdf_url,
      completedAt: job.completed_at,
    });

  } catch (error) {
    console.error('Error fetching results:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}