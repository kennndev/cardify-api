# 🃏 Cardify API

Standalone card generation API service for Cardify. Generates AI trading cards using GPT Image 1.

## Setup

```bash
npm install
cp .env.example .env
# Add your OPENAI_API_KEY to .env
npm run dev
```

## API

### POST `/api/generate`

Generates an AI trading card.

**Body:**
```json
{
  "mainCharacter": "a frost-covered samurai with glowing blue eyes",
  "background": "a frozen battlefield under a pale moon",
  "frameStyle": "magic",
  "titleText": "Frost Blade",
  "additionalText": "Creature - Warrior"
}
```

**Fields:**
| Field | Required | Max Length | Description |
|-------|----------|------------|-------------|
| mainCharacter | ✅ Yes | 300 | Main character description |
| background | ❌ No | 300 | Background setting |
| frameStyle | ❌ No | - | `none`, `pokemon`, `magic`, `cyberpunk` |
| titleText | ❌ No | 100 | Card title |
| additionalText | ❌ No | 200 | Subtitle / type / description |

**Response:**
```json
{
  "success": true,
  "imageUrl": "https://...",
  "remaining": 2,
  "revisedPrompt": "..."
}
```

**Rate Limits:** 3 free generations per IP per 24 hours.

## Deploy to Vercel

```bash
vercel deploy
```

Set `OPENAI_API_KEY` in Vercel environment variables.

## Built by
kennndev + Nyx ✨
