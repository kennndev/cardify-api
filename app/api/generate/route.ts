import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import { buildCardPrompt, validateCardParams, CardParams } from "@/lib/prompt-builder"

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
}

// Rate limit config
const MAX_FREE_GENERATIONS = 3
const WINDOW_MS = 24 * 60 * 60 * 1000 // 24h

// In-memory store (works for dev, use Redis/Supabase in prod)
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
        { error: "Rate limit exceeded. Free generations used up.", code: "RATE_LIMIT_EXCEEDED", remaining: 0 },
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
    const imageUrl = imageData.url || (imageData.b64_json ? `data:image/png;base64,${imageData.b64_json}` : null)

    if (!imageUrl) {
      throw new Error("No image URL or base64 in response")
    }

    return NextResponse.json({
      success: true,
      imageUrl,
      remaining,
      revisedPrompt: imageData.revised_prompt || null,
    })

  } catch (err: any) {
    // OpenAI specific errors
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
      { error: "Card generation failed", code: "INTERNAL_ERROR" },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ error: "Use POST" }, { status: 405 })
}
