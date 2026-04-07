'use client';
import { usePortfolio } from '@/hooks/usePortfolio';
import { TrendingUp, TrendingDown, Wallet, Activity } from 'lucide-react';
import styles from './PortfolioHero.module.css';

export default function PortfolioHero() {
  const { stats, isLoading } = usePortfolio();

  if (isLoading) {
    return <div className={styles.skeleton} />;
  }

  const { totalInvested, currentValue, totalPnL, totalPnLPct, dailyPnl, dailyPnlPct, availableMargin } = stats;

  const isOverallProfit = totalPnL >= 0;
  const isDayProfit = dailyPnl >= 0;

  const fmtINR = (n: number) =>
    '₹' + Math.abs(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const sign = (n: number) => (n >= 0 ? '+' : '−');

  return (
    <div className={styles.hero}>
      {/* Left — Primary number */}
      <div className={styles.left}>
        <p className={styles.label}>Current Portfolio Value</p>
        <h1 className={styles.bigValue}>{fmtINR(currentValue)}</h1>

        {/* Day P&L pill */}
        <div className={`${styles.dayPill} ${isDayProfit ? styles.pillGreen : styles.pillRed}`}>
          {isDayProfit ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
          <span>
            {sign(dailyPnl)}{fmtINR(dailyPnl)} ({sign(dailyPnlPct)}{Math.abs(dailyPnlPct).toFixed(2)}%) Today
          </span>
        </div>
      </div>

      {/* Right — Supporting stats */}
      <div className={styles.right}>
        <div className={styles.statGrid}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Total Invested</span>
            <span className={styles.statValue}>{fmtINR(totalInvested)}</span>
          </div>

          <div className={styles.statItem}>
            <span className={styles.statLabel}>Overall Returns</span>
            <span className={`${styles.statValue} ${isOverallProfit ? styles.profit : styles.loss}`}>
              {sign(totalPnL)}{fmtINR(totalPnL)}
            </span>
            <span className={`${styles.statSub} ${isOverallProfit ? styles.profit : styles.loss}`}>
              {sign(totalPnLPct)}{Math.abs(totalPnLPct).toFixed(2)}%
            </span>
          </div>

          <div className={styles.statItem}>
            <span className={styles.statLabel}>Available Margin</span>
            <span className={styles.statValue}>{fmtINR(availableMargin)}</span>
          </div>
        </div>

        <div className={styles.footerRow}>
          <Activity size={12} color="var(--profit)" />
          <span>Real-time syncing every 60s</span>
        </div>
      </div>
    </div>
  );
}
