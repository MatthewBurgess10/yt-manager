import type React from "react"
import type { Metadata } from "next"
import {Inter} from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Replyt - Turn YouTube Comments into Insights",
  description:
    "Instantly find what your audience keeps asking and what you should answer next. Get video ideas and high-impact replies from your YouTube comments.",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        {children}

        {/* Feedback Widget */}
        <script
          src="https://www.boosttoad.com/api/widget/bundle?projectId=e2118a0c-11a3-4821-a600-d04844fd6c3a"
          async
        />

      </body>
    </html>
  )
}
