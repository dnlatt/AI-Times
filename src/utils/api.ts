"use client";

// TypeScript type definitions
export interface Article {
  source: {
    id: string | null;
    name: string;
  };
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
  AISummarizeContent: string; // AI-generated summary content
}

export interface NewsApiResponse {
  status: string;
  totalResults: number;
  articles: Omit<Article, 'AISummarizeContent'>[];
}

export interface CachedNewsData {
  articles: Article[];
  timestamp: number;
}

// Import the summarizeContentWithAI function from openrouter.ts
import { summarizeContentWithAI } from './openrouter';

// Cache configuration
const CACHE_KEY = 'newsCache';
const CACHE_TIMESTAMP_KEY = 'newsCacheTimestamp';
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

/**
 * Check if cached data is still valid (within 1 hour)
 */
const isCacheValid = (timestamp: number): boolean => {
  return Date.now() - timestamp < CACHE_DURATION;
};

/**
 * Get cached news data from localStorage
 */
const getCachedData = (): CachedNewsData | null => {
  try {
    const cachedData = localStorage.getItem(CACHE_KEY);
    const cachedTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
    
    if (!cachedData || !cachedTimestamp) {
      return null;
    }
    
    const timestamp = parseInt(cachedTimestamp, 10);
    
    if (!isCacheValid(timestamp)) {
      // Cache expired, remove it
      localStorage.removeItem(CACHE_KEY);
      localStorage.removeItem(CACHE_TIMESTAMP_KEY);
      return null;
    }
    
    return {
      articles: JSON.parse(cachedData),
      timestamp
    };
  } catch (error) {
    console.error('Error reading cached data:', error);
    return null;
  }
};

/**
 * Save news data to localStorage cache
 */
const setCachedData = (articles: Article[]): void => {
  try {
    const timestamp = Date.now();
    localStorage.setItem(CACHE_KEY, JSON.stringify(articles));
    localStorage.setItem(CACHE_TIMESTAMP_KEY, timestamp.toString());
  } catch (error) {
    console.error('Error caching data:', error);
  }
};

/**
 * Fetch news from NewsAPI
 */
const fetchNewsFromApi = async (): Promise<Omit<Article, 'AISummarizeContent'>[]> => {
  const apiKey = process.env.NEXT_PUBLIC_NEWS_API_KEY;
  
  if (!apiKey) {
    throw new Error('NEWS_API_KEY environment variable is not set');
  }
  
  const url = new URL('https://newsapi.org/v2/top-headlines');
  url.searchParams.append('apiKey', apiKey);
  url.searchParams.append('country', 'us'); // You can make this configurable
  url.searchParams.append('pageSize', '20'); // Limit results for demo
  
  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'User-Agent': 'NewsApp/1.0'
    }
  });
  
  if (!response.ok) {
    throw new Error(`NewsAPI responded with status: ${response.status}`);
  }
  
  const data: NewsApiResponse = await response.json();
  
  if (data.status !== 'ok') {
    throw new Error(`NewsAPI error: ${data.status}`);
  }
  
  return data.articles;
};

/**
 * Load fallback news data from local JSON file
 */
const loadFallbackData = async (): Promise<Omit<Article, 'AISummarizeContent'>[]> => {
  try {
    const response = await fetch('/data/fallback-news.json');
    
    if (!response.ok) {
      throw new Error(`Failed to load fallback data: ${response.status}`);
    }
    
    const fallbackData = await response.json();
    return fallbackData.articles || fallbackData; // Handle both formats
  } catch (error) {
    console.error('Error loading fallback data:', error);
    
    // Return minimal fallback data if file loading fails
    return [
      {
        source: { id: null, name: 'Fallback News' },
        author: 'System',
        title: 'News service temporarily unavailable',
        description: 'Please try again later.',
        url: '#',
        urlToImage: null,
        publishedAt: new Date().toISOString(),
        content: 'News service is temporarily unavailable. Please try again later.'
      }
    ];
  }
};

/**
 * Fetch full article content from URL using backend API
 */
const fetchArticleContent = async (url: string): Promise<string> => {
  try {
    const response = await fetch('/api/fetch-article', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url })
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    return data.content || '';
  } catch (error) {
    console.error('Failed to fetch article content from URL:', error);
    throw error;
  }
};

