import { NextRequest, NextResponse } from 'next/server';
import { searchWithPerplexity } from '@/lib/perplexity';
import { generateDailySearchQuery } from '@/lib/search-topics';
import { DailyReport } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { customQuery } = await request.json();
    
    const query = customQuery || generateDailySearchQuery();
    const discussions = await searchWithPerplexity(query);
    
    const report: DailyReport = {
      id: generateReportId(),
      date: new Date().toISOString(),
      discussions,
      searchQuery: query,
      createdAt: new Date().toISOString(),
      status: 'completed'
    };
    
    return NextResponse.json(report);
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Failed to perform search' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // This endpoint can be used for manual triggers
    const query = generateDailySearchQuery();
    const discussions = await searchWithPerplexity(query);
    
    const report: DailyReport = {
      id: generateReportId(),
      date: new Date().toISOString(),
      discussions,
      searchQuery: query,
      createdAt: new Date().toISOString(),
      status: 'completed'
    };
    
    return NextResponse.json(report);
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Failed to perform search' },
      { status: 500 }
    );
  }
}

function generateReportId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}