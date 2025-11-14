import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import Script from 'next/script'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'ReplyYT',
  description: 'A simple YouTube reply app with improved filtering and organization features.',
}
// app/layout.js




export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        {children}
        {/* Simple Analytics script */}
        <Script src="https://scripts.simpleanalyticscdn.com/latest.js"  />

        {/* Feedback Widget */}
        <script
          src="https://www.boosttoad.com/api/widget/bundle?projectId=e2118a0c-11a3-4821-a600-d04844fd6c3a"
          async
        />
      </body>
    </html>
  )
}
