export type SummaryResult = { summary: string };

export async function summarizeContentWithAI(content: string): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY missing");

  const systemPrompt = `You are an assistant that always responds in exactly 3 concise bullet points. Do not add introductions like 'Here is your summary' or 'Summary:' — only output the bullet points directly.`;
  const userPrompt = `Summarize this article in 3 bullet points: \n\n${content}`;

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://news-bite.example",
      "X-Title": "News Bite"
    },
    body: JSON.stringify(
      {
        "model": "google/gemma-3-12b-it:free",
        messages: [
          {
            "role": "system",
            "content": systemPrompt
          },
          {
            "role": "user",
            "content": userPrompt
          }
      ],
      temperature: 0.3,
      max_tokens: 400
    })
  });

  if (!res.ok) throw new Error(`OpenRouter failed ${res.status}`);
  const json = await res.json();
  const text: string = json.choices?.[0]?.message?.content ?? "";
  if (!text) throw new Error("No summary content");
  return text.trim();
}