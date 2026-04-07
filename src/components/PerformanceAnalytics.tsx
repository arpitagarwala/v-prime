'use client';
import useSWR from 'swr';
import { TrendingUp, TrendingDown, Award, AlertOctagon, Layers } from 'lucide-react';
import styles from './PerformanceAnalytics.module.css';

export default function PerformanceAnalytics() {
  const fetcher = async () => {
    const res = await fetch('/api/market/movers');
    return res.json();
  };

  const { data, isLoading } = useSWR('market-movers', fetcher, { refreshInterval: 60000 });

  if (isLoading || !data?.success) {
    return <div className={styles.empty}>Loading market data...</div>;
  }

  const { bestOverall, lagging } = data;

  const sign = (n: number) => (n >= 0 ? '+' : '');

  return (
    <div className={styles.container}>
      {/* Top Gainer */}
      <div className={styles.row}>
        <div className={styles.rowIcon} style={{ background: 'var(--profit-soft)' }}>
          <TrendingUp size={14} color="var(--profit)" />
        </div>
        <div className={styles.rowBody}>
          <span className={styles.rowLabel}>Top Gainer (NIFTY)</span>
          <span className={styles.rowSymbol}>{bestOverall.symbol}</span>
        </div>
        <span className={styles.rowValue} style={{ color: 'var(--profit)' }}>
          {sign(bestOverall.changePct)}{bestOverall.changePct.toFixed(2)}%
        </span>
      </div>

      <div className={styles.divider} />

      {/* Top Loser */}
      <div className={styles.row}>
        <div className={styles.rowIcon} style={{ background: 'var(--loss-soft)' }}>
          <TrendingDown size={14} color="var(--loss)" />
        </div>
        <div className={styles.rowBody}>
          <span className={styles.rowLabel}>Top Loser (NIFTY)</span>
          <span className={styles.rowSymbol}>{lagging.symbol}</span>
        </div>
        <span className={styles.rowValue} style={{ color: 'var(--loss)' }}>
          {sign(lagging.changePct)}{lagging.changePct.toFixed(2)}%
        </span>
      </div>
    </div>
  );
}
