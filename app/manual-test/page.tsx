"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, TestTube, CheckCircle, XCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface TestResult {
  success: boolean
  selectors?: any
  itemCount?: number
  error?: string
  duration?: number
  feedPreview?: any
}

export default function ManualTestPage() {
  const [url, setUrl] = useState("")
  const [testing, setTesting] = useState(false)
  const [result, setResult] = useState<TestResult | null>(null)

  const quickTestUrls = [
    "https://example.com",
    "https://news.ycombinator.com",
    "https://github.com/trending",
    "https://www.reddit.com/r/programming",
    "https://jsonplaceholder.typicode.com",
  ]

  const testSingleWebsite = async (testUrl: string) => {
    setTesting(true)
    setResult(null)
    const startTime = Date.now()

    try {
      console.log("Testing URL:", testUrl)

      // Step 1: Test auto-detection
      const autoDetectResponse = await fetch("/api/autodetect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: testUrl }),
      })

      console.log("Auto-detect response status:", autoDetectResponse.status)

      if (!autoDetectResponse.ok) {
        throw new Error(`Auto-detect failed: ${autoDetectResponse.status} ${autoDetectResponse.statusText}`)
      }

      const autoDetectData = await autoDetectResponse.json()
      console.log("Auto-detect data:", autoDetectData)

      if (!autoDetectData.success) {
        setResult({
          success: false,
          error: autoDetectData.error || "Auto-detection failed",
          duration: Date.now() - startTime,
        })
        return
      }

      // Step 2: Test feed generation
      const feedResponse = await fetch("/api/generate-feed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: testUrl,
          selectors: autoDetectData.selectors,
          feedTitle: "Test RSS Feed",
          maxItems: 5,
          useAI: true,
        }),
      })

      console.log("Feed generation response status:", feedResponse.status)

      if (!feedResponse.ok) {
        throw new Error(`Feed generation failed: ${feedResponse.status} ${feedResponse.statusText}`)
      }

      const feedData = await feedResponse.json()
      console.log("Feed data:", feedData)

      setResult({
        success: feedData.success,
        selectors: autoDetectData.selectors,
        itemCount: feedData.success ? feedData.preview.items.length : 0,
        error: feedData.success ? undefined : feedData.error,
        duration: Date.now() - startTime,
        feedPreview: feedData.success ? feedData.preview : undefined,
      })
    } catch (error) {
      console.error("Test error:", error)
      setResult({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
        duration: Date.now() - startTime,
      })
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-6">
          <Link href="/test" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Automated Tests</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manual Website Testing</h1>
          <p className="text-gray-600">Test individual websites to debug Gemini AI content detection</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TestTube className="h-5 w-5 text-teal-500" />
              <span>Test Website</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="url">Website URL</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label>Quick Test URLs</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {quickTestUrls.map((testUrl) => (
                  <Button key={testUrl} variant="outline" size="sm" onClick={() => setUrl(testUrl)} className="text-xs">
                    {new URL(testUrl).hostname}
                  </Button>
                ))}
              </div>
            </div>

            <Button
              onClick={() => testSingleWebsite(url)}
              disabled={!url || testing}
              className="w-full bg-teal-500 hover:bg-teal-600"
            >
              {testing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing Website...
                </>
              ) : (
                <>
                  <TestTube className="mr-2 h-4 w-4" />
                  Test Website
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {result.success ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <span>Test Results</span>
                <Badge variant={result.success ? "default" : "destructive"}>
                  {result.success ? "Success" : "Failed"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Duration: {result.duration}ms</span>
                {result.success && <span>Items found: {result.itemCount}</span>}
              </div>

              {result.error && (
                <div className="bg-red-50 border border-red-200 rounded p-3">
                  <h4 className="font-medium text-red-800 mb-1">Error Details</h4>
                  <p className="text-red-700 text-sm">{result.error}</p>
                </div>
              )}

              {result.selectors && (
                <div className="bg-gray-50 border rounded p-3">
                  <h4 className="font-medium text-gray-800 mb-2">AI-Detected Selectors</h4>
                  <div className="space-y-1 text-sm font-mono">
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

              {result.feedPreview && result.feedPreview.items && (
                <div className="bg-green-50 border border-green-200 rounded p-3">
                  <h4 className="font-medium text-green-800 mb-2">Extracted Items Preview</h4>
                  <div className="space-y-2">
                    {result.feedPreview.items.slice(0, 3).map((item: any, index: number) => (
                      <div key={index} className="border-l-2 border-green-400 pl-3">
                        <div className="font-medium text-sm">{item.title}</div>
                        <div className="text-xs text-gray-600">{item.link}</div>
                        {item.description && (
                          <div className="text-xs text-gray-500 mt-1">{item.description.substring(0, 100)}...</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
