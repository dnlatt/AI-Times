'use client';

import { useState, useEffect } from 'react';
import ArticleComponent from '@/components/home/ArticleComponent';
import ThumbnailComponent from '@/components/home/ThumbnailComponent';
import { NewsResponse, Article } from '@/types/';

export default function MainContent() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would be a server component or a more robust fetch
    // For this example, we mock a client-side fetch.
    const fetchArticles = async () => {
      try {
        const res = await fetch('/data/fallback-news.json');
        if (!res.ok) {
          throw new Error('Failed to fetch articles');
        }
        const data: NewsResponse = await res.json();
        setArticles(data.articles);
      } catch (error) {
        console.error('Error fetching articles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading news...</p>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>No articles found.</p>
      </div>
    );
  }

  return (
    <div className=" flex flex-col items-center p-4 max-w-6xl">
      {/* Article Display Area */}
      <ArticleComponent
        articles={articles}
        selectedIndex={selectedIndex}
        setSelectedIndex={setSelectedIndex}
      />

      {/* Thumbnail Navigation Area */}
      <ThumbnailComponent
        articles={articles}
        selectedIndex={selectedIndex}
        setSelectedIndex={setSelectedIndex}
      />
    </div>
  );
}