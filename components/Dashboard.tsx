'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { RefreshCw, Calendar, Filter, Download, Search, Clock, AlertCircle } from 'lucide-react';
import { DailyReport, Discussion } from '@/types';
import { cn } from '@/lib/utils';
import '../app/globals.css';
import { getReports, saveReport, getTodaysReport } from '@/lib/storage';
import DiscussionCard from './DiscussionCard';

export default function Dashboard() {
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<DailyReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterPlatform, setFilterPlatform] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [lastFetch, setLastFetch] = useState<Date | null>(null);

  useEffect(() => {
    // Load reports from localStorage
    const storedReports = getReports();
    setReports(storedReports);

    // Select today's report by default, or the most recent one
    const todaysReport = getTodaysReport();
    if (todaysReport) {
      setSelectedReport(todaysReport);
    } else if (storedReports.length > 0) {
      setSelectedReport(storedReports[0]);
    }

    // Check if we need to fetch today's data
    if (!todaysReport) {
      fetchDailyData();
    }
  }, []);

  const fetchDailyData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/perplexity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch discussions');
      }

      const report: DailyReport = await response.json();

      // Save to localStorage
      saveReport(report);

      // Update state
      setReports(prevReports => [report, ...prevReports.filter(r => r.id !== report.id)]);
      setSelectedReport(report);
      setLastFetch(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleManualRefresh = () => {
    fetchDailyData();
  };

  const exportToJSON = () => {
    if (!selectedReport) return;

    const dataStr = JSON.stringify(selectedReport, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = `open-video-discussions-${format(new Date(selectedReport.date), 'yyyy-MM-dd')}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Filter discussions
  const filteredDiscussions = selectedReport?.discussions.filter(d => {
    if (filterPlatform !== 'all' && d.platform !== filterPlatform) return false;
    if (filterCategory !== 'all' && d.category !== filterCategory) return false;
    return true;
  }) || [];

  // Get unique platforms and categories for filters
  const platforms = [...new Set(selectedReport?.discussions.map(d => d.platform) || [])];
  const categories = [...new Set(selectedReport?.discussions.map(d => d.category) || [])];

  return (
    <div className="min-h-screen container">
      {/* Full-width header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Open Video Discussion Tracker</h1>
              <p className="text-sm text-gray-600 mt-1">Daily insights from creator communities</p>
            </div>
            <div className="flex items-center gap-4">
              {lastFetch && (
                <div className="text-sm text-gray-500 flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Last updated: {format(lastFetch, 'HH:mm')}
                </div>
              )}
              <button
                onClick={handleManualRefresh}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Fetching...' : 'Refresh'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Content area with proper container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar with date selection */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Report History
              </h3>
              <div className="space-y-1 max-h-96 overflow-y-auto">
                {reports.map(report => (
                  <button
                    key={report.id}
                    onClick={() => setSelectedReport(report)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedReport?.id === report.id
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'hover:bg-gray-50 text-gray-700'
                      }`}
                  >
                    <div>{format(new Date(report.date), 'MMM dd, yyyy')}</div>
                    <div className="text-xs text-gray-500">
                      {report.discussions.length} discussions
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main content area */}
          <div className="lg:col-span-9">
            {selectedReport && (
              <>
                <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        {format(new Date(selectedReport.date), 'EEEE, MMMM dd, yyyy')}
                      </h2>
                      <p className="text-sm text-gray-600">
                        {filteredDiscussions.length} discussions found
                      </p>
                    </div>
                    <button
                      onClick={exportToJSON}
                      className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 self-start sm:self-auto"
                    >
                      <Download className="w-4 h-4" />
                      Export JSON
                    </button>
                  </div>

                  {/* Filters */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4 text-gray-500" />
                      <select
                        value={filterPlatform}
                        onChange={(e) => setFilterPlatform(e.target.value)}
                        className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="all">All Platforms</option>
                        {platforms.map(platform => (
                          <option key={platform} value={platform}>{platform}</option>
                        ))}
                      </select>
                      <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="all">All Categories</option>
                        {categories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Discussion cards */}
                <div className="grid gap-4">
                  {filteredDiscussions.length > 0 ? (
                    filteredDiscussions.map(discussion => (
                      <DiscussionCard key={discussion.id} discussion={discussion} />
                    ))
                  ) : (
                    <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
                      <Search className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600">No discussions found with current filters</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}