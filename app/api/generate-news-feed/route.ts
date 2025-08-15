import { type NextRequest, NextResponse } from "next/server"
import RSS from "rss"

export async function POST(request: NextRequest) {
  try {
    const { url, newsItems, feedTitle } = await request.json()

    if (!url || !newsItems || !Array.isArray(newsItems)) {
      return NextResponse.json({ success: false, error: "Invalid request data" })
    }

    const selectedItems = newsItems.filter((item: any) => item.selected)

    if (selectedItems.length === 0) {
      return NextResponse.json({ success: false, error: "No news items selected" })
    }

    // Create RSS feed with news-specific metadata
    const feed = new RSS({
      title: feedTitle || `News Feed from ${new URL(url).hostname}`,
      description: `Top news stories extracted from ${url} using Grok AI`,
      feed_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/feed/${Date.now()}`,
      site_url: url,
      language: "en",
      categories: [...new Set(selectedItems.map((item: any) => item.category))],
      generator: "RSS Converter with Grok AI",
      ttl: 60, // 1 hour TTL for news feeds
    })

    // Add news items to feed
    selectedItems.forEach((item: any) => {
      feed.item({
        title: item.title,
        description: item.description || `News story from ${item.source}`,
        url: item.link,
        categories: [item.category],
        date: new Date().toISOString(), // Use current time since we don't have exact publish dates
        custom_elements: [
          { importance: item.importance },
          { source: item.source },
          { rank: item.rank.toString() },
          { "grok:confidence": item.confidence },
        ],
      })
    })

    const xml = feed.xml()
    const feedId = Date.now().toString()
    const feedUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/feed/${feedId}`

    return NextResponse.json({
      success: true,
      preview: {
        title: feedTitle || `News Feed from ${new URL(url).hostname}`,
        description: `Top news stories extracted from ${url} using Grok AI`,
        items: selectedItems,
        categories: [...new Set(selectedItems.map((item: any) => item.category))],
        totalItems: selectedItems.length,
      },
      xml,
      feedUrl,
      stats: {
        totalScanned: newsItems.length,
        selected: selectedItems.length,
        categories: [...new Set(selectedItems.map((item: any) => item.category))].length,
        highImportance: selectedItems.filter((item: any) => item.importance === "high").length,
      },
    })
  } catch (error) {
    console.error("News feed generation error:", error)
    return NextResponse.json({ success: false, error: "Failed to generate news feed" })
  }
}
