import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "RSS Feed Generator - AI-Powered News Extraction",
  description:
    "Transform any website into intelligent RSS feeds using advanced AI technology. Extract news articles, categorize content, and create beautiful magazine-style layouts.",
  keywords: "RSS feed generator, AI news extraction, content categorization, magazine layout, news aggregator",
  authors: [{ name: "RSS Feed Generator" }],
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#8b5cf6",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%238b5cf6'><path d='M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z'/></svg>"
        />
      </head>
      <body className={`${inter.className} bg-black text-white antialiased`}>{children}</body>
    </html>
  )
}
