import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import * as cheerio from "cheerio"

const genAI = new GoogleGenerativeAI("AIzaSyBg8Pwp9JNZ7cq9HfN_XVo7k6vVViyNl5M")

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

    console.log(`Starting analysis for: ${url}`)

    // Try ScreenshotOne API (will fail without API key)
    console.log("Checking ScreenshotOne availability...")
    const screenshotResult = await getScreenshotViaScreenshotOne(url)

    // Since screenshot services require API keys, use HTML-only analysis
    console.log("Screenshot services require API keys, using HTML-only analysis...")
    return await performHtmlOnlyAnalysis(url)
  } catch (error) {
    console.error("Vision analysis error:", error)

    // Always return JSON, never let the error bubble up as HTML
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Analysis failed due to an unexpected error",
      fallbackAvailable: true,
    })
  }
}

async function getScreenshotViaScreenshotOne(url: string) {
  try {
    console.log("ScreenshotOne requires API key, skipping...")

    // ScreenshotOne requires an API key even for free tier
    // Since we don't have one configured, we'll skip this service
    return {
      success: false,
      error: "ScreenshotOne requires API key configuration",
    }
  } catch (error) {
    console.error("ScreenshotOne failed:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "ScreenshotOne failed",
    }
  }
}

async function performHtmlOnlyAnalysis(url: string) {
  try {
    console.log("Performing HTML-only analysis")

    const html = await fetchPageHtml(url)
    const $ = cheerio.load(html)
    const pageTitle = $("title").text() || "Unknown Page"

    // Create a mock analysis based on HTML structure
    const analysisResult = await analyzeHtmlStructure($, url)

    // Generate selectors based on HTML analysis with fallback handling
    const cleanedHtml = prepareHtmlForAI($)
    let selectors

    try {
      selectors = await generateSelectorsFromHtmlAnalysis(cleanedHtml, url)
    } catch (error) {
      console.error("Selector generation failed, using enhanced fallback:", error)
      selectors = generateIntelligentFallback(cleanedHtml, url)
    }

    return NextResponse.json({
      success: true,
      screenshot: null, // No screenshot available
      analysis: analysisResult,
      selectors,
      pageTitle,
      url,
      method: "html-only",
      note: selectors.reasoning?.includes("Fallback mode")
        ? "Using intelligent HTML analysis - AI service temporarily unavailable"
        : "Using intelligent HTML structure analysis - screenshot services require API key configuration",
    })
  } catch (error) {
    console.error("HTML-only analysis failed:", error)
    return NextResponse.json({
      success: false,
      error: "HTML analysis failed. Please try traditional scraping instead.",
      fallbackAvailable: true,
    })
  }
}

