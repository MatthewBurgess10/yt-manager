import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

interface ChannelProfile {
  medianLikes: number
  p75Likes: number
  p90Likes: number
  p95Likes: number
  meanLikes: number
  questionRatio: number
  totalComments: number
}

function calculatePercentile(sortedArray: number[], percentile: number): number {
  if (sortedArray.length === 0) return 0
  const index = Math.ceil((percentile / 100) * sortedArray.length) - 1
  return sortedArray[Math.max(0, index)]
}

function calculateChannelProfile(comments: any[]): ChannelProfile {
  if (comments.length === 0) {
    return {
      medianLikes: 0,
      p75Likes: 0,
      p90Likes: 0,
      p95Likes: 0,
      meanLikes: 0,
      questionRatio: 0,
      totalComments: 0,
    }
  }

  const likeCounts = comments.map((c) => c.likes).sort((a, b) => a - b)
  const questionCount = comments.filter((c) => c.isQuestion).length

  const median = calculatePercentile(likeCounts, 50)
  const p75 = calculatePercentile(likeCounts, 75)
  const p90 = calculatePercentile(likeCounts, 90)
  const p95 = calculatePercentile(likeCounts, 95)
  const mean = likeCounts.reduce((sum, val) => sum + val, 0) / likeCounts.length

  return {
    medianLikes: median,
    p75Likes: p75,
    p90Likes: p90,
    p95Likes: p95,
    meanLikes: Number.parseFloat(mean.toFixed(2)),
    questionRatio: Number.parseFloat((questionCount / comments.length).toFixed(4)),
    totalComments: comments.length,
  }
}

async function getChannelProfile(supabase: any, channelId: string): Promise<ChannelProfile | null> {
  const { data, error } = await supabase.from("channel_profiles").select("*").eq("channel_id", channelId).single()

  if (error || !data) {
    console.log("[v0] No cached profile found for channel:", channelId)
    return null
  }

  // Check if profile is older than 24 hours
  const lastUpdated = new Date(data.last_updated)
  const now = new Date()
  const hoursSinceUpdate = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60)

  if (hoursSinceUpdate > 24) {
    console.log("[v0] Cached profile is stale (", hoursSinceUpdate.toFixed(1), "hours old)")
    return null
  }

  console.log("[v0] Using cached profile from", hoursSinceUpdate.toFixed(1), "hours ago")
  return {
    medianLikes: data.median_likes,
    p75Likes: data.p75_likes,
    p90Likes: data.p90_likes,
    p95Likes: data.p95_likes,
    meanLikes: Number.parseFloat(data.mean_likes),
    questionRatio: Number.parseFloat(data.question_ratio),
    totalComments: data.total_comments,
  }
}

async function saveChannelProfile(supabase: any, channelId: string, profile: ChannelProfile) {
  const { error } = await supabase.from("channel_profiles").upsert(
    {
      channel_id: channelId,
      median_likes: profile.medianLikes,
      p75_likes: profile.p75Likes,
      p90_likes: profile.p90Likes,
      p95_likes: profile.p95Likes,
      mean_likes: profile.meanLikes,
      question_ratio: profile.questionRatio,
      total_comments: profile.totalComments,
      last_updated: new Date().toISOString(),
    },
    { onConflict: "channel_id" },
  )

  if (error) {
    console.error("[v0] Error saving channel profile:", error)
  } else {
    console.log("[v0] Channel profile saved successfully")
  }
}

