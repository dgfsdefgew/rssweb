import { type NextRequest, NextResponse } from "next/server"
import * as cheerio from "cheerio"

export async function POST(request: NextRequest) {
  try {
    const { newsItems, feedTitle, url, layout = "cosmic-universe" } = await request.json()

    if (!newsItems || !Array.isArray(newsItems)) {
      return NextResponse.json({ success: false, error: "News items are required" })
    }

    const selectedItems = newsItems.filter((item: any) => item.selected)

    if (selectedItems.length === 0) {
      return NextResponse.json({ success: false, error: "No news items selected" })
    }

    // Enhance news items with images and styling
    const itemsWithImages = await enhanceNewsItemsWithImages(selectedItems, url)

    // Generate magazine HTML with dark universe design
    const magazineHtml = generateCosmicUniverseMagazineHTML(itemsWithImages, feedTitle || "News Magazine", layout)

    return NextResponse.json({
      success: true,
      magazineHtml,
      itemsCount: selectedItems.length,
      layout,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Magazine generation error:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate magazine",
    })
  }
}

async function enhanceNewsItemsWithImages(items: any[], baseUrl: string) {
  const enhancedItems = await Promise.all(
    items.map(async (item, index) => {
      try {
        // Try to fetch the article page to find images
        const imageUrl = await findArticleImage(item.link, baseUrl)

        return {
          ...item,
          imageUrl: imageUrl || generateCosmicPlaceholder(item, index),
          magazineIndex: index,
          cosmicColor: getCosmicColor(item.category, item.importance),
          accentColor: getAccentColor(item.category),
        }
      } catch (error) {
        console.error(`Failed to enhance item ${item.title}:`, error)
        return {
          ...item,
          imageUrl: generateCosmicPlaceholder(item, index),
          magazineIndex: index,
          cosmicColor: getCosmicColor(item.category, item.importance),
          accentColor: getAccentColor(item.category),
        }
      }
    }),
  )

  return enhancedItems
}

function getCosmicColor(category: string, importance: string): string {
  // High importance gets brighter effects
  const intensity = importance === "high" ? "0.8" : importance === "medium" ? "0.6" : "0.4"

  const colors = {
    Politics: `rgba(239, 68, 68, ${intensity})`, // Red
    Technology: `rgba(59, 130, 246, ${intensity})`, // Blue
    Sports: `rgba(34, 197, 94, ${intensity})`, // Green
    Business: `rgba(245, 158, 11, ${intensity})`, // Amber
    Entertainment: `rgba(168, 85, 247, ${intensity})`, // Purple
    Health: `rgba(16, 185, 129, ${intensity})`, // Emerald
    Science: `rgba(6, 182, 212, ${intensity})`, // Cyan
    World: `rgba(236, 72, 153, ${intensity})`, // Pink
    General: `rgba(100, 116, 139, ${intensity})`, // Slate
  }

  return colors[category] || colors.General
}

function getAccentColor(category: string): string {
  const colors = {
    Politics: "#ef4444",
    Technology: "#3b82f6",
    Sports: "#22c55e",
    Business: "#f59e0b",
    Entertainment: "#a855f7",
    Health: "#10b981",
    Science: "#06b6d4",
    World: "#ec4899",
    General: "#64748b",
  }

  return colors[category] || colors.General
}

async function findArticleImage(articleUrl: string, baseUrl: string): Promise<string | null> {
  try {
    const response = await fetch(articleUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      signal: AbortSignal.timeout(8000),
    })

    if (!response.ok) return null

    const html = await response.text()
    const $ = cheerio.load(html)

    const imageSelectors = [
      'meta[property="og:image"]',
      'meta[name="twitter:image"]',
      'img[src*="featured"]',
      'img[src*="hero"]',
      'img[src*="main"]',
      ".featured-image img",
      ".hero-image img",
      ".article-image img",
      "article img:first-of-type",
      ".content img:first-of-type",
      "img[alt]:first-of-type",
    ]

    for (const selector of imageSelectors) {
      const element = $(selector).first()
      if (element.length) {
        let src = element.attr("content") || element.attr("src")
        if (src) {
          if (src.startsWith("/")) {
            src = new URL(baseUrl).origin + src
          } else if (!src.startsWith("http")) {
            src = new URL(src, articleUrl).href
          }

          if (await isValidImageUrl(src)) {
            return src
          }
        }
      }
    }

    return null
  } catch (error) {
    console.error("Error finding article image:", error)
    return null
  }
}

