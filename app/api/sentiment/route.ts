import { pipeline } from '@xenova/transformers';

let classifier: any = null;

async function loadModel() {
  if (!classifier) {
    classifier = await pipeline("sentiment-analysis");
  }
  return classifier;
}

export async function POST(req: Request) {
  const { comments } = await req.json();
  const classifier = await loadModel();

  const values: number[] = [];

  for (const comment of comments) {
    const result = await classifier(comment);
    const { label, score } = result[0];

    const numeric = label === "POSITIVE" ? score : -score;
    values.push(numeric);
  }

  const average = values.reduce((a, b) => a + b, 0) / values.length;
  const finalScore = Math.round(average * 50 + 50);

  let sentiment = "neutral";
  if (finalScore > 60) sentiment = "positive";
  else if (finalScore < 40) sentiment = "negative";

  return Response.json({
    score: finalScore,
    sentiment,
  });
}