export async function GET(request: Request) {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.provider_token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const channelId = searchParams.get("channelId")

  console.log("[v0] Fetching comments for channelId:", channelId)

  if (!channelId) {
    return NextResponse.json({ error: "Channel ID is required" }, { status: 400 })
  }

  try {
    console.log("[v0] Step 1: Fetching videos for channel...")
    const videosResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&maxResults=50&order=date&type=video`,
      {
        headers: {
          Authorization: `Bearer ${session.provider_token}`,
        },
      },
    )

    if (!videosResponse.ok) {
      const errorData = await videosResponse.json()
      console.error("[v0] Videos fetch error:", errorData)
      throw new Error("Failed to fetch videos")
    }

    const videosData = await videosResponse.json()
    console.log("[v0] Found", videosData.items?.length || 0, "videos")

    if (!videosData.items || videosData.items.length === 0) {
      return NextResponse.json({ comments: [] })
    }

    const rawComments: any[] = []
    const videosToFetch = videosData.items.slice(0, 10)

    console.log("[v0] Step 2: Fetching comments from", videosToFetch.length, "videos...")

    for (const video of videosToFetch) {
      const videoId = video.id.videoId
      const videoTitle = video.snippet.title

      try {
        const commentsResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&maxResults=100&order=relevance`,
          {
            headers: {
              Authorization: `Bearer ${session.provider_token}`,
            },
          },
        )

        if (commentsResponse.ok) {
          const commentsData = await commentsResponse.json()

          if (commentsData.items) {
            console.log("[v0] Found", commentsData.items.length, "comments for video:", videoTitle)

            const videoComments = commentsData.items.map((item: any) => {
              const snippet = item.snippet.topLevelComment.snippet
              const likeCount = snippet.likeCount || 0
              const textOriginal = snippet.textOriginal || snippet.textDisplay || ""
              const isQuestion = /\?/.test(textOriginal)

              return {
                id: item.id,
                commentId: item.snippet.topLevelComment.id,
                author: snippet.authorDisplayName,
                authorAvatar: snippet.authorProfileImageUrl,
                text: textOriginal,
                likes: likeCount,
                timestamp: new Date(snippet.publishedAt).toLocaleDateString(),
                publishedAt: snippet.publishedAt,
                videoId: videoId,
                videoTitle: videoTitle,
                isQuestion,
                replied: false,
              }
            })

            rawComments.push(...videoComments)
          }
        }
      } catch (videoError) {
        console.error("[v0] Error fetching comments for video:", videoId, videoError)
      }
    }
    

    console.log("[v0] Step 3: Calculating adaptive channel profile...")

    let channelProfile = await getChannelProfile(supabase, channelId)

    if (!channelProfile) {
      console.log("[v0] Calculating new channel profile from", rawComments.length, "comments")
      channelProfile = calculateChannelProfile(rawComments)
      await saveChannelProfile(supabase, channelId, channelProfile)
    }

    console.log("[v0] Channel Profile:", channelProfile)

    const allComments = rawComments.map((comment) => {
      // Calculate normalized score relative to channel median
      const normalizedScore =
        channelProfile!.medianLikes > 0 ? (comment.likes / channelProfile!.medianLikes) * 100 : comment.likes

      // Calculate adaptive question bonus based on question ratio
      let questionBonus = 0
      if (comment.isQuestion) {
        if (channelProfile!.questionRatio < 0.2) {
          // Questions are rare (< 20%), boost significantly
          questionBonus = normalizedScore * 1.5
        } else if (channelProfile!.questionRatio > 0.5) {
          // Questions are common (> 50%), smaller boost
          questionBonus = normalizedScore * 0.3
        } else {
          // Default boost
          questionBonus = normalizedScore * 0.5
        }
      }

      const priorityScore = Math.round(normalizedScore + questionBonus)

      // Calculate relative score (how many times above median)
      const relativeScore =
        channelProfile!.medianLikes > 0 ? (comment.likes / channelProfile!.medianLikes).toFixed(1) : "0.0"

      return {
        ...comment,
        priorityScore,
        relativeScore: `${relativeScore}x`,
      }
    })

    allComments.sort((a, b) => b.priorityScore - a.priorityScore)

    console.log("[v0] Total comments with adaptive scoring:", allComments.length)
    console.log("[v0] Sample scored comment:", {
      text: allComments[0]?.text.substring(0, 50),
      likes: allComments[0]?.likes,
      priorityScore: allComments[0]?.priorityScore,
      relativeScore: allComments[0]?.relativeScore,
    })

    return NextResponse.json({
      comments: allComments,
      channelProfile: {
        medianLikes: channelProfile.medianLikes,
        highPriorityThreshold: channelProfile.p90Likes,
        questionRatio: channelProfile.questionRatio,
      },
    })
  } catch (error: any) {
    console.error("[v0] Error fetching comments:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch comments" }, { status: 500 })
  }
}
