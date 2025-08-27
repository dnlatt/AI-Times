import fs from "node:fs/promises";
import path from "node:path";
import { summarizeWithDeepseek } from "./openrouter";
import { getCache, setCache } from "./cache";

export type NewsArticle = {
  title: string;
  description?: string;
  url: string;
  urlToImage?: string;
  source?: { name: string };
  category?: string;
  content?: string;
  summary?: string;
  publishedAt?: string;
};

export type NewsResponse = { articles: NewsArticle[] };

const FALLBACK_PATH = path.join(process.cwd(), "public", "data", "fallback-news.json");
const CACHE_KEY = "news-bite:top-headlines";

async function readFallback(): Promise<NewsResponse> {
  const buf = await fs.readFile(FALLBACK_PATH, "utf-8");
  return JSON.parse(buf) as NewsResponse;
}

async function fetchNewsApi(): Promise<NewsResponse> {
  const apiKey = process.env.NEWS_API_KEY!;
  const country = process.env.NEWS_COUNTRY ?? "us";
  const category = process.env.NEWS_CATEGORY ?? "world";

  const url = new URL("https://newsapi.org/v2/top-headlines");
  url.searchParams.set("country", country);
  url.searchParams.set("category", category);
  url.searchParams.set("pageSize", "12");

  const res = await fetch(url, { headers: { "X-Api-Key": apiKey } });
  if (!res.ok) throw new Error(`News API failed ${res.status}`);
  const json = await res.json();
  return { articles: json.articles ?? [] };
}

/** Server-side: fetch news + generate summaries; if both fail, load fallback JSON */
export async function getNewsServer(): Promise<NewsResponse> {
  try {
    const data = await fetchNewsApi();

    // Summarize each item (best-effort; if summary fails, use description/content)
    const summarized = await Promise.all(
      data.articles.map(async (a) => {
        try {
          const raw = a.content || a.description || a.title;
          const summary = await summarizeWithDeepseek(raw);
          return { ...a, summary };
        } catch {
          return { ...a, summary: a.description || a.content || "" };
        }
      })
    );

    return { articles: summarized };
  } catch (e) {
    // Both news and summaries failed; read fallback
    return await readFallback();
  }
}

/** Client-side: get from cache first, else seed cache from SSR payload */
export function getNewsClientCached(seed?: NewsResponse): NewsResponse | null {
  const cached = getCache<NewsResponse>(CACHE_KEY);
  if (cached) return cached;
  if (seed) {
    setCache(CACHE_KEY, seed);
    return seed;
  }
  return null;
}

export function putNewsClientCached(data: NewsResponse) {
  setCache(CACHE_KEY, data);
}
