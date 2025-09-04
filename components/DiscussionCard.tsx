'use client';

import { Discussion } from '@/types';
import { ExternalLink, MessageCircle, TrendingUp } from 'lucide-react';

interface DiscussionCardProps {
  discussion: Discussion;
}

export default function DiscussionCard({ discussion }: DiscussionCardProps) {
  return (
    <div className="bg-white/70 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium px-2 py-1 bg-cyan-100 text-cyan-700 rounded">
              {discussion.platform}
            </span>
            <span className="text-xs font-medium px-2 py-1 bg-gray-800 text-cyan-200 rounded">
              {discussion.category}
            </span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
            {discussion.title}
          </h3>
        </div>
      </div>

      <p className="text-sm text-gray-800 mb-3 line-clamp-3 px-2">
        {discussion.description}
      </p>

      <div className="flex items-center justify-between">
        <a
          href={discussion.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[12px] text-cyan-300 hover:bg-cyan-700 font-base border px-3 py-1 bg-cyan-950 rounded-full"
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