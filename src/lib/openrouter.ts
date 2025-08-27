// openrouter.ts
"use server"; // Server-side only, avoids exposing API key to browser

/**
 * Summarize a given article URL using OpenRouter AI.
 * 
 * Requires:
 *   - OPENROUTER_API_KEY in your .env.local
 *   - Model available on OpenRouter (e.g., "deepseek-chat" or "gpt-3.5-turbo")
 */

export async function summarizeArticle(url: string): Promise<string> {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.warn("⚠️ Missing OPENROUTER_API_KEY, using mock summary instead.");
      return mockSummary(url);
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(
        {
        model: "deepseek/deepseek-chat", // You can switch to another model
        messages: [
          {
            role: "system",
            content:
              "You are an assistant that summarizes articles concisely in 2-3 sentences.",
          },
          {
            role: "user",
            content: `Summarize the main points of this article: ${url}`,
          },
        ],
      }
    ),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter request failed: ${response.status}`);
    }

    const data = await response.json();
    const summary =
      data.choices?.[0]?.message?.content?.trim() || "Summary unavailable";

    return summary;
  } catch (err) {
    console.error(`❌ OpenRouter summarization failed for ${url}:`, err);
    return "Summary unavailable";
  }
}

// -----------------------------
// Mock Summary (for dev/testing)
// -----------------------------
function mockSummary(url: string): string {
  return `Mock summary for article at ${url}. Replace with real API once key is set.`;
}
