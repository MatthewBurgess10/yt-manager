"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

type Subscription = {
  status: string
  trial_end: string | null
  current_period_end: string | null
}

export default function DashboardPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState(false)

  useEffect(() => {
    async function checkSubscription() {
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
        .select("status, trial_end, current_period_end")
        .eq("user_id", user.id)
        .single()

      setSubscription(data)
      setLoading(false)
    }

    checkSubscription()
  }, [])

  const handleStartTrial = async () => {
    setCheckoutLoading(true)

    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        console.error("No checkout URL received")
        setCheckoutLoading(false)
      }
    } catch (error) {
      console.error("Error:", error)
      setCheckoutLoading(false)
    }
  }

  const hasActiveSubscription =
    subscription &&
    (subscription.status === "active" || subscription.status === "trialing")

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  // Show paywall modal if no active subscription
  if (!hasActiveSubscription) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40"></div>
        
        <div className="relative z-50 max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome! 👋
            </h1>
            <p className="text-gray-600">
              Start your 14-day free trial to access your dashboard
            </p>
          </div>

          <div className="mb-6">
            <div className="inline-block bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              14 Day Free Trial
            </div>
            <div className="mb-2">
              <span className="text-4xl font-bold text-gray-900">$14.99</span>
              <span className="text-gray-500 ml-2">/month</span>
            </div>
            <p className="text-sm text-gray-500">
              Cancel anytime during your trial
            </p>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-start">
              <svg
                className="w-5 h-5 text-green-500 mt-0.5 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="ml-3 text-sm text-gray-700">
                Smart AI-powered comment filtering
              </span>
            </div>
            <div className="flex items-start">
              <svg
                className="w-5 h-5 text-green-500 mt-0.5 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="ml-3 text-sm text-gray-700">
                Prioritize questions and high-value comments
              </span>
            </div>
            <div className="flex items-start">
              <svg
                className="w-5 h-5 text-green-500 mt-0.5 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="ml-3 text-sm text-gray-700">
                Save hours managing your YouTube comments
              </span>
            </div>
          </div>

          <button
            onClick={handleStartTrial}
            disabled={checkoutLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl mb-3"
          >
            {checkoutLoading ? "Loading..." : "Start 14-Day Free Trial"}
          </button>

          <p className="text-xs text-gray-500 text-center">
            You won't be charged until your trial ends
          </p>
        </div>
      </div>
    )
  }

  // Show actual dashboard content for subscribed users
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">
            Welcome to your YouTube Comment Filter
          </p>
        </div>

        {subscription?.status === "trialing" && subscription.trial_end && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <svg
                className="w-5 h-5 text-blue-600 mt-0.5 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <p className="font-medium text-blue-900">Free Trial Active</p>
                <p className="text-sm text-blue-700">
                  Your trial ends on{" "}
                  {new Date(subscription.trial_end).toLocaleDateString()}. You
                  won't be charged until then.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Your actual dashboard content goes here */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-gray-900 mb-2">
              Total Comments
            </h3>
            <p className="text-3xl font-bold text-blue-600">0</p>
            <p className="text-sm text-gray-500 mt-1">No comments filtered yet</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-gray-900 mb-2">
              Questions Found
            </h3>
            <p className="text-3xl font-bold text-green-600">0</p>
            <p className="text-sm text-gray-500 mt-1">Awaiting your first scan</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-gray-900 mb-2">
              High Priority
            </h3>
            <p className="text-3xl font-bold text-orange-600">0</p>
            <p className="text-sm text-gray-500 mt-1">Ready to filter comments</p>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Getting Started
          </h2>
          <ol className="space-y-3">
            <li className="flex items-start">
              <span className="shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-3">
                1
              </span>
              <span className="text-gray-700">
                Connect your YouTube channel
              </span>
            </li>
            <li className="flex items-start">
              <span className="shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-3">
                2
              </span>
              <span className="text-gray-700">
                Select videos to monitor
              </span>
            </li>
            <li className="flex items-start">
              <span className="shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-3">
                3
              </span>
              <span className="text-gray-700">
                Let AI filter and prioritize your comments
              </span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  )
}