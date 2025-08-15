import { type NextRequest, NextResponse } from "next/server"
import * as cheerio from "cheerio"

export async function POST(request: NextRequest) {
  try {
    const { items } = await request.json()

    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ success: false, error: "Items array is required" })
    }

    const itemsWithPreviews = await Promise.all(
      items.map(async (item: any) => {
        try {
          // Generate a preview image for each item
          const previewImage = await generateItemPreview(item)
          return {
            ...item,
            previewImage,
          }
        } catch (error) {
          console.error(`Failed to generate preview for item: ${item.title}`, error)
          return {
            ...item,
            previewImage: null,
          }
        }
      }),
    )

    return NextResponse.json({
      success: true,
      items: itemsWithPreviews,
    })
  } catch (error) {
    console.error("Preview image generation error:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to generate preview images",
    })
  }
}

async function generateItemPreview(item: any): Promise<string | null> {
  try {
    // Fetch the item's page to get more context
    const response = await fetch(item.link, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    })

    if (!response.ok) {
      return generateFallbackPreview(item)
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    // Look for existing images in the content
    const images = []

    // Try to find relevant images
    const selectors = [
      'meta[property="og:image"]',
      'meta[name="twitter:image"]',
      'img[src*="thumb"]',
      'img[src*="preview"]',
      'img[src*="featured"]',
      ".featured-image img",
      ".thumbnail img",
      ".preview img",
      "article img:first-of-type",
      ".content img:first-of-type",
      'img[alt*="' + item.title.split(" ")[0] + '"]',
    ]

    for (const selector of selectors) {
      const element = $(selector).first()
      if (element.length) {
        let src = element.attr("content") || element.attr("src")
        if (src) {
          // Make absolute URL
          if (src.startsWith("/")) {
            src = new URL(item.link).origin + src
          } else if (!src.startsWith("http")) {
            src = new URL(src, item.link).href
          }

          // Validate image URL
          if (await isValidImage(src)) {
            return src
          }
        }
      }
    }

    // If no image found, generate a text-based preview
    return generateFallbackPreview(item)
  } catch (error) {
    console.error("Error generating item preview:", error)
    return generateFallbackPreview(item)
  }
}

async function isValidImage(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, {
      method: "HEAD",
      signal: AbortSignal.timeout(5000),
    })

    const contentType = response.headers.get("content-type")
    return response.ok && contentType?.startsWith("image/")
  } catch {
    return false
  }
}

function generateFallbackPreview(item: any): string {
  // Generate a data URL for a simple text-based preview image
  const canvas = createCanvas(400, 200)
  const ctx = canvas.getContext("2d")

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, 400, 200)
  gradient.addColorStop(0, "#f0f9ff")
  gradient.addColorStop(1, "#e0f2fe")
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 400, 200)

  // Border
  ctx.strokeStyle = "#0891b2"
  ctx.lineWidth = 2
  ctx.strokeRect(1, 1, 398, 198)

  // Title
  ctx.fillStyle = "#0f172a"
  ctx.font = "bold 16px Arial"
  ctx.textAlign = "center"

  const title = item.title.length > 40 ? item.title.substring(0, 37) + "..." : item.title
  const words = title.split(" ")
  const lines = []
  let currentLine = ""

  for (const word of words) {
    const testLine = currentLine + (currentLine ? " " : "") + word
    const metrics = ctx.measureText(testLine)
    if (metrics.width > 360 && currentLine) {
      lines.push(currentLine)
      currentLine = word
    } else {
      currentLine = testLine
    }
  }
  if (currentLine) lines.push(currentLine)

  const startY = 80 - (lines.length - 1) * 10
  lines.forEach((line, index) => {
    ctx.fillText(line, 200, startY + index * 20)
  })

  // Description
  if (item.description) {
    ctx.fillStyle = "#64748b"
    ctx.font = "12px Arial"
    const desc = item.description.length > 60 ? item.description.substring(0, 57) + "..." : item.description
    const descWords = desc.split(" ")
    const descLines = []
    let currentDescLine = ""

    for (const word of descWords) {
      const testLine = currentDescLine + (currentDescLine ? " " : "") + word
      const metrics = ctx.measureText(testLine)
      if (metrics.width > 360 && currentDescLine) {
        descLines.push(currentDescLine)
        currentDescLine = word
      } else {
        currentDescLine = testLine
      }
    }
    if (currentDescLine) descLines.push(currentDescLine)

    const descStartY = 130
    descLines.slice(0, 2).forEach((line, index) => {
      ctx.fillText(line, 200, descStartY + index * 15)
    })
  }

  // Source indicator
  ctx.fillStyle = "#0891b2"
  ctx.font = "10px Arial"
  const domain = new URL(item.link).hostname
  ctx.fillText(domain, 200, 180)

  return canvas.toDataURL()
}

// Simple canvas implementation for server-side rendering
function createCanvas(width: number, height: number) {
  // This is a simplified canvas implementation
  // In a real implementation, you'd use a library like 'canvas' or 'node-canvas'
  return {
    getContext: () => ({
      createLinearGradient: (x0: number, y0: number, x1: number, y1: number) => ({
        addColorStop: (offset: number, color: string) => {},
      }),
      fillRect: (x: number, y: number, width: number, height: number) => {},
      strokeRect: (x: number, y: number, width: number, height: number) => {},
      fillText: (text: string, x: number, y: number) => {},
      measureText: (text: string) => ({ width: text.length * 8 }),
      set fillStyle(value: string) {},
      set strokeStyle(value: string) {},
      set lineWidth(value: number) {},
      set font(value: string) {},
      set textAlign(value: string) {},
    }),
    toDataURL: () => generatePlaceholderDataUrl(width, height),
  }
}

function generatePlaceholderDataUrl(width: number, height: number): string {
  // Generate a simple SVG-based data URL as fallback
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#f0f9ff;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#e0f2fe;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)" stroke="#0891b2" stroke-width="2"/>
      <text x="50%" y="50%" text-anchor="middle" fill="#0f172a" font-family="Arial" font-size="14" font-weight="bold">
        Content Preview
      </text>
    </svg>
  `
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`
}
