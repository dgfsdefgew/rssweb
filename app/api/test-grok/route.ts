import { type NextRequest, NextResponse } from "next/server"
import { xai } from "@ai-sdk/xai"
import { generateText } from "ai"

export async function POST(request: NextRequest) {
  try {
    console.log("Testing Grok connection...")

    const response = await generateText({
      model: xai("grok-3"),
      prompt:
        "Hello! Can you confirm that you're working properly? Please respond with a brief confirmation and your current capabilities for web content analysis.",
    })

    return NextResponse.json({
      success: true,
      message: "Grok connection successful!",
      grokResponse: response.text,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Grok test failed:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Grok connection failed",
      timestamp: new Date().toISOString(),
    })
  }
}
