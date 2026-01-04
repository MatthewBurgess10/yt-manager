import { CommentInfo } from './youtube';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export interface AnalysisTheme {
  label: string;
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  summary: string;
  video_ideas: string[];
  example_comment: string;
  comment_count: number;
}

export interface AnalysisResult {
  overall_sentiment: string;
  themes: AnalysisTheme[];
}

export async function runSpecializedPipeline(
  videoTitle: string, 
  comments: CommentInfo[]
): Promise<AnalysisResult> {

  // 1. Light Pre-filtering (CPU level)
  // We keep only substantial comments to ensure quality analysis
  const relevantComments = comments
    .filter(c => c.text.length > 8) 
    .sort((a, b) => b.likeCount - a.likeCount)
    .slice(0, 750); 

  const prompt = `
    You are an expert YouTube Strategist.
    VIDEO CONTEXT: "${videoTitle}"
    
    DATA: I have provided ${relevantComments.length} comments below.
    
    TASK:
    1. Identify all distinct and significant "Themes" present in these comments. 
       - Do not force a specific number of themes. 
       - If there are only 3 clear themes, return 3. If there are 8 distinct topics, return 8. 
       - Ignore insignificant noise.
    2. For each theme, generate 2-3 high-quality, unique video ideas that would address this specific topic.
       - Focus on quality over quantity.
    3. Select a representative quote for each theme.
    4. Estimate the count of comments that fit this theme.

    COMMENTS:
    ${relevantComments.map(c => `- ${c.text} (Likes: ${c.likeCount})`).join('\n')}

    OUTPUT JSON FORMAT:
    {
      "overall_sentiment": "Brief summary of audience vibe",
      "themes": [
        {
          "label": "Theme Name",
          "sentiment": "Positive/Neutral/Negative",
          "summary": "Description of what they are saying",
          "video_ideas": ["Idea 1", "Idea 2", "Idea 3"],
          "example_comment": "Direct quote",
          "comment_count": 10
        }
      ]
    }
  `;

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
          { role: 'system', content: 'You are a data analyst. Output strict JSON.' },
          { role: 'user', content: prompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.3, 
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    return JSON.parse(content) as AnalysisResult;

  } catch (error) {
    console.error("AI Analysis Failed:", error);
    return { overall_sentiment: "Error analyzing", themes: [] };
  }
}