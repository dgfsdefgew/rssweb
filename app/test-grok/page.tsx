"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Brain, Zap, Loader2, CheckCircle, AlertCircle, Cpu, Activity, Terminal, Orbit, Star, Atom } from "lucide-react"

export default function TestGrokPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState("")

  const testGrok = async () => {
    setIsLoading(true)
    setError("")
    setResult(null)

    try {
      const response = await fetch("/api/test-grok", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      const data = await response.json()

      if (data.success) {
        setResult(data)
      } else {
        setError(data.error || "AI engine test failed")
      }
    } catch (error) {
      setError("Network error during AI engine test")
      console.error("Test error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Static Cosmic Background */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Deep Space Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-slate-900 to-purple-950"></div>

        {/* Static Nebula */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-15"></div>
        </div>

        {/* Static Star Field */}
        <div className="absolute inset-0">
          {[...Array(100)].map((_, i) => (
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
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-full blur-lg opacity-50 animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                    AI Engine Test
                  </h1>
                  <p className="text-xs text-gray-400">Grok AI System Diagnostics</p>
                </div>
              </div>
              <Badge variant="outline" className="border-purple-400/30 text-purple-400 bg-purple-400/10">
                <Activity className="w-3 h-3 mr-1 animate-pulse" />
                DIAGNOSTIC
              </Badge>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-6 py-8">
          {/* Test Interface */}
          <Card className="mb-8 bg-black/60 border-purple-500/30 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent"></div>

            {/* Static Floating Particles */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(10)].map((_, i) => (
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

            <CardHeader className="relative z-10">
              <CardTitle className="flex items-center text-2xl bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                <Cpu className="w-6 h-6 mr-3 text-purple-400" />
                Grok AI Engine Test
              </CardTitle>
              <CardDescription className="text-gray-300">
                Test the connection and functionality of the Grok AI engine used for content extraction and
                categorization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 relative z-10">
              <Button
                onClick={testGrok}
                disabled={isLoading}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white border-0 px-8"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Running AI Diagnostics...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Test AI Engine
                  </>
                )}
              </Button>

              {/* Status Messages */}
              {error && (
                <div className="flex items-center p-4 bg-red-500/10 border border-red-500/30 rounded-lg backdrop-blur-sm">
                  <AlertCircle className="w-5 h-5 text-red-400 mr-3" />
                  <span className="text-red-300">{error}</span>
                </div>
              )}

              {result && (
                <div className="space-y-4">
                  <div className="flex items-center p-4 bg-green-500/10 border border-green-500/30 rounded-lg backdrop-blur-sm">
                    <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                    <span className="text-green-300">AI engine test successful!</span>
                  </div>

                  {/* Test Results */}
                  <Card className="bg-black/80 border-cyan-500/30 backdrop-blur-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent"></div>

                    <CardHeader className="relative z-10">
                      <CardTitle className="flex items-center text-lg bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                        <Terminal className="w-5 h-5 mr-2" />
                        AI Engine Response
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 relative z-10">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold text-purple-400 flex items-center">
                            <Atom className="w-3 h-3 mr-1" />
                            Model
                          </h4>
                          <p className="text-gray-300 font-mono text-sm bg-black/40 p-2 rounded border border-purple-500/20">
                            {result.model || "grok-3"}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold text-purple-400 flex items-center">
                            <Zap className="w-3 h-3 mr-1" />
                            Response Time
                          </h4>
                          <p className="text-gray-300 font-mono text-sm bg-black/40 p-2 rounded border border-purple-500/20">
                            {result.responseTime || "N/A"}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold text-purple-400 flex items-center">
                            <Activity className="w-3 h-3 mr-1" />
                            Status
                          </h4>
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                            <Orbit className="w-3 h-3 mr-1 animate-spin" />
                            OPERATIONAL
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold text-purple-400 flex items-center">
                            <Star className="w-3 h-3 mr-1" />
                            Timestamp
                          </h4>
                          <p className="text-gray-300 font-mono text-sm bg-black/40 p-2 rounded border border-purple-500/20">
                            {result.timestamp}
                          </p>
                        </div>
                      </div>

                      {result.response && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold text-purple-400 flex items-center">
                            <Brain className="w-3 h-3 mr-1" />
                            AI Response
                          </h4>
                          <div className="bg-black/60 border border-cyan-500/30 rounded-lg p-4 backdrop-blur-sm">
                            <p className="text-gray-300 leading-relaxed">{result.response}</p>
                          </div>
                        </div>
                      )}

                      {result.usage && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold text-purple-400 flex items-center">
                            <Terminal className="w-3 h-3 mr-1" />
                            Usage Statistics
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div className="bg-black/60 border border-purple-500/30 rounded-lg p-3 backdrop-blur-sm">
                              <p className="text-gray-400 text-xs">Prompt Tokens</p>
                              <p className="text-cyan-400 font-mono text-lg">{result.usage.promptTokens}</p>
                            </div>
                            <div className="bg-black/60 border border-purple-500/30 rounded-lg p-3 backdrop-blur-sm">
                              <p className="text-gray-400 text-xs">Completion Tokens</p>
                              <p className="text-cyan-400 font-mono text-lg">{result.usage.completionTokens}</p>
                            </div>
                            <div className="bg-black/60 border border-purple-500/30 rounded-lg p-3 backdrop-blur-sm">
                              <p className="text-gray-400 text-xs">Total Tokens</p>
                              <p className="text-cyan-400 font-mono text-lg">{result.usage.totalTokens}</p>
                            </div>
                            <div className="bg-black/60 border border-purple-500/30 rounded-lg p-3 backdrop-blur-sm">
                              <p className="text-gray-400 text-xs">Finish Reason</p>
                              <p className="text-cyan-400 font-mono text-sm">{result.finishReason}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