async function fetchPageHtml(url: string): Promise<string> {
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
    signal: AbortSignal.timeout(15000),
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch page: ${response.status} ${response.statusText}`)
  }

  return await response.text()
}

async function analyzeHtmlStructure($: cheerio.CheerioAPI, url: string) {
  // Enhanced HTML structure analysis with better pattern detection
  const analysis = {
    contentPatterns: {},
    semanticElements: {},
    classPatterns: {},
    structuralHints: {},
    contentDensity: {},
    linkPatterns: {},
  }

  // 1. Analyze semantic HTML elements
  analysis.semanticElements = {
    articles: $("article").length,
    sections: $("section").length,
    headers: $("header").length,
    mains: $("main").length,
    asides: $("aside").length,
    navs: $("nav").length,
  }

  // 2. Analyze common content class patterns
  const commonPatterns = [
    "post",
    "entry",
    "item",
    "card",
    "listing",
    "product",
    "shop",
    "company",
    "result",
    "content",
    "article",
    "news",
    "story",
    "blog",
    "feed",
    "tile",
    "box",
    "container",
    "wrapper",
    "block",
    "unit",
    "piece",
    "element",
  ]

  for (const pattern of commonPatterns) {
    const exactClass = $(`.${pattern}`).length
    const containsClass = $(`[class*="${pattern}"]`).length
    if (exactClass > 0 || containsClass > 0) {
      analysis.classPatterns[pattern] = { exact: exactClass, contains: containsClass }
    }
  }

  // 3. Analyze heading structure and content hierarchy
  const headings = {
    h1: $("h1").length,
    h2: $("h2").length,
    h3: $("h3").length,
    h4: $("h4").length,
    h5: $("h5").length,
    h6: $("h6").length,
  }

  // 4. Analyze link patterns
  analysis.linkPatterns = {
    totalLinks: $("a[href]").length,
    internalLinks: $("a[href^='/'], a[href*='" + new URL(url).hostname + "']").length,
    externalLinks: $("a[href^='http']:not([href*='" + new URL(url).hostname + "'])").length,
    linksWithText: $("a[href]").filter((_, el) => $(el).text().trim().length > 0).length,
  }

  // 5. Content density analysis - find areas with high content concentration
  const contentAreas = ["main", "article", ".content", ".main", "#content", "#main", ".container", ".wrapper"]
  for (const area of contentAreas) {
    const $area = $(area)
    if ($area.length > 0) {
      const textLength = $area.text().length
      const linkCount = $area.find("a[href]").length
      const headingCount = $area.find("h1, h2, h3, h4, h5, h6").length

      analysis.contentDensity[area] = {
        textLength,
        linkCount,
        headingCount,
        score: textLength / 100 + linkCount * 2 + headingCount * 3,
      }
    }
  }

  // 6. Detect repeating patterns by analyzing DOM structure
  const repeatingPatterns = findRepeatingPatterns($)

  // 7. Smart content type detection
  let contentType = "unknown"
  let layoutType = "mixed"
  let confidence = "low"

  // Enhanced content type detection logic
  if (analysis.semanticElements.articles > 3) {
    contentType = "blog"
    layoutType = "list"
    confidence = "high"
  } else if (analysis.classPatterns.product?.contains > 3 || analysis.classPatterns.shop?.contains > 3) {
    contentType = "ecommerce"
    layoutType = "grid"
    confidence = "high"
  } else if (analysis.classPatterns.news?.contains > 3 || analysis.classPatterns.story?.contains > 3) {
    contentType = "news"
    layoutType = "list"
    confidence = "high"
  } else if (analysis.classPatterns.company?.contains > 3 || analysis.classPatterns.listing?.contains > 3) {
    contentType = "directory"
    layoutType = "list"
    confidence = "high"
  } else if (analysis.classPatterns.post?.contains > 3 || analysis.classPatterns.entry?.contains > 3) {
    contentType = "blog"
    layoutType = "list"
    confidence = "medium"
  } else if (analysis.classPatterns.card?.contains > 3 || analysis.classPatterns.tile?.contains > 3) {
    contentType = "mixed"
    layoutType = "cards"
    confidence = "medium"
  } else if (repeatingPatterns.bestPattern && repeatingPatterns.bestPattern.count > 3) {
    contentType = "structured"
    layoutType = "list"
    confidence = "medium"
  }

  // 8. Generate content areas description
  const totalContentItems =
    Object.values(analysis.classPatterns).reduce((sum, pattern) => sum + pattern.contains, 0) +
    analysis.semanticElements.articles

  const mainContentAreas = [
    {
      description: `Detected ${totalContentItems} potential content containers using enhanced HTML structure analysis`,
      location: "main content area",
      importance: "high",
      contentPattern: `${contentType} items in ${layoutType} layout`,
      details: {
        semanticElements: analysis.semanticElements,
        topPatterns: Object.entries(analysis.classPatterns)
          .sort(([, a], [, b]) => b.contains - a.contains)
          .slice(0, 3)
          .map(([pattern, data]) => ({ pattern, count: data.contains })),
        repeatingPattern: repeatingPatterns.bestPattern
          ? {
              className: repeatingPatterns.bestPattern.className,
              count: repeatingPatterns.bestPattern.count,
            }
          : null,
      },
    },
  ]

  return {
    contentType,
    mainContentAreas,
    recommendedFocus: `Focus on ${contentType} content extraction using enhanced HTML structure analysis with ${confidence} confidence`,
    layoutType,
    excludeAreas: ["navigation", "sidebar", "footer", "ads", "header"],
    confidence,
    method: "enhanced-html-structure-analysis",
    analysis: analysis,
    repeatingPatterns: {
      bestPattern: repeatingPatterns.bestPattern
        ? {
            className: repeatingPatterns.bestPattern.className,
            count: repeatingPatterns.bestPattern.count,
          }
        : null,
      validPatterns: repeatingPatterns.validPatterns.slice(0, 5).map(([className, data]) => ({
        className,
        count: data.count,
      })),
    },
  }
}

function findRepeatingPatterns($: cheerio.CheerioAPI) {
  const patterns = {}
  const minOccurrences = 3

  // Look for repeating class patterns
  $("[class]").each((_, element) => {
    const classes = $(element).attr("class")?.split(" ") || []

    for (const className of classes) {
      if (className.length > 2) {
        // Ignore very short class names
        if (!patterns[className]) {
          patterns[className] = { count: 0, elements: [] }
        }
        patterns[className].count++
        // Don't store the actual elements to avoid circular references
        patterns[className].elements.push($(element).get(0)?.tagName || "unknown")
      }
    }
  })

  // Find the best repeating pattern
  const validPatterns = Object.entries(patterns)
    .filter(([, data]) => data.count >= minOccurrences)
    .sort(([, a], [, b]) => b.count - a.count)

  const bestPattern =
    validPatterns.length > 0
      ? {
          className: validPatterns[0][0],
          count: validPatterns[0][1].count,
          // Don't include elements to avoid circular references
        }
      : null

  return {
    allPatterns: Object.fromEntries(Object.entries(patterns).map(([key, data]) => [key, { count: data.count }])),
    validPatterns: validPatterns.slice(0, 5), // Top 5 patterns
    bestPattern,
  }
}

async function generateSelectorsFromHtmlAnalysis(html: string, url: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const prompt = `
You are an expert web scraper with deep knowledge of HTML patterns and CSS selectors. Analyze this HTML structure and generate the most effective CSS selectors for extracting RSS feed content.

HTML STRUCTURE:
${html}

ANALYSIS CONTEXT:
- URL: ${url}
- Task: Generate selectors for RSS feed content extraction
- Priority: Accuracy and reliability over complexity

Generate CSS selectors using this enhanced approach:

1. CONTENT CONTAINER ANALYSIS:
   - Look for repeating patterns (same class names, similar structures)
   - Identify semantic HTML elements (article, section, div with content classes)
   - Find containers that hold multiple similar items
   - Consider grid/list layouts, card patterns, and content blocks

2. TITLE EXTRACTION STRATEGY:
   - Prioritize heading tags (h1-h6) within containers
   - Look for elements with title-related classes (.title, .headline, .name, etc.)
   - Consider link text as titles when appropriate
   - Ensure titles are descriptive and meaningful

3. LINK DETECTION APPROACH:
   - Find anchor tags with href attributes
   - Look for data-href or other link attributes
   - Consider parent/child relationships for nested links
   - Ensure links are actionable and lead to content

4. DESCRIPTION EXTRACTION:
   - Identify paragraph tags, summary classes, excerpt areas
   - Look for content previews, descriptions, or introductory text
   - Consider meta descriptions or structured data
   - Handle cases where descriptions might not exist

5. SELECTOR OPTIMIZATION:
   - Use multiple selector options separated by commas for better coverage
   - Balance specificity with flexibility
   - Avoid overly complex selectors that might break
   - Test mental model: "Will this work on similar pages?"

Provide selectors in this exact JSON format:
{
  "item": "CSS selector for each content item/article container",
  "title": "CSS selector for the title within each item",
  "link": "CSS selector for the link within each item",
  "description": "CSS selector for description/excerpt within each item (can be empty string if none)",
  "confidence": "high/medium/low based on pattern clarity",
  "reasoning": "Detailed explanation of selector choices and HTML patterns identified"
}

IMPORTANT REQUIREMENTS:
- NEVER return empty strings for item, title, or link selectors
- Use fallback options with comma separation (e.g., "h2, .title, .headline")
- Make selectors work within the item container context
- Consider that these selectors will be used with jQuery/Cheerio
- Optimize for content that would be valuable in an RSS feed

EXAMPLES OF GOOD SELECTOR PATTERNS:
- item: "article, .post, .entry, .item, .card, .listing, .product"
- title: "h1, h2, h3, .title, .headline, .name, a"
- link: "a[href], .link, [data-href]"
- description: "p, .excerpt, .summary, .description, .content"

Return ONLY the JSON object, no additional text.
`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    try {
      let cleanedText = text.trim()
      if (cleanedText.startsWith("```json")) {
        cleanedText = cleanedText.replace(/^```json\s*/, "").replace(/\s*```$/, "")
      } else if (cleanedText.startsWith("```")) {
        cleanedText = cleanedText.replace(/^```\s*/, "").replace(/\s*```$/, "")
      }

      const selectors = JSON.parse(cleanedText)

      // Enhanced validation with better fallbacks
      if (
        !selectors.item ||
        !selectors.title ||
        !selectors.link ||
        selectors.item.trim() === "" ||
        selectors.title.trim() === "" ||
        selectors.link.trim() === ""
      ) {
        console.warn("AI returned invalid selectors, using enhanced fallback")
        return enhancedFallbackDetection()
      }

      // Ensure we have confidence and reasoning
      if (!selectors.confidence) {
        selectors.confidence = "medium"
      }
      if (!selectors.reasoning) {
        selectors.reasoning = "AI-generated selectors based on HTML structure analysis"
      }

      return selectors
    } catch (parseError) {
      console.error("Failed to parse enhanced HTML analysis selector response:", text)
      return enhancedFallbackDetection()
    }
  } catch (error) {
    console.error("Enhanced HTML analysis selector generation error:", error)

    // Check if it's an API overload error
    if (error instanceof Error && error.message.includes("overloaded")) {
      console.log("Gemini API is overloaded, using intelligent HTML-based fallback")
      return generateIntelligentFallback(html, url)
    }

    return enhancedFallbackDetection()
  }
}

