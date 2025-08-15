import { type NextRequest, NextResponse } from "next/server"
import { xai } from "@ai-sdk/xai"
import { generateText } from "ai"
import * as cheerio from "cheerio"

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ success: false, error: "URL is required" })
    }

    // Validate URL format
    try {
      new URL(url)
    } catch {
      return NextResponse.json({ success: false, error: "Invalid URL format" })
    }

    console.log(`Starting comprehensive Grok news scan for: ${url}`)

    // Fetch the webpage content with enhanced crawling
    const { html, subpages } = await fetchPageWithSubpages(url)
    const $ = cheerio.load(html)
    const pageTitle = $("title").text() || "News Website"

    // Clean and prepare HTML for Grok analysis
    const cleanedHtml = prepareHtmlForGrok($)

    console.log(`Analyzing ${cleanedHtml.length} characters of content from ${subpages.length} pages`)

    // Use Grok to analyze and extract news items with multiple attempts
    const newsItems = await extractNewsWithGrokEnhanced(cleanedHtml, url, pageTitle, subpages)

    if (!newsItems || newsItems.length === 0) {
      return NextResponse.json({
        success: false,
        error: "No news items found. The website might not contain news content or may be blocking access.",
      })
    }

    // If we have fewer than 10 items, try to get more from subpages
    let finalNewsItems = newsItems
    if (newsItems.length < 10 && subpages.length > 1) {
      console.log(`Found only ${newsItems.length} items, scanning subpages for more...`)
      const additionalItems = await scanSubpagesForNews(subpages.slice(1, 4), url) // Scan up to 3 more pages
      finalNewsItems = [...newsItems, ...additionalItems]
    }

    // Remove duplicates and ensure we have quality items
    const uniqueItems = removeDuplicateNews(finalNewsItems)

    // Sort by importance and recency, then take top items
    const sortedItems = uniqueItems
      .sort((a, b) => {
        // First sort by importance
        const importanceOrder = { high: 3, medium: 2, low: 1 }
        const importanceDiff = importanceOrder[b.importance] - importanceOrder[a.importance]
        if (importanceDiff !== 0) return importanceDiff

        // Then by rank (lower rank = higher priority)
        return a.rank - b.rank
      })
      .slice(0, 20) // Take top 20 to ensure we have enough

    // Enhance news items with additional metadata and better categorization
    const enhancedItems = await enhanceNewsItems(sortedItems, url)

    console.log(`Final result: ${enhancedItems.length} unique news items extracted`)

    return NextResponse.json({
      success: true,
      newsItems: enhancedItems,
      pageTitle,
      url,
      method: "grok-ai-enhanced-analysis",
      totalFound: enhancedItems.length,
      pagesScanned: subpages.length,
      timestamp: new Date().toISOString(),
      stats: {
        originalItems: newsItems.length,
        afterDeduplication: uniqueItems.length,
        finalItems: enhancedItems.length,
        pagesAnalyzed: subpages.length,
      },
    })
  } catch (error) {
    console.error("Grok news scan error:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to scan news with Grok AI",
      fallbackAvailable: true,
    })
  }
}

