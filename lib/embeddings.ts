const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable');
}

export type Embedding = number[];

/**
 * Generate embeddings for an array of texts using OpenAI
 */
export async function generateEmbeddings(texts: string[]): Promise<Embedding[]> {
  if (texts.length === 0) return [];

  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: texts,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.data.map((item: any) => item.embedding);
  } catch (error) {
    console.error('Error generating embeddings:', error);
    throw new Error('Failed to generate embeddings');
  }
}

/**
 * Calculate cosine similarity between two embeddings
 */
export function cosineSimilarity(a: Embedding, b: Embedding): number {
  if (a.length !== b.length) {
    throw new Error('Embeddings must have the same length');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) return 0;

  return dotProduct / (normA * normB);
}

/**
 * Batch texts into groups for efficient API calls
 */
export function batchTexts(texts: string[], batchSize: number = 100): string[][] {
  const batches: string[][] = [];
  
  for (let i = 0; i < texts.length; i += batchSize) {
    batches.push(texts.slice(i, i + batchSize));
  }
  
  return batches;
}

/**
 * Generate embeddings in batches with rate limiting
 */
export async function generateEmbeddingsBatched(
  texts: string[],
  batchSize: number = 100,
  delayMs: number = 100
): Promise<Embedding[]> {
  const batches = batchTexts(texts, batchSize);
  const allEmbeddings: Embedding[] = [];

  for (let i = 0; i < batches.length; i++) {
    const batchEmbeddings = await generateEmbeddings(batches[i]);
    allEmbeddings.push(...batchEmbeddings);

    // Rate limiting delay between batches
    if (i < batches.length - 1) {
      await sleep(delayMs);
    }
  }

  return allEmbeddings;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}