"use client";

import { createContext, useContext, useState } from "react";
import type { Comment } from "@/types/comment";

interface CommentsContextValue {
  comments: Comment[];
  score: number ;
  overallSentiment: string | null;
  setComments: (comments: Comment[]) => void;
  setScore: (score: number) => void;
  setOverallSentiment: (sentiment: string | null) => void;
}

const CommentsContext = createContext<CommentsContextValue | null>(null);

export function CommentsProvider({ children }: { children: React.ReactNode }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [score, setScore] = useState<number>(50);
  const [overallSentiment, setOverallSentiment] = useState<string | null>(null);

  return (
    <CommentsContext.Provider
      value={{
        comments,
        score,
        overallSentiment,
        setComments,
        setScore,
        setOverallSentiment,
      }}
    >
      {children}
    </CommentsContext.Provider>
  );
}

export function useCommentsContext() {
  const ctx = useContext(CommentsContext);
  if (!ctx) {
    throw new Error("useCommentsContext must be used within CommentsProvider");
  }
  return ctx;
}
