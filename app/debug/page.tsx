"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Bug, CheckCircle, XCircle, ArrowLeft, Eye } from "lucide-react"
import Link from "next/link"

interface DebugResult {
  success: boolean
  url: string
  selectors?: any
  htmlPreview?: string
  itemsFound?: number
  sampleItems?: any[]
  error?: string
  suggestions?: string[]
  subpagesCrawled?: number
  subpageUrls?: string[]
}

export default function DebugPage() {
  const [url, setUrl] = useState("https://www.trustedshops.de/shops/telekommunikation/")
  const [debugging, setDebugging] = useState(false)
  const [result, setResult] = useState<DebugResult | null>(null)

  const debugWebsite = async () => {
    if (!url) return

    setDebugging(true)
    setResult(null)

    try {
      // First, let's create a debug endpoint that gives us more information
      const response = await fetch("/api/debug-selectors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        success: false,
        url,
        error: error instanceof Error ? error.message : "Debug failed",
      })
    } finally {
      setDebugging(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-6">
          <Link href="/convert" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Converter</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Selector Debug Tool</h1>
          <p className="text-gray-600">Debug why certain websites return 0 items and improve selector detection</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bug className="h-5 w-5 text-orange-500" />
              <span>Debug Website Selectors</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="debug-url">Website URL</Label>
              <Input
                id="debug-url"
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="mt-1"
              />
            </div>

            <Button
              onClick={debugWebsite}
              disabled={!url || debugging}
              className="w-full bg-orange-500 hover:bg-orange-600"
            >
              {debugging ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Debugging Selectors...
                </>
              ) : (
                <>
                  <Bug className="mr-2 h-4 w-4" />
                  Debug Selectors
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {result && (
          <div className="space-y-6">
            {/* Status Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  {result.success ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span>Debug Results</span>
                  <Badge variant={result.success ? "default" : "destructive"}>
                    {result.itemsFound || 0} items found
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-600 mb-4">
                  <strong>URL:</strong> {result.url}
                </div>

                {result.error && (
                  <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
                    <h4 className="font-medium text-red-800 mb-1">Error</h4>
                    <p className="text-red-700 text-sm">{result.error}</p>
                  </div>
                )}

                {result.selectors && (
                  <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
                    <h4 className="font-medium text-blue-800 mb-2">AI-Detected Selectors</h4>
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

                {result.subpagesCrawled && (
                  <div className="bg-purple-50 border border-purple-200 rounded p-3 mb-4">
                    <h4 className="font-medium text-purple-800 mb-2">Subpage Crawling</h4>
                    <div className="text-sm text-purple-700">
                      <p>Found {result.subpagesCrawled} subpages to crawl</p>
                      {result.subpageUrls && (
                        <div className="mt-2">
                          <p className="font-medium">Sample subpages:</p>
                          <ul className="list-disc list-inside text-xs">
                            {result.subpageUrls.map((url, index) => (
                              <li key={index} className="break-all">
                                {url}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {result.suggestions && result.suggestions.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
                    <h4 className="font-medium text-yellow-800 mb-2">Suggestions</h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      {result.suggestions.map((suggestion, index) => (
                        <li key={index}>• {suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Sample Items */}
            {result.sampleItems && result.sampleItems.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>All Extracted Items ({result.sampleItems.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {result.sampleItems.map((item, index) => (
                      <div
                        key={index}
                        className="border-l-4 border-green-400 pl-3 py-2 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-sm">{item.title || "No title"}</div>
                            <div className="text-xs text-gray-600 break-all">{item.link || "No link"}</div>
                            {item.description && <div className="text-xs text-gray-500 mt-1">{item.description}</div>}
                          </div>
                          <Badge variant="outline" className="text-xs ml-2">
                            #{index + 1}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* HTML Preview */}
            {result.htmlPreview && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Eye className="h-5 w-5" />
                    <span>HTML Structure Preview</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={result.htmlPreview}
                    readOnly
                    className="font-mono text-xs h-64 resize-none"
                    placeholder="HTML structure will appear here..."
                  />
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
