'use client';
import useSWR from 'swr';
import { useAppStore } from '@/store/useAppStore';

export interface IndexData {
  Symbol: string;
  LTP: number;
  Chg: number;
  ChgPct: number;
}

export function useIndices() {
  const { isMockMode, apiKeys } = useAppStore();
  const isLive = !isMockMode && !!apiKeys?.accessToken;

  const indicesFetcher = async (): Promise<any> => {
    const res = await fetch('/api/market/indices');
    return res.json();
  };

  const { data: indicesRaw, isLoading, error } = useSWR(
    isLive ? `market-indices` : null,
    indicesFetcher,
    { refreshInterval: 60000 }
  );

  const processedIndices: IndexData[] = indicesRaw?.success && Array.isArray(indicesRaw.data) ? indicesRaw.data : [];

  // Mock data for demo
  const mockIndices: IndexData[] = [
    { Symbol: 'Nifty 50', LTP: 22450.50, Chg: 120.50, ChgPct: 0.54 },
    { Symbol: 'Sensex', LTP: 73850.00, Chg: 450.20, ChgPct: 0.61 },
  ];

  return {
    indices: isMockMode ? mockIndices : processedIndices,
    isLoading,
    error,
    isLive
  };
}
