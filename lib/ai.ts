import { RankedCluster, getClusterExamples } from '@/lib/clustering';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

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
 * Generate insights with Context Awareness
 */
export async function generateClusterInsights(
  clusters: RankedCluster[],
  channelName: string,
  recentVideoTitles: string[] = []
): Promise<Map<string, ClusterInsights>> {
  
  const contextBlock = recentVideoTitles.length > 0
    ? `\nCONTEXT - The creator has RECENTLY posted videos with these titles. DO NOT suggest ideas that overlap with these:\n${recentVideoTitles.map(t => `- ${t}`).join('\n')}\n`
    : '';

  const clusterData = clusters.map(cluster => ({
    id: cluster.id,
    commentCount: cluster.comments.length,
    totalLikes: cluster.totalLikes,
    examples: getClusterExamples(cluster, 5),
  }));

  const prompt = `You are analyzing YouTube comments for the channel "${channelName}".
${contextBlock}
Below are ${clusters.length} clusters of viewer comments. For each cluster, provide:
1. A clear label (5-10 words).
2. A unique video idea (Ensure it is NOT similar to the "Recent Videos" listed above).
3. A suggested pinned reply.

IMPORTANT: You MUST return the exact "clusterId" provided in the input.

Clusters:
${clusterData.map((c) => `
ID: ${c.id} (${c.commentCount} comments, ${c.totalLikes} likes):
${c.examples.map((ex) => `  - "${ex}"`).join('\n')}
`).join('\n')}

Respond ONLY with valid JSON:
{
  "clusters": [
    {
      "clusterId": "the_id_provided_above",
      "label": "Theme label",
      "videoIdea": "Idea title",
      "suggestedPinnedReply": "Reply text"
    }
  ]
}`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      response_format: { type: "json_object" },
      messages: [
        { role: 'system', content: 'You are an expert YouTube strategist.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.4,
    }),
  });

  const data = await response.json();
  const parsed = JSON.parse(data.choices[0].message.content);
  const insightsMap = new Map<string, ClusterInsights>();
  
  parsed.clusters.forEach((item: any) => {
    insightsMap.set(item.clusterId, {
      label: item.label,
      videoIdea: item.videoIdea,
      suggestedPinnedReply: item.suggestedPinnedReply,
    });
  });

  return insightsMap;
}

/**
 * Generate suggestions for individual high-value comments
 */
export async function generateReplySuggestions(
  comments: Array<{ text: string; likeCount: number; clusterLabel?: string }>,
  channelName: string
): Promise<ReplyOpportunity[]> {
  const prompt = `You are a community manager for the YouTube channel "${channelName}".
Analyze these comments and suggest which ones deserve a personal reply.

Comments:
${comments.map((c, i) => `ID: ${i}\nText: "${c.text}"\nTopic: ${c.clusterLabel || 'General'}`).join('\n\n')}

Respond ONLY with JSON:
{
  "replies": [
    {
      "commentId": 0,
      "reason": "Why this comment is high priority",
      "suggestedReply": "What the creator should say",
      "priorityScore": 85
    }
  ]
}`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      response_format: { type: "json_object" },
      messages: [
        { role: 'system', content: 'You are an expert community manager.' },
        { role: 'user', content: prompt },
      ],
    }),
  });

  const data = await response.json();
  const parsed = JSON.parse(data.choices[0].message.content);
  return parsed.replies;
}