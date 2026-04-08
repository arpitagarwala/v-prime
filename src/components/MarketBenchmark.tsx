'use client';
import { useIndices } from '@/hooks/useIndices';
import useSWR from 'swr';
import { usePortfolio } from '@/hooks/usePortfolio';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import styles from './MarketBenchmark.module.css';

export default function MarketBenchmark() {
  const { indices, isLoading: loadingIndices } = useIndices();
  const { stats, isLoading: loadingPortfolio } = usePortfolio();

  const nifty = indices.find(i => i.Symbol === 'Nifty 50');
  const sensex = indices.find(i => i.Symbol === 'Sensex');
  
  // Real-time Breadth Calculation from the Index Engine
  const { data: indexData } = useSWR('/api/market/indices?index=NIFTY%2050', (u) => fetch(u).then(r => r.json()), { refreshInterval: 3000 });
  const constituents = indexData?.success ? indexData.data : [];
  const advances = constituents.filter((s: any) => s.pChange > 0).length;
  const declines = constituents.filter((s: any) => s.pChange < 0).length;
  const total = constituents.length;

  const portfolioDelta = stats?.dailyPnlPct ?? 0;
  const niftyDelta = nifty?.ChgPct ?? 0;
  const diff = portfolioDelta - niftyDelta;

  const DiffIcon = diff > 0 ? TrendingUp : diff < 0 ? TrendingDown : Minus;
  const diffClass = diff > 0 ? styles.positive : diff < 0 ? styles.negative : styles.neutral;

  const fmt = (n: number) => (n >= 0 ? '+' : '') + n.toFixed(2) + '%';

  return (
    <div className={styles.ticker}>
      {/* Nifty 50 */}
      {nifty && (
        <div className={styles.indexChip}>
          <span className={styles.indexName}>NIFTY 50</span>
          <span className={styles.indexPrice}>
            {nifty.LTP.toLocaleString('en-IN')}
          </span>
          <span className={`${styles.indexChange} ${nifty.ChgPct >= 0 ? styles.positive : styles.negative}`}>
            {fmt(nifty.ChgPct)}
          </span>
          
          {/* Breadth Indicator */}
          {total > 0 && (
            <div style={{ marginLeft: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', borderLeft: '1px solid var(--surface-border)', paddingLeft: '1rem' }}>
               <div style={{ display: 'flex', height: '6px', width: '60px', borderRadius: '3px', overflow: 'hidden', background: 'var(--surface-raised)' }}>
                  <div style={{ width: `${(advances / total) * 100}%`, background: 'var(--profit)' }} />
                  <div style={{ width: `${(declines / total) * 100}%`, background: 'var(--loss)' }} />
               </div>
               <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)' }}>
                  <span style={{ color: 'var(--profit)' }}>{advances}</span> / <span style={{ color: 'var(--loss)' }}>{declines}</span>
               </span>
            </div>
          )}
        </div>
      )}

      <div className={styles.separator} />

      {/* Sensex */}
      {sensex && (
        <div className={styles.indexChip}>
          <span className={styles.indexName}>SENSEX</span>
          <span className={styles.indexPrice}>
            {sensex.LTP.toLocaleString('en-IN')}
          </span>
          <span className={`${styles.indexChange} ${sensex.ChgPct >= 0 ? styles.positive : styles.negative}`}>
            {fmt(sensex.ChgPct)}
          </span>
        </div>
      )}

      <div className={styles.spacer} />

      {/* Portfolio vs Market */}
      {!loadingPortfolio && !loadingIndices && (
        <div className={`${styles.vsChip} ${diffClass}`}>
          <DiffIcon size={13} />
          <span>
            Your Portfolio {fmt(portfolioDelta)} &nbsp;·&nbsp; {diff >= 0 ? 'Outperforming' : 'Underperforming'} Nifty by {Math.abs(diff).toFixed(2)}%
          </span>
        </div>
      )}
    </div>
  );
}
