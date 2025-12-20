import { pipeline } from "@xenova/transformers";

// force workiing in nextjs edge runtime
export const runtime = "nodejs";

// Load model once and reuse
let classifier: any = null;

// Lazily loads the sentiment-analysis model.This prevents re-downloading and re-initializing the model on every request (which would be extremely slow).
async function loadModel() {
  if (!classifier) {
    classifier = await pipeline(
      "sentiment-analysis",
      "Xenova/distilbert-base-uncased-finetuned-sst-2-english"
    );
  }
  return classifier;
}

export async function POST(req: Request) {
  // parse comments coming in
  const { comments } = await req.json();

  //make sure comments exists
  if (!Array.isArray(comments) || comments.length === 0) {
    return Response.json(
      { score: 50, sentiment: "neutral" },
      { status: 400 }
    );
  }

  //get text from comments
  const texts = comments.map((c: any) => c.text);

  const classifier = await loadModel();
  // run sentiment analysis in one call.
  const results = await classifier(texts);

  // it returns an array of results with label and score
  const values = results.map((r: any) =>
    r.label === "POSITIVE" ? r.score : -r.score
  );

  // calculate average
  const average =
    values.reduce((a: number, b: number) => a + b, 0) / values.length;

    // scale to 0-100
  const finalScore = Math.round(average * 50 + 50);

  // map into an actual word
  const sentiment =
    finalScore > 60 ? "positive" :
    finalScore < 40 ? "negative" :
    "neutral";

  //return to client
  return Response.json({
    score: finalScore,
    sentiment,
  });
}
