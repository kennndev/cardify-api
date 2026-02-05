export default function Home() {
  return (
    <div style={{ padding: "40px", fontFamily: "monospace", color: "#fff", background: "#111", minHeight: "100vh" }}>
      <h1 style={{ color: "#00ffff" }}>🃏 Cardify API</h1>
      <p style={{ color: "#aaa", marginTop: "12px" }}>Card generation service. Use the API endpoint below.</p>

      <div style={{ marginTop: "32px", background: "#1a1a1a", borderRadius: "12px", padding: "24px", border: "1px solid #333" }}>
        <h2 style={{ color: "#00ffff", marginBottom: "16px" }}>POST /api/generate</h2>

        <h3 style={{ color: "#aaa", marginBottom: "8px" }}>Body:</h3>
        <pre style={{ background: "#222", padding: "16px", borderRadius: "8px", color: "#0f0", overflow: "auto" }}>
{`{
  "mainCharacter": "a frost-covered samurai with glowing blue eyes",
  "background": "a frozen battlefield under a pale moon",
  "frameStyle": "magic",          // "none" | "pokemon" | "magic" | "cyberpunk"
  "titleText": "Frost Blade",
  "additionalText": "Creature - Warrior"
}`}
        </pre>

        <h3 style={{ color: "#aaa", marginTop: "20px", marginBottom: "8px" }}>Response:</h3>
        <pre style={{ background: "#222", padding: "16px", borderRadius: "8px", color: "#0f0", overflow: "auto" }}>
{`{
  "success": true,
  "imageUrl": "https://...",
  "remaining": 2,
  "revisedPrompt": "..."
}`}
        </pre>

        <h3 style={{ color: "#aaa", marginTop: "20px", marginBottom: "8px" }}>Rate Limits:</h3>
        <p style={{ color: "#888" }}>3 free generations per IP per 24 hours.</p>
      </div>
    </div>
  )
}