/**
 * Summarize individual article using OpenRouter API
 */
const summarizeIndividualArticle = async (article: Omit<Article, 'AISummarizeContent'>): Promise<string> => {
  try {
    let contentToSummarize = '';
    
    // Strategy 1: Try to fetch content from URL first
    if (article.url && article.url !== '#' && !article.url.includes('example.com')) {
      try {
        console.log(`Fetching content from URL: ${article.url}`);
        contentToSummarize = await fetchArticleContent(article.url);
      } catch (urlError) {
        console.log('Failed to fetch from URL, falling back to article content');
      }
    }
    
    // Strategy 2: Fall back to available article content
    if (!contentToSummarize || contentToSummarize.trim() === '') {
      contentToSummarize = article.content || article.description || article.title || '';
    }
    
    // Check if we have sufficient content
    if (!contentToSummarize || contentToSummarize.trim().length < 50) {
      return 'Insufficient content available for summarization';
    }
    
    // Call the summarizeContentWithAI function from openrouter.ts
    const summary = await summarizeContentWithAI(contentToSummarize);
    return summary;
  } catch (error) {
    console.error(`Failed to summarize article: ${article.title}`, error);
    return 'Summary unavailable';
  }
};

/**
 * Main function to fetch and process news articles
 */
export const fetchNewsWithSummaries = async (): Promise<Article[]> => {
  console.log('Starting news fetch process...');
  
  // Check for valid cached data first
  const cachedData = getCachedData();
  if (cachedData) {
    console.log('Using cached news data');
    return cachedData.articles;
  }
  
  let rawArticles: Omit<Article, 'AISummarizeContent'>[] = [];
  
  // Try to fetch from NewsAPI first
  try {
    console.log('Fetching news from NewsAPI...');
    rawArticles = await fetchNewsFromApi();
    console.log(`Successfully fetched ${rawArticles.length} articles from NewsAPI`);
  } catch (error) {
    console.error('NewsAPI fetch failed, falling back to local data:', error);
    
    // Fallback to local JSON data
    try {
      rawArticles = await loadFallbackData();
      console.log(`Loaded ${rawArticles.length} articles from fallback data`);
    } catch (fallbackError) {
      console.error('Fallback data loading failed:', fallbackError);
      throw new Error('Both NewsAPI and fallback data failed to load');
    }
  }
  
  // Process articles with AI summaries
  const processedArticles: Article[] = [];
  
  console.log('Starting AI summarization process...');
  
  for (let i = 0; i < rawArticles.length; i++) {
    const rawArticle = rawArticles[i];
    
    try {
      console.log(`Summarizing article ${i + 1}/${rawArticles.length}: ${rawArticle.title}`);
      
      // Get AI summary for this article
      const aiSummary = await summarizeIndividualArticle(rawArticle);
      
      // Create the complete article with AI summary
      const processedArticle: Article = {
        ...rawArticle,
        AISummarizeContent: aiSummary
      };
      
      processedArticles.push(processedArticle);
      
      console.log(`Successfully summarized article ${i + 1}/${rawArticles.length}`);
      
    } catch (error) {
      console.error(`Failed to process article ${i + 1}: ${rawArticle.title}`, error);
      
      // Add article without summary if AI processing fails
      const processedArticle: Article = {
        ...rawArticle,
        AISummarizeContent: 'Summary unavailable'
      };
      
      processedArticles.push(processedArticle);
    }
    
    // Add a small delay between API calls to be respectful
    if (i < rawArticles.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  console.log(`Completed processing ${processedArticles.length} articles`);
  
  // Cache the processed articles
  setCachedData(processedArticles);
  
  return processedArticles;
};

/**
 * Clear the news cache (useful for debugging or manual refresh)
 */
export const clearNewsCache = (): void => {
  try {
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(CACHE_TIMESTAMP_KEY);
    console.log('News cache cleared');
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
};

/**
 * Get cache status information
 */
export const getCacheStatus = (): { cached: boolean; timestamp?: number; age?: number } => {
  const cachedTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
  
  if (!cachedTimestamp) {
    return { cached: false };
  }
  
  const timestamp = parseInt(cachedTimestamp, 10);
  const age = Date.now() - timestamp;
  
  return {
    cached: true,
    timestamp,
    age
  };
};

// Default export for convenience
export default fetchNewsWithSummaries;