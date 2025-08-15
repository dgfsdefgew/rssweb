"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Brain,
  Scan,
  ExternalLink,
  Loader2,
  CheckCircle,
  AlertCircle,
  Globe,
  Sparkles,
  Eye,
  Layout,
  Telescope,
  Orbit,
  Star,
  Atom,
} from "lucide-react"

interface NewsItem {
  id: string
  title: string
  link: string
  description: string
  category: string
  importance: "high" | "medium" | "low"
  timestamp: string
  source: string
  selected: boolean
  rank: number
}

export default function NewsPage() {
  const [url, setUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [newsItems, setNewsItems] = useState<NewsItem[]>([])
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [feedTitle, setFeedTitle] = useState("")
  const [isGeneratingMagazine, setIsGeneratingMagazine] = useState(false)

  const handleScan = async () => {
    if (!url.trim()) {
      setError("Please enter a valid URL")
      return
    }

    setIsLoading(true)
    setError("")
    setSuccess("")
    setNewsItems([])

    try {
      const response = await fetch("/api/grok-news-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      })

      const data = await response.json()

      if (data.success) {
        setNewsItems(data.newsItems || [])
        setFeedTitle(data.pageTitle || "News Feed")
        setSuccess(`Extraction complete! Found ${data.newsItems?.length || 0} news articles`)
      } else {
        setError(data.error || "Failed to extract news content")
      }
    } catch (error) {
      setError("Network error during content extraction")
      console.error("Scan error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleItemSelection = (id: string) => {
    setNewsItems((items) => items.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item)))
  }

  const selectAll = () => {
    setNewsItems((items) => items.map((item) => ({ ...item, selected: true })))
  }

  const deselectAll = () => {
    setNewsItems((items) => items.map((item) => ({ ...item, selected: false })))
  }

  const generateMagazine = async () => {
    const selectedItems = newsItems.filter((item) => item.selected)

    if (selectedItems.length === 0) {
      setError("Please select at least one news article")
      return
    }

    setIsGeneratingMagazine(true)
    setError("")

    try {
      const response = await fetch("/api/generate-magazine-page", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newsItems: selectedItems,
          feedTitle,
          url,
          layout: "cosmic-universe",
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Open magazine in new window
        const newWindow = window.open("", "_blank")
        if (newWindow) {
          newWindow.document.write(data.magazineHtml)
          newWindow.document.close()
        }
        setSuccess(`Magazine generated with ${selectedItems.length} articles!`)
      } else {
        setError(data.error || "Failed to generate magazine")
      }
    } catch (error) {
      setError("Network error during magazine generation")
      console.error("Magazine generation error:", error)
    } finally {
      setIsGeneratingMagazine(false)
    }
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      Technology: "from-cyan-400 to-blue-500",
      Business: "from-amber-400 to-orange-500",
      Politics: "from-red-400 to-rose-500",
      Sports: "from-green-400 to-emerald-500",
      Entertainment: "from-purple-400 to-violet-500",
      Health: "from-emerald-400 to-teal-500",
      Science: "from-cyan-400 to-sky-500",
      World: "from-orange-400 to-red-500",
      General: "from-slate-400 to-gray-500",
    }
    return colors[category] || colors.General
  }

  const getImportanceIcon = (importance: string) => {
    switch (importance) {
      case "high":
        return <Star className="w-3 h-3 text-yellow-400" />
      case "medium":
        return <Sparkles className="w-3 h-3 text-blue-400" />
      case "low":
        return <Eye className="w-3 h-3 text-purple-400" />
      default:
        return <Eye className="w-3 h-3 text-gray-400" />
    }
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Static Cosmic Background */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Deep Space Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-slate-900 to-purple-950"></div>

        {/* Rotating Matrix Planet - Smaller and more subtle */}
        <div className="absolute top-1/3 left-1/4 w-64 h-64 opacity-15">
          <div className="relative w-full h-full">
            {/* Planet Core */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500/20 via-cyan-500/15 to-emerald-500/20 animate-spin-slow">
              {/* Matrix Grid Lines */}
              <div className="absolute inset-0 rounded-full">
                {/* Horizontal Lines */}
                {[...Array(8)].map((_, i) => (
                  <div
                    key={`h-${i}`}
                    className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent"
                    style={{ top: `${(i + 1) * 12.5}%` }}
                  />
                ))}
                {/* Vertical Lines */}
                {[...Array(8)].map((_, i) => (
                  <div
                    key={`v-${i}`}
                    className="absolute top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-purple-400/30 to-transparent"
                    style={{ left: `${(i + 1) * 12.5}%` }}
                  />
                ))}
              </div>

              {/* Digital Nodes */}
              {[...Array(12)].map((_, i) => (
                <div
                  key={`node-${i}`}
                  className="absolute w-1 h-1 bg-cyan-400/60 rounded-full animate-pulse"
                  style={{
                    left: `${Math.random() * 90 + 5}%`,
                    top: `${Math.random() * 90 + 5}%`,
                    animationDelay: `${Math.random() * 3}s`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Static Nebula */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-15"></div>
        </div>

        {/* Static Star Field */}
        <div className="absolute inset-0">
          {[...Array(150)].map((_, i) => (
            <div
              key={i}
              className="absolute bg-white rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 2 + 1}px`,
                height: `${Math.random() * 2 + 1}px`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${Math.random() * 3 + 2}s`,
              }}
            />
          ))}
        </div>

        {/* Static Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-purple-500/20 backdrop-blur-sm bg-black/40">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-full flex items-center justify-center">
                    <Telescope className="w-5 h-5 text-white" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-full blur-lg opacity-50 animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                    News Extractor
                  </h1>
                  <p className="text-xs text-gray-400">AI-Powered Content Scanner</p>
                </div>
              </div>
              <Badge variant="outline" className="border-purple-400/30 text-purple-400 bg-purple-400/10">
                <Orbit className="w-3 h-3 mr-1 animate-spin" />
                ACTIVE
              </Badge>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-6 py-8">
          {/* Scanner Interface */}
          <Card className="mb-8 bg-black/60 border-purple-500/30 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent"></div>
            <CardHeader className="relative z-10">
              <CardTitle className="flex items-center text-2xl bg-gradient-to-r from-purple-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                <Scan className="w-6 h-6 mr-3 text-purple-400" />
                Website Content Extractor
              </CardTitle>
              <CardDescription className="text-gray-300">
                Enter any website URL to extract news articles, blog posts, and content automatically
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 relative z-10">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    type="url"
                    placeholder="https://example.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="bg-black/80 border-purple-400/30 text-white placeholder:text-gray-500 focus:border-purple-400 focus:ring-purple-400/20"
                    onKeyPress={(e) => e.key === "Enter" && handleScan()}
                  />
                </div>
                <Button
                  onClick={handleScan}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-purple-600 to-emerald-600 hover:from-purple-500 hover:to-emerald-500 text-white border-0 px-8"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Extracting...
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4 mr-2" />
                      Extract News
                    </>
                  )}
                </Button>
              </div>

              {/* Status Messages */}
              {error && (
                <div className="flex items-center p-4 bg-red-500/10 border border-red-500/30 rounded-lg backdrop-blur-sm">
                  <AlertCircle className="w-5 h-5 text-red-400 mr-3" />
                  <span className="text-red-300">{error}</span>
                </div>
              )}

              {success && (
                <div className="flex items-center p-4 bg-green-500/10 border border-green-500/30 rounded-lg backdrop-blur-sm">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                  <span className="text-green-300">{success}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Results */}
          {newsItems.length > 0 && (
            <div className="space-y-6">
              {/* Controls */}
              <Card className="bg-black/60 border-cyan-500/30 backdrop-blur-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent"></div>
                <CardHeader className="relative z-10">
                  <CardTitle className="flex items-center text-xl bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                    <Layout className="w-5 h-5 mr-3 text-cyan-400" />
                    Feed Controls
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 relative z-10">
                  <div className="flex flex-wrap gap-4 items-center">
                    <Button
                      onClick={selectAll}
                      variant="outline"
                      size="sm"
                      className="border-purple-400/30 text-purple-400 hover:bg-purple-400/10 bg-transparent"
                    >
                      Select All Articles
                    </Button>
                    <Button
                      onClick={deselectAll}
                      variant="outline"
                      size="sm"
                      className="border-gray-400/30 text-gray-400 hover:bg-gray-400/10 bg-transparent"
                    >
                      Clear Selection
                    </Button>
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <Atom className="w-4 h-4" />
                      <span>{newsItems.filter((item) => item.selected).length} articles selected</span>
                    </div>
                  </div>

                  <Button
                    onClick={generateMagazine}
                    disabled={isGeneratingMagazine || newsItems.filter((item) => item.selected).length === 0}
                    className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white border-0"
                  >
                    {isGeneratingMagazine ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating Magazine...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate Magazine Layout
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* News Items Grid */}
              <div className="grid gap-4">
                {newsItems.map((item, index) => (
                  <Card
                    key={item.id}
                    className={`group relative bg-black/60 border-white/10 backdrop-blur-sm hover:bg-black/80 transition-all duration-300 cursor-pointer overflow-hidden ${
                      item.selected ? "border-emerald-400/40 bg-emerald-500/5" : ""
                    }`}
                    onClick={() => toggleItemSelection(item.id)}
                  >
                    {/* Static Glow Effect for Selected Items */}
                    {item.selected && (
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-purple-500/10 rounded-lg"></div>
                    )}

                    {/* Static Floating Particles */}
                    <div className="absolute inset-0 overflow-hidden">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute w-1 h-1 bg-purple-400 rounded-full animate-pulse opacity-30"
                          style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 2}s`,
                          }}
                        />
                      ))}
                    </div>

                    <CardContent className="relative z-10 p-6">
                      <div className="flex items-start space-x-4">
                        <Checkbox
                          checked={item.selected}
                          onChange={() => toggleItemSelection(item.id)}
                          className="mt-1 border-emerald-400/30 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                        />

                        <div className="flex-1 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Badge
                                className={`bg-gradient-to-r ${getCategoryColor(item.category)} text-white border-0 shadow-lg`}
                              >
                                {item.category}
                              </Badge>
                              <div className="flex items-center space-x-1">
                                {getImportanceIcon(item.importance)}
                                <span className="text-xs text-gray-400 capitalize">{item.importance}</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Star className="w-3 h-3 text-yellow-400" />
                              <span className="text-xs text-gray-500">#{item.rank}</span>
                            </div>
                          </div>

                          <h3 className="text-lg font-semibold text-white group-hover:text-emerald-200 transition-colors">
                            {item.title}
                          </h3>

                          {item.description && (
                            <p className="text-gray-400 text-sm leading-relaxed">{item.description}</p>
                          )}

                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center space-x-4">
                              <span className="flex items-center">
                                <Globe className="w-3 h-3 mr-1" />
                                {item.source}
                              </span>
                              <span>{item.timestamp}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                window.open(item.link, "_blank")
                              }}
                              className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10 p-1 h-auto"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </Button>
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

      <style jsx>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-spin-slow {
          animation: spin-slow 30s linear infinite;
        }
      `}</style>
    </div>
  )
}
