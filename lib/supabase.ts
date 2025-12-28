import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Client for frontend (respects RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client for backend operations (bypasses RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Type definitions
export type AnalysisStatus = 'pending' | 'processing' | 'complete' | 'failed';

export interface Channel {
  id: string;
  channel_id: string;
  channel_name: string;
  thumbnail_url?: string;
  subscriber_count?: number;
  created_at: string;
}

export interface Video {
  id: string;
  channel_id: string;
  video_id: string;
  title: string;
  published_at?: string;
  view_count?: number;
  comment_count?: number;
  created_at: string;
}

export interface Comment {
  id: string;
  video_id: string;
  comment_id: string;
  text: string;
  author_name?: string;
  like_count: number;
  reply_count: number;
  published_at?: string;
  is_filtered: boolean;
  created_at: string;
}

export interface AnalysisJob {
  id: string;
  channel_id: string;
  status: AnalysisStatus;
  progress: number;
  error_message?: string;
  pdf_url?: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
}

export interface Cluster {
  id: string;
  analysis_job_id: string;
  channel_id: string;
  label: string;
  comment_count: number;
  total_likes: number;
  rank?: number;
  representative_comment?: string;
  video_idea?: string;
  suggested_pinned_reply?: string;
  created_at: string;
}

export interface ReplyOpportunity {
  id: string;
  analysis_job_id: string;
  cluster_id?: string;
  comment_id: string;
  reason: string;
  suggested_reply: string;
  priority_score: number;
  created_at: string;
}