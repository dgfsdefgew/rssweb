// Test script to verify Gemini AI detection works across different website structures
const testWebsites = [
  {
    name: "Hacker News",
    url: "https://news.ycombinator.com",
    type: "News aggregator",
    expectedPattern: "List items with titles and links",
  },
  {
    name: "BBC News",
    url: "https://www.bbc.com/news",
    type: "News website",
    expectedPattern: "Article cards with headlines and descriptions",
  },
  {
    name: "GitHub Blog",
    url: "https://github.blog",
    type: "Corporate blog",
    expectedPattern: "Blog post articles with titles and excerpts",
  },
  {
    name: "Reddit Programming",
    url: "https://www.reddit.com/r/programming",
    type: "Social media/Forum",
    expectedPattern: "Post items with titles and links",
  },
  {
    name: "Dev.to",
    url: "https://dev.to",
    type: "Developer blog platform",
    expectedPattern: "Article cards with titles, authors, and descriptions",
  },
  {
    name: "Product Hunt",
    url: "https://www.producthunt.com",
    type: "Product listing",
    expectedPattern: "Product items with names and descriptions",
  },
  {
    name: "Medium",
    url: "https://medium.com",
    type: "Publishing platform",
    expectedPattern: "Article cards with titles and previews",
  },
  {
    name: "Stack Overflow Questions",
    url: "https://stackoverflow.com/questions",
    type: "Q&A platform",
    expectedPattern: "Question items with titles and metadata",
  },
]

async function testWebsite(website) {
  console.log(`\n🧪 Testing: ${website.name} (${website.type})`)
  console.log(`URL: ${website.url}`)

  try {
    // Test auto-detection
    const autoDetectResponse = await fetch("http://localhost:3000/api/autodetect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: website.url }),
    })

    const autoDetectData = await autoDetectResponse.json()

    if (autoDetectData.success) {
      console.log("✅ Auto-detection successful")
      console.log("📋 Suggested selectors:")
      console.log(`   Item: ${autoDetectData.selectors.item}`)
      console.log(`   Title: ${autoDetectData.selectors.title}`)
      console.log(`   Link: ${autoDetectData.selectors.link}`)
      console.log(`   Description: ${autoDetectData.selectors.description || "None"}`)
      console.log(`   Suggested Title: ${autoDetectData.suggestedTitle}`)

      // Test feed generation with AI-detected selectors
      const feedResponse = await fetch("http://localhost:3000/api/generate-feed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: website.url,
          selectors: autoDetectData.selectors,
          feedTitle: `${website.name} RSS Feed`,
          maxItems: 5,
          useAI: true,
        }),
      })

      const feedData = await feedResponse.json()

      if (feedData.success) {
        console.log("✅ Feed generation successful")
        console.log(`📰 Generated ${feedData.preview.items.length} items`)

        // Show first few items
        feedData.preview.items.slice(0, 3).forEach((item, index) => {
          console.log(`   ${index + 1}. ${item.title}`)
          console.log(`      Link: ${item.link}`)
          if (item.description) {
            console.log(`      Description: ${item.description.substring(0, 100)}...`)
          }
        })

        return { success: true, itemCount: feedData.preview.items.length }
      } else {
        console.log("❌ Feed generation failed:", feedData.error)
        return { success: false, error: feedData.error }
      }
    } else {
      console.log("❌ Auto-detection failed:", autoDetectData.error)
      return { success: false, error: autoDetectData.error }
    }
  } catch (error) {
    console.log("❌ Test failed with error:", error.message)
    return { success: false, error: error.message }
  }
}

async function runAllTests() {
  console.log("🚀 Starting comprehensive website structure tests...")
  console.log("=".repeat(60))

  const results = []

  for (const website of testWebsites) {
    const result = await testWebsite(website)
    results.push({
      name: website.name,
      type: website.type,
      url: website.url,
      ...result,
    })

    // Add delay between requests to be respectful
    await new Promise((resolve) => setTimeout(resolve, 2000))
  }

  // Summary
  console.log("\n" + "=".repeat(60))
  console.log("📊 TEST SUMMARY")
  console.log("=".repeat(60))

  const successful = results.filter((r) => r.success)
  const failed = results.filter((r) => !r.success)

  console.log(`✅ Successful: ${successful.length}/${results.length}`)
  console.log(`❌ Failed: ${failed.length}/${results.length}`)

  if (successful.length > 0) {
    console.log("\n🎉 Successful tests:")
    successful.forEach((result) => {
      console.log(`   ✅ ${result.name} (${result.type}) - ${result.itemCount || 0} items`)
    })
  }

  if (failed.length > 0) {
    console.log("\n💥 Failed tests:")
    failed.forEach((result) => {
      console.log(`   ❌ ${result.name} (${result.type}) - ${result.error}`)
    })
  }

  // Performance metrics
  const totalItems = successful.reduce((sum, result) => sum + (result.itemCount || 0), 0)
  console.log(`\n📈 Total items extracted: ${totalItems}`)
  console.log(
    `📊 Average items per successful site: ${successful.length > 0 ? Math.round(totalItems / successful.length) : 0}`,
  )

  console.log("\n🏁 Testing complete!")
}

// Run the tests
runAllTests().catch(console.error)
