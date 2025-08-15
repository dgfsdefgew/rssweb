"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Loader2,
  Globe,
  Brain,
  Download,
  Copy,
  ExternalLink,
  Rss,
  ArrowLeft,
  AlertCircle,
  Eye,
  BarChart3,
  Camera,
  Zap,
  Info,
  ImageIcon,
} from "lucide-react"
import Link from "next/link"

interface ContentItem {
  id: string
  title: string
  link: string
  description: string
  sourcePage: string
  selected: boolean
  confidence?: string
  previewImage?: string | null
}

interface FeedPreview {
  title: string
  description: string
  items: ContentItem[]
}

interface CrawlStats {
  totalItems: number
  uniqueItems: number
  duplicatesRemoved: number
}

interface VisionAnalysis {
  contentType: string
  mainContentAreas: Array<{
    description: string
    location: string
    importance: string
    contentPattern: string
  }>
  recommendedFocus: string
  layoutType: string
  excludeAreas: string[]
  confidence: string
  error?: string
  method?: string
}

export default function ConvertPage() {
  const [mounted, setMounted] = useState(false)
  const [url, setUrl] = useState("")
  const [feedTitle, setFeedTitle] = useState("")
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [generatingPreviews, setGeneratingPreviews] = useState(false)
  const [previewItems, setPreviewItems] = useState<ContentItem[]>([])
  const [feedPreview, setFeedPreview] = useState<FeedPreview | null>(null)
  const [feedXml, setFeedXml] = useState("")
  const [feedUrl, setFeedUrl] = useState("")
  const [error, setError] = useState<string>("")
  const [step, setStep] = useState<"input" | "vision" | "preview" | "generated">("input")
  const [crawlStats, setCrawlStats] = useState<CrawlStats | null>(null)
  const [pagesCrawled, setPagesCrawled] = useState(0)
  const [totalPagesFound, setTotalPagesFound] = useState(0)
  const [useVision, setUseVision] = useState(true)
  const [screenshot, setScreenshot] = useState<string>("")
  const [visionAnalysis, setVisionAnalysis] = useState<VisionAnalysis | null>(null)
  const [detectedSelectors, setDetectedSelectors] = useState<any>(null)
  const [analysisMethod, setAnalysisMethod] = useState<string>("")
  const [showPreviews, setShowPreviews] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleVisionAnalysis = async () => {
    if (!url) return

    setError("")
    setLoading(true)
    setStep("input")

    try {
      console.log("Starting smart analysis for:", url)

      const response = await fetch("/api/vision-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      })

      console.log("Response status:", response.status)

      // Check if response is actually JSON
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const textResponse = await response.text()
        console.error("Non-JSON response:", textResponse.substring(0, 500))
        throw new Error(
          `Server error: The smart analysis service is currently unavailable. Please try traditional scraping instead.`,
        )
      }

      const data = await response.json()
      console.log("Smart analysis response:", data)

      if (data.success) {
        setScreenshot(data.screenshot)
        setVisionAnalysis(data.analysis)
        setDetectedSelectors(data.selectors)
        setFeedTitle(data.pageTitle || "")
        setAnalysisMethod(data.method || "html-analysis")
        setStep("vision")
        setError("")
      } else {
        if (data.fallbackAvailable) {
          // Automatically fall back to traditional scraping
          console.log("Smart analysis not available, falling back to traditional scraping")
          await handleScrapeWebsite()
          return
        } else {
          setError(data.error || "Smart analysis failed")
        }
      }
    } catch (error) {
      console.error("Smart analysis failed:", error)
      let errorMessage = "Smart analysis failed"

      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === "string") {
        errorMessage = error
      }

      // If smart analysis fails, automatically try traditional scraping
      console.log("Smart analysis failed, automatically trying traditional scraping...")
      setError("")
      await handleScrapeWebsite()
    } finally {
      setLoading(false)
    }
  }

  const handleScrapeWithVision = async () => {
    if (!detectedSelectors || !visionAnalysis) return

    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/vision-preview-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          selectors: detectedSelectors,
          analysis: visionAnalysis,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        setPreviewItems(data.items)
        setStep("preview")
        setError("")
        setCrawlStats(data.stats)
        setPagesCrawled(data.pagesCrawled)
        setTotalPagesFound(data.totalPagesFound)
      } else {
        setError(data.error)
      }
    } catch (error) {
      console.error("Vision-guided scraping failed:", error)
      const errorMessage = error instanceof Error ? error.message : "Network error occurred"
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleScrapeWebsite = async () => {
    if (!url) return

    setError("")
    setLoading(true)
    setStep("input")
    setCrawlStats(null)
    setPagesCrawled(0)
    setTotalPagesFound(0)

    try {
      const response = await fetch("/api/preview-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      })

      const data = await response.json()

      if (data.success) {
        setPreviewItems(data.items)
        setFeedTitle(data.suggestedTitle || "")
        setStep("preview")
        setError("")
        setCrawlStats(data.stats)
        setPagesCrawled(data.pagesCrawled)
        setTotalPagesFound(data.totalPagesFound)
        setAnalysisMethod("traditional")
      } else {
        setError(data.error)
      }
    } catch (error) {
      console.error("Scraping failed:", error)
      const errorMessage = error instanceof Error ? error.message : "Network error occurred"
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleGeneratePreviews = async () => {
    if (previewItems.length === 0) return

    setGeneratingPreviews(true)
    setError("")

    try {
      const response = await fetch("/api/generate-preview-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: previewItems.slice(0, 10) }), // Limit to first 10 items for performance
      })

      const data = await response.json()

      if (data.success) {
        // Update preview items with generated images
        setPreviewItems((prevItems) =>
          prevItems.map((item) => {
            const updatedItem = data.items.find((updated: any) => updated.id === item.id)
            return updatedItem ? { ...item, previewImage: updatedItem.previewImage } : item
          }),
        )
        setShowPreviews(true)
      } else {
        setError("Failed to generate preview images")
      }
    } catch (error) {
      console.error("Preview generation failed:", error)
      setError("Failed to generate preview images")
    } finally {
      setGeneratingPreviews(false)
    }
  }

  const handleGenerateRSS = async () => {
    const selectedItems = previewItems.filter((item) => item.selected)

    if (selectedItems.length === 0) {
      setError("Please select at least one item to include in the RSS feed")
      return
    }

    setError("")
    setGenerating(true)

    try {
      const response = await fetch("/api/generate-selected-feed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          selectedItems,
          feedTitle: feedTitle || "Custom RSS Feed",
        }),
      })

      const data = await response.json()

      if (data.success) {
        setFeedPreview(data.preview)
        setFeedXml(data.xml)
        setFeedUrl(data.feedUrl)
        setStep("generated")
        setError("")
      } else {
        setError(data.error)
      }
    } catch (error) {
      console.error("RSS generation failed:", error)
      const errorMessage = error instanceof Error ? error.message : "Network error occurred"
      setError(errorMessage)
    } finally {
      setGenerating(false)
    }
  }

  const toggleItemSelection = (itemId: string) => {
    setPreviewItems((items) => items.map((item) => (item.id === itemId ? { ...item, selected: !item.selected } : item)))
  }

  const selectAll = () => {
    setPreviewItems((items) => items.map((item) => ({ ...item, selected: true })))
  }

  const deselectAll = () => {
    setPreviewItems((items) => items.map((item) => ({ ...item, selected: false })))
  }

  const selectBySourcePage = (sourcePage: string, selected: boolean) => {
    setPreviewItems((items) => items.map((item) => (item.sourcePage === sourcePage ? { ...item, selected } : item)))
  }

  const copyFeedUrl = () => {
    if (mounted && navigator.clipboard) {
      navigator.clipboard.writeText(feedUrl)
    }
  }

  const downloadXml = () => {
    if (!mounted) return

    const blob = new Blob([feedXml], { type: "application/xml" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "feed.xml"
    a.click()
    URL.revokeObjectURL(url)
  }

  const resetToInput = () => {
    setStep("input")
    setPreviewItems([])
    setFeedPreview(null)
    setError("")
    setCrawlStats(null)
    setScreenshot("")
    setVisionAnalysis(null)
    setDetectedSelectors(null)
    setAnalysisMethod("")
    setShowPreviews(false)
  }

  // Group items by source page for better organization
  const itemsByPage = previewItems.reduce(
    (acc, item) => {
      if (!acc[item.sourcePage]) {
        acc[item.sourcePage] = []
      }
      acc[item.sourcePage].push(item)
      return acc
    },
    {} as Record<string, ContentItem[]>,
  )

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-teal-500" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-5 w-5" />
              <span>Back</span>
            </Link>
            <div className="flex items-center space-x-2">
              <Rss className="h-6 w-6 text-teal-500" />
              <span className="text-lg font-semibold text-gray-900">RSS Converter</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Convert Website to RSS</h1>
            <p className="text-gray-600">
              {step === "input" && "Choose between AI smart analysis or traditional scraping"}
              {step === "vision" && "Review the AI's analysis of the website"}
              {step === "preview" && "Select the items you want to include in your RSS feed"}
              {step === "generated" && "Your RSS feed has been generated successfully"}
            </p>
          </div>

          {error && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>Error:</strong> {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Step 1: Input URL */}
          {step === "input" && (
            <div className="max-w-2xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Globe className="h-5 w-5 text-teal-500" />
                    <span>Website URL</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="url">Enter the website URL you want to convert</Label>
                    <Input
                      id="url"
                      type="url"
                      placeholder="https://example.com"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="useVision"
                        checked={useVision}
                        onCheckedChange={(checked) => setUseVision(checked as boolean)}
                      />
                      <Label htmlFor="useVision" className="text-sm font-medium">
                        Try AI Smart Analysis
                      </Label>
                      <Badge variant="secondary" className="text-xs">
                        SMART
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 ml-6">
                      {useVision
                        ? "AI will analyze the website's HTML structure intelligently for better content detection. Falls back to traditional scraping if needed."
                        : "Traditional HTML analysis will be used to detect content patterns"}
                    </p>
                    {useVision && (
                      <div className="ml-6 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
                        <div className="flex items-start space-x-2">
                          <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <strong className="text-blue-800">Smart Mode:</strong>
                            <span className="text-blue-700 ml-1">
                              Uses intelligent HTML structure analysis to understand content patterns and generate
                              better selectors. Automatically falls back to traditional scraping if needed.
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {useVision ? (
                    <Button
                      onClick={handleVisionAnalysis}
                      disabled={!url || loading}
                      className="w-full bg-purple-500 hover:bg-purple-600 text-white py-3"
                      size="lg"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Running Smart Analysis...
                        </>
                      ) : (
                        <>
                          <Brain className="mr-2 h-5 w-5" />
                          Start Smart Analysis
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      onClick={handleScrapeWebsite}
                      disabled={!url || loading}
                      className="w-full bg-teal-500 hover:bg-teal-600 text-white py-3"
                      size="lg"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Scraping Website & Subpages...
                        </>
                      ) : (
                        <>
                          <Eye className="mr-2 h-5 w-5" />
                          Traditional Scrape & Preview
                        </>
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 2: Vision Analysis Results */}
          {step === "vision" && visionAnalysis && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Camera className="h-5 w-5 text-purple-500" />
                      <span>AI Analysis Results</span>
                      <Badge variant={visionAnalysis.confidence === "high" ? "default" : "secondary"}>
                        {visionAnalysis.confidence} confidence
                      </Badge>
                      {analysisMethod && (
                        <Badge variant="outline" className="text-xs">
                          {analysisMethod === "html-only" ? "Smart HTML Analysis" : analysisMethod}
                        </Badge>
                      )}
                    </div>
                    <Button variant="outline" onClick={resetToInput} size="sm">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to URL
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Website Preview Section */}
                  <div className="bg-gray-50 border rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
                      <Globe className="h-4 w-4 text-blue-500" />
                      <span>Website Preview</span>
                    </h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">URL:</span>
                            <span className="text-blue-600 truncate max-w-xs">{url}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Title:</span>
                            <span className="font-medium truncate max-w-xs">{feedTitle || "Loading..."}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Domain:</span>
                            <span className="text-gray-800">{new URL(url).hostname}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Protocol:</span>
                            <Badge variant="outline" className="text-xs">
                              {new URL(url).protocol.replace(":", "")}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Analysis Method:</span>
                            <Badge variant="secondary" className="text-xs">
                              {analysisMethod === "html-only" ? "Smart HTML" : analysisMethod}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Content Type:</span>
                            <Badge variant="outline" className="text-xs">
                              {visionAnalysis?.contentType || "Analyzing..."}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Layout:</span>
                            <Badge variant="outline" className="text-xs">
                              {visionAnalysis?.layoutType || "Detecting..."}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Confidence:</span>
                            <Badge
                              variant={visionAnalysis?.confidence === "high" ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {visionAnalysis?.confidence || "Processing..."}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="mt-4 pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span>Scraped at: {new Date().toLocaleString()}</span>
                        <div className="flex items-center space-x-2">
                          <span>Status:</span>
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-green-600">Active</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {analysisMethod === "html-only" && (
                    <Alert className="border-blue-200 bg-blue-50">
                      <Info className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-blue-800">
                        <strong>Smart HTML Analysis:</strong> Using intelligent HTML structure analysis to detect
                        content patterns. This provides better results than basic scraping by understanding the page
                        structure.
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Screenshot */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Website {screenshot ? "Screenshot" : "Analysis"}</h4>
                    <div className="border rounded-lg overflow-hidden">
                      {screenshot ? (
                        <img
                          src={screenshot || "/placeholder.svg"}
                          alt="Website screenshot"
                          className="w-full h-auto max-h-96 object-contain"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
                          <div className="text-center">
                            <Brain className="h-12 w-12 text-blue-500 mx-auto mb-2" />
                            <span className="text-gray-600">HTML Structure Analysis</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Analysis Results */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Content Analysis</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Content Type:</span>
                          <Badge variant="outline">{visionAnalysis.contentType}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Layout Type:</span>
                          <Badge variant="outline">{visionAnalysis.layoutType}</Badge>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Main Content Areas</h4>
                      <div className="space-y-2">
                        {visionAnalysis.mainContentAreas.map((area, index) => (
                          <div key={index} className="bg-gray-50 p-3 rounded text-sm">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium">{area.description}</span>
                              <Badge variant={area.importance === "high" ? "default" : "secondary"} className="text-xs">
                                {area.importance}
                              </Badge>
                            </div>
                            <div className="text-gray-600 text-xs">
                              Location: {area.location} • Pattern: {area.contentPattern}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Recommended Focus</h4>
                      <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded">{visionAnalysis.recommendedFocus}</p>
                    </div>

                    {detectedSelectors && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Generated Selectors</h4>
                        <div className="bg-gray-50 p-3 rounded text-xs font-mono space-y-1">
                          <div>
                            <span className="text-blue-600">Item:</span> {detectedSelectors.item}
                          </div>
                          <div>
                            <span className="text-green-600">Title:</span> {detectedSelectors.title}
                          </div>
                          <div>
                            <span className="text-purple-600">Link:</span> {detectedSelectors.link}
                          </div>
                          {detectedSelectors.description && (
                            <div>
                              <span className="text-orange-600">Description:</span> {detectedSelectors.description}
                            </div>
                          )}
                        </div>
                        {detectedSelectors.reasoning && (
                          <p className="text-xs text-gray-600 mt-2 italic">{detectedSelectors.reasoning}</p>
                        )}
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={handleScrapeWithVision}
                    disabled={loading}
                    className="w-full bg-purple-500 hover:bg-purple-600 text-white py-3"
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Scraping with AI Guidance...
                      </>
                    ) : (
                      <>
                        <Zap className="mr-2 h-5 w-5" />
                        Proceed with AI-Guided Scraping
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 3: Preview and Select Items */}
          {step === "preview" && (
            <div className="space-y-6">
              {/* Stats Card */}
              {crawlStats && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart3 className="h-5 w-5 text-blue-500" />
                      <span>Crawl Statistics</span>
                      {analysisMethod && (
                        <Badge
                          variant="secondary"
                          className={
                            analysisMethod === "traditional"
                              ? "bg-teal-100 text-teal-800"
                              : "bg-purple-100 text-purple-800"
                          }
                        >
                          {analysisMethod === "traditional" ? "Traditional" : "AI-Guided"}
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{pagesCrawled}</div>
                        <div className="text-sm text-gray-600">Pages Crawled</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{crawlStats.uniqueItems}</div>
                        <div className="text-sm text-gray-600">Unique Items</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">{crawlStats.totalItems}</div>
                        <div className="text-sm text-gray-600">Total Found</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">{crawlStats.duplicatesRemoved}</div>
                        <div className="text-sm text-gray-600">Duplicates Removed</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Brain className="h-5 w-5 text-teal-500" />
                      <span>Content Preview</span>
                      <Badge variant="secondary">{previewItems.length} items found</Badge>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        onClick={handleGeneratePreviews}
                        disabled={generatingPreviews || previewItems.length === 0}
                        size="sm"
                      >
                        {generatingPreviews ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <ImageIcon className="mr-2 h-4 w-4" />
                            Generate Previews
                          </>
                        )}
                      </Button>
                      <Button variant="outline" onClick={resetToInput} size="sm">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to URL
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="feedTitle">Feed Title</Label>
                    <Input
                      id="feedTitle"
                      placeholder="My Custom RSS Feed"
                      value={feedTitle}
                      onChange={(e) => setFeedTitle(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2 items-center">
                    <Button variant="outline" size="sm" onClick={selectAll}>
                      Select All
                    </Button>
                    <Button variant="outline" size="sm" onClick={deselectAll}>
                      Deselect All
                    </Button>
                    <Badge variant="secondary" className="ml-auto">
                      {previewItems.filter((item) => item.selected).length} selected
                    </Badge>
                  </div>

                  <div className="max-h-96 overflow-y-auto space-y-4 border rounded-lg p-4">
                    {Object.entries(itemsByPage).map(([sourcePage, items]) => (
                      <div key={sourcePage} className="space-y-2">
                        <div className="flex items-center justify-between bg-gray-100 p-2 rounded">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium text-sm text-gray-700">{new URL(sourcePage).pathname || "/"}</h4>
                            <Badge variant="outline" className="text-xs">
                              {items.length} items
                            </Badge>
                          </div>
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => selectBySourcePage(sourcePage, true)}
                              className="text-xs h-6 px-2"
                            >
                              Select All
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => selectBySourcePage(sourcePage, false)}
                              className="text-xs h-6 px-2"
                            >
                              Deselect All
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2 ml-4">
                          {items.map((item) => (
                            <div
                              key={item.id}
                              className={`flex items-start space-x-3 p-3 rounded-lg border ${
                                item.selected ? "bg-teal-50 border-teal-200" : "bg-white border-gray-200"
                              }`}
                            >
                              <Checkbox
                                checked={item.selected}
                                onCheckedChange={() => toggleItemSelection(item.id)}
                                className="mt-1"
                              />

                              {/* Preview Image */}
                              {showPreviews && item.previewImage && (
                                <div className="flex-shrink-0">
                                  <img
                                    src={item.previewImage || "/placeholder.svg"}
                                    alt={`Preview of ${item.title}`}
                                    className="w-20 h-16 object-cover rounded border"
                                    onError={(e) => {
                                      // Hide image if it fails to load
                                      e.currentTarget.style.display = "none"
                                    }}
                                  />
                                </div>
                              )}

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2 mb-1">
                                  <h5 className="font-medium text-gray-900 line-clamp-2">{item.title}</h5>
                                  {item.confidence && (
                                    <Badge
                                      variant={item.confidence === "high" ? "default" : "secondary"}
                                      className="text-xs"
                                    >
                                      {item.confidence}
                                    </Badge>
                                  )}
                                </div>
                                {item.description && (
                                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.description}</p>
                                )}
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                  <span className="truncate">{item.link}</span>
                                  <a
                                    href={item.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center hover:text-teal-600 ml-2"
                                  >
                                    <ExternalLink className="h-3 w-3 mr-1" />
                                    View
                                  </a>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={handleGenerateRSS}
                    disabled={generating || previewItems.filter((item) => item.selected).length === 0}
                    className="w-full bg-teal-500 hover:bg-teal-600 text-white py-3"
                    size="lg"
                  >
                    {generating ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Generating RSS Feed...
                      </>
                    ) : (
                      <>
                        <Rss className="mr-2 h-5 w-5" />
                        Generate RSS Feed ({previewItems.filter((item) => item.selected).length} items)
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 4: Generated Feed */}
          {step === "generated" && feedPreview && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>RSS Feed Generated</span>
                    <div className="flex space-x-2">
                      <Button variant="outline" onClick={resetToInput} size="sm">
                        Create New Feed
                      </Button>
                      <Button variant="outline" onClick={copyFeedUrl} className="bg-transparent">
                        <Copy className="mr-1 h-3 w-3" />
                        Copy URL
                      </Button>
                      <Button variant="outline" onClick={downloadXml} className="bg-transparent">
                        <Download className="mr-1 h-3 w-3" />
                        Download
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="preview" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="preview">Preview</TabsTrigger>
                      <TabsTrigger value="xml">Raw XML</TabsTrigger>
                    </TabsList>

                    <TabsContent value="preview" className="space-y-4 mt-4">
                      <div className="border-b pb-4">
                        <h3 className="font-semibold text-lg">{feedPreview.title}</h3>
                        <p className="text-gray-600 text-sm">{feedPreview.description}</p>
                        <Badge variant="secondary" className="mt-2">
                          {feedPreview.items.length} items
                        </Badge>
                      </div>

                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {feedPreview.items.map((item, index) => (
                          <div key={index} className="border-l-4 border-teal-500 pl-4 py-2">
                            <h4 className="font-medium text-gray-900 mb-1">{item.title}</h4>
                            {item.description && <p className="text-gray-600 text-sm mb-2">{item.description}</p>}
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>{new Date().toLocaleDateString()}</span>
                              <a
                                href={item.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center hover:text-teal-600"
                              >
                                <ExternalLink className="h-3 w-3 mr-1" />
                                View
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="xml" className="mt-4">
                      <Textarea value={feedXml} readOnly className="font-mono text-xs h-96 resize-none" />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
