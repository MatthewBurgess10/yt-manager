"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, AlertCircle, Loader2, ChevronDown } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface ChannelInfo {
  channelId: string
  title: string
  description: string
  thumbnail: string
  subscriberCount: string
  videoCount: string
}

interface ChannelVerificationProps {
  onChannelSelect?: (channelId: string) => void
}

export function ChannelVerification({ onChannelSelect }: ChannelVerificationProps) {
  const [channels, setChannels] = useState<ChannelInfo[]>([])
  const [selectedChannel, setSelectedChannel] = useState<ChannelInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchChannels()
  }, [])

  const fetchChannels = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("[v0] Fetching YouTube channels...")
      const response = await fetch("/api/youtube/channel")
      const data = await response.json()

      console.log("[v0] Channel API response:", data)

      if (!response.ok || data.error) {
        throw new Error(data.error || "Failed to fetch channels")
      }

      if (!data.channels || !Array.isArray(data.channels) || data.channels.length === 0) {
        throw new Error("No YouTube channels found for this account")
      }

      console.log("[v0] Channels detected:", data.channels.length)
      console.log("[v0] Channel details:", data.channels)

      setChannels(data.channels)

      const savedChannelId = localStorage.getItem("selectedChannelId")
      const channelToSelect = savedChannelId
        ? data.channels.find((ch: ChannelInfo) => ch.channelId === savedChannelId) || data.channels[0]
        : data.channels[0]

      console.log("[v0] Selected channel:", channelToSelect)
      setSelectedChannel(channelToSelect)

      if (onChannelSelect) {
        console.log("[v0] Calling onChannelSelect with channelId:", channelToSelect.channelId)
        onChannelSelect(channelToSelect.channelId)
      }
    } catch (err: any) {
      console.error("[v0] Channel fetch error:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChannelSelect = (channel: ChannelInfo) => {
    console.log("[v0] User selected channel:", channel.channelId)
    setSelectedChannel(channel)
    localStorage.setItem("selectedChannelId", channel.channelId)
    if (onChannelSelect) {
      onChannelSelect(channel.channelId)
    }
  }

  const handleSwitchAccount = async () => {
    await supabase.auth.signOut()
    localStorage.removeItem("selectedChannelId")
    window.location.href = "/login"
  }

  if (loading) {
    return (
      <Card className="border-2">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Verifying YouTube channel...</span>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-2 border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20">
        <CardContent className="py-3">
          <div className="flex items-start gap-4">
            <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-2">
              <h3 className="font-semibold text-red-900 dark:text-red-100">YouTube Channel Not Found</h3>
              <p className="text-sm text-red-700 dark:text-red-300">
                {error}. Please make sure you have a YouTube channel associated with your Google account.
              </p>
              <Button onClick={handleSwitchAccount} variant="outline" size="sm" className="mt-2 bg-transparent">
                Try Different Account
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!selectedChannel || channels.length === 0) {
    return null
  }

  return (
    <Card className="border-2 border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20">
      <CardContent className="py-3">
        <div className="flex items-start gap-4">
          <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-green-900 dark:text-green-100 mb-3">YouTube Channel Connected</h3>
            <div className="flex items-center gap-4">
              <img
                src={selectedChannel.thumbnail || "/placeholder.svg"}
                alt={selectedChannel.title}
                className="w-16 h-16 rounded-full border-2 border-green-200 dark:border-green-800"
              />
              <div className="flex-1">
                {channels.length > 1 ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-auto p-0 hover:bg-transparent">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-foreground">{selectedChannel.title}</h4>
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-64">
                      {channels.map((channel) => (
                        <DropdownMenuItem
                          key={channel.channelId}
                          onClick={() => handleChannelSelect(channel)}
                          className="flex items-center gap-3 p-3"
                        >
                          <img
                            src={channel.thumbnail || "/placeholder.svg"}
                            alt={channel.title}
                            className="w-10 h-10 rounded-full"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{channel.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {Number.parseInt(channel.subscriberCount).toLocaleString()} subscribers
                            </p>
                          </div>
                          {channel.channelId === selectedChannel.channelId && (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          )}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <h4 className="font-semibold text-foreground">{selectedChannel.title}</h4>
                )}
                <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                  <span>{Number.parseInt(selectedChannel.subscriberCount).toLocaleString()} subscribers</span>
                  <span>•</span>
                  <span>{Number.parseInt(selectedChannel.videoCount).toLocaleString()} videos</span>
                </div>
              </div>
              <Button onClick={handleSwitchAccount} variant="outline" size="sm">
                Switch Account
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
