# Cardify Card Generation API — Agent Guide

## Endpoint
```
POST https://cardify-api.vercel.app/api/generate
Content-Type: application/json
```

## What It Does
Generates a professional AI trading card image (1024x1536 PNG, card ratio 2.5:3.5). Describe the card, pick a style — it builds and returns the image.

## Body Params

| Field | Required | Description |
|---|---|---|
| `mainCharacter` | ✅ Yes | Who/what is on the card. Be descriptive — appearance, details, pose |
| `background` | No | The scene/setting behind the character |
| `frameStyle` | No | Card frame type — see styles below |
| `titleText` | No | Name on the card (top of frame) |
| `additionalText` | No | Subtitle, type, stats, flavor text etc |

## Frame Styles

### `pokemon` — TCG Style
Classic Pokémon-style layout. Red header with card name + HP, attack boxes, weakness/resistance symbols at bottom. Character breaks through the frame in 3D.
> Best for: creatures, monsters, characters with stats

### `magic` — Magic Fantasy
Magic: The Gathering inspired. Curved transparent banner at top for name, mana symbols, rules text box in lower third, power/toughness box bottom-right. 3D breakout effect.
> Best for: spells, creatures, fantasy characters

### `cyberpunk` — Cyberpunk Style
High-tech digital interface with circuit borders, HUD elements, and neon accents. Title in bold all-caps, subtitle below. Futuristic vibe.
> Best for: sci-fi, tech, robots, cyber characters

### `none` — No Frame
Pure full artwork, no borders or frame elements. Text overlaid directly on the art with glow/shadow effects for readability.
> Best for: artistic portraits, showcase pieces

## Response
Default: returns a **PNG image file** directly (`Content-Type: image/png`). Save it as `.png` and you're done.

If you need JSON instead, add `Accept: application/json` header — returns `{ success, imageUrl, remaining }`.

## Example Requests

### A Pokémon-style creature card
```json
{
  "mainCharacter": "a massive serpentine dragon made of liquid fire, coiled and ready to strike",
  "background": "a volcanic island surrounded by a stormy ocean at sunset",
  "frameStyle": "pokemon",
  "titleText": "Inferno Wyrm",
  "additionalText": "Fire Breath - 180 damage"
}
```

### A Magic: The Gathering spell card
```json
{
  "mainCharacter": "an ancient wizard casting a massive portal of light, robes flowing with arcane energy",
  "background": "a dark mystical forest with glowing runes floating in the air",
  "frameStyle": "magic",
  "titleText": "Dimensional Rift",
  "additionalText": "Instant - Draw 3 cards. Opponents discard 1."
}
```

### A cyberpunk warrior
```json
{
  "mainCharacter": "a chrome-plated street samurai with holographic tattoos and a glowing katana",
  "background": "rain-soaked neon-lit alleyway with flickering ads and smoke",
  "frameStyle": "cyberpunk",
  "titleText": "GHOST BLADE",
  "additionalText": "Tier 5 — Street Legend"
}
```

### Pure art, no frame
```json
{
  "mainCharacter": "a majestic phoenix mid-rebirth, feathers dissolving into golden embers",
  "background": "an endless void with swirling galaxies and stars",
  "frameStyle": "none",
  "titleText": "Eternal Phoenix"
}
```

## Tips for Better Cards
- **Be specific** about the character — colors, details, pose matter
- **Match the vibe** — dark background for horror, vibrant for fantasy
- **Use additionalText** for flavor — stats, type lines, descriptions make cards feel real
- **3D breakout** happens automatically on pokemon/magic/cyberpunk — characters pop out of the frame

## Limits
- ~50 seconds per card (AI generation time)
- Rate limited to 10 cards per IP per 24 hours
