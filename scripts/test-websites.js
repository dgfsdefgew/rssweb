import fetch from "node-fetch"

const testWebsites = [
  {
    name: "TechCrunch",
    url: "https://techcrunch.com",
    expectedCategories: ["Technology", "Business"],
    description: "Technology news and startup coverage",
  },
  {
    name: "BBC News",
    url: "https://www.bbc.com/news",
    expectedCategories: ["World", "Politics", "Business"],
    description: "International news coverage",
  },
  {
    name: "ESPN",
    url: "https://www.espn.com",
    expectedCategories: ["Sports"],
    description: "Sports news and scores",
  },
  {
    name: "The Verge",
    url: "https://www.theverge.com",
    expectedCategories: ["Technology", "Science"],
    description: "Technology and culture news",
  },
  {
    name: "Reuters",
    url: "https://www.reuters.com",
    expectedCategories: ["World", "Business", "Politics"],
    description: "Global news and business information",
  },
]

async function testWebsite(website) {
  console.log(`\n🔍 Testing: ${website.name}`)
  console.log(`📍 URL: ${website.url}`)
  console.log(`📝 Description: ${website.description}`)

  try {
    const startTime = Date.now()

    // Test the autodetect endpoint
    const response = await fetch("http://localhost:3000/api/autodetect", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: website.url }),
    })

    const data = await response.json()
    const endTime = Date.now()
    const duration = endTime - startTime

    if (data.success) {
      console.log(`✅ Success! (${duration}ms)`)
      console.log(`📊 Found ${data.items?.length || 0} items`)

      if (data.items && data.items.length > 0) {
        const categories = [...new Set(data.items.map((item) => item.category))]
        console.log(`🏷️  Categories found: ${categories.join(", ")}`)

        // Check if expected categories are present
        const foundExpected = website.expectedCategories.some((cat) =>
          categories.some((found) => found.toLowerCase().includes(cat.toLowerCase())),
        )

        if (foundExpected) {
          console.log(`🎯 Expected categories detected!`)
        } else {
          console.log(`⚠️  Expected categories not found. Expected: ${website.expectedCategories.join(", ")}`)
        }

        // Show sample items
        console.log(`📰 Sample articles:`)
        data.items.slice(0, 3).forEach((item, index) => {
          console.log(`   ${index + 1}. [${item.category}] ${item.title.substring(0, 60)}...`)
        })
      }
    } else {
      console.log(`❌ Failed: ${data.error}`)
    }
  } catch (error) {
    console.log(`💥 Error: ${error.message}`)
  }
}

async function runAllTests() {
  console.log("🚀 Starting RSS Feed Generator Website Tests")
  console.log("=".repeat(50))

  for (const website of testWebsites) {
    await testWebsite(website)

    // Wait between tests to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 2000))
  }

  console.log("\n" + "=".repeat(50))
  console.log("✨ All tests completed!")
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests().catch(console.error)
}

export { testWebsites, testWebsite, runAllTests }
