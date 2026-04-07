'use client';
import useSWR from 'swr';

export interface EnrichedData {
  beta: number | null;
  pe: number | null;
  fwdPe: number | null;
  eps: number | null;
  regularMarketPrice: number | null;
  regularMarketChange: number | null;
  regularMarketChangePercent: number | null;
  regularMarketPreviousClose: number | null;
  marketCap: number | null;
  fiftyTwoWeekHigh: number | null;
  fiftyTwoWeekLow: number | null;
  fiftyDayAverage: number | null;
  twoHundredDayAverage: number | null;
  dividendYield: number | null;
  priceToBook: number | null;
  sector: string | null;
}

export function usePortfolioEnrichment(symbols: string[]) {
  const key = symbols.length > 0 ? `portfolio-batch-${symbols.sort().join(',')}` : null;

  const fetcher = async () => {
    const res = await fetch('/api/market/portfolio-batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symbols }),
    });
    return res.json();
  };

  const { data, isLoading } = useSWR(key, fetcher, {
    refreshInterval: 300000, // Refresh every 5 min — fundamentals don't change fast
    revalidateOnFocus: false,
  });

  const enrichedMap: Record<string, EnrichedData> = data?.success ? data.data : {};

  return { enrichedMap, isEnrichmentLoading: isLoading };
}
