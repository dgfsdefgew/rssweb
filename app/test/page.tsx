"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Brain, Scan, ExternalLink, Loader2, CheckCircle, AlertCircle, Code, Eye, Settings, Zap } from "lucide-react"

interface TestResult {
  success: boolean
  items?: any[]
  error?: string
  selectors?: any
  pageTitle?: string
  duration?: number
}

export default function TestPage() {
  const [url, setUrl] = useState("")
  const [customSelectors, setCustomSelectors] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<TestResult | null>(null)
  const [activeTab, setActiveTab] = useState("autodetect")

  const testAutoDetect = async () => {
    if (!url.trim()) return

    setIsLoading(true)
    setResult(null)

    try {
      const startTime = Date.now()
      const response = await fetch("/api/autodetect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      })

      const data = await response.json()
      const endTime = Date.now()

      setResult({
        ...data,
        duration: endTime - startTime,
      })
    } catch (error) {
      setResult({
        success: false,
        error: "Network error during testing",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const testCustomSelectors = async () => {
    if (!url.trim() || !customSelectors.trim()) return

    setIsLoading(true)
    setResult(null)

    try {
      const startTime = Date.now()
      let selectors
      try {
        selectors = JSON.parse(customSelectors)
      } catch {
        setResult({
          success: false,
          error: "Invalid JSON in custom selectors",
        })
        setIsLoading(false)
        return
      }

      const response = await fetch("/api/generate-feed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: url.trim(),
          selectors,
        }),
      })

      const data = await response.json()
      const endTime = Date.now()

      setResult({
        ...data,
        duration: endTime - startTime,
      })
    } catch (error) {
      setResult({
        success: false,
        error: "Network error during testing",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const testDebugSelectors = async () => {
    if (!url.trim()) return

    setIsLoading(true)
    setResult(null)

    try {
      const startTime = Date.now()
      const response = await fetch("/api/debug-selectors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      })

      const data = await response.json()
      const endTime = Date.now()

      setResult({
        ...data,
        duration: endTime - startTime,
      })
    } catch (error) {
      setResult({
        success: false,
        error: "Network error during testing",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const sampleSelectors = {
    title: "h1, h2, .title, .headline",
    link: "a[href]",
    description: ".summary, .excerpt, p",
    category: ".category, .tag",
    timestamp: ".date, .time, time",
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-6">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-4">
            RSS Generator Testing Suite
          </h1>
          <p className="text-gray-300 text-lg">Test and debug the RSS feed generation system with various methods</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Testing Interface */}
          <Card className="bg-black/60 border-purple-500/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-xl text-purple-400">
                <Zap className="w-5 h-5 mr-2" />
                Test Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Website URL</label>
                <Input
                  type="url"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="bg-black/80 border-purple-400/30 text-white placeholder:text-gray-500"
                />
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3 bg-black/60">
                  <TabsTrigger value="autodetect" className="data-[state=active]:bg-purple-600">
                    <Brain className="w-4 h-4 mr-2" />
                    Auto Detect
                  </TabsTrigger>
                  <TabsTrigger value="custom" className="data-[state=active]:bg-emerald-600">
                    <Code className="w-4 h-4 mr-2" />
                    Custom
                  </TabsTrigger>
                  <TabsTrigger value="debug" className="data-[state=active]:bg-cyan-600">
                    <Settings className="w-4 h-4 mr-2" />
                    Debug
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="autodetect" className="space-y-4">
                  <p className="text-sm text-gray-400">Use AI-powered automatic detection to find content selectors</p>
                  <Button
                    onClick={testAutoDetect}
                    disabled={isLoading || !url.trim()}
                    className="w-full bg-gradient-to-r from-purple-600 to-emerald-600 hover:from-purple-500 hover:to-emerald-500"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Testing Auto Detection...
                      </>
                    ) : (
                      <>
                        <Brain className="w-4 h-4 mr-2" />
                        Test Auto Detection
                      </>
                    )}
                  </Button>
                </TabsContent>

                <TabsContent value="custom" className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Custom Selectors (JSON)</label>
                    <Textarea
                      placeholder={JSON.stringify(sampleSelectors, null, 2)}
                      value={customSelectors}
                      onChange={(e) => setCustomSelectors(e.target.value)}
                      className="bg-black/80 border-emerald-400/30 text-white placeholder:text-gray-500 font-mono text-sm min-h-[200px]"
                    />
                  </div>
                  <Button
                    onClick={testCustomSelectors}
                    disabled={isLoading || !url.trim() || !customSelectors.trim()}
                    className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Testing Custom Selectors...
                      </>
                    ) : (
                      <>
                        <Code className="w-4 h-4 mr-2" />
                        Test Custom Selectors
                      </>
                    )}
                  </Button>
                </TabsContent>

                <TabsContent value="debug" className="space-y-4">
                  <p className="text-sm text-gray-400">
                    Debug mode shows detailed selector analysis and potential matches
                  </p>
                  <Button
                    onClick={testDebugSelectors}
                    disabled={isLoading || !url.trim()}
                    className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Running Debug Analysis...
                      </>
                    ) : (
                      <>
                        <Settings className="w-4 h-4 mr-2" />
                        Run Debug Analysis
                      </>
                    )}
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Results */}
          <Card className="bg-black/60 border-cyan-500/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-xl text-cyan-400">
                <Eye className="w-5 h-5 mr-2" />
                Test Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!result ? (
                <div className="text-center py-12 text-gray-400">
                  <Scan className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Run a test to see results here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Status */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {result.success ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-400" />
                      )}
                      <span className={result.success ? "text-green-400" : "text-red-400"}>
                        {result.success ? "Success" : "Failed"}
                      </span>
                    </div>
                    {result.duration && (
                      <Badge variant="outline" className="border-gray-400/30 text-gray-400">
                        {result.duration}ms
                      </Badge>
                    )}
                  </div>

                  {/* Error */}
                  {result.error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                      <p className="text-red-300 text-sm">{result.error}</p>
                    </div>
                  )}

                  {/* Success Results */}
                  {result.success && (
                    <div className="space-y-4">
                      {result.pageTitle && (
                        <div>
                          <h4 className="font-semibold text-emerald-400 mb-2">Page Title</h4>
                          <p className="text-gray-300 text-sm">{result.pageTitle}</p>
                        </div>
                      )}

                      {result.items && result.items.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-emerald-400 mb-2">Found Items ({result.items.length})</h4>
                          <div className="space-y-2 max-h-96 overflow-y-auto">
                            {result.items.slice(0, 10).map((item, index) => (
                              <div key={index} className="p-3 bg-black/40 border border-gray-600/30 rounded-lg">
                                <div className="flex items-start justify-between mb-2">
                                  <h5 className="font-medium text-white text-sm line-clamp-2">
                                    {item.title || "No title"}
                                  </h5>
                                  {item.link && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => window.open(item.link, "_blank")}
                                      className="text-cyan-400 hover:text-cyan-300 p-1 h-auto"
                                    >
                                      <ExternalLink className="w-3 h-3" />
                                    </Button>
                                  )}
                                </div>
                                {item.description && (
                                  <p className="text-gray-400 text-xs mb-2 line-clamp-2">{item.description}</p>
                                )}
                                <div className="flex items-center space-x-2 text-xs">
                                  {item.category && (
                                    <Badge variant="outline" className="border-emerald-400/30 text-emerald-400">
                                      {item.category}
                                    </Badge>
                                  )}
                                  {item.timestamp && <span className="text-gray-500">{item.timestamp}</span>}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {result.selectors && (
                        <div>
                          <h4 className="font-semibold text-emerald-400 mb-2">Debug Selectors</h4>
                          <pre className="bg-black/60 p-4 rounded-lg text-xs text-gray-300 overflow-x-auto">
                            {JSON.stringify(result.selectors, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
