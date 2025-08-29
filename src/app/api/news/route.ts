import { NextResponse } from "next/server";
import { Article } from "@/types";

let cache: Article[] = [];
let cacheTime = 0; // timestamp in ms

export async function GET() {
  const CACHE_DURATION = 2 * 60 * 60 * 1000; // 2 hours

  // Return cache if not expired
  if (cache.length && Date.now() - cacheTime < CACHE_DURATION) {
    console.log("Returning cached articles");
    return NextResponse.json(cache);
  }

  try {
    // --- Step 1: Fetch NewsAPI ---
    console.log("Fetching NewsAPI...");
    const newsRes = await fetch(
      `https://newsapi.org/v2/top-headlines?sources=nbc-news&apiKey=${process.env.NEWS_API_KEY}`
    );

    if (!newsRes.ok) {
      console.error(
        "NewsAPI fetch failed:",
        newsRes.status,
        newsRes.statusText
      );
      return NextResponse.json(
        { error: `NewsAPI fetch failed: ${newsRes.status}` },
        { status: newsRes.status }
      );
    }

    const newsDataRaw = await newsRes.json();
    console.log("NewsAPI fetched", newsDataRaw.articles?.length, "articles");

    // --- Step 2: Summarize articles ---
    const summarizedArticles: Article[] = await Promise.all(
      newsDataRaw.articles.map(async (article: Article, idx: number) => {
        try {
          const summaryRes = await fetch(
            "https://openrouter.ai/api/v1/chat/completions",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
              },
              body: JSON.stringify({
                model: "google/gemma-3-12b-it:free",
                messages: [
                  {
                    role: "system",
                    content:
                      "You are an assistant that always responds in exactly 3 concise bullet points. Do not add introductions — only bullet points.",
                  },
                  {
                    role: "user",
                    content: `Summarize this article in 3 bullet points:\n\n${article.url}`,
                  },
                ],
                max_tokens: 200,
                temperature: 0.3,
              }),
            }
          );

          if (!summaryRes.ok) {
            console.error(
              "OpenRouter fetch failed:",
              summaryRes.status,
              summaryRes.statusText
            );
            return { ...article, AISummarizeContent: article.description };
          }

          const summaryData = await summaryRes.json();
          const summaryText =
            summaryData?.choices?.[0]?.message?.content?.trim() ??
            article.description;
          return { ...article, AISummarizeContent: summaryText };
        } catch (err) {
          console.error("Summarization failed for", article.url, err);
          return { ...article, AISummarizeContent: article.description };
        }
      })
    );

    // --- Step 3: Update cache ---
    cache = summarizedArticles;
    cacheTime = Date.now();
    console.log("Cache updated with", summarizedArticles.length, "articles");

    return NextResponse.json(summarizedArticles);
  } catch (err) {
    console.error("GET /api/news error:", err);

    // fallback to cached if exists
    if (cache.length) {
      console.log("Returning cached articles due to error");
      return NextResponse.json(cache);
    }

    return NextResponse.json({ error: "Failed to fetch articles" }, { status: 500 });
  }
}
