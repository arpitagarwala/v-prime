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
    return data.success ? data.data : null;
  };

  const { data: benchmarks, isLoading: loadingNifty } = useSWR('/api/market/benchmarks', fetcher, { refreshInterval: 60000 });

  const portfolioDelta = stats?.dailyPnlPct ?? 0;
  const niftyDelta = benchmarks?.nifty?.changePct ?? 0;
  
  // Guard zero state rendering if data hasn't loaded
  if (loadingPortfolio || loadingNifty || !benchmarks) return null;

  const diff = portfolioDelta - niftyDelta;

  const DiffIcon = diff > 0 ? TrendingUp : diff < 0 ? TrendingDown : Minus;
  const diffClass = diff > 0 ? styles.positive : diff < 0 ? styles.negative : styles.neutral;

  const fmt = (n: number) => (n >= 0 ? '+' : '') + n.toFixed(2) + '%';
  const fmtAbs = (n: number) => (n >= 0 ? '+' : '') + n.toFixed(2);

  const NiftyIcon = benchmarks.nifty.changePct >= 0 ? TrendingUp : TrendingDown;
  const SensexIcon = benchmarks.sensex.changePct >= 0 ? TrendingUp : TrendingDown;

  return (
    <div style={{ display: 'flex', alignItems: 'center', marginLeft: 'auto', marginRight: '1rem', gap: '0.75rem' }}>
      
      {/* Live Benchmark Pills */}
      <div style={{ display: 'flex', gap: '0.5rem', marginRight: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', padding: '4px 10px', background: 'var(--surface-card)', border: '1px solid var(--surface-border)', borderRadius: '6px' }}>
           <span style={{ fontWeight: 800, color: 'var(--text-muted)' }}>NIFTY</span>
           <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{benchmarks.nifty.price.toLocaleString('en-IN')}</span>
           <span style={{ fontWeight: 800, color: benchmarks.nifty.changePct >= 0 ? 'var(--profit)' : 'var(--loss)', display: 'flex', alignItems: 'center', gap: '2px' }}>
              <NiftyIcon size={10} />
              {fmtAbs(benchmarks.nifty.changePct)}%
           </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', padding: '4px 10px', background: 'var(--surface-card)', border: '1px solid var(--surface-border)', borderRadius: '6px' }}>
           <span style={{ fontWeight: 800, color: 'var(--text-muted)' }}>SENSEX</span>
           <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{benchmarks.sensex.price.toLocaleString('en-IN')}</span>
           <span style={{ fontWeight: 800, color: benchmarks.sensex.changePct >= 0 ? 'var(--profit)' : 'var(--loss)', display: 'flex', alignItems: 'center', gap: '2px' }}>
              <SensexIcon size={10} />
              {fmtAbs(benchmarks.sensex.changePct)}%
           </span>
        </div>
      </div>

      <div className={styles.separator} style={{ height: '24px', marginRight: '0.5rem' }} />

      {/* Outperforming Nifty Stat */}
      <div className={`${styles.vsChip} ${diffClass}`} style={{ height: '36px' }}>
        <DiffIcon size={14} />
        <span>
          Your Portfolio {fmt(portfolioDelta)} &nbsp;·&nbsp; {diff >= 0 ? 'Outperforming' : 'Underperforming'} Nifty by {Math.abs(diff).toFixed(2)}%
        </span>
      </div>

    </div>
  );
}
