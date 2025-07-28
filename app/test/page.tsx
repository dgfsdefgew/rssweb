"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle, XCircle, Globe } from "lucide-react"

interface TestResult {
  name: string
  type: string
  url: string
  success: boolean
  itemCount?: number
  error?: string
  selectors?: any
  duration?: number
}

const testWebsites = [
  {
    name: "Example.com",
    url: "https://example.com",
    type: "Simple HTML",
    description: "Basic HTML structure for testing",
  },
  {
    name: "Hacker News",
    url: "https://news.ycombinator.com",
    type: "News aggregator",
    description: "List-based content with titles and links",
  },
  {
    name: "JSONPlaceholder Blog",
    url: "https://jsonplaceholder.typicode.com",
    type: "API documentation",
    description: "Simple structured content",
  },
  {
    name: "GitHub Trending",
    url: "https://github.com/trending",
    type: "Repository listing",
    description: "Repository cards with names and descriptions",
  },
  {
    name: "Reddit Programming",
    url: "https://www.reddit.com/r/programming",
    type: "Social platform",
    description: "Post items with titles and metadata",
  },
]

export default function TestPage() {
  const [testing, setTesting] = useState(false)
  const [results, setResults] = useState<TestResult[]>([])
  const [currentTest, setCurrentTest] = useState<string>("")

  const testWebsite = async (website: any): Promise<TestResult> => {
    const startTime = Date.now()

    try {
      setCurrentTest(website.name)

      // Test auto-detection with timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

      const autoDetectResponse = await fetch("/api/autodetect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: website.url }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!autoDetectResponse.ok) {
        throw new Error(`HTTP ${autoDetectResponse.status}: ${autoDetectResponse.statusText}`)
      }

      const autoDetectData = await autoDetectResponse.json()

      if (!autoDetectData.success) {
        return {
          name: website.name,
          type: website.type,
          url: website.url,
          success: false,
          error: autoDetectData.error || "Auto-detection failed",
          duration: Date.now() - startTime,
        }
      }

      // Test feed generation with timeout
      const feedController = new AbortController()
      const feedTimeoutId = setTimeout(() => feedController.abort(), 30000)

      const feedResponse = await fetch("/api/generate-feed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: website.url,
          selectors: autoDetectData.selectors,
          feedTitle: `${website.name} RSS Feed`,
          maxItems: 5, // Reduced for faster testing
          useAI: true,
        }),
        signal: feedController.signal,
      })

      clearTimeout(feedTimeoutId)

      if (!feedResponse.ok) {
        throw new Error(`HTTP ${feedResponse.status}: ${feedResponse.statusText}`)
      }

      const feedData = await feedResponse.json()

      return {
        name: website.name,
        type: website.type,
        url: website.url,
        success: feedData.success,
        itemCount: feedData.success ? feedData.preview.items.length : 0,
        error: feedData.success ? undefined : feedData.error || "Feed generation failed",
        selectors: autoDetectData.selectors,
        duration: Date.now() - startTime,
      }
    } catch (error) {
      let errorMessage = "Unknown error"

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          errorMessage = "Request timed out (30s)"
        } else {
          errorMessage = error.message
        }
      }

      return {
        name: website.name,
        type: website.type,
        url: website.url,
        success: false,
        error: errorMessage,
        duration: Date.now() - startTime,
      }
    }
  }

  const runAllTests = async () => {
    setTesting(true)
    setResults([])
    setCurrentTest("")

    const testResults: TestResult[] = []

    for (let i = 0; i < testWebsites.length; i++) {
      const website = testWebsites[i]
      setCurrentTest(`${website.name} (${i + 1}/${testWebsites.length})`)

      try {
        const result = await testWebsite(website)
        testResults.push(result)
        setResults([...testResults])
      } catch (error) {
        console.error(`Failed to test ${website.name}:`, error)
        testResults.push({
          name: website.name,
          type: website.type,
          url: website.url,
          success: false,
          error: error instanceof Error ? error.message : "Test execution failed",
          duration: 0,
        })
        setResults([...testResults])
      }

      // Add delay between requests to avoid rate limiting
      if (i < testWebsites.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 2000))
      }
    }

    setTesting(false)
    setCurrentTest("")
  }

  const successful = results.filter((r) => r.success)
  const failed = results.filter((r) => !r.success)
  const totalItems = successful.reduce((sum, result) => sum + (result.itemCount || 0), 0)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Website Structure Testing</h1>
          <p className="text-gray-600">
            Verify Gemini AI content detection across different website types and structures
          </p>
        </div>

        <div className="mb-8 text-center">
          <Button
            onClick={runAllTests}
            disabled={testing}
            size="lg"
            className="bg-teal-500 hover:bg-teal-600 text-white px-8"
          >
            {testing ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Testing {currentTest}...
              </>
            ) : (
              <>
                <Globe className="mr-2 h-5 w-5" />
                Run All Tests
              </>
            )}
          </Button>
        </div>

        {results.length > 0 && (
          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Test Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{successful.length}</div>
                    <div className="text-sm text-gray-600">Successful</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{failed.length}</div>
                    <div className="text-sm text-gray-600">Failed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{totalItems}</div>
                    <div className="text-sm text-gray-600">Total Items</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {successful.length > 0 ? Math.round(totalItems / successful.length) : 0}
                    </div>
                    <div className="text-sm text-gray-600">Avg Items</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid gap-6">
          {testWebsites.map((website, index) => {
            const result = results.find((r) => r.name === website.name)

            return (
              <Card key={website.name} className="relative">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <span>{website.name}</span>
                        <Badge variant="secondary">{website.type}</Badge>
                        {result && (
                          <div className="flex items-center space-x-1">
                            {result.success ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-500" />
                            )}
                          </div>
                        )}
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{website.description}</p>
                      <p className="text-xs text-gray-500 mt-1">{website.url}</p>
                    </div>
                    {testing && currentTest === website.name && (
                      <Loader2 className="h-6 w-6 animate-spin text-teal-500" />
                    )}
                  </div>
                </CardHeader>

                {result && (
                  <CardContent>
                    {result.success ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-green-600 font-medium">✅ Test Passed</span>
                          <div className="flex space-x-4 text-gray-600">
                            <span>{result.itemCount} items extracted</span>
                            <span>{result.duration}ms</span>
                          </div>
                        </div>

                        {result.selectors && (
                          <div className="bg-gray-50 p-3 rounded text-xs">
                            <div className="font-medium text-gray-700 mb-2">AI-Detected Selectors:</div>
                            <div className="space-y-1 font-mono">
                              <div>
                                <span className="text-blue-600">Item:</span> {result.selectors.item}
                              </div>
                              <div>
                                <span className="text-green-600">Title:</span> {result.selectors.title}
                              </div>
                              <div>
                                <span className="text-purple-600">Link:</span> {result.selectors.link}
                              </div>
                              {result.selectors.description && (
                                <div>
                                  <span className="text-orange-600">Description:</span> {result.selectors.description}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-red-600 font-medium">❌ Test Failed</span>
                          <span className="text-gray-600">{result.duration}ms</span>
                        </div>
                        <div className="bg-red-50 p-3 rounded text-sm text-red-700">{result.error}</div>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
