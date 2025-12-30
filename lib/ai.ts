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
  channelName: string): Promise<Map<string, ClusterInsights>> {
  // Pass the ID explicitly to the AI
  const clusterData = clusters.map(cluster => ({
    id: cluster.id, 
    commentCount: cluster.comments.length,
    totalLikes: cluster.totalLikes,
    examples: getClusterExamples(cluster, 5),
  }));

  const prompt = `You are analyzing YouTube comments for the channel "${channelName}".

  Below are ${clusters.length} clusters. For each cluster, provide insights.
  IMPORTANT: You MUST return the exact "clusterId" provided in the input for each cluster.

  Clusters to analyze:
  ${clusterData.map((c) => `
  ID: ${c.id} (${c.commentCount} comments, ${c.totalLikes} likes):
  ${c.examples.map((ex, j) => `  - "${ex}"`).join('\n')}
  `).join('\n')}

  Respond ONLY with valid JSON in this format:
  {
    "clusters": [
      {
        "clusterId": "the_id_provided_above",
        "label": "Theme label",
        "videoIdea": "Idea text",
        "suggestedPinnedReply": "Reply text"
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
        // Use JSON mode if available to ensure better parsing
        response_format: { type: "json_object" }, 
        messages: [
          {
            role: 'system',
            content: 'You are an expert analyst. You output strict JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3, // Lower temperature = more stable JSON
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    let content = data.choices[0].message.content;
    
    // Clean markdown if AI included it
    content = content.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const parsed = JSON.parse(content);
    const insightsMap = new Map<string, ClusterInsights>();
    
    if (!parsed.clusters || !Array.isArray(parsed.clusters)) {
        throw new Error("AI response missing clusters array");
    }

    for (const item of parsed.clusters) {
      insightsMap.set(item.clusterId, {
        label: item.label,
        videoIdea: item.videoIdea,
        suggestedPinnedReply: item.suggestedPinnedReply,
      });
    }

    return insightsMap;
  } catch (error: any) {
    console.error('Detailed AI Error:', error);
    throw new Error(`AI processing failed: ${error.message}`);
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