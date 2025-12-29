const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

if (!YOUTUBE_API_KEY) {
  console.warn('Missing YOUTUBE_API_KEY environment variable');
}

export interface ChannelInfo {
  id: string;
  title: string;
  thumbnailUrl: string;
  subscriberCount: number;
}

export interface VideoInfo {
  id: string;
  title: string;
  publishedAt: string;
  viewCount: number;
  commentCount: number;
}

export interface CommentInfo {
  id: string;
  text: string;
  authorName: string;
  likeCount: number;
  replyCount: number;
  publishedAt: string;
}

/**
 * Extract channel ID or handle from URL
 */
export function extractChannelId(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathSegments = urlObj.pathname.split('/').filter(Boolean);
    
    if (pathSegments.length === 0) return null;

    // Handle /channel/ID
    if (pathSegments[0] === 'channel') {
      return pathSegments[1];
    }
    
    // Handle /@handle
    if (pathSegments[0].startsWith('@')) {
      return pathSegments[0]; // Return handle directly
    }

    // Handle /c/CustomName or /user/UserName (legacy) - treat as username/handle search
    return pathSegments[0];
  } catch (e) {
    return null;
  }
}

/**
 * Resolve channel ID and get basic info
 */
export async function resolveChannelId(identifier: string): Promise<ChannelInfo | null> {
  let apiUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&key=${YOUTUBE_API_KEY}`;

  if (identifier.startsWith('UC')) {
    apiUrl += `&id=${identifier}`;
  } else if (identifier.startsWith('@')) {
    apiUrl += `&forHandle=${encodeURIComponent(identifier)}`;
  } else {
    apiUrl += `&forUsername=${encodeURIComponent(identifier)}`;
  }

  try {
    const res = await fetch(apiUrl);
    const data = await res.json();

    if (!data.items || data.items.length === 0) return null;

    const channel = data.items[0];
    return {
      id: channel.id,
      title: channel.snippet.title,
      thumbnailUrl: channel.snippet.thumbnails.high?.url || channel.snippet.thumbnails.default?.url,
      subscriberCount: parseInt(channel.statistics.subscriberCount || '0', 10),
    };
  } catch (error) {
    console.error('Error resolving channel:', error);
    return null;
  }
}

/**
 * Fetch recent videos from a channel
 */
export async function fetchChannelVideos(channelId: string, limit: number = 10): Promise<VideoInfo[]> {
  try {
    // 1. Get the "Uploads" playlist ID for the channel (Save quota by not using Search API)
    const channelRes = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${YOUTUBE_API_KEY}`
    );
    const channelData = await channelRes.json();
    const uploadsPlaylistId = channelData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;

    if (!uploadsPlaylistId) return [];

    // 2. Get videos from the Uploads playlist
    const playlistRes = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${uploadsPlaylistId}&maxResults=${limit}&key=${YOUTUBE_API_KEY}`
    );
    const playlistData = await playlistRes.json();

    if (!playlistData.items) return [];

    // 3. Get extra stats (views, comment counts) for these videos
    const videoIds = playlistData.items.map((item: any) => item.contentDetails.videoId).join(',');
    const videosRes = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${videoIds}&key=${YOUTUBE_API_KEY}`
    );
    const videosData = await videosRes.json();

    return videosData.items.map((video: any) => ({
      id: video.id,
      title: video.snippet.title,
      publishedAt: video.snippet.publishedAt,
      viewCount: parseInt(video.statistics.viewCount || '0', 10),
      commentCount: parseInt(video.statistics.commentCount || '0', 10),
    }));

  } catch (error) {
    console.error('Error fetching videos:', error);
    return [];
  }
}



/**
 * Extracts Video ID from standard, short, and Shorts YouTube URLs
 */
export function extractVideoId(url: string): string | null {
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{11})/i;
  const match = url.match(regExp);
  return match ? match[1] : null;
}

/**
 * Fetches details for a single video including its parent channel
 * Standardized to use fetch() like your other functions
 */
export async function fetchVideoDetails(videoId: string) {
  try {
    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoId}&key=${YOUTUBE_API_KEY}`;
    
    const res = await fetch(apiUrl);
    const data = await res.json();

    const video = data.items?.[0];
    if (!video) return null;

    return {
      id: video.id,
      title: video.snippet?.title,
      channelId: video.snippet?.channelId,
      channelTitle: video.snippet?.channelTitle,
      thumbnailUrl: video.snippet?.thumbnails?.high?.url || video.snippet?.thumbnails?.default?.url,
      commentCount: parseInt(video.statistics?.commentCount || '0', 10),
      publishedAt: video.snippet?.publishedAt,
    };
  } catch (error) {
    console.error('Error fetching video details:', error);
    return null;
  }
}

/**
 * Fetch comments for a specific video
 * Matches your original fetchVideoComments style
 */
export async function fetchVideoComments(videoId: string, limit: number = 100): Promise<CommentInfo[]> {
  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&maxResults=${limit}&order=relevance&textFormat=plainText&key=${YOUTUBE_API_KEY}`
    );
    const data = await res.json();

    if (!data.items) return [];

    return data.items.map((item: any) => {
      const topComment = item.snippet.topLevelComment.snippet;
      return {
        id: item.id,
        text: topComment.textDisplay,
        authorName: topComment.authorDisplayName,
        likeCount: topComment.likeCount,
        replyCount: item.snippet.totalReplyCount,
        publishedAt: topComment.publishedAt,
      };
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
}