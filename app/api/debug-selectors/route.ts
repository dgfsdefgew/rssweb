import { type NextRequest, NextResponse } from "next/server"
import * as cheerio from "cheerio"

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ success: false, error: "URL is required" })
    }

    // Fetch the webpage
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    })

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: `Failed to fetch webpage: ${response.status} ${response.statusText}`,
      })
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    // Debug analysis of potential selectors
    const debugInfo = {
      pageTitle: $("title").text().trim(),
      metaDescription: $('meta[name="description"]').attr("content") || "",
      totalElements: $("*").length,
      headings: {
        h1: $("h1").length,
        h2: $("h2").length,
        h3: $("h3").length,
        h4: $("h4").length,
        h5: $("h5").length,
        h6: $("h6").length,
      },
      links: $("a[href]").length,
      images: $("img").length,
      articles: $("article").length,
      sections: $("section").length,
      divs: $("div").length,
    }

    // Analyze potential content selectors
    const potentialSelectors = {
      titles: [],
      links: [],
      descriptions: [],
      categories: [],
      timestamps: [],
    }

    // Find potential title selectors
    const titleSelectors = ["h1", "h2", "h3", ".title", ".headline", ".entry-title", ".post-title", ".article-title"]
    for (const selector of titleSelectors) {
      const elements = $(selector)
      if (elements.length > 0) {
        potentialSelectors.titles.push({
          selector,
          count: elements.length,
          samples: elements
            .slice(0, 3)
            .map((i, el) => $(el).text().trim().substring(0, 100))
            .get(),
        })
      }
    }

    // Find potential link selectors
    const linkSelectors = ["a[href]", ".read-more", ".permalink", ".entry-link"]
    for (const selector of linkSelectors) {
      const elements = $(selector)
      if (elements.length > 0) {
        potentialSelectors.links.push({
          selector,
          count: elements.length,
          samples: elements
            .slice(0, 3)
            .map((i, el) => $(el).attr("href"))
            .get(),
        })
      }
    }

    // Find potential description selectors
    const descSelectors = [".excerpt", ".summary", ".description", ".content", "p", ".entry-content", ".post-content"]
    for (const selector of descSelectors) {
      const elements = $(selector)
      if (elements.length > 0) {
        potentialSelectors.descriptions.push({
          selector,
          count: elements.length,
          samples: elements
            .slice(0, 3)
            .map((i, el) => $(el).text().trim().substring(0, 150))
            .get(),
        })
      }
    }

    // Find potential category selectors
    const catSelectors = [".category", ".tag", ".label", ".topic", ".section"]
    for (const selector of catSelectors) {
      const elements = $(selector)
      if (elements.length > 0) {
        potentialSelectors.categories.push({
          selector,
          count: elements.length,
          samples: elements
            .slice(0, 3)
            .map((i, el) => $(el).text().trim())
            .get(),
        })
      }
    }

    // Find potential timestamp selectors
    const timeSelectors = [".date", ".time", "time", ".published", ".timestamp", ".post-date"]
    for (const selector of timeSelectors) {
      const elements = $(selector)
      if (elements.length > 0) {
        potentialSelectors.timestamps.push({
          selector,
          count: elements.length,
          samples: elements
            .slice(0, 3)
            .map((i, el) => $(el).text().trim() || $(el).attr("datetime"))
            .get(),
        })
      }
    }

    // Generate recommended selectors based on analysis
    const recommendedSelectors = {
      title: potentialSelectors.titles.length > 0 ? potentialSelectors.titles[0].selector : "h1, h2",
      link: potentialSelectors.links.length > 0 ? potentialSelectors.links[0].selector : "a[href]",
      description:
        potentialSelectors.descriptions.length > 0 ? potentialSelectors.descriptions[0].selector : ".excerpt, p",
      category: potentialSelectors.categories.length > 0 ? potentialSelectors.categories[0].selector : ".category",
      timestamp: potentialSelectors.timestamps.length > 0 ? potentialSelectors.timestamps[0].selector : ".date, time",
    }

    return NextResponse.json({
      success: true,
      debugInfo,
      potentialSelectors,
      recommendedSelectors,
      url,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Debug selectors error:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to debug selectors",
    })
  }
}
