export interface Discussion {
  id: string;
  link: string;
  title: string;
  description: string;
  platform: string;
  date: string;
  relevanceScore?: number;
  category: string;
}

export interface DailyReport {
  id: string;
  date: string;
  discussions: Discussion[];
  searchQuery: string;
  createdAt: string;
  status: 'pending' | 'completed' | 'failed';
}

export interface SearchTopic {
  keyword: string;
  category: 'business' | 'audience' | 'competitors' | 'technology';
}