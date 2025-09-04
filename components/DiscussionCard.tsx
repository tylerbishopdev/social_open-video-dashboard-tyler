'use client';

import { Discussion } from '@/types';
import { ExternalLink, MessageCircle, TrendingUp } from 'lucide-react';

interface DiscussionCardProps {
  discussion: Discussion;
}

export default function DiscussionCard({ discussion }: DiscussionCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-700 rounded">
              {discussion.platform}
            </span>
            <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-700 rounded">
              {discussion.category}
            </span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
            {discussion.title}
          </h3>
        </div>
      </div>
      
      <p className="text-sm text-gray-600 mb-3 line-clamp-3">
        {discussion.description}
      </p>
      
      <div className="flex items-center justify-between">
        <a
          href={discussion.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          View Discussion
          <ExternalLink className="w-3 h-3" />
        </a>
        
        {discussion.relevanceScore && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <TrendingUp className="w-3 h-3" />
            <span>Relevance: {discussion.relevanceScore}%</span>
          </div>
        )}
      </div>
    </div>
  );
}