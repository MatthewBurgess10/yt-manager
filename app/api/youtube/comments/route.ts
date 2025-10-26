import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

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

    const allComments: any[] = []
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
              const textDisplay = snippet.textDisplay || snippet.textOriginal || ""
              const isQuestion = /\?/.test(textDisplay)
              const questionBonus = isQuestion ? 100 : 0

              return {
                id: item.id,
                commentId: item.snippet.topLevelComment.id,
                author: snippet.authorDisplayName,
                authorAvatar: snippet.authorProfileImageUrl,
                text: textDisplay,
                likes: likeCount,
                timestamp: new Date(snippet.publishedAt).toLocaleDateString(),
                publishedAt: snippet.publishedAt,
                videoId: videoId,
                videoTitle: videoTitle,
                isQuestion,
                priorityScore: likeCount + questionBonus,
                replied: false,
              }
            })

            allComments.push(...videoComments)
          }
        }
      } catch (videoError) {
        console.error("[v0] Error fetching comments for video:", videoId, videoError)
        // Continue with other videos even if one fails
      }
    }

    allComments.sort((a, b) => b.priorityScore - a.priorityScore)

    console.log("[v0] Total comments fetched:", allComments.length)
    console.log("[v0] Sample comment:", allComments[0])

    return NextResponse.json({ comments: allComments })
  } catch (error: any) {
    console.error("[v0] Error fetching comments:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch comments" }, { status: 500 })
  }
}
