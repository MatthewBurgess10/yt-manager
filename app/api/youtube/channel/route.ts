import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.provider_token) {
      return NextResponse.json({ error: "Not authenticated with YouTube. Please sign in again." }, { status: 401 })
    }

    console.log("[v0] Fetching YouTube channels...")

    const response = await fetch("https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true", {
      headers: {
        Authorization: `Bearer ${session.provider_token}`,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("[v0] YouTube API error:", errorData)

      if (response.status === 401) {
        return NextResponse.json({ error: "YouTube authentication expired. Please sign in again." }, { status: 401 })
      }

      return NextResponse.json(
        { error: `YouTube API error: ${errorData.error?.message || "Failed to fetch channels"}` },
        { status: response.status },
      )
    }

    const data = await response.json()
    console.log("[v0] YouTube API response:", data)

    if (!data.items || data.items.length === 0) {
      return NextResponse.json({ error: "No YouTube channel found for this Google account" }, { status: 404 })
    }

    const channels = data.items.map((channel: any) => ({
      channelId: channel.id,
      title: channel.snippet.title,
      description: channel.snippet.description,
      thumbnail: channel.snippet.thumbnails.default.url,
      subscriberCount: channel.statistics.subscriberCount,
      videoCount: channel.statistics.videoCount,
    }))

    console.log("[v0] Successfully fetched", channels.length, "channel(s)")

    return NextResponse.json({ channels })
  } catch (error: any) {
    console.error("[v0] Error in channel route:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
