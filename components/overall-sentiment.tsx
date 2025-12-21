"use client";

import { useEffect } from "react";
import { useCommentsContext } from "@/context/CommentsContext";
import type { Comment } from "@/types/comment";
import SentimentGauge from "@/components/SentimentGauge";
import { set } from "date-fns";

export function OverallSentiment() {
  const { comments, score, overallSentiment, setScore, setOverallSentiment } = useCommentsContext();

  useEffect(() => {
    if (!comments.length) return;

    async function fetchSentiment() {
      const res = await fetch("/api/sentiment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comments }),
      });

      const data = await res.json();
      setScore(data.score);
      setOverallSentiment(data.sentiment);
    }

    fetchSentiment();
  }, [comments, setScore, setOverallSentiment]);
  console.error("Overall sentiment", overallSentiment);

  const sentiment_input = {
    score: score,
    sentiment: overallSentiment
  }

  if (!comments.length) {
    return <div className="text-muted-foreground">No comments yet</div>;
  }

  // return (
  //   <div className="p-4 border rounded-xl">
  //     <h2 className="text-lg font-bold">Overall Sentiment</h2>
  //     <p className="mt-2">
  //       {overallSentiment ?? "Analyzing sentiment…"}
  //     </p>
  //     <p className="text-xs text-muted-foreground mt-1">
  //       Based on {comments.length} comments
  //     </p>
  //   </div>
  // );
  if (!overallSentiment) {
    return <div className="text-muted-foreground">Analyzing sentiment…</div>;
  }

  return (
    <div className="flex flex-col items-center gap-4 p-6">
      <h2 className="text-xl font-semibold text-foreground">Overall Sentiment</h2>
      
      <SentimentGauge data={{
          score,
          sentiment: overallSentiment as "Positive" | "Negative",
        }} size={280} />

      <p className="text-sm text-muted-foreground">
        Based on {comments.length} comment{comments.length !== 1 ? "s" : ""}
      </p>
    </div>
  );
}
