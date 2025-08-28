export type Article = {
  source: {
    id: string | null;
    name: string;
  };
  author: string;
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  content: string;
  AISummarizeContent: string | null;
};

export type NewsResponse = {
  status: string;
  totalResults: number;
  articles: Article[];
};

export type NewsArticleProps = {
  article: Article;
};

export type ArticleComponentProps = {
  articles: Article[];
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
}

