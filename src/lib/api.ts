"use client"; // Required because we use localStorage (client-side only)

import { summarizeArticle } from "./openrouter";

// -----------------------------
// Type Definitions
// -----------------------------
export interface Article {
  title: string;
  url: string;
  source?: { id: string | null; name: string };
  author?: string;
  description?: string;
  urlToImage?: string;
  publishedAt?: string;
  content?: string;
  AISummarizeContent: string; // Filled after summarization
}

interface NewsApiResponse {
  status: string;
  totalResults: number;
  articles: Omit<Article, "AISummarizeContent">[];
}

// -----------------------------
// Constants for Caching
// -----------------------------
const CACHE_KEY = "newsCache";
const CACHE_TIMESTAMP_KEY = "newsCacheTimestamp";
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

// -----------------------------
// Main Function to Fetch News
// -----------------------------
export async function fetchNews(): Promise<Article[]> {
  try {
    // Step 1: Try loading from cache
    const cached = loadFromCache();
    if (cached) {
      console.log("✅ Using cached news data");
      return cached;
    }

    // Step 2: If cache is expired/missing, fetch new data
    console.log("🌐 Fetching fresh news data from NewsAPI...");
    const apiKey = process.env.NEXT_PUBLIC_NEWS_API_KEY; // Store in .env
    const url = `https://newsapi.org/v2/top-headlines?country=us&apiKey=${apiKey}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`News API failed with status ${res.status}`);

    const data: NewsApiResponse = await res.json();
    if (!data.articles) throw new Error("Invalid News API response");

    // Step 3: Enrich with AISummarizeContent
    const enriched = await summarizeArticles(data.articles);

    // Step 4: Save to cache
    saveToCache(enriched);

    return enriched;
  } catch (err) {
    console.error("❌ Failed to fetch from News API. Falling back to local JSON:", err);

    // Step 5: Use fallback file
    try {
      const fallback = await import("/data/fallback-news.json");
      const articles: Omit<Article, "AISummarizeContent">[] = fallback.default;

      const enriched = await summarizeArticles(articles);
      return enriched;
    } catch (fallbackErr) {
      console.error("❌ Failed to load fallback news JSON:", fallbackErr);
      return [];
    }
  }
}

// -----------------------------
// Caching Helpers
// -----------------------------
function loadFromCache(): Article[] | null {
  try {
    const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
    const cache = localStorage.getItem(CACHE_KEY);

    if (!timestamp || !cache) return null;

    const now = Date.now();
    if (now - parseInt(timestamp, 10) > CACHE_DURATION) {
      console.log("⚠️ Cache expired");
      return null;
    }

    return JSON.parse(cache) as Article[];
  } catch (err) {
    console.error("⚠️ Failed to read from cache:", err);
    return null;
  }
}

function saveToCache(data: Article[]): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
  } catch (err) {
    console.error("⚠️ Failed to save to cache:", err);
  }
}

// -----------------------------
// Summarization Logic
// -----------------------------
async function summarizeArticles(
  articles: Omit<Article, "AISummarizeContent">[]
): Promise<Article[]> {
  const enriched: Article[] = [];

  for (const article of articles) {
    let summary = "";
    try {
      summary = await summarizeArticle(article.url);
    } catch (err) {
      console.error(`❌ Failed to summarize ${article.url}:`, err);
      summary = "Summary unavailable";
    }

    enriched.push({
      ...article,
      AISummarizeContent: summary || "Summary unavailable",
    });
  }

  return enriched;
}