async function fetchPageWithSubpages(url: string): Promise<{ html: string; subpages: string[] }> {
  const subpages = [url] // Start with main page
  const domain = new URL(url).origin

  try {
    // Fetch main page
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate, br",
        DNT: "1",
        Connection: "keep-alive",
        "Upgrade-Insecure-Requests": "1",
      },
      signal: AbortSignal.timeout(20000),
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch page: ${response.status} ${response.statusText}`)
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    // Find additional news pages/sections
    const additionalPages = new Set<string>()

    // Look for common news section patterns
    const newsPatterns = [
      'a[href*="/news"]',
      'a[href*="/latest"]',
      'a[href*="/breaking"]',
      'a[href*="/headlines"]',
      'a[href*="/stories"]',
      'a[href*="/articles"]',
      'a[href*="/today"]',
      'a[href*="/recent"]',
      ".news-section a[href]",
      ".latest-news a[href]",
      ".headlines a[href]",
      ".breaking-news a[href]",
      // Pagination patterns
      'a[href*="page="]',
      'a[href*="/page/"]',
      ".pagination a[href]",
      ".next a[href]",
      'a[rel="next"]',
    ]

    for (const pattern of newsPatterns) {
      $(pattern).each((_, element) => {
        let href = $(element).attr("href")
        if (!href) return

        // Make absolute URL
        if (href.startsWith("/")) {
          href = domain + href
        } else if (!href.startsWith("http")) {
          href = new URL(href, url).href
        }

        // Only include same-domain links
        if (href.startsWith(domain) && href !== url) {
          additionalPages.add(href)
        }
      })
    }

    // Add the most promising additional pages (limit to avoid too many requests)
    const additionalPagesArray = Array.from(additionalPages).slice(0, 5)
    subpages.push(...additionalPagesArray)

    console.log(`Found ${subpages.length} pages to analyze: ${subpages.join(", ")}`)

    // Combine HTML from multiple pages for comprehensive analysis
    let combinedHtml = html

    // Fetch a few additional pages to get more content
    for (let i = 1; i < Math.min(subpages.length, 3); i++) {
      try {
        const pageResponse = await fetch(subpages[i], {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          },
          signal: AbortSignal.timeout(10000),
        })

        if (pageResponse.ok) {
          const pageHtml = await pageResponse.text()
          combinedHtml += "\n\n<!-- ADDITIONAL PAGE CONTENT -->\n\n" + pageHtml
        }
      } catch (error) {
        console.warn(`Failed to fetch additional page ${subpages[i]}:`, error)
      }
    }

    return { html: combinedHtml, subpages }
  } catch (error) {
    console.error("Error fetching page with subpages:", error)
    throw error
  }
}

async function scanSubpagesForNews(subpageUrls: string[], baseUrl: string): Promise<any[]> {
  const additionalNews: any[] = []

  for (const pageUrl of subpageUrls) {
    try {
      console.log(`Scanning additional page: ${pageUrl}`)

      const response = await fetch(pageUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
        signal: AbortSignal.timeout(10000),
      })

      if (!response.ok) continue

      const html = await response.text()
      const $ = cheerio.load(html)
      const cleanedHtml = prepareHtmlForGrok($)

      // Use Grok to extract news from this page
      const pageNews = await extractNewsWithGrok(
        cleanedHtml,
        pageUrl,
        `Additional page from ${new URL(baseUrl).hostname}`,
      )

      if (pageNews && pageNews.length > 0) {
        additionalNews.push(...pageNews)
        console.log(`Found ${pageNews.length} additional news items from ${pageUrl}`)
      }

      // Add delay to be respectful
      await new Promise((resolve) => setTimeout(resolve, 1000))
    } catch (error) {
      console.warn(`Failed to scan subpage ${pageUrl}:`, error)
    }
  }

  return additionalNews
}

function prepareHtmlForGrok($: cheerio.CheerioAPI): string {
  // Remove unnecessary elements but keep more content for better analysis
  $("script, style, noscript, nav, footer, .sidebar, .ads, .advertisement, .social-share, .comments").remove()

  // Focus on main content areas but be more inclusive
  let mainContent =
    $("main").html() ||
    $("article").parent().html() ||
    $(".content, .main, #content, #main, .news-content, .articles, .stories, .headlines, .news-list").html() ||
    $("body").html()

  // Increase the limit to capture more content
  if (mainContent && mainContent.length > 25000) {
    // Take first 25000 characters to get more comprehensive content
    mainContent = mainContent.substring(0, 25000) + "..."
  }

  return mainContent || ""
}

async function extractNewsWithGrokEnhanced(html: string, url: string, pageTitle: string, subpages: string[]) {
  try {
    console.log("Using Grok to extract comprehensive news items...")

    const response = await generateText({
      model: xai("grok-3"),
      system: `You are an expert news analyst and web scraper. Your task is to analyze HTML content from news websites and extract AT LEAST 10-15 news items, but preferably more if available.

ANALYSIS GUIDELINES:
1. Focus on actual news articles, stories, and reports
2. Look for ALL news content, not just the most recent
3. Include breaking news, featured stories, regular articles, and news briefs
4. Avoid advertisements, navigation, and promotional content
5. Extract meaningful descriptions when available
6. Ensure each item has a clear title and link
7. Be comprehensive - find as many legitimate news items as possible
8. Include both main stories and smaller news items
9. Look for news in different sections (politics, tech, sports, business, etc.)
10. Don't limit yourself to just "top" stories - include all news content

CATEGORY CLASSIFICATION:
Classify each news item into ONE of these specific categories:
- Technology (tech, AI, software, hardware, startups, digital)
- Business (finance, economy, markets, companies, earnings)
- Politics (government, elections, policy, international relations)
- Sports (all sports, games, athletes, competitions)
- Entertainment (movies, music, celebrities, TV, gaming)
- Health (medicine, wellness, healthcare, research)
- Science (research, discoveries, space, environment)
- World (international news, global events, conflicts)
- General (anything that doesn't fit other categories)

IMPORTANCE LEVELS:
- high: Breaking news, major announcements, significant events
- medium: Regular news stories, updates, moderate importance
- low: Minor updates, brief mentions, less critical news

RESPONSE FORMAT:
Return a JSON array of news items (aim for 15-20+ items if available) in this format:
[
  {
    "title": "Clear, descriptive news headline",
    "link": "Full URL to the article (make absolute if relative)",
    "description": "Brief summary or excerpt of the news (2-3 sentences max)",
    "category": "One of the 9 categories listed above",
    "importance": "high/medium/low based on news significance",
    "timestamp": "Estimated publication time if available, or 'recent'"
  }
]

IMPORTANT REQUIREMENTS:
- Return ONLY the JSON array, no additional text
- Aim for AT LEAST 10 items, preferably 15-20+
- Ensure all URLs are absolute (start with http:// or https://)
- Make titles concise but informative
- Descriptions should be factual and neutral
- Categories must be exactly one of the 9 listed categories
- Include ALL types of news content you can find
- Don't be overly selective - include more rather than fewer items
- Look for news in headers, sidebars, featured sections, and article lists`,

      prompt: `Analyze this comprehensive HTML content from ${url} (${pageTitle}) and extract ALL available news items. This content may include multiple pages: ${subpages.join(", ")}

HTML CONTENT:
${html}

Website URL: ${url}
Page Title: ${pageTitle}
Pages Analyzed: ${subpages.length}

Extract ALL news items from this content - aim for 15-20+ items if available. Look comprehensively through all sections, not just the main headlines. Include breaking news, featured stories, regular articles, news briefs, and any other news content you can identify.

CRITICAL: Use ONLY these 9 categories: Technology, Business, Politics, Sports, Entertainment, Health, Science, World, General`,
    })

    const text = response.text
    console.log("Grok comprehensive response received, parsing...")

    // Parse the JSON response
    let cleanedText = text.trim()
    if (cleanedText.startsWith("```json")) {
      cleanedText = cleanedText.replace(/^```json\s*/, "").replace(/\s*```$/, "")
    } else if (cleanedText.startsWith("```")) {
      cleanedText = cleanedText.replace(/^```\s*/, "").replace(/\s*```$/, "")
    }

    const newsItems = JSON.parse(cleanedText)

    if (!Array.isArray(newsItems)) {
      throw new Error("Grok did not return a valid array of news items")
    }

    // Validate and clean up the news items with better category normalization
    const validItems = newsItems
      .filter((item) => item.title && item.title.trim().length > 0)
      .map((item, index) => ({
        id: `grok-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: item.title.trim(),
        link: makeAbsoluteUrl(item.link, url),
        description: item.description || "",
        category: normalizeCategory(item.category),
        importance: item.importance || "medium",
        timestamp: item.timestamp || "recent",
        source: new URL(url).hostname,
        selected: true,
        rank: index + 1,
      }))

    console.log(`Grok extracted ${validItems.length} valid news items`)

    // If we still have fewer than 10 items, try a second pass with different instructions
    if (validItems.length < 10) {
      console.log("Fewer than 10 items found, attempting second pass...")
      const additionalItems = await extractNewsSecondPass(html, url, pageTitle)
      return [...validItems, ...additionalItems]
    }

    return validItems
  } catch (error) {
    console.error("Grok comprehensive news extraction failed:", error)

    // If Grok fails, try a fallback approach
    if (error instanceof Error && error.message.includes("JSON")) {
      console.log("JSON parsing failed, attempting to extract from raw response...")
      return extractNewsFromRawResponse("", url)
    }

    throw new Error(`Grok analysis failed: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

function normalizeCategory(category: string): string {
  if (!category) return "General"

  const normalized = category.toLowerCase().trim()

  // Map various category names to our standard 9 categories
  const categoryMap = {
    // Technology variations
    tech: "Technology",
    technology: "Technology",
    ai: "Technology",
    artificial: "Technology",
    software: "Technology",
    hardware: "Technology",
    digital: "Technology",
    startup: "Technology",
    startups: "Technology",
    internet: "Technology",
    cyber: "Technology",

    // Business variations
    business: "Business",
    finance: "Business",
    financial: "Business",
    economy: "Business",
    economic: "Business",
    market: "Business",
    markets: "Business",
    money: "Business",
    corporate: "Business",
    company: "Business",
    earnings: "Business",

    // Politics variations
    politics: "Politics",
    political: "Politics",
    government: "Politics",
    election: "Politics",
    elections: "Politics",
    policy: "Politics",
    congress: "Politics",
    senate: "Politics",
    president: "Politics",

    // Sports variations
    sports: "Sports",
    sport: "Sports",
    football: "Sports",
    basketball: "Sports",
    baseball: "Sports",
    soccer: "Sports",
    tennis: "Sports",
    golf: "Sports",
    olympics: "Sports",

    // Entertainment variations
    entertainment: "Entertainment",
    celebrity: "Entertainment",
    celebrities: "Entertainment",
    movie: "Entertainment",
    movies: "Entertainment",
    music: "Entertainment",
    tv: "Entertainment",
    television: "Entertainment",
    gaming: "Entertainment",
    games: "Entertainment",

    // Health variations
    health: "Health",
    healthcare: "Health",
    medical: "Health",
    medicine: "Health",
    wellness: "Health",
    fitness: "Health",

    // Science variations
    science: "Science",
    scientific: "Science",
    research: "Science",
    study: "Science",
    space: "Science",
    environment: "Science",
    climate: "Science",

    // World variations
    world: "World",
    international: "World",
    global: "World",
    foreign: "World",
    conflict: "World",
    war: "World",

    // General fallback
    news: "General",
    general: "General",
    other: "General",
    misc: "General",
    miscellaneous: "General",
  }

  // Check for exact matches first
  if (categoryMap[normalized]) {
    return categoryMap[normalized]
  }

  // Check for partial matches
  for (const [key, value] of Object.entries(categoryMap)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return value
    }
  }

  // Default to General if no match found
  return "General"
}

async function extractNewsSecondPass(html: string, url: string, pageTitle: string) {
  try {
    console.log("Attempting second pass with more aggressive extraction...")

    const response = await generateText({
      model: xai("grok-3"),
      system: `You are a comprehensive news extraction specialist. Your goal is to find EVERY possible news item, article, or story from the provided HTML content.

EXTRACTION STRATEGY:
1. Look for ANY content that could be considered news or articles
2. Include headlines, subheadings, article titles, story briefs
3. Don't be picky about importance - include everything news-related
4. Look in ALL sections: main content, sidebars, footers, lists
5. Include blog posts, opinion pieces, analysis articles
6. Find news from different time periods (today, yesterday, this week)
7. Extract from news feeds, article lists, story collections
8. Include both major stories and minor news items

CATEGORIES: Use ONLY these 9 categories:
Technology, Business, Politics, Sports, Entertainment, Health, Science, World, General

GOAL: Extract 15-25+ items if possible. Be comprehensive, not selective.`,

      prompt: `Perform a comprehensive second-pass extraction on this HTML content. Find EVERY possible news item, article, or story:

${html.substring(0, 15000)}

Extract ALL news-related content you can find. Don't limit to just top stories - include everything that could be considered news or articles. Use ONLY the 9 specified categories.`,
    })

    const text = response.text
    let cleanedText = text.trim()
    if (cleanedText.startsWith("```json")) {
      cleanedText = cleanedText.replace(/^```json\s*/, "").replace(/\s*```$/, "")
    } else if (cleanedText.startsWith("```")) {
      cleanedText = cleanedText.replace(/^```\s*/, "").replace(/\s*```$/, "")
    }

    const newsItems = JSON.parse(cleanedText)

    if (Array.isArray(newsItems)) {
      return newsItems
        .filter((item) => item.title && item.title.trim().length > 0)
        .map((item, index) => ({
          id: `grok-second-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title: item.title.trim(),
          link: makeAbsoluteUrl(item.link, url),
          description: item.description || "",
          category: normalizeCategory(item.category),
          importance: item.importance || "low", // Mark second pass items as lower importance
          timestamp: item.timestamp || "recent",
          source: new URL(url).hostname,
          selected: true,
          rank: index + 100, // Give higher rank numbers to second pass items
        }))
    }

    return []
  } catch (error) {
    console.error("Second pass extraction failed:", error)
    return []
  }
}

// Keep the existing helper functions but enhance them
async function extractNewsWithGrok(html: string, url: string, pageTitle: string) {
  // This is a simpler version for subpage scanning
  try {
    const response = await generateText({
      model: xai("grok-3"),
      prompt: `Extract all news items from this HTML content from ${url}. Return as JSON array with title, link, description, category (use ONLY: Technology, Business, Politics, Sports, Entertainment, Health, Science, World, General), importance, timestamp fields. Find as many news items as possible:

${html.substring(0, 10000)}`,
    })

    let cleanedText = response.text.trim()
    if (cleanedText.startsWith("```json")) {
      cleanedText = cleanedText.replace(/^```json\s*/, "").replace(/\s*```$/, "")
    } else if (cleanedText.startsWith("```")) {
      cleanedText = cleanedText.replace(/^```\s*/, "").replace(/\s*```$/, "")
    }

    const newsItems = JSON.parse(cleanedText)

    if (Array.isArray(newsItems)) {
      return newsItems
        .filter((item) => item.title && item.title.trim().length > 0)
        .map((item, index) => ({
          id: `grok-sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title: item.title.trim(),
          link: makeAbsoluteUrl(item.link, url),
          description: item.description || "",
          category: normalizeCategory(item.category),
          importance: item.importance || "medium",
          timestamp: item.timestamp || "recent",
          source: new URL(url).hostname,
          selected: true,
          rank: index + 50,
        }))
    }

    return []
  } catch (error) {
    console.error("Subpage news extraction failed:", error)
    return []
  }
}

function removeDuplicateNews(newsItems: any[]): any[] {
  const seen = new Set<string>()
  const unique: any[] = []

  for (const item of newsItems) {
    // Create a key based on title and link
    const key = `${item.title.toLowerCase().trim()}-${item.link}`

    // Also check for very similar titles (first 50 characters)
    const titleKey = item.title.toLowerCase().trim().substring(0, 50)
    const hasSimilarTitle = unique.some((existing) => existing.title.toLowerCase().trim().substring(0, 50) === titleKey)

    if (!seen.has(key) && !hasSimilarTitle) {
      seen.add(key)
      unique.push(item)
    }
  }

  console.log(`Removed ${newsItems.length - unique.length} duplicate items`)
  return unique
}

function extractNewsFromRawResponse(rawText: string, url: string) {
  // Enhanced fallback extraction
  console.log("Attempting comprehensive fallback extraction from raw Grok response...")

  const lines = rawText.split("\n").filter((line) => line.trim().length > 0)
  const newsItems = []

  let currentItem = null
  for (const line of lines) {
    const trimmedLine = line.trim()

    // Look for title patterns (more comprehensive)
    if (
      trimmedLine.match(/^[\d.\-*]\s*/) ||
      trimmedLine.match(/^Title:/i) ||
      trimmedLine.match(/^Headline:/i) ||
      trimmedLine.match(/^\d+\.\s*/) ||
      (trimmedLine.length > 20 && trimmedLine.length < 200 && !trimmedLine.includes("http"))
    ) {
      if (currentItem && currentItem.title) {
        newsItems.push(currentItem)
      }
      currentItem = {
        id: `grok-fallback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: trimmedLine.replace(/^[\d.\-*]\s*/, "").replace(/^(Title|Headline):\s*/i, ""),
        link: url,
        description: "",
        category: "General",
        importance: "medium",
        timestamp: "recent",
        source: new URL(url).hostname,
        selected: true,
        rank: newsItems.length + 1,
      }
    } else if (currentItem && (trimmedLine.match(/^Link:/i) || trimmedLine.startsWith("http"))) {
      currentItem.link = makeAbsoluteUrl(trimmedLine.replace(/^Link:\s*/i, ""), url)
    } else if (currentItem && trimmedLine.match(/^Description:/i)) {
      currentItem.description = trimmedLine.replace(/^Description:\s*/i, "")
    }
  }

  if (currentItem && currentItem.title) {
    newsItems.push(currentItem)
  }

  console.log(`Fallback extraction found ${newsItems.length} items`)
  return newsItems
}

function makeAbsoluteUrl(link: string, baseUrl: string): string {
  if (!link || link.trim() === "") {
    return baseUrl
  }

  try {
    if (link.startsWith("http://") || link.startsWith("https://")) {
      return link
    }

    const base = new URL(baseUrl)
    if (link.startsWith("/")) {
      return base.origin + link
    } else {
      return new URL(link, baseUrl).href
    }
  } catch (error) {
    console.warn(`Failed to make absolute URL from ${link}:`, error)
    return baseUrl
  }
}

async function enhanceNewsItems(items: any[], baseUrl: string) {
  return items.map((item, index) => ({
    ...item,
    extractedAt: new Date().toISOString(),
    baseUrl,
    confidence: item.importance === "high" ? "high" : item.importance === "low" ? "low" : "medium",
    // Ensure category is properly normalized
    category: normalizeCategory(item.category),
  }))
}
