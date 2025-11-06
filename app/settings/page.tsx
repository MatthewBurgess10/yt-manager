"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

type Subscription = {
  status: string
  trial_end: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean
}

export default function SettingsPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [portalLoading, setPortalLoading] = useState(false)

  useEffect(() => {
    async function fetchSubscription() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setLoading(false)
        return
      }

      const { data } = await supabase
        .from("subscriptions")
        .select("status, trial_end, current_period_end, cancel_at_period_end")
        .eq("user_id", user.id)
        .single()

      setSubscription(data)
      setLoading(false)
    }

    fetchSubscription()
  }, [])

  const handleManageSubscription = async () => {
    setPortalLoading(true)

    try {
      const response = await fetch("/api/create-portal-session", {
        method: "POST",
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error("Error:", error)
      setPortalLoading(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; text: string }> = {
      active: { color: "bg-green-100 text-green-800", text: "Active" },
      trialing: { color: "bg-blue-100 text-blue-800", text: "Trial" },
      past_due: { color: "bg-yellow-100 text-yellow-800", text: "Past Due" },
      canceled: { color: "bg-red-100 text-red-800", text: "Canceled" },
    }

    const badge = badges[status] || { color: "bg-gray-100 text-gray-800", text: status }

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}>
        {badge.text}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Subscription
          </h2>

          {subscription ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b">
                <span className="text-gray-600">Status</span>
                {getStatusBadge(subscription.status)}
              </div>

              {subscription.status === "trialing" && subscription.trial_end && (
                <div className="flex items-center justify-between py-3 border-b">
                  <span className="text-gray-600">Trial ends</span>
                  <span className="font-medium text-gray-900">
                    {formatDate(subscription.trial_end)}
                  </span>
                </div>
              )}

              {subscription.current_period_end && (
                <div className="flex items-center justify-between py-3 border-b">
                  <span className="text-gray-600">
                    {subscription.cancel_at_period_end
                      ? "Access until"
                      : "Next billing date"}
                  </span>
                  <span className="font-medium text-gray-900">
                    {formatDate(subscription.current_period_end)}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between py-3 border-b">
                <span className="text-gray-600">Plan</span>
                <span className="font-medium text-gray-900">
                  $14.99 / month
                </span>
              </div>

              {subscription.cancel_at_period_end && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800 text-sm">
                    Your subscription will be canceled at the end of the current
                    billing period. You can reactivate it anytime before then.
                  </p>
                </div>
              )}

              <button
                onClick={handleManageSubscription}
                disabled={portalLoading}
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
              >
                {portalLoading ? "Loading..." : "Manage Subscription"}
              </button>

              <p className="text-xs text-gray-500 text-center mt-2">
                Update payment method, view invoices, or cancel subscription
              </p>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">No active subscription</p>
              <a
                href="/pricing"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
              >
                Subscribe Now
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}