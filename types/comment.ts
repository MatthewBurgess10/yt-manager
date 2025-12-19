export interface Comment {
  id: string;
  commentId: string;
  author: string;
  authorAvatar: string;
  text: string;
  videoTitle: string;
  videoId: string;
  likes: number;
  isQuestion: boolean;
  priorityScore: number;
  relativeScore?: string;
  timestamp: string;
  replied: boolean;
}
