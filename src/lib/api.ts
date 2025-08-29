import { NewsResponse, Article } from "@/types/";

export async function fetchArticles(): Promise<Article[]> {
  try {
    // Step 1: Fetch from NewsAPI
    const res = await fetch(
      `https://newsapi.org/v2/top-headlines?sources=nbc-news&apiKey=${process.env.NEXT_PUBLIC_NEWS_API_KEY}`
    );

    if (!res.ok) {
      throw new Error("Failed to fetch articles from NewsAPI");
    }

    const data: NewsResponse = await res.json();

    // Step 2: Summarize each article via OpenRouter
    const summarizedArticles: Article[] = await Promise.all(
      data.articles.map(async (article) => {
        const systemPrompt = `You are an assistant that always responds in exactly 3 concise bullet points. Do not add introductions — only bullet points.`;
        const userPrompt = `Summarize this article in 3 bullet points:\n\n${article.url}`;

        try {
          const summaryRes = await fetch(
            "https://openrouter.ai/api/v1/chat/completions",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY}`,
              },
              body: JSON.stringify({
                model: "google/gemma-3-12b-it:free",
                messages: [
                  { role: "system", content: systemPrompt },
                  { role: "user", content: userPrompt },
                ],
              }),
            }
          );

          if (!summaryRes.ok) throw new Error("Failed to summarize article");

          const summaryData = await summaryRes.json();
          const summaryText =
            summaryData?.choices?.[0]?.message?.content ?? null;

          return {
            ...article,
            AISummarizeContent: summaryText,
          };
        } catch (err) {
          console.error(`Summarization failed for ${article.url}`, err);
          return {
            ...article,
            AISummarizeContent: null,
          };
        }
      })
    );

    return summarizedArticles;
  } catch (error) {
    console.error("Error fetching articles:", error);

    // Step 3: Fallback to local JSON
    try {
      const fallbackRes = await fetch("/data/fallback-news.json");
      if (!fallbackRes.ok) {
        throw new Error("Failed to fetch fallback articles");
      }
      const fallbackData: NewsResponse = await fallbackRes.json();
      return fallbackData.articles;
    } catch (fallbackError) {
      console.error("Fallback fetch also failed:", fallbackError);
      return [];
    }
  }
}
