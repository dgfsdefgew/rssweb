import { type NextRequest, NextResponse } from "next/server"
import * as cheerio from "cheerio"

async function crawlSubpages(baseUrl: string, maxPages = 25): Promise<string[]> {
  const urls = [baseUrl]
  const visitedUrls = new Set([baseUrl])
  const domain = new URL(baseUrl).origin

  try {
    const response = await fetch(baseUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    })

    if (!response.ok) return [baseUrl]

    const html = await response.text()
    const $ = cheerio.load(html)

    const links: string[] = []
    $("a[href]").each((_, element) => {
      let href = $(element).attr("href")
      if (!href) return

      if (href.startsWith("/")) {
        href = domain + href
      } else if (!href.startsWith("http")) {
        href = new URL(href, baseUrl).href
      }

      if (href.startsWith(domain) && !visitedUrls.has(href)) {
        if (
          !href.match(/\.(pdf|jpg|png|gif|zip|doc|docx|css|js)$/i) &&
          !href.includes("#") &&
          !href.includes("mailto:") &&
          !href.includes("tel:")
        ) {
          links.push(href)
          visitedUrls.add(href)
        }
      }
    })

    urls.push(...links.slice(0, maxPages - 1))
  } catch (error) {
    console.error("Error crawling subpages:", error)
  }

  return urls
}

export async function POST(request: NextRequest) {
  try {
    const { url, selectors, analysis } = await request.json()

    if (!url || !selectors) {
      return NextResponse.json({ success: false, error: "URL and selectors are required" })
    }

    console.log(`Using vision-guided selectors for: ${url}`)
    console.log("Selectors:", selectors)

    // Get subpages to crawl (reduced to 25 for vision-guided approach)
    const urlsToCrawl = await crawlSubpages(url, 25)
    console.log(`Found ${urlsToCrawl.length} URLs to crawl`)

    // Extract preview items from all pages using vision-guided selectors
    const allItems: any[] = []
    let processedCount = 0

    for (const pageUrl of urlsToCrawl) {
      try {
        console.log(`Processing page ${processedCount + 1}/${urlsToCrawl.length}: ${pageUrl}`)

        const pageResponse = await fetch(pageUrl, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          },
          signal: AbortSignal.timeout(15000),
        })

        if (!pageResponse.ok) {
          console.warn(`Failed to fetch ${pageUrl}: ${pageResponse.status}`)
          continue
        }

        const contentType = pageResponse.headers.get("content-type")
        if (!contentType?.includes("text/html")) {
          console.warn(`Skipping non-HTML page: ${pageUrl}`)
          continue
        }

        const pageHtml = await pageResponse.text()
        const page$ = cheerio.load(pageHtml)

        const itemElements = page$(selectors.item)
        console.log(`Found ${itemElements.length} items on ${pageUrl}`)

        itemElements.each((index, element) => {
          const $item = page$(element)

          const titleEl = $item.find(selectors.title).first()
          const title =
            titleEl.text().trim() ||
            titleEl.attr("title") ||
            titleEl.attr("alt") ||
            `Item from ${new URL(pageUrl).pathname}`

          const linkEl = $item.find(selectors.link).first()
          let link = linkEl.attr("href") || linkEl.attr("data-href") || $item.find("a").first().attr("href") || ""

          // Make link absolute
          if (link && !link.startsWith("http")) {
            const basePageUrl = new URL(pageUrl)
            if (link.startsWith("/")) {
              link = basePageUrl.origin + link
            } else {
              link = new URL(link, pageUrl).href
            }
          }

          let description = ""
          if (selectors.description) {
            const descEl = $item.find(selectors.description).first()
            description = descEl.text().trim().substring(0, 300)
          }

          // Only add items with valid title and link
          if (title && link && title.length > 3) {
            allItems.push({
              id: `${pageUrl}-${index}-${Date.now()}`,
              title: title.substring(0, 200),
              link,
              description,
              sourcePage: pageUrl,
              selected: true,
              confidence: selectors.confidence || "medium",
            })
          }
        })

        processedCount++
        await new Promise((resolve) => setTimeout(resolve, 200))
      } catch (error) {
        console.error(`Error processing page ${pageUrl}:`, error)
        continue
      }
    }

    console.log(`Total items found: ${allItems.length}`)

    // Remove duplicates
    const uniqueItems = allItems.filter((item, index, self) => {
      return (
        index ===
        self.findIndex((other) => other.link === item.link || (other.title === item.title && other.link === item.link))
      )
    })

    console.log(`Unique items after deduplication: ${uniqueItems.length}`)

    // Sort by title
    const sortedItems = uniqueItems.sort((a, b) => a.title.localeCompare(b.title))

    return NextResponse.json({
      success: true,
      selectors,
      analysis,
      items: sortedItems,
      pagesCrawled: processedCount,
      totalPagesFound: urlsToCrawl.length,
      stats: {
        totalItems: allItems.length,
        uniqueItems: uniqueItems.length,
        duplicatesRemoved: allItems.length - uniqueItems.length,
      },
    })
  } catch (error) {
    console.error("Vision preview content error:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to preview content with vision analysis",
    })
  }
}
