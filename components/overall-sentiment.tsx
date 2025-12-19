"use client";

import { useEffect } from "react";
import { useCommentsContext } from "@/context/CommentsContext";
import type { Comment } from "@/types/comment";

export function OverallSentiment() {
  const { comments, overallSentiment, setOverallSentiment } = useCommentsContext();

  useEffect(() => {
    if (!comments.length) return;

    async function fetchSentiment() {
      const res = await fetch("/api/sentiment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comments }),
      });

      const data = await res.json();
      setOverallSentiment(data.sentiment);
    }

    fetchSentiment();
  }, [comments, setOverallSentiment]);

  if (!comments.length) {
    return <div className="text-muted-foreground">No comments yet</div>;
  }

  return (
    <div className="p-4 border rounded-xl">
      <h2 className="text-lg font-bold">Overall Sentiment</h2>
      <p className="mt-2">
        {overallSentiment ?? "Analyzing sentiment…"}
      </p>
      <p className="text-xs text-muted-foreground mt-1">
        Based on {comments.length} comments
      </p>
    </div>
  );
}
