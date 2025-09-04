import { DailyReport } from '@/types';

const STORAGE_KEY = 'open_video_daily_reports';

export function saveReport(report: DailyReport): void {
  if (typeof window === 'undefined') return;
  
  const reports = getReports();
  const existingIndex = reports.findIndex(r => r.id === report.id);
  
  if (existingIndex >= 0) {
    reports[existingIndex] = report;
  } else {
    reports.unshift(report);
  }
  
  // Keep only last 30 reports
  const trimmedReports = reports.slice(0, 30);
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedReports));
}

export function getReports(): DailyReport[] {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function getReport(id: string): DailyReport | null {
  const reports = getReports();
  return reports.find(r => r.id === id) || null;
}

export function getTodaysReport(): DailyReport | null {
  const reports = getReports();
  const today = new Date().toISOString().split('T')[0];
  
  return reports.find(r => r.date.startsWith(today)) || null;
}

export function deleteReport(id: string): void {
  if (typeof window === 'undefined') return;
  
  const reports = getReports();
  const filtered = reports.filter(r => r.id !== id);
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}