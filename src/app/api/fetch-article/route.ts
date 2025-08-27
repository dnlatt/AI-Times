// app/api/fetch-article/route.ts
// Backend API route to fetch article content from URLs

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Invalid URL provided' }, { status: 400 });
    }
    
    // Fetch the article content
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NewsBot/1.0)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive'
      },
      // Add timeout
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const html = await response.text();
    
    // Extract text content from HTML
    const textContent = extractTextFromHtml(html);
    
    // Limit content length to avoid token limits
    const limitedContent = textContent.substring(0, 5000);
    
    return NextResponse.json({ content: limitedContent });
    
  } catch (error) {
    console.error('Error fetching article:', error);
    return NextResponse.json(
      { error: 'Failed to fetch article content' }, 
      { status: 500 }
    );
  }
}

function extractTextFromHtml(html: string): string {
  // Remove script and style elements
  const text = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  
  // Extract content from common article containers
  const articlePatterns = [
    /<article[^>]*>(.*?)<\/article>/gis,
    /<div[^>]*class="[^"]*content[^"]*"[^>]*>(.*?)<\/div>/gis,
    /<div[^>]*class="[^"]*article[^"]*"[^>]*>(.*?)<\/div>/gis,
    /<main[^>]*>(.*?)<\/main>/gis
  ];
  
  let extractedContent = '';
  
  for (const pattern of articlePatterns) {
    const matches = text.match(pattern);
    if (matches && matches[0]) {
      extractedContent = matches[0];
      break;
    }
  }
  
  // If no specific content found, use full body
  if (!extractedContent) {
    const bodyMatch = text.match(/<body[^>]*>(.*?)<\/body>/gis);
    extractedContent = bodyMatch ? bodyMatch[0] : text;
  }
  
  // Remove all HTML tags and normalize whitespace
  return extractedContent
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim();
}