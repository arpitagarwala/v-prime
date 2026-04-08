'use client';
import useSWR from 'swr';
import { usePortfolio } from '@/hooks/usePortfolio';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import styles from './MarketBenchmark.module.css';

export default function PortfolioPill() {
  const { stats, isLoading: loadingPortfolio } = usePortfolio();

  const fetcher = async (url: string) => {
    const res = await fetch(url);
    const data = await res.json();
    return data.success ? data.data : { changePct: 0 };
  };

  const { data: niftyData, isLoading: loadingNifty } = useSWR('/api/market/nifty', fetcher, { refreshInterval: 60000 });

  const portfolioDelta = stats?.dailyPnlPct ?? 0;
  const niftyDelta = niftyData?.changePct ?? 0;
  
  // Guard zero state rendering if data hasn't loaded
  if (loadingPortfolio || loadingNifty) return null;

  const diff = portfolioDelta - niftyDelta;

  const DiffIcon = diff > 0 ? TrendingUp : diff < 0 ? TrendingDown : Minus;
  const diffClass = diff > 0 ? styles.positive : diff < 0 ? styles.negative : styles.neutral;

  const fmt = (n: number) => (n >= 0 ? '+' : '') + n.toFixed(2) + '%';

  return (
    <div className={`${styles.vsChip} ${diffClass}`} style={{ marginLeft: 'auto', marginRight: '1rem', height: '36px' }}>
      <DiffIcon size={14} />
      <span>
        Your Portfolio {fmt(portfolioDelta)} &nbsp;·&nbsp; {diff >= 0 ? 'Outperforming' : 'Underperforming'} Nifty by {Math.abs(diff).toFixed(2)}%
      </span>
    </div>
  );
}
