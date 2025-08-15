"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Brain, Sparkles, Globe, Scan, ArrowRight, Telescope, Orbit, Atom, Rss, Layout } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null)

  const features = [
    {
      icon: <Scan className="w-8 h-8" />,
      title: "Website Content Extraction",
      description: "Automatically extract news articles, headlines, and content from any website or blog",
      color: "from-purple-500 to-purple-600",
      glowColor: "rgba(147, 51, 234, 0.3)",
    },
    {
      icon: <Brain className="w-8 h-8" />,
      title: "AI-Powered Categorization",
      description: "Intelligent sorting into categories like Technology, Business, Politics, Sports, and more",
      color: "from-cyan-500 to-cyan-600",
      glowColor: "rgba(6, 182, 212, 0.3)",
    },
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "Magazine-Style Layouts",
      description: "Transform plain RSS feeds into beautiful, visual magazine-style presentations",
      color: "from-emerald-500 to-emerald-600",
      glowColor: "rgba(16, 185, 129, 0.3)",
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Multi-Page Crawling",
      description: "Scan multiple pages and sections of websites for comprehensive news coverage",
      color: "from-amber-500 to-amber-600",
      glowColor: "rgba(245, 158, 11, 0.3)",
    },
    {
      icon: <Rss className="w-8 h-8" />,
      title: "RSS Feed Generation",
      description: "Convert any website into a proper RSS feed format for easy subscription",
      color: "from-orange-500 to-orange-600",
      glowColor: "rgba(249, 115, 22, 0.3)",
    },
    {
      icon: <Layout className="w-8 h-8" />,
      title: "Custom Feed Curation",
      description: "Select specific articles and create personalized news collections",
      color: "from-violet-500 to-violet-600",
      glowColor: "rgba(139, 92, 246, 0.3)",
    },
  ]

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Static Cosmic Background */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Deep Space Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-slate-900 to-purple-950"></div>

        {/* Rotating Matrix Planet */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 opacity-20">
          <div className="relative w-full h-full">
            {/* Planet Core */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500/30 via-cyan-500/20 to-emerald-500/30 animate-spin-slow">
              {/* Matrix Grid Lines */}
              <div className="absolute inset-0 rounded-full">
                {/* Horizontal Lines */}
                {[...Array(12)].map((_, i) => (
                  <div
                    key={`h-${i}`}
                    className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent"
                    style={{ top: `${(i + 1) * 8.33}%` }}
                  />
                ))}
                {/* Vertical Lines */}
                {[...Array(12)].map((_, i) => (
                  <div
                    key={`v-${i}`}
                    className="absolute top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-purple-400/40 to-transparent"
                    style={{ left: `${(i + 1) * 8.33}%` }}
                  />
                ))}
              </div>

              {/* Digital Nodes */}
              {[...Array(20)].map((_, i) => (
                <div
                  key={`node-${i}`}
                  className="absolute w-2 h-2 bg-cyan-400 rounded-full animate-pulse"
                  style={{
                    left: `${Math.random() * 90 + 5}%`,
                    top: `${Math.random() * 90 + 5}%`,
                    animationDelay: `${Math.random() * 3}s`,
                  }}
                />
              ))}

              {/* Scanning Lines */}
              <div className="absolute inset-0 rounded-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent w-full h-px animate-scan-vertical" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-400/60 to-transparent h-full w-px animate-scan-horizontal" />
              </div>
            </div>

            {/* Planet Atmosphere */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-500/10 via-transparent to-purple-500/10 blur-sm animate-pulse" />
          </div>
        </div>

        {/* Static Nebula */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-20 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-15"></div>
        </div>

        {/* Static Star Field */}
        <div className="absolute inset-0">
          {[...Array(200)].map((_, i) => (
            <div
              key={i}
              className="absolute bg-white rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 3 + 1}px`,
                height: `${Math.random() * 3 + 1}px`,
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
          <div className="container mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-full flex items-center justify-center">
                    <Atom className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-full blur-lg opacity-50 animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                    RSS Feed Generator
                  </h1>
                  <p className="text-sm text-gray-400">AI-Powered News Extraction</p>
                </div>
              </div>
              <Badge variant="outline" className="border-purple-400/30 text-purple-400 bg-purple-400/10">
                <Orbit className="w-3 h-3 mr-1 animate-spin" />
                ONLINE
              </Badge>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="container mx-auto px-6 py-20">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            <div className="space-y-4">
              <h2 className="text-6xl md:text-8xl font-black bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent leading-tight">
                SMART
                <br />
                <span className="bg-gradient-to-r from-purple-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  RSS
                </span>
              </h2>
              <p className="text-xl md:text-2xl text-gray-300 leading-relaxed">
                Transform any website into intelligent RSS feeds with AI-powered
                <br />
                content extraction and beautiful magazine layouts
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link href="/news">
                <Button className="bg-gradient-to-r from-purple-600 to-emerald-600 hover:from-purple-500 hover:to-emerald-500 text-white border-0 px-8 py-4 text-lg rounded-full shadow-2xl shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300">
                  <Telescope className="w-5 h-5 mr-2" />
                  Start Extracting News
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/test-grok">
                <Button
                  variant="outline"
                  className="border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/10 bg-transparent px-8 py-4 text-lg rounded-full"
                >
                  <Brain className="w-5 h-5 mr-2" />
                  Test AI Engine
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="container mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-4">
              Powerful Features
            </h3>
            <p className="text-gray-400 text-lg">Everything you need to extract, organize, and present news content</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="group relative bg-black/60 border-white/10 backdrop-blur-sm hover:border-purple-400/40 transition-all duration-300 cursor-pointer overflow-hidden"
                onMouseEnter={() => setHoveredFeature(index)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                {/* Static Glow Effect */}
                <div
                  className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl`}
                  style={{ background: feature.glowColor }}
                ></div>

                {/* Gradient Border */}
                <div
                  className={`absolute inset-0 rounded-lg bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-20 transition-opacity duration-500`}
                ></div>

                <CardHeader className="relative z-10">
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${feature.color} mb-4 w-fit`}>
                    {feature.icon}
                  </div>
                  <CardTitle className="text-white group-hover:text-cyan-100 transition-colors">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <CardDescription className="text-gray-400 group-hover:text-gray-300 transition-colors">
                    {feature.description}
                  </CardDescription>
                </CardContent>

                {/* Static Scanning Line Effect */}
                {hoveredFeature === index && (
                  <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse"></div>
                )}
              </Card>
            ))}
          </div>
        </section>

        {/* Examples Section */}
        <section className="container mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">
              What You Can Do
            </h3>
            <p className="text-gray-400 text-lg">Real examples of how our RSS generator works</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="bg-black/60 border-cyan-500/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-cyan-400 flex items-center">
                  <Globe className="w-5 h-5 mr-2" />
                  News Websites
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-gray-300">
                  <p className="font-semibold mb-2">Extract from sites like:</p>
                  <ul className="space-y-1 text-sm text-gray-400">
                    <li>• TechCrunch → Technology news feed</li>
                    <li>• BBC News → World news with categories</li>
                    <li>• ESPN → Sports news and scores</li>
                    <li>• Business blogs → Industry updates</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/60 border-emerald-500/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-emerald-400 flex items-center">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Magazine Layouts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-gray-300">
                  <p className="font-semibold mb-2">Transform feeds into:</p>
                  <ul className="space-y-1 text-sm text-gray-400">
                    <li>• Visual magazine-style cards</li>
                    <li>• Category-based color coding</li>
                    <li>• Importance ranking system</li>
                    <li>• Mobile-responsive layouts</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-6 py-20">
          <Card className="bg-gradient-to-br from-purple-900/40 to-cyan-900/40 border-purple-500/30 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-cyan-500/10 rounded-lg"></div>
            <CardContent className="relative z-10 text-center py-16 px-8">
              <h3 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-6">
                Ready to Create Smart RSS Feeds?
              </h3>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Start extracting news from any website and transform it into beautiful, organized feeds
              </p>
              <Link href="/news">
                <Button className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white border-0 px-12 py-4 text-xl rounded-full shadow-2xl shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300">
                  <Telescope className="w-6 h-6 mr-3" />
                  Start Extracting
                  <Sparkles className="w-6 h-6 ml-3" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </section>

        {/* Footer */}
        <footer className="border-t border-purple-500/20 backdrop-blur-sm bg-black/40">
          <div className="container mx-auto px-6 py-8">
            <div className="text-center text-gray-400">
              <p className="mb-2">RSS Feed Generator • Powered by Advanced AI</p>
              <p className="text-sm">Transform any website into intelligent news feeds</p>
            </div>
          </div>
        </footer>
      </div>

      <style jsx>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes scan-vertical {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(400px); }
        }
        
        @keyframes scan-horizontal {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400px); }
        }
        
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        
        .animate-scan-vertical {
          animation: scan-vertical 3s ease-in-out infinite;
        }
        
        .animate-scan-horizontal {
          animation: scan-horizontal 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
