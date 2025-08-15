"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Brain, Loader2, CheckCircle, AlertCircle, Code, Eye, Zap, BarChart3, Search } from "lucide-react"

interface DebugResult {
  success: boolean
  debugInfo?: any
  potentialSelectors?: any
  recommendedSelectors?: any
  error?: string
  url?: string
  timestamp?: string
}

export default function DebugPage() {
  const [url, setUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<DebugResult | null>(null)

  const runDebugAnalysis = async () => {
    if (!url.trim()) return

    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/debug-selectors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        success: false,
        error: "Network error during debug analysis",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-6">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-4">
            RSS Debug Console
          </h1>
          <p className="text-gray-300 text-lg">
            Deep analysis of website structure and content selectors for RSS feed generation
          </p>
        </div>

        {/* Debug Interface */}
        <Card className="mb-8 bg-black/60 border-purple-500/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center text-xl text-purple-400">
              <Search className="w-5 h-5 mr-2" />
              Debug Analysis
            </CardTitle>
            <CardDescription className="text-gray-300">
              Enter a website URL to perform detailed structural analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  type="url"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="bg-black/80 border-purple-400/30 text-white placeholder:text-gray-500"
                  onKeyPress={(e) => e.key === "Enter" && runDebugAnalysis()}
                />
              </div>
              <Button
                onClick={runDebugAnalysis}
                disabled={isLoading || !url.trim()}
                className="bg-gradient-to-r from-purple-600 to-emerald-600 hover:from-purple-500 hover:to-emerald-500 px-8"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Run Analysis
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Status */}
            <Card className="bg-black/60 border-cyan-500/30 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {result.success ? (
                      <CheckCircle className="w-6 h-6 text-green-400" />
                    ) : (
                      <AlertCircle className="w-6 h-6 text-red-400" />
                    )}
                    <div>
                      <h3 className={`font-semibold ${result.success ? "text-green-400" : "text-red-400"}`}>
                        {result.success ? "Analysis Complete" : "Analysis Failed"}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {result.success ? `Analyzed: ${result.url}` : result.error}
                      </p>
                    </div>
                  </div>
                  {result.timestamp && (
                    <Badge variant="outline" className="border-gray-400/30 text-gray-400">
                      {new Date(result.timestamp).toLocaleTimeString()}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {result.success && result.debugInfo && (
              <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4 bg-black/60">
                  <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="selectors" className="data-[state=active]:bg-emerald-600">
                    <Code className="w-4 h-4 mr-2" />
                    Selectors
                  </TabsTrigger>
                  <TabsTrigger value="recommended" className="data-[state=active]:bg-cyan-600">
                    <Brain className="w-4 h-4 mr-2" />
                    Recommended
                  </TabsTrigger>
                  <TabsTrigger value="samples" className="data-[state=active]:bg-amber-600">
                    <Eye className="w-4 h-4 mr-2" />
                    Samples
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                  <Card className="bg-black/60 border-purple-500/30 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-purple-400">Page Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="p-4 bg-black/40 rounded-lg">
                          <h4 className="font-semibold text-emerald-400 mb-2">Page Info</h4>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="text-gray-400">Title:</span>
                              <p className="text-white">{result.debugInfo.pageTitle || "No title"}</p>
                            </div>
                            <div>
                              <span className="text-gray-400">Elements:</span>
                              <p className="text-white">{result.debugInfo.totalElements}</p>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 bg-black/40 rounded-lg">
                          <h4 className="font-semibold text-cyan-400 mb-2">Content Structure</h4>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Articles:</span>
                              <span className="text-white">{result.debugInfo.articles}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Sections:</span>
                              <span className="text-white">{result.debugInfo.sections}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Links:</span>
                              <span className="text-white">{result.debugInfo.links}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Images:</span>
                              <span className="text-white">{result.debugInfo.images}</span>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 bg-black/40 rounded-lg">
                          <h4 className="font-semibold text-amber-400 mb-2">Headings</h4>
                          <div className="space-y-1 text-sm">
                            {Object.entries(result.debugInfo.headings).map(([tag, count]) => (
                              <div key={tag} className="flex justify-between">
                                <span className="text-gray-400">{tag.toUpperCase()}:</span>
                                <span className="text-white">{count as number}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="selectors">
                  <div className="grid lg:grid-cols-2 gap-6">
                    {Object.entries(result.potentialSelectors || {}).map(([type, selectors]) => (
                      <Card key={type} className="bg-black/60 border-emerald-500/30 backdrop-blur-sm">
                        <CardHeader>
                          <CardTitle className="text-emerald-400 capitalize">{type} Selectors</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {(selectors as any[]).slice(0, 5).map((selector, index) => (
                              <div key={index} className="p-3 bg-black/40 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                  <code className="text-cyan-400 text-sm font-mono">{selector.selector}</code>
                                  <Badge variant="outline" className="border-gray-400/30 text-gray-400">
                                    {selector.count}
                                  </Badge>
                                </div>
                                {selector.samples && selector.samples.length > 0 && (
                                  <div className="text-xs text-gray-400">
                                    <p className="mb-1">Samples:</p>
                                    {selector.samples.slice(0, 2).map((sample: string, i: number) => (
                                      <p key={i} className="truncate">
                                        • {sample}
                                      </p>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="recommended">
                  <Card className="bg-black/60 border-cyan-500/30 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-cyan-400">Recommended Selectors</CardTitle>
                      <CardDescription className="text-gray-300">
                        AI-generated recommendations based on page analysis
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <pre className="bg-black/60 p-4 rounded-lg text-sm text-gray-300 overflow-x-auto">
                          {JSON.stringify(result.recommendedSelectors, null, 2)}
                        </pre>
                        <div className="grid md:grid-cols-2 gap-4">
                          {Object.entries(result.recommendedSelectors || {}).map(([key, value]) => (
                            <div key={key} className="p-3 bg-black/40 rounded-lg">
                              <h4 className="font-semibold text-emerald-400 capitalize mb-2">{key}</h4>
                              <code className="text-cyan-400 text-sm font-mono">{value as string}</code>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="samples">
                  <div className="space-y-6">
                    {Object.entries(result.potentialSelectors || {}).map(([type, selectors]) => (
                      <Card key={type} className="bg-black/60 border-amber-500/30 backdrop-blur-sm">
                        <CardHeader>
                          <CardTitle className="text-amber-400 capitalize">{type} Content Samples</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {(selectors as any[]).slice(0, 3).map((selector, index) => (
                              <div key={index} className="space-y-2">
                                <div className="flex items-center space-x-2">
                                  <code className="text-cyan-400 text-sm font-mono bg-black/40 px-2 py-1 rounded">
                                    {selector.selector}
                                  </code>
                                  <Badge variant="outline" className="border-gray-400/30 text-gray-400">
                                    {selector.count} found
                                  </Badge>
                                </div>
                                {selector.samples && (
                                  <div className="pl-4 space-y-1">
                                    {selector.samples.slice(0, 3).map((sample: string, i: number) => (
                                      <p key={i} className="text-sm text-gray-300 bg-black/20 p-2 rounded">
                                        {sample || "(empty)"}
                                      </p>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
