import { RankedCluster, getClusterExamples } from '@/lib/clustering';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable');
}

export interface ClusterInsights {
  label: string;
  videoIdea: string;
  suggestedPinnedReply: string;
}

export interface ReplyOpportunity {
  commentText: string;
  reason: string;
  suggestedReply: string;
  priorityScore: number;
}

/**
 * Generate insights for all clusters in one LLM call
 */
export async function generateClusterInsights(
  clusters: RankedCluster[],
  channelName: string
): Promise<Map<string, ClusterInsights>> {
  const clusterData = clusters.map(cluster => ({
    id: cluster.id,
    commentCount: cluster.comments.length,
    totalLikes: cluster.totalLikes,
    examples: getClusterExamples(cluster, 5),
  }));

  const prompt = `You are analyzing YouTube comments for the channel "${channelName}".

Below are ${clusters.length} clusters of similar questions/issues from viewers. For each cluster, provide:
1. A clear, concise label (5-10 words) describing the common theme
2. A video idea that would address this topic
3. A suggested pinned comment reply

Clusters:
${clusterData.map((c, i) => `
Cluster ${i + 1} (${c.commentCount} comments, ${c.totalLikes} likes):
${c.examples.map((ex, j) => `  ${j + 1}. "${ex}"`).join('\n')}
`).join('\n')}

Respond in valid JSON format:
{
  "clusters": [
    {
      "clusterId": "cluster_0",
      "label": "...",
      "videoIdea": "...",
      "suggestedPinnedReply": "..."
    }
  ]
}`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that analyzes YouTube comments and provides insights. Always respond with valid JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Parse JSON response
    const parsed = JSON.parse(content);
    
    // Convert to Map
    const insightsMap = new Map<string, ClusterInsights>();
    for (const item of parsed.clusters) {
      insightsMap.set(item.clusterId, {
        label: item.label,
        videoIdea: item.videoIdea,
        suggestedPinnedReply: item.suggestedPinnedReply,
      });
    }

    return insightsMap;
  } catch (error) {
    console.error('Error generating cluster insights:', error);
    throw new Error('Failed to generate cluster insights');
  }
}

/**
 * Generate reply suggestions for high-priority comments
 */
export async function generateReplySuggestions(
  comments: Array<{
    text: string;
    likeCount: number;
    replyCount: number;
    clusterLabel?: string;
  }>,
  channelName: string
): Promise<ReplyOpportunity[]> {
  if (comments.length === 0) return [];

  const prompt = `You are helping "${channelName}" respond to YouTube comments.

Generate helpful, concise reply suggestions for these high-priority comments. Keep replies:
- Friendly and professional
- Directly addressing the question/concern
- Under 100 words
- Actionable when possible

Comments:
${comments.map((c, i) => `${i + 1}. "${c.text}" (${c.likeCount} likes, ${c.replyCount} replies)${c.clusterLabel ? ` [Topic: ${c.clusterLabel}]` : ''}`).join('\n\n')}

Respond in valid JSON format:
{
  "replies": [
    {
      "commentIndex": 0,
      "reason": "Why this comment is important to reply to",
      "suggestedReply": "The suggested reply text",
      "priorityScore": 0-10
    }
  ]
}`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that generates professional YouTube comment replies. Always respond with valid JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.8,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const parsed = JSON.parse(content);

    return parsed.replies.map((reply: any, index: number) => ({
      commentText: comments[reply.commentIndex]?.text || comments[index]?.text || '',
      reason: reply.reason,
      suggestedReply: reply.suggestedReply,
      priorityScore: reply.priorityScore || 5,
    }));
  } catch (error) {
    console.error('Error generating reply suggestions:', error);
    return [];
  }
}