async function isValidImageUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, {
      method: "HEAD",
      signal: AbortSignal.timeout(3000),
    })

    const contentType = response.headers.get("content-type")
    return response.ok && contentType?.startsWith("image/")
  } catch {
    return false
  }
}

function generateCosmicPlaceholder(item: any, index: number): string {
  const title = item.title.length > 30 ? item.title.substring(0, 27) + "..." : item.title
  const accentColor = getAccentColor(item.category)

  // Create dark universe-style SVG placeholder
  const svg = `
    <svg width="400" height="240" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="cosmicGrad${index}" cx="50%" cy="50%" r="70%">
          <stop offset="0%" style="stop-color:${accentColor};stop-opacity:0.9" />
          <stop offset="30%" style="stop-color:${accentColor};stop-opacity:0.6" />
          <stop offset="70%" style="stop-color:#8b5cf6;stop-opacity:0.3" />
          <stop offset="100%" style="stop-color:#000000;stop-opacity:1" />
        </radialGradient>
        <radialGradient id="starGrad${index}" cx="50%" cy="50%" r="30%">
          <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
          <stop offset="50%" style="stop-color:${accentColor};stop-opacity:0.8" />
          <stop offset="100%" style="stop-color:transparent;stop-opacity:0" />
        </radialGradient>
        <filter id="cosmicGlow${index}" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="12" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      <!-- Deep Space Background -->
      <rect width="100%" height="100%" fill="#000000" rx="12"/>
      
      <!-- Nebula Cloud -->
      <ellipse cx="200" cy="120" rx="150" ry="80" fill="url(#cosmicGrad${index})" opacity="0.7"/>
      
      <!-- Central Star -->
      <circle cx="200" cy="120" r="40" fill="url(#starGrad${index})" filter="url(#cosmicGlow${index})"/>
      <circle cx="200" cy="120" r="20" fill="${accentColor}" opacity="0.8"/>
      <circle cx="200" cy="120" r="8" fill="white" opacity="0.9"/>
      
      <!-- Static Particles -->
      <circle cx="120" cy="80" r="2" fill="white" opacity="0.6"/>
      <circle cx="280" cy="160" r="1.5" fill="${accentColor}" opacity="0.8"/>
      <circle cx="160" cy="180" r="1" fill="white" opacity="0.7"/>
      <circle cx="320" cy="60" r="2.5" fill="${accentColor}" opacity="0.5"/>
      <circle cx="80" cy="140" r="1" fill="white" opacity="0.8"/>
      
      <!-- Category Badge -->
      <rect x="150" y="30" width="100" height="24" rx="12" fill="${accentColor}" opacity="0.9"/>
      <text x="200" y="47" text-anchor="middle" fill="white" font-family="Arial" font-size="12" font-weight="bold">
        ${item.category.toUpperCase()}
      </text>
      
      <!-- Title -->
      <foreignObject x="20" y="180" width="360" height="50">
        <div xmlns="http://www.w3.org/1999/xhtml" 
             style="color: white; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
                    font-size: 14px; font-weight: 600; line-height: 1.3; text-align: center; 
                    text-shadow: 0 2px 8px rgba(0,0,0,0.8);">
          ${title}
        </div>
      </foreignObject>
    </svg>
  `

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`
}

function generateCosmicUniverseMagazineHTML(items: any[], title: string, layout: string): string {
  const mainStory = items[0]
  const otherStories = items.slice(1)

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #000000;
            min-height: 100vh;
            color: white;
            overflow-x: hidden;
            position: relative;
        }

        /* Static Cosmic Background */
        body::before {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: 
                radial-gradient(ellipse at 20% 20%, rgba(147, 51, 234, 0.3) 0%, transparent 50%),
                radial-gradient(ellipse at 80% 80%, rgba(59, 130, 246, 0.2) 0%, transparent 50%),
                radial-gradient(ellipse at 40% 60%, rgba(236, 72, 153, 0.2) 0%, transparent 70%),
                linear-gradient(135deg, #000000 0%, #0f0f23 30%, #1a0033 70%, #000000 100%);
            z-index: -2;
        }

        /* Static Star Field */
        body::after {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-image: 
                radial-gradient(2px 2px at 20px 30px, white, transparent),
                radial-gradient(2px 2px at 40px 70px, white, transparent),
                radial-gradient(1px 1px at 90px 40px, white, transparent),
                radial-gradient(1px 1px at 130px 80px, white, transparent),
                radial-gradient(2px 2px at 160px 30px, white, transparent);
            background-repeat: repeat;
            background-size: 200px 100px;
            opacity: 0.6;
            z-index: -1;
        }

        .magazine-container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 2rem;
            position: relative;
            z-index: 1;
        }

        .magazine-header {
            text-align: center;
            margin-bottom: 4rem;
            position: relative;
        }

        .magazine-title {
            font-size: 4rem;
            font-weight: 900;
            margin-bottom: 1rem;
            background: linear-gradient(45deg, #ffffff, #a855f7, #06b6d4, #ec4899);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            text-shadow: 0 0 50px rgba(168, 85, 247, 0.5);
        }

        .magazine-subtitle {
            font-size: 1.2rem;
            opacity: 0.8;
            font-weight: 300;
            letter-spacing: 3px;
            color: #a855f7;
        }

        .magazine-date {
            font-size: 0.9rem;
            opacity: 0.6;
            margin-top: 0.5rem;
            font-weight: 300;
            color: #06b6d4;
        }

        .cards-container {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 2rem;
            justify-items: center;
        }

        .news-card {
            width: 350px;
            height: 500px;
            background: linear-gradient(145deg, 
                rgba(0, 0, 0, 0.9) 0%, 
                rgba(15, 15, 35, 0.8) 50%, 
                rgba(26, 0, 51, 0.9) 100%);
            border-radius: 20px;
            border: 1px solid rgba(168, 85, 247, 0.2);
            backdrop-filter: blur(20px);
            position: relative;
            cursor: pointer;
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            overflow: hidden;
            opacity: 0;
            transform: translateY(50px) scale(0.9);
        }

        .news-card.loaded {
            opacity: 1;
            transform: translateY(0) scale(1);
        }

        .news-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: var(--cosmic-color);
            border-radius: 20px;
            opacity: 0;
            transition: opacity 0.3s ease;
            z-index: -1;
            filter: blur(30px);
        }

        .news-card:hover::before {
            opacity: 0.4;
        }

        .news-card:hover {
            transform: translateY(-20px) scale(1.03);
            border-color: rgba(168, 85, 247, 0.5);
            box-shadow: 
                0 30px 60px rgba(0, 0, 0, 0.8),
                0 0 0 1px rgba(168, 85, 247, 0.3),
                inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }

        .news-card.main-card {
            width: 420px;
            height: 600px;
            grid-column: 1 / -1;
            margin-bottom: 2rem;
            background: linear-gradient(145deg, 
                rgba(0, 0, 0, 0.95) 0%, 
                rgba(15, 15, 35, 0.9) 50%, 
                rgba(26, 0, 51, 0.95) 100%);
            border: 2px solid rgba(168, 85, 247, 0.4);
        }

        .news-card.main-card::before {
            background: radial-gradient(circle at center, rgba(168, 85, 247, 0.5) 0%, transparent 70%);
            opacity: 0.3;
        }

        .news-card.main-card:hover::before {
            opacity: 0.6;
        }

        .news-card.main-card:hover {
            transform: translateY(-25px) scale(1.04);
            box-shadow: 
                0 40px 80px rgba(0, 0, 0, 0.9),
                0 0 150px rgba(168, 85, 247, 0.4),
                inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }

        .card-content {
            padding: 2rem;
            height: 100%;
            display: flex;
            flex-direction: column;
            position: relative;
            z-index: 2;
        }

        .main-card .card-content {
            padding: 2.5rem;
        }

        .card-image {
            width: 100%;
            height: 200px;
            object-fit: cover;
            border-radius: 15px;
            margin-bottom: 1.5rem;
            border: 1px solid rgba(168, 85, 247, 0.2);
            transition: all 0.3s ease;
        }

        .main-card .card-image {
            height: 250px;
            margin-bottom: 2rem;
        }

        .news-card:hover .card-image {
            transform: scale(1.05);
            border-color: rgba(168, 85, 247, 0.4);
            box-shadow: 0 10px 30px rgba(168, 85, 247, 0.3);
        }

        .card-category {
            display: inline-block;
            padding: 0.6rem 1.2rem;
            border-radius: 25px;
            font-size: 0.75rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 1rem;
            align-self: flex-start;
            background: linear-gradient(45deg, var(--accent-color), rgba(168, 85, 247, 0.8));
            color: white;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
            position: relative;
            overflow: hidden;
            min-width: 90px;
            text-align: center;
        }

        .card-category::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
            transition: left 0.6s ease;
        }

        .news-card:hover .card-category::before {
            left: 100%;
        }

        .main-card .card-category {
            font-size: 0.85rem;
            padding: 0.7rem 1.5rem;
            min-width: 110px;
        }

        .card-title {
            font-size: 1.2rem;
            font-weight: 700;
            line-height: 1.4;
            margin-bottom: 1rem;
            color: white;
            text-shadow: 0 2px 8px rgba(0, 0, 0, 0.8);
        }

        .main-card .card-title {
            font-size: 1.6rem;
            margin-bottom: 1.5rem;
        }

        .card-description {
            font-size: 0.9rem;
            color: rgba(255, 255, 255, 0.8);
            line-height: 1.6;
            margin-bottom: 1.5rem;
            flex-grow: 1;
        }

        .main-card .card-description {
            font-size: 1rem;
            color: rgba(255, 255, 255, 0.9);
        }

        .card-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 0.8rem;
            color: rgba(255, 255, 255, 0.6);
            border-top: 1px solid rgba(168, 85, 247, 0.2);
            padding-top: 1rem;
            margin-top: auto;
        }

        .card-source {
            font-weight: 600;
            color: var(--accent-color);
        }

        .card-timestamp {
            font-style: italic;
        }

        .importance-indicator {
            position: absolute;
            top: 1rem;
            right: 1rem;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            box-shadow: 0 0 15px currentColor;
            animation: pulse 2s infinite;
        }

        .importance-high { 
            background: #fbbf24; 
            color: #fbbf24; 
        }
        .importance-medium { 
            background: #06b6d4; 
            color: #06b6d4; 
        }
        .importance-low { 
            background: #a855f7; 
            color: #a855f7; 
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.6; transform: scale(1.2); }
        }

        /* Static Orb Effect */
        .cosmic-orb {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 120px;
            height: 120px;
            border-radius: 50%;
            background: radial-gradient(circle, var(--cosmic-color) 0%, transparent 70%);
            opacity: 0.1;
            z-index: 1;
            transition: all 0.3s ease;
        }

        .news-card:hover .cosmic-orb {
            opacity: 0.2;
            transform: translate(-50%, -50%) scale(1.3);
        }

        .main-card .cosmic-orb {
            width: 150px;
            height: 150px;
            opacity: 0.15;
        }

        .main-card:hover .cosmic-orb {
            opacity: 0.3;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
            .magazine-container {
                padding: 1rem;
            }

            .magazine-title {
                font-size: 2.5rem;
            }

            .cards-container {
                grid-template-columns: 1fr;
                gap: 1.5rem;
            }

            .news-card {
                width: 100%;
                max-width: 350px;
                height: 480px;
            }

            .news-card.main-card {
                width: 100%;
                max-width: 400px;
                height: 580px;
            }
        }

        .magazine-footer {
            text-align: center;
            margin-top: 4rem;
            color: rgba(255, 255, 255, 0.5);
            font-size: 0.9rem;
            font-weight: 300;
        }

        /* Loading Animation */
        @keyframes cardSlideIn {
            from {
                opacity: 0;
                transform: translateY(50px) scale(0.9);
            }
            to {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
        }
    </style>
</head>
<body>
    <div class="magazine-container">
        <header class="magazine-header">
            <h1 class="magazine-title">${title}</h1>
            <p class="magazine-subtitle">AI-POWERED NEWS MAGAZINE</p>
            <p class="magazine-date">${new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}</p>
        </header>

        <main class="cards-container">
            <!-- Main Story Card -->
            <article class="news-card main-card" 
                     style="--cosmic-color: ${mainStory.cosmicColor}; --accent-color: ${mainStory.accentColor};"
                     onclick="window.open('${mainStory.link}', '_blank')">
                <div class="cosmic-orb"></div>
                <div class="importance-indicator importance-${mainStory.importance}"></div>
                
                <div class="card-content">
                    <img src="${mainStory.imageUrl}" alt="${mainStory.title}" class="card-image" />
                    <span class="card-category">${mainStory.category}</span>
                    <h2 class="card-title">${mainStory.title}</h2>
                    <p class="card-description">${mainStory.description || "Featured news article from " + mainStory.source}</p>
                    <div class="card-footer">
                        <span class="card-source">${mainStory.source}</span>
                        <span class="card-timestamp">${mainStory.timestamp}</span>
                    </div>
                </div>
            </article>

            <!-- Other Story Cards -->
            ${otherStories
              .map(
                (story, index) => `
                <article class="news-card" 
                         style="--cosmic-color: ${story.cosmicColor}; --accent-color: ${story.accentColor};"
                         onclick="window.open('${story.link}', '_blank')"
                         data-index="${index}">
                    <div class="cosmic-orb"></div>
                    <div class="importance-indicator importance-${story.importance}"></div>
                    
                    <div class="card-content">
                        <img src="${story.imageUrl}" alt="${story.title}" class="card-image" />
                        <span class="card-category">${story.category}</span>
                        <h3 class="card-title">${story.title}</h3>
                        ${story.description ? `<p class="card-description">${story.description}</p>` : ""}
                        <div class="card-footer">
                            <span class="card-source">${story.source}</span>
                            <span class="card-timestamp">${story.timestamp}</span>
                        </div>
                    </div>
                </article>
            `,
              )
              .join("")}
        </main>

        <footer class="magazine-footer">
            <p>Generated ${new Date().toLocaleString()} • ${items.length} articles • Powered by AI News Extraction</p>
        </footer>
    </div>

    <script>
        // Enhanced loading animation
        window.addEventListener('load', function() {
            const mainCard = document.querySelector('.main-card');
            const otherCards = document.querySelectorAll('.news-card:not(.main-card)');
            
            // Load main card first
            setTimeout(function() {
                if (mainCard) {
                    mainCard.classList.add('loaded');
                }
            }, 400);
            
            // Stagger other cards
            otherCards.forEach(function(card, index) {
                setTimeout(function() {
                    card.classList.add('loaded');
                }, 800 + (index * 200));
            });
        });

        // Enhanced hover effects
        document.querySelectorAll('.news-card').forEach(function(card) {
            card.addEventListener('mouseenter', function() {
                this.style.zIndex = '10';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.zIndex = '1';
            });
        });

        // Add click ripple effect
        document.querySelectorAll('.news-card').forEach(function(card) {
            card.addEventListener('click', function(e) {
                const ripple = document.createElement('div');
                ripple.style.position = 'absolute';
                ripple.style.borderRadius = '50%';
                ripple.style.background = 'rgba(168, 85, 247, 0.4)';
                ripple.style.transform = 'scale(0)';
                ripple.style.animation = 'ripple 0.8s linear';
                ripple.style.left = (e.clientX - card.offsetLeft) + 'px';
                ripple.style.top = (e.clientY - card.offsetTop) + 'px';
                ripple.style.width = ripple.style.height = '30px';
                ripple.style.marginLeft = ripple.style.marginTop = '-15px';

                card.appendChild(ripple);

                setTimeout(function() {
                    ripple.remove();
                }, 800);
            });
        });

        // Add ripple animation keyframes
        const style = document.createElement('style');
        style.textContent = '@keyframes ripple { to { transform: scale(6); opacity: 0; } }';
        document.head.appendChild(style);
    </script>
</body>
</html>
  `
}
