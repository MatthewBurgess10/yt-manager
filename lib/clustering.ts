import { Embedding, cosineSimilarity } from './embeddings';

export interface CommentWithEmbedding {
  id: string;
  text: string;
  embedding: Embedding;
  likeCount: number;
  replyCount: number;
}

export interface Cluster {
  id: string;
  centroid: Embedding;
  representativeComment: string;
  comments: CommentWithEmbedding[];
  totalLikes: number;
  recentCount: number;
}

export interface RankedCluster extends Cluster {
  score: number;
  rank: number;
}

const SIMILARITY_THRESHOLD = 0.85;

/**
 * Cluster comments using centroid-based approach
 */
export function clusterComments(
  comments: CommentWithEmbedding[],
  similarityThreshold: number = SIMILARITY_THRESHOLD
): Cluster[] {
  const clusters: Cluster[] = [];

  for (const comment of comments) {
    let assigned = false;

    // Try to assign to existing cluster
    for (const cluster of clusters) {
      const similarity = cosineSimilarity(comment.embedding, cluster.centroid);

      if (similarity >= similarityThreshold) {
        // Add to cluster
        cluster.comments.push(comment);
        cluster.totalLikes += comment.likeCount;
        
        // Update centroid (running average)
        updateCentroid(cluster);
        
        // Update representative comment (highest likes)
        if (comment.likeCount > getLikeCount(cluster.representativeComment, cluster.comments)) {
          cluster.representativeComment = comment.text;
        }

        assigned = true;
        break;
      }
    }

    // Create new cluster if not assigned
    if (!assigned) {
      clusters.push({
        id: `cluster_${clusters.length}`,
        centroid: [...comment.embedding],
        representativeComment: comment.text,
        comments: [comment],
        totalLikes: comment.likeCount,
        recentCount: 1,
      });
    }
  }

  return clusters;
}

/**
 * Update cluster centroid as running average
 */
function updateCentroid(cluster: Cluster): void {
  const n = cluster.comments.length;
  const newComment = cluster.comments[n - 1];

  for (let i = 0; i < cluster.centroid.length; i++) {
    cluster.centroid[i] = 
      (cluster.centroid[i] * (n - 1) + newComment.embedding[i]) / n;
  }
}

/**
 * Get like count for a specific comment text
 */
function getLikeCount(text: string, comments: CommentWithEmbedding[]): number {
  const comment = comments.find(c => c.text === text);
  return comment?.likeCount || 0;
}

/**
 * Calculate cluster importance score
 */
function calculateClusterScore(cluster: Cluster): number {
  const commentCount = cluster.comments.length;
  const totalLikes = cluster.totalLikes;
  const recentCount = cluster.recentCount;

  // Weighted scoring formula
  const score = 
    commentCount * 1.0 +
    totalLikes * 0.3 +
    recentCount * 0.5;

  return score;
}

/**
 * Rank clusters by importance
 */
export function rankClusters(clusters: Cluster[]): RankedCluster[] {
  const rankedClusters: RankedCluster[] = clusters.map(cluster => ({
    ...cluster,
    score: calculateClusterScore(cluster),
    rank: 0,
  }));

  // Sort by score descending
  rankedClusters.sort((a, b) => b.score - a.score);

  // Assign ranks
  rankedClusters.forEach((cluster, index) => {
    cluster.rank = index + 1;
  });

  return rankedClusters;
}

/**
 * Get top N clusters
 */
export function getTopClusters(
  clusters: Cluster[],
  topN: number = 15
): RankedCluster[] {
  const ranked = rankClusters(clusters);
  return ranked.slice(0, topN);
}

/**
 * Get example comments from a cluster
 */
export function getClusterExamples(
  cluster: Cluster,
  maxExamples: number = 3
): string[] {
  // Sort by likes descending
  const sorted = [...cluster.comments].sort((a, b) => b.likeCount - a.likeCount);
  return sorted.slice(0, maxExamples).map(c => c.text);
}

/**
 * Mark recent comments (for scoring)
 * Assumes comments have a publishedAt field
 */
export function markRecentComments(
  comments: CommentWithEmbedding[],
  daysCutoff: number = 30
): CommentWithEmbedding[] {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysCutoff);

  return comments.map(comment => ({
    ...comment,
    // This would need publishedAt field in the actual implementation
  }));
}

/**
 * Calculate recent count for clusters
 */
export function calculateRecentCounts(
  clusters: Cluster[],
  daysCutoff: number = 30
): Cluster[] {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysCutoff);

  return clusters.map(cluster => ({
    ...cluster,
    recentCount: cluster.comments.filter(comment => {
      // Would need to check actual publishedAt date
      // For now, assume all are recent
      return true;
    }).length,
  }));
}