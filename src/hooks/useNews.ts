'use client';
import useSWR from 'swr';
import { useAppStore } from '@/store/useAppStore';

export interface NewsItem {
  Symbol: string;
  CallType: string;
  BuySell: string;
  Entry: number;
  Target: number;
  StopLoss: number;
  Remarks: string;
  Time: string;
  ScripCode?: string;
}

export function useNews() {
  const { isMockMode, apiKeys } = useAppStore();
  const isLive = !isMockMode && !!apiKeys?.accessToken;

  const newsFetcher = async (): Promise<any> => {
    const res = await fetch('/api/5paisa/sdk-ideas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keys: apiKeys })
    });
    return res.json();
  };

  const { data: newsRaw, isLoading, error } = useSWR(
    isLive ? `5paisa-ideas` : null,
    newsFetcher,
    { refreshInterval: 60000 } // Refresh every 1 min for live ideas
  );

  const liveNews = newsRaw?.success && Array.isArray(newsRaw.data) ? newsRaw.data : [];

  // Mock data for demo (when keys are missing)
  const mockNews = [
    { 
      Symbol: 'DEFENSE SECTOR',
      Remarks: 'Institutional View: Multi-Year Cycle for Defense Sector Remains Intact', 
      CallType: 'BULLISH',
      BuySell: 'BUY',
      Entry: 0,
      Target: 0,
      StopLoss: 0,
      Time: new Date().toISOString()
    },
    { 
      Symbol: 'RELIANCE',
      Remarks: 'Reliance Industries: Green Hydrogen Strategy Accelerates Capital Outlay', 
      CallType: 'ALPHA',
      BuySell: 'BUY',
      Entry: 0,
      Target: 0,
      StopLoss: 0,
      Time: new Date().toISOString()
    }
  ];

  return {
    news: isLive ? liveNews : mockNews,
    isLoading,
    error,
    isLive
  };
}
