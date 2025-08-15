"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Scan, ExternalLink, Loader2, CheckCircle, AlertCircle, Globe, Download, Eye, Settings } from "lucide-react"

interface FeedItem {
  id: string
  title: string
  link: string
  description: string
  category: string
  timestamp: string
  selected: boolean
}

export default function ManualTestPage() {
  const [url, setUrl] = useState("")
  const [customSelectors, setCustomSelectors] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [feedItems, setFeedItems] = useState<FeedItem[]>([])
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [feedTitle, setFeedTitle] = useState("")
  const [isGeneratingFeed, setIsGeneratingFeed] = useState(false)

  const handleTest = async () => {
    if (!url.trim()) {
      setError("Please enter a valid URL")
      return
    }

    setIsLoading(true)
    setError("")
    setSuccess("")
    setFeedItems([])

    try {
      let selectors = null
      if (customSelectors.trim()) {
        try {
          selectors = JSON.parse(customSelectors)
        } catch {
          setError("Invalid JSON in custom selectors")
          setIsLoading(false)
          return
        }
      }

      const endpoint = selectors ? "/api/generate-feed" : "/api/autodetect"
      const body = selectors ? { url: url.trim(), selectors } : { url: url.trim() }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (data.success) {
        const items = (data.items || []).map((item: any, index: number) => ({
          ...item,
          id: `item-${index}`,
          selected: false,
        }))
        setFeedItems(items)
        setFeedTitle(data.pageTitle || "Manual Test Feed")
        setSuccess(`Found ${items.length} items successfully!`)
      } else {
        setError(data.error || "Failed to extract content")
      }
    } catch (error) {
      setError("Network error during testing")
      console.error("Test error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleItemSelection = (id: string) => {
    setFeedItems((items) => items.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item)))
  }

  const selectAll = () => {
    setFeedItems((items) => items.map((item) => ({ ...item, selected: true })))
  }

  const deselectAll = () => {
    setFeedItems((items) => items.map((item) => ({ ...item, selected: false })))
  }

  const generateFeed = async () => {
    const selectedItems = feedItems.filter((item) => item.selected)

    if (selectedItems.length === 0) {
      setError("Please select at least one item")
      return
    }

    setIsGeneratingFeed(true)
    setError("")

    try {
      const response = await fetch("/api/generate-selected-feed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: selectedItems,
          feedTitle,
          feedUrl: url,
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Download the RSS feed
        const blob = new Blob([data.rssXml], { type: "application/rss+xml" })
        const downloadUrl = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = downloadUrl
        a.download = `${feedTitle.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.xml`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(downloadUrl)

        setSuccess(`RSS feed generated with ${selectedItems.length} items!`)
      } else {
        setError(data.error || "Failed to generate RSS feed")
      }
    } catch (error) {
      setError("Network error during feed generation")
      console.error("Feed generation error:", error)
    } finally {
      setIsGeneratingFeed(false)
    }
  }

  const sampleSelectors = {
    title: "h1, h2, .title, .headline, .entry-title",
    link: "a[href]",
    description: ".summary, .excerpt, .content, p",
    category: ".category, .tag, .label",
    timestamp: ".date, .time, time, .published",
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-6">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-4">
            Manual RSS Testing
          </h1>
          <p className="text-gray-300 text-lg">
            Manually test and generate RSS feeds with custom selectors and item selection
          </p>
        </div>

        {/* Configuration */}
        <Card className="mb-8 bg-black/60 border-purple-500/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center text-xl text-purple-400">
              <Settings className="w-5 h-5 mr-2" />
              Test Configuration
            </CardTitle>
            <CardDescription className="text-gray-300">
              Configure the URL and optional custom selectors for content extraction
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
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
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Feed Title</label>
                <Input
                  type="text"
                  placeholder="My Custom Feed"
                  value={feedTitle}
                  onChange={(e) => setFeedTitle(e.target.value)}
                  className="bg-black/80 border-emerald-400/30 text-white placeholder:text-gray-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Custom Selectors (Optional JSON)</label>
              <Textarea
                placeholder={JSON.stringify(sampleSelectors, null, 2)}
                value={customSelectors}
                onChange={(e) => setCustomSelectors(e.target.value)}
                className="bg-black/80 border-emerald-400/30 text-white placeholder:text-gray-500 font-mono text-sm min-h-[150px]"
              />
              <p className="text-xs text-gray-400 mt-2">
                Leave empty to use automatic detection, or provide custom CSS selectors in JSON format
              </p>
            </div>

            <Button
              onClick={handleTest}
              disabled={isLoading || !url.trim()}
              className="bg-gradient-to-r from-purple-600 to-emerald-600 hover:from-purple-500 hover:to-emerald-500"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Extracting Content...
                </>
              ) : (
                <>
                  <Scan className="w-4 h-4 mr-2" />
                  Extract Content
                </>
              )}
            </Button>

            {/* Status Messages */}
            {error && (
              <div className="flex items-center p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-400 mr-3" />
                <span className="text-red-300">{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                <span className="text-green-300">{success}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        {feedItems.length > 0 && (
          <div className="space-y-6">
            {/* Controls */}
            <Card className="bg-black/60 border-emerald-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-xl text-emerald-400">
                  <Eye className="w-5 h-5 mr-2" />
                  Item Selection & Feed Generation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-4 items-center">
                  <Button
                    onClick={selectAll}
                    variant="outline"
                    size="sm"
                    className="border-emerald-400/30 text-emerald-400 hover:bg-emerald-400/10 bg-transparent"
                  >
                    Select All
                  </Button>
                  <Button
                    onClick={deselectAll}
                    variant="outline"
                    size="sm"
                    className="border-gray-400/30 text-gray-400 hover:bg-gray-400/10 bg-transparent"
                  >
                    Clear Selection
                  </Button>
                  <Badge variant="outline" className="border-cyan-400/30 text-cyan-400">
                    {feedItems.filter((item) => item.selected).length} selected
                  </Badge>
                </div>

                <Button
                  onClick={generateFeed}
                  disabled={isGeneratingFeed || feedItems.filter((item) => item.selected).length === 0}
                  className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500"
                >
                  {isGeneratingFeed ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating RSS Feed...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Generate & Download RSS Feed
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Items Grid */}
            <div className="grid gap-4">
              {feedItems.map((item) => (
                <Card
                  key={item.id}
                  className={`bg-black/60 border-white/10 backdrop-blur-sm hover:bg-black/80 transition-all duration-300 cursor-pointer ${
                    item.selected ? "border-emerald-400/40 bg-emerald-500/5" : ""
                  }`}
                  onClick={() => toggleItemSelection(item.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <Checkbox
                        checked={item.selected}
                        onChange={() => toggleItemSelection(item.id)}
                        className="mt-1 border-emerald-400/30 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                      />

                      <div className="flex-1 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {item.category && (
                              <Badge className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white border-0">
                                {item.category}
                              </Badge>
                            )}
                          </div>
                          {item.link && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                window.open(item.link, "_blank")
                              }}
                              className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/10 p-1 h-auto"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </Button>
                          )}
                        </div>

                        <h3 className="text-lg font-semibold text-white">{item.title}</h3>

                        {item.description && (
                          <p className="text-gray-400 text-sm leading-relaxed">{item.description}</p>
                        )}

                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center space-x-4">
                            <span className="flex items-center">
                              <Globe className="w-3 h-3 mr-1" />
                              {new URL(url).hostname}
                            </span>
                            {item.timestamp && <span>{item.timestamp}</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