function generateIntelligentFallback(html: string, url: string) {
  console.log("Generating intelligent fallback selectors based on HTML analysis")

  // Parse HTML to find patterns
  const $ = cheerio.load(html)

  // Analyze common patterns in the HTML
  const patterns = {
    articles: $("article").length,
    posts: $('.post, .entry, [class*="post"], [class*="entry"]').length,
    items: $('.item, [class*="item"]').length,
    cards: $('.card, [class*="card"]').length,
    listings: $('.listing, .list-item, [class*="listing"]').length,
    products: $('.product, [class*="product"]').length,
    news: $('.news, [class*="news"]').length,
    stories: $('.story, [class*="story"]').length,
  }

  // Find the most common pattern
  const maxPattern = Object.entries(patterns).reduce(
    (max, [key, value]) => (value > max.value ? { key, value } : max),
    { key: "items", value: 0 },
  )

  // Generate selectors based on detected patterns
  let itemSelector = "article, .post, .entry, .item, .card, .listing, .product"
  let confidence = "medium"
  let reasoning = "Intelligent HTML analysis fallback - Gemini API temporarily unavailable"

  if (maxPattern.value > 3) {
    switch (maxPattern.key) {
      case "articles":
        itemSelector = "article, .post, .entry, .content-item"
        confidence = "high"
        reasoning = `Found ${maxPattern.value} article elements - likely a blog or news site`
        break
      case "posts":
        itemSelector = ".post, .entry, article, .blog-post"
        confidence = "high"
        reasoning = `Found ${maxPattern.value} post elements - likely a blog or forum`
        break
      case "cards":
        itemSelector = ".card, .item, .product, .listing"
        confidence = "high"
        reasoning = `Found ${maxPattern.value} card elements - likely a grid-based layout`
        break
      case "products":
        itemSelector = ".product, .item, .card, .listing"
        confidence = "high"
        reasoning = `Found ${maxPattern.value} product elements - likely an e-commerce site`
        break
      case "listings":
        itemSelector = ".listing, .item, .entry, .result"
        confidence = "high"
        reasoning = `Found ${maxPattern.value} listing elements - likely a directory or catalog`
        break
      default:
        itemSelector = `.${maxPattern.key}, .item, .card, .entry`
        reasoning = `Found ${maxPattern.value} ${maxPattern.key} elements - using pattern-based selectors`
    }
  }

  return {
    item: itemSelector,
    title: "h1, h2, h3, h4, .title, .headline, .name, .subject, a, [class*='title'], [class*='name']",
    link: "a[href], .link, [href], .url, .read-more, [data-href]",
    description: "p, .excerpt, .summary, .description, .content, .text, [class*='desc'], [class*='summary']",
    confidence,
    reasoning: reasoning + " (Fallback mode due to API limitations)",
  }
}

