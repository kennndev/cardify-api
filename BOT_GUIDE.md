# Bot Instructions: Card Generation with Credits

Quick guide for AI bots to generate trading cards using the credit system.

---

## 🎯 Quick Flow

1. **Check balance** → 2. **Generate card** (or buy credits if insufficient)

---

## Step 1: Check User Balance

```bash
GET https://credit-endpoint.vercel.app/api/credits/balance?platform=discord&external_user_id={USER_ID}
```

**Response:**
```json
{
  "credits": 4000,
  "account_id": "uuid"
}
```

**If `credits < 200`:** Go to Step 3 (buy credits)  
**If `credits >= 200`:** Go to Step 2 (generate)

---

## Step 2: Generate Card

```bash
POST https://cardify-api.vercel.app/api/generate
Content-Type: application/json

{
  "platform": "discord",
  "external_user_id": "USER_ID_HERE",
  "mainCharacter": "a fierce dragon warrior with golden scales",
  "background": "volcanic eruption",
  "frameStyle": "pokemon",
  "titleText": "Dragon King",
  "additionalText": "Fire Breath - 180 damage"
}
```

**Fields:**
- `platform` - Always `"discord"` (required)
- `external_user_id` - User's Discord ID (required)
- `mainCharacter` - Main subject (required)
- `background` - Scene/setting (optional)
- `frameStyle` - `none`, `pokemon`, `magic`, or `cyberpunk` (optional)
- `titleText` - Card name (optional)
- `additionalText` - Stats/flavor text (optional)

**Success Response (200):**
```json
{
  "success": true,
  "imageUrl": "data:image/png;base64,...",
  "credits": {
    "balance": 3800,
    "deducted": 200
  }
}
```

**Error Response (402 - Insufficient Credits):**
```json
{
  "error": "Insufficient credits",
  "code": "INSUFFICIENT_CREDITS",
  "balance": 50,
  "required": 200
}
```

---

## Step 3: Buy Credits (If Needed)

```bash
POST https://credit-endpoint.vercel.app/api/credits/checkout
Content-Type: application/json

{
  "platform": "discord",
  "external_user_id": "USER_ID_HERE",
  "usd": 10
}
```

**Response:**
```json
{
  "url": "https://checkout.stripe.com/c/pay/...",
  "order_id": "uuid",
  "account_id": "uuid"
}
```

Send user the `url` to complete payment.

---

## 💬 Example Conversation

**User:** "Generate a cyberpunk hacker card"

**Bot:**
1. Check balance: `GET /api/credits/balance`
2. If balance >= 200:
   ```
   ✅ Generating your card... (costs 200 credits, you have 4000)
   ⏳ This takes ~50 seconds...
   ```
3. Call `POST /api/generate` with:
   ```json
   {
     "mainCharacter": "cyberpunk hacker with neon visor",
     "frameStyle": "cyberpunk",
     "titleText": "NetRunner"
   }
   ```
4. Return result:
   ```
   🎴 Here's your card!
   💰 3800 credits remaining
   [image attachment]
   ```

**If insufficient credits:**
```
❌ You need 200 credits but have 50.
💳 Buy credits: [checkout link]
```

---

## 🎨 Frame Style Guide

| Style | Best For |
|-------|----------|
| `none` | Full art, no frame |
| `pokemon` | Cute, colorful, TCG |
| `magic` | Fantasy, medieval, spells |
| `cyberpunk` | Sci-fi, futuristic, tech |

---

## ⚡ Quick Reference

| Action | Cost | Time |
|--------|------|------|
| Generate card | 200 credits | ~50s |
| Buy $10 | 4,000 credits | instant |
| Check balance | Free | instant |

**Pricing:** $10 = 4,000 credits = 20 cards ($0.50/card)

---

## 🚨 Error Handling

### 402 - Insufficient Credits
```json
{
  "error": "Insufficient credits",
  "balance": 50,
  "required": 200
}
```
**Bot Response:** "You need 200 credits but have {balance}. Buy more: [checkout link]"

### 404 - No Account
```json
{
  "error": "Account not found. Please purchase credits first."
}
```
**Bot Response:** "Create an account by purchasing credits: [checkout link]"

### 400 - Bad Request
```json
{
  "error": "mainCharacter is required"
}
```
**Bot Response:** "I need a description of what should be on the card. Try: 'Generate a dragon card'"

### 500 - Generation Failed
```json
{
  "error": "Card generation failed",
  "code": "INTERNAL_ERROR"
}
```
**Bot Response:** "Card generation failed. Try again or contact support."

---

## 📋 Checklist for Bots

- [ ] Always check balance BEFORE generating
- [ ] Tell user the cost upfront (200 credits)
- [ ] Set expectation (takes ~50 seconds)
- [ ] Show remaining credits after generation
- [ ] Offer purchase link if insufficient
- [ ] Handle all error codes gracefully
- [ ] Use `frameStyle` to match card theme
- [ ] Add `titleText` for better cards

---

## 🔗 API Endpoints

**Balance:** `https://credit-endpoint.vercel.app/api/credits/balance`  
**Checkout:** `https://credit-endpoint.vercel.app/api/credits/checkout`  
**Generate:** `https://cardify-api.vercel.app/api/generate`  
**History:** `https://credit-endpoint.vercel.app/api/credits/history`

---

## 💡 Tips for Better Cards

**Good prompts:**
- "a fierce dragon warrior with golden scales and fire breath"
- "mysterious wizard with purple robes casting lightning"
- "cyberpunk hacker with neon visor and data streams"

**Bad prompts:**
- "dragon" (too vague)
- "something cool" (unclear)

**Use details:** colors, clothing, pose, expression, action

---

## ✅ Ready to Use!

Your bot can now:
1. Check credits
2. Generate cards
3. Handle purchases
4. Show results

Questions? See full docs in `AGENT_INSTRUCTIONS.md`
