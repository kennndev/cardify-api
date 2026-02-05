import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import { buildCardPrompt, validateCardParams, CardParams } from "@/lib/prompt-builder"

// Extend Vercel function timeout to 120s (gpt-image-1 takes ~50s)
export const config = {
  api: {
    responseLimit: false,
  },
  maxDuration: 120,
}

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
}

// Rate limit config
const MAX_FREE_GENERATIONS = 10
const WINDOW_MS = 24 * 60 * 60 * 1000 // 24h

// In-memory store
const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

function getClientId(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for")
  return forwarded ? forwarded.split(",")[0].trim() : "unknown"
}

function checkRateLimit(clientId: string): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const data = rateLimitStore.get(clientId)

  if (!data || now > data.resetAt) {
    rateLimitStore.set(clientId, { count: 1, resetAt: now + WINDOW_MS })
    return { allowed: true, remaining: MAX_FREE_GENERATIONS - 1 }
  }

  if (data.count >= MAX_FREE_GENERATIONS) {
    return { allowed: false, remaining: 0 }
  }

  data.count++
  return { allowed: true, remaining: MAX_FREE_GENERATIONS - data.count }
}

export async function POST(req: NextRequest) {
  try {
    // Check OpenAI key
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "Service not configured", code: "SERVICE_UNAVAILABLE" },
        { status: 503 }
      )
    }

    // Parse + validate
    const body: CardParams = await req.json()
    const validation = validateCardParams(body)

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error, code: "VALIDATION_ERROR" },
        { status: 400 }
      )
    }

    // Rate limit check
    const clientId = getClientId(req)
    const { allowed, remaining } = checkRateLimit(clientId)

    if (!allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again later.", code: "RATE_LIMIT_EXCEEDED", remaining: 0 },
        { status: 429 }
      )
    }

    // Build prompt SERVER-SIDE
    const prompt = buildCardPrompt(body)

    // Call OpenAI
    const openai = getOpenAI()
    const response = await openai.images.generate({
      model: "gpt-image-1",
      prompt,
      size: "1024x1536",
      quality: "medium",
    })

    if (!response.data || response.data.length === 0) {
      throw new Error("No image returned from OpenAI")
    }

    const imageData = response.data[0]

    // Check what the client wants: JSON (with data URL) or raw image
    const acceptHeader = req.headers.get("accept") || ""

    if (imageData.b64_json) {
      // If client wants raw image (default for curl/agents) → return PNG binary
      if (!acceptHeader.includes("application/json")) {
        const imageBuffer = Buffer.from(imageData.b64_json, "base64")
        return new NextResponse(imageBuffer, {
          status: 200,
          headers: {
            "Content-Type": "image/png",
            "Content-Disposition": "attachment; filename=card.png",
            "X-Remaining": String(remaining),
            "Access-Control-Expose-Headers": "X-Remaining",
          },
        })
      }

      // If client explicitly wants JSON → return data URL
      return NextResponse.json({
        success: true,
        imageUrl: `data:image/png;base64,${imageData.b64_json}`,
        remaining,
      })
    }

    // If OpenAI returned a URL directly
    if (imageData.url) {
      return NextResponse.json({
        success: true,
        imageUrl: imageData.url,
        remaining,
      })
    }

    throw new Error("No image data in response")

  } catch (err: any) {
    if (err?.error?.code === "content_policy_violation") {
      return NextResponse.json(
        { error: "Prompt flagged by content policy. Try a different description.", code: "CONTENT_POLICY" },
        { status: 400 }
      )
    }
    if (err?.error?.code === "rate_limit_exceeded") {
      return NextResponse.json(
        { error: "OpenAI rate limit hit. Try again shortly.", code: "API_RATE_LIMIT" },
        { status: 429 }
      )
    }
    if (err?.error?.code === "billing_hard_limit_reached") {
      return NextResponse.json(
        { error: "Service temporarily unavailable.", code: "SERVICE_UNAVAILABLE" },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { error: "Card generation failed", code: "INTERNAL_ERROR", details: err?.message || err?.error?.message || "Unknown" },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ error: "Use POST" }, { status: 405 })
}
