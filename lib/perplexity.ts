import axios from 'axios';
import { Discussion } from '@/types';

const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

export async function searchWithPerplexity(query: string): Promise<Discussion[]> {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  
  if (!apiKey) {
    throw new Error('Perplexity API key not configured');
  }

  try {
    const response = await axios.post(
      PERPLEXITY_API_URL,
      {
        model: 'llama-3.1-sonar-large-128k-online',
        messages: [
          {
            role: 'system',
            content: 'You are a research assistant that finds online discussions and returns them in a structured format. Always provide direct links and brief descriptions only.'
          },
          {
            role: 'user',
            content: query
          }
        ],
        temperature: 0.2,
        top_p: 0.9,
        search_domain_filter: ['reddit.com', 'news.ycombinator.com', 'producthunt.com', 'twitter.com', 'linkedin.com', 'facebook.com', 'discord.com'],
        return_citations: true,
        search_recency_filter: '2week'
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const content = response.data.choices[0].message.content;
    const citations = response.data.citations || [];
    
    // Parse the response and extract discussions
    return parseDiscussions(content, citations);
  } catch (error) {
    console.error('Perplexity API error:', error);
    throw new Error('Failed to fetch discussions from Perplexity');
  }
}

function parseDiscussions(content: string, citations: any[]): Discussion[] {
  const discussions: Discussion[] = [];
  
  // Split content by common delimiters
  const lines = content.split('\n');
  let currentDiscussion: Partial<Discussion> | null = null;
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Check for URLs
    const urlMatch = trimmedLine.match(/https?:\/\/[^\s]+/);
    if (urlMatch) {
      if (currentDiscussion && currentDiscussion.description) {
        discussions.push({
          id: generateId(),
          link: urlMatch[0],
          title: extractTitle(currentDiscussion.description || trimmedLine),
          description: currentDiscussion.description || trimmedLine,
          platform: extractPlatform(urlMatch[0]),
          date: new Date().toISOString(),
          category: categorizeDiscussion(currentDiscussion.description || trimmedLine)
        });
        currentDiscussion = null;
      }
    } else if (trimmedLine.length > 20) {
      // Accumulate description
      if (!currentDiscussion) {
        currentDiscussion = {};
      }
      currentDiscussion.description = (currentDiscussion.description || '') + ' ' + trimmedLine;
    }
  }
  
  // Also process citations if available
  citations.forEach((citation: any) => {
    if (citation.url) {
      discussions.push({
        id: generateId(),
        link: citation.url,
        title: citation.title || extractTitle(citation.snippet || ''),
        description: citation.snippet || 'Discussion found',
        platform: extractPlatform(citation.url),
        date: new Date().toISOString(),
        category: categorizeDiscussion(citation.snippet || '')
      });
    }
  });
  
  // Remove duplicates based on link
  const uniqueDiscussions = discussions.filter((discussion, index, self) =>
    index === self.findIndex((d) => d.link === discussion.link)
  );
  
  return uniqueDiscussions;
}

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function extractTitle(text: string): string {
  // Extract first meaningful part as title
  const words = text.split(' ').slice(0, 10).join(' ');
  return words.length > 80 ? words.substring(0, 77) + '...' : words;
}

function extractPlatform(url: string): string {
  try {
    const hostname = new URL(url).hostname;
    if (hostname.includes('reddit.com')) return 'Reddit';
    if (hostname.includes('twitter.com') || hostname.includes('x.com')) return 'Twitter/X';
    if (hostname.includes('linkedin.com')) return 'LinkedIn';
    if (hostname.includes('facebook.com')) return 'Facebook';
    if (hostname.includes('discord.com')) return 'Discord';
    if (hostname.includes('news.ycombinator.com')) return 'Hacker News';
    if (hostname.includes('producthunt.com')) return 'Product Hunt';
    if (hostname.includes('youtube.com')) return 'YouTube';
    return hostname.replace('www.', '').split('.')[0];
  } catch {
    return 'Unknown';
  }
}

function categorizeDiscussion(text: string): string {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('monetiz') || lowerText.includes('revenue') || lowerText.includes('earning')) {
    return 'Monetization';
  }
  if (lowerText.includes('alternative') || lowerText.includes('platform')) {
    return 'Platform Alternatives';
  }
  if (lowerText.includes('creator') || lowerText.includes('content')) {
    return 'Creator Economy';
  }
  if (lowerText.includes('seo') || lowerText.includes('traffic') || lowerText.includes('growth')) {
    return 'Growth & SEO';
  }
  if (lowerText.includes('technical') || lowerText.includes('api') || lowerText.includes('integration')) {
    return 'Technical';
  }
  
  return 'General Discussion';
}