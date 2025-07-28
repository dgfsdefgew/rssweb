import { type NextRequest, NextResponse } from "next/server"
import RSS from "rss"

export async function POST(request: NextRequest) {
  try {
    const { url, selectedItems, feedTitle } = await request.json()

    if (!url || !selectedItems || !Array.isArray(selectedItems)) {
      return NextResponse.json({ success: false, error: "Invalid request data" })
    }

    // Create RSS feed
    const feed = new RSS({
      title: feedTitle || "Custom RSS Feed",
      description: `RSS feed generated from ${url}`,
      feed_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/feed/${Date.now()}`,
      site_url: url,
      language: "en",
    })

    selectedItems.forEach((item: any) => {
      feed.item({
        title: item.title,
        description: item.description || "",
        url: item.link,
        date: new Date().toISOString(),
      })
    })

    const xml = feed.xml()
    const feedId = Date.now().toString()
    const feedUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/feed/${feedId}`

    return NextResponse.json({
      success: true,
      preview: {
        title: feedTitle || "Custom RSS Feed",
        description: `RSS feed generated from ${url}`,
        items: selectedItems,
      },
      xml,
      feedUrl,
    })
  } catch (error) {
    console.error("Feed generation error:", error)
    return NextResponse.json({ success: false, error: "Feed generation failed" })
  }
}