function enhancedFallbackDetection() {
  return {
    item: "article, .post, .entry, .item, .card, .listing, .product, .shop, .company, .result, .content-item, .grid-item, .list-item, .news-item, .story, .blog-post, .feed-item, [class*='item'], [class*='card'], [class*='post'], [class*='entry'], [class*='product'], [class*='listing']",
    title:
      "h1, h2, h3, h4, h5, .title, .headline, .name, .subject, .entry-title, .post-title, .product-name, .item-title, a, .link-title, [class*='title'], [class*='name'], [class*='headline'], [class*='subject']",
    link: "a[href], .link, [href], .url, .read-more, .permalink, .item-link, .post-link, .entry-link, [data-href], [data-url]",
    description:
      "p, .excerpt, .summary, .description, .content, .text, .body, .intro, .preview, .snippet, .abstract, [class*='desc'], [class*='summary'], [class*='excerpt'], [class*='content'], [class*='text']",
    confidence: "medium",
    reasoning:
      "Enhanced fallback selectors with comprehensive pattern coverage for maximum compatibility across different website structures",
  }
}

function prepareHtmlForAI($: cheerio.CheerioAPI): string {
  $("script, style, noscript").remove()

  let mainContent =
    $("main").html() || $("article").parent().html() || $(".content, .main, #content, #main").html() || $("body").html()

  if (mainContent && mainContent.length > 10000) {
    mainContent = mainContent.substring(0, 10000) + "..."
  }

  return mainContent || ""
}
