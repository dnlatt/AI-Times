'use client';

import { useState, useEffect } from 'react';
import ArticleComponent from '@/components/home/ArticleComponent';
import ThumbnailComponent from '@/components/home/ThumbnailComponent';
import { Article } from '@/types/';
import { fetchArticles } from '@/lib/api';
import { LoaderCircle } from 'lucide-react';

export default function MainContent() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadArticles = async () => {
      const fetched = await fetchArticles();
      setArticles(fetched);
      setLoading(false);
    };

    loadArticles();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center justify-center h-full gap-2">
          <LoaderCircle className="w-6 h-6 animate-spin text-gray-600 dark:text-gray-300" />
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
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