import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Rss, Globe, Zap, Download, Brain, Code } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Rss className="h-8 w-8 text-teal-500" />
            <span className="text-xl font-bold text-gray-900">RSS Converter</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">
              Features
            </Link>
            <Link href="#how-it-works" className="text-gray-600 hover:text-gray-900 transition-colors">
              How it Works
            </Link>
            <Link href="/convert">
              <Button className="bg-teal-500 hover:bg-teal-600 text-white">Try Now</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Turn Any Website into an <span className="text-teal-500">RSS Feed</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Convert any website into a clean, structured RSS feed with AI-powered content detection. Perfect for
              staying updated with your favorite sites.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/convert">
                <Button size="lg" className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-4 text-lg group">
                  Try it Now
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                className="px-8 py-4 text-lg border-gray-300 hover:border-teal-500 bg-transparent"
              >
                View Demo
              </Button>
            </div>

            {/* Hero Image */}
            <div className="relative max-w-3xl mx-auto">
              <div className="relative bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 rounded-2xl p-8 shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-blue-600/10 rounded-2xl"></div>
                <div className="relative flex items-center justify-center h-64">
                  <div className="text-center space-y-4">
                    <div className="relative">
                      <img
                        src="/placeholder.svg?height=120&width=120"
                        alt="RSS Converter AI Logo"
                        className="w-24 h-24 mx-auto drop-shadow-2xl"
                      />
                      <div className="absolute -inset-4 bg-gradient-to-r from-teal-400/20 to-blue-500/20 rounded-full blur-xl"></div>
                    </div>
                    <div className="flex items-center justify-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-gray-300 to-gray-500 rounded-lg flex items-center justify-center shadow-lg">
                        <Globe className="h-8 w-8 text-gray-700" />
                      </div>
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></div>
                        <div
                          className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"
                          style={{ animationDelay: "0.4s" }}
                        ></div>
                      </div>
                      <div className="w-16 h-16 bg-gradient-to-br from-orange-300 to-orange-500 rounded-lg flex items-center justify-center shadow-lg">
                        <Rss className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 font-medium">AI-Powered Website to RSS Conversion</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Convert any website to RSS in three simple steps</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="text-center p-8 border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Globe className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">1. Paste Website URL</h3>
                <p className="text-gray-600">
                  Simply enter the URL of any website you want to convert into an RSS feed
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-8 border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Brain className="h-8 w-8 text-teal-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">2. Configure or Use AI</h3>
                <p className="text-gray-600">
                  Let our AI detect content automatically or manually specify CSS selectors
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-8 border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Download className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">3. Preview & Export</h3>
                <p className="text-gray-600">
                  Preview your feed and export as XML or copy the feed URL for your reader
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Powerful Features</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to create perfect RSS feeds from any website
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Zap className="h-6 w-6 text-teal-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">AI-Powered Detection</h3>
                <p className="text-gray-600">
                  Automatically detect content patterns and generate optimal CSS selectors
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Code className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Full Developer Control</h3>
                <p className="text-gray-600">Manual CSS selector configuration for precise content extraction</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Globe className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Works on Most Sites</h3>
                <p className="text-gray-600">Compatible with static and dynamic pages, blogs, news sites, and more</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Rss className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Standard RSS Format</h3>
                <p className="text-gray-600">Generate valid RSS 2.0 XML that works with all feed readers</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Download className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Multiple Export Options</h3>
                <p className="text-gray-600">Download XML files or get shareable feed URLs for your favorite reader</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <ArrowRight className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-time Preview</h3>
                <p className="text-gray-600">See exactly how your feed will look before exporting</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-teal-500 to-blue-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Convert Your First Website?</h2>
          <p className="text-xl text-teal-100 mb-8 max-w-2xl mx-auto">
            Start creating RSS feeds from any website in seconds. No signup required.
          </p>
          <Link href="/convert">
            <Button size="lg" className="bg-white text-teal-600 hover:bg-gray-100 px-8 py-4 text-lg">
              Get Started Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Rss className="h-6 w-6 text-teal-400" />
              <span className="text-lg font-semibold">RSS Converter</span>
            </div>
            <div className="text-gray-400 text-sm">© 2024 RSS Converter. Turn any website into an RSS feed.</div>
          </div>
        </div>
      </footer>
    </div>
  )
}